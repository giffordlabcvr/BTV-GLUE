var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

glue.command(["delete", "module", "-w", "name like 'btvClusterPicker%'"]);

var clusterPickers = [
	{ nodeThresholdType: "TBE", nodeThreshold:0.75, p_distance: 0.20, segments: ["1", "3", "4", "5", "7", "8", "9", "10"] },
	{ nodeThresholdType: "TBE", nodeThreshold:0.75, p_distance: 0.24, segments: ["2"] },
	{ nodeThresholdType: "TBE", nodeThreshold:0.75, p_distance: 0.33, segments: ["6"] },
	{ nodeThresholdType: "TBE", nodeThreshold:0.75, p_distance: 0.35, segments: ["2"] }
];

try {
	glue.popMode();
	glue.inMode("schema-project/btv/table/sequence", function() {
		var seqFields = glue.getTableColumn(glue.command(["list", "field"]), "name");
		_.each(seqFields, function(seqField) {
			if(seqField.startsWith("cluster_")) {
				glue.command(["delete", "field", seqField]);
				glue.logInfo("Removed old field "+seqField);
			}
		});
		glue.command(["commit"]);
		glue.command(["new-context"]);
		_.each(clusterPickers, function(clusterPicker) {
			var field = fieldForClusterPicker(clusterPicker);
			glue.logInfo("Adding field "+field);
			glue.command(["create", "field", field, "INTEGER"]);
			glue.logInfo("Added field "+field);
		});
	});
} finally {
	glue.pushMode("project/btv");
}

function idForClusterPicker(clusterPicker) {
	var nodeThresholdType = clusterPicker.nodeThresholdType;
	return nodeThresholdType.toLowerCase()+
		"_n"+( nodeThresholdType == "FBP" ? clusterPicker.nodeThreshold : Math.round(clusterPicker.nodeThreshold * 100) ) + 
		"_p"+( Math.round(clusterPicker.p_distance * 100));
}


function fieldForClusterPicker(clusterPicker) {
	return "cluster_" + idForClusterPicker(clusterPicker);
}

function moduleNameForClusterPicker(clusterPicker) {
	return "btvClusterPicker_"+idForClusterPicker(clusterPicker);
}

_.each(clusterPickers, function(clusterPicker) {
	var moduleName = moduleNameForClusterPicker(clusterPicker);
	glue.command(["create", "module", "--moduleType", "clusterPickerRunner", moduleName]);
	glue.inMode("module/"+moduleName, function() {
		glue.command(["set", "property", "geneticThreshold", clusterPicker.p_distance]);
		glue.command(["set", "property", "initialThreshold", clusterPicker.nodeThreshold]);
		glue.command(["set", "property", "supportThreshold", clusterPicker.nodeThreshold]);
		glue.command(["set", "property", "nodeThresholdType", clusterPicker.nodeThresholdType == "FBP" ? "BOOTSTRAPS" : "TRANSFER_BOOTSTRAPS"]);
	});
});

_.each(["btvNexusExporter", "btvNexusExporter_Seg2", "btvNexusExporter_Seg6"], function(nexusExporter) {
	glue.inMode("module/"+nexusExporter, function() {
		glue.command(["load", "configuration", "modules/"+nexusExporter+".xml"]);
		_.each(clusterPickers, function(clusterPicker) {
			var field = fieldForClusterPicker(clusterPicker);
			glue.command(["add", "annotation-generator", "freemarker", field, "${sequence."+field+"!'-'}"]);
		});
	});
});

var summaryString = "segment\tclusterPicker\tbootstrapType\tnodeThreshold\tpDistance\tnumSequences\tclusters\tsingletons\n";

_.each(segments, function(segment) {
	_.each(clusterPickers, function(clusterPicker) {
		if(_.contains(clusterPicker.segments, segment)) {
			var whereClause = "sequence.source.name in ('ncbi-curated')";
			if(segment == "6") {
				// A bunch of Seg 6 genotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
				// outgroup. Instead PATAV is used as an outgroup and so EHDV remains in the tree
				whereClause = whereClause +" or (sequence.sequenceID = 'AM744982')";
			}
	
			var clusterResultObjs;
			
			var moduleName = moduleNameForClusterPicker(clusterPicker);
			glue.inMode("module/"+moduleName, function() {
			    clusterResultObjs = 
			    	glue.tableToObjects(glue.command(["run", "cluster-picker", "field", "--alignmentName", "BTV_OUTG_CODON_"+segment]));
			});
	
			var clusters = 0;
			var singletons = 0;
	
			var field = fieldForClusterPicker(clusterPicker);
			_.each(clusterResultObjs, function(clusterResultObj) {
				glue.inMode("sequence/"+clusterResultObj.sourceName+"/"+clusterResultObj.sequenceID, function() {
					if(clusterResultObj.clusterIndex == null) {
						glue.command(["unset", "field", "--noCommit", field]);
						singletons++;
					} else {
						glue.command(["set", "field", "--noCommit", field, clusterResultObj.clusterIndex]);
						clusters = Math.max(clusters, clusterResultObj.clusterIndex);
					}
				});
			});
			glue.command(["commit"]);
	
			summaryString += segment + "\t" + 
				idForClusterPicker(clusterPicker) + "\t" +
				clusterPicker.nodeThresholdType + "\t" +
				clusterPicker.nodeThreshold + "\t" +
				clusterPicker.p_distance + "\t" +
				clusterResultObjs.length + "\t" +
				clusters + "\t" +
				singletons + "\n";
			
			glue.log("FINEST", "Set "+moduleName+" annotations for segment "+segment);
		}
	});
	
	var nexusExporter = "btvNexusExporter";
	if(segment == "2" || segment == "6") {
		nexusExporter = "btvNexusExporter_Seg"+segment;
	}
	
	glue.log("FINEST", "Exporting display tree for segment "+segment);
	glue.inMode("module/"+nexusExporter, function() {
		glue.command(["export", "tree", "BTV_OUTG_CODON_"+segment, 
		              "-f", "trees/S"+segment+"_display.nexus"])
	});

	
});

glue.command(["file-util", "save-string", summaryString, "clusterPickerSummary.txt"]);
