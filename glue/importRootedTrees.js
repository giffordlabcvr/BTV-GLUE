var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


_.each(segments, function(segment) {
	glue.inMode("module/btvPhyloImporter", function() {
		
		var whereClause = "sequence.source.name in ('ncbi-curated')";
		if(segment == "6") {
			// A bunch of Seg 6 serotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
			// outgroup. Instead PATAV is used as an outgroup and so EHDV remains in the tree
			whereClause = whereClause +" or (sequence.sequenceID = 'AM744982')";
		}
		
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", whereClause, 
	                  "-i", "trees/phyloTrees/S"+segment+"_og_rerooted.tree", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
	glue.log("FINEST", "Imported tree for segment "+segment);
});
