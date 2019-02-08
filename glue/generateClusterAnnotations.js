var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

// var segments = ["2"];

glue.command(["delete", "module", "-w", "name like 'btvClusterPicker%'"]);

var clusterPickers = [
	{ module: "btvClusterPickerA", seq_column: "cluster_a", p_distance: 0.22 },
	{ module: "btvClusterPickerB", seq_column: "cluster_b", p_distance: 0.18 },
	{ module: "btvClusterPickerC", seq_column: "cluster_c", p_distance: 0.14 },
	{ module: "btvClusterPickerD", seq_column: "cluster_d", p_distance: 0.12 },
	{ module: "btvClusterPickerE", seq_column: "cluster_e", p_distance: 0.10 },
	{ module: "btvClusterPickerF", seq_column: "cluster_f", p_distance: 0.08 },
	{ module: "btvClusterPickerG", seq_column: "cluster_g", p_distance: 0.06 },
	{ module: "btvClusterPickerH", seq_column: "cluster_h", p_distance: 0.04 },
	{ module: "btvClusterPickerI", seq_column: "cluster_i", p_distance: 0.02 },
	{ module: "btvClusterPickerJ", seq_column: "cluster_j", p_distance: 0.01 },
];

_.each(clusterPickers, function(clusterPicker) {
	glue.command(["create", "module", "--fileName", "modules/"+clusterPicker.module+".xml"]);
});

var summaryString = "segment\tclusterPicker\tpDistance\tnumSequences\tclusters\tsingletons\n";

_.each(segments, function(segment) {
	_.each(clusterPickers, function(clusterPicker) {
		var whereClause = "sequence.source.name in ('ncbi-curated')";
		if(segment == "6") {
			// A bunch of Seg 6 serotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
			// outgroup. Instead PATAV is used as an outgroup and so EHDV remains in the tree
			whereClause = whereClause +" or (sequence.sequenceID = 'AM744982')";
		}

		var clusterResultObjs;
		
		glue.inMode("module/"+clusterPicker.module, function() {
		    clusterResultObjs = 
		    	glue.tableToObjects(glue.command(["run", "cluster-picker", "--alignmentName", "BTV_OUTG_CODON_"+segment, 
		                  "-w", whereClause, 
		                  "--treeFileName", "trees/phyloTrees/S"+segment+"_og_rerooted.tree", "NEWICK_BOOTSTRAPS"]));
		});

		var clusters = 0;
		var singletons = 0;

		_.each(clusterResultObjs, function(clusterResultObj) {
			glue.inMode("sequence/"+clusterResultObj.sourceName+"/"+clusterResultObj.sequenceID, function() {
				if(clusterResultObj.clusterIndex == null) {
					glue.command(["unset", "field", "--noCommit", clusterPicker.seq_column]);
					singletons++;
				} else {
					glue.command(["set", "field", "--noCommit", clusterPicker.seq_column, clusterResultObj.clusterIndex]);
					clusters = Math.max(clusters, clusterResultObj.clusterIndex);
				}
			});
		});
		glue.command(["commit"]);

		summaryString += segment + "\t" + 
			clusterPicker.seq_column + "\t" +
			clusterPicker.p_distance + "\t" +
			clusterResultObjs.length + "\t" +
			clusters + "\t" +
			singletons + "\n";
		
		glue.log("FINEST", "Set "+clusterPicker.module+" annotations for segment "+segment);
	});
});

glue.command(["file-util", "save-string", summaryString, "clusterPickerSummary.txt"]);
