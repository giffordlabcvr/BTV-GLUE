var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.inMode("module/btvPhyloUtility", function() {
		var whereClause = "sequence.source.name in ('ncbi-outgroup')";
		if(segment == "6") {
			// A bunch of Seg 6 serotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
			// outgroup. Instead we just use PATAV
			whereClause = "sequence.sequenceID = 'JQ070391'";
		}
	    glue.command(["reroot-alignment-phylogeny", 
	                  "BTV_OUTG_CODON_"+segment, "phylogeny", 
	                  "--whereClause", whereClause, 
	                  "-o", "trees/phyloTrees/S"+segment+"_og_rerooted.tree", "NEWICK_BOOTSTRAPS"]);
	});
	glue.log("FINEST", "Rerooted tree for segment "+segment);

});

