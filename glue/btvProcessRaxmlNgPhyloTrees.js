var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	
	_.each([["FBP", "NEWICK_BOOTSTRAPS"], ["TBE", "NEWICK_TRANSFER_BOOTSTRAPS"]], function(pair) {
		var bootstrapMetric = pair[0];
		var phyloFormat = pair[1];
		glue.log("FINEST", "Importing unrooted "+bootstrapMetric+" tree for segment "+segment);
		glue.inMode("module/btvPhyloImporter", function() {
		    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
		                  "-w", "sequence.source.name in ('ncbi-curated', 'ncbi-outgroup')", 
		                  "-i", "trees/raxmlNgTbeTrees/S"+segment+".raxml.support"+bootstrapMetric, phyloFormat, 
		                  "-f", "phylogeny" ]);
		});
		
		glue.log("FINEST", "Rerooted "+bootstrapMetric+" tree for segment "+segment);
		
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
		                  "--removeOutgroup",
		                  "-o", "trees/raxmlNgTbeTrees/S"+segment+"_og_rerooted_"+bootstrapMetric+".tree", phyloFormat]);
		});
	});
	
	glue.log("FINEST", "Importing rooted FBP tree for segment "+segment);
	
	var whereClause = "sequence.source.name in ('ncbi-curated')";
	if(segment == "6") {
		// A bunch of Seg 6 serotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
		// outgroup. Instead PATAV is used as an outgroup and so EHDV remains in the tree
		whereClause = whereClause +" or (sequence.sequenceID = 'AM744982')";
	}
	
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", whereClause, 
	                  "-i", "trees/raxmlNgTbeTrees/S"+segment+"_og_rerooted_FBP.tree", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
	glue.log("FINEST", "Merging rooted TBE tree for segment "+segment);
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", whereClause, 
	                  "-i", "trees/raxmlNgTbeTrees/S"+segment+"_og_rerooted_TBE.tree", "NEWICK_TRANSFER_BOOTSTRAPS", 
	                  "-f", "phylogeny", "--merge" ]);
	});
	glue.log("FINEST", "Exporting display tree for segment "+segment);
	glue.inMode("module/btvNexusExporter", function() {
		glue.command(["export", "tree", "BTV_OUTG_CODON_"+segment, 
		              "-f", "trees/raxmlNgTbeTrees/S"+segment+"_display.nexus"])
	});
	

	
});



