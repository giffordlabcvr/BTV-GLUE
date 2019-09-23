// allow different rooting strategies per segment; 
// on some segments outgroup rooting worked, on others it looks wrong.

var segments = [
	{ seg: "1",
	  rooting: "og" },
	{ seg: "2",
      rooting: "og" },
	{ seg: "3",
	  rooting: "og" },
	{ seg: "4",
	  rooting: "og" },
	{ seg: "5",
	  rooting: "mp" },
	{ seg: "6",
	  rooting: "og" },
	{ seg: "7",
	  rooting: "og" },
	{ seg: "8",
	  rooting: "mp" },
	{ seg: "9",
	  rooting: "mp" },
	{ seg: "10",
	  rooting: "mp" },
];
_.each(segments, function(segObj) {
	var segment = segObj.seg;
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
		
		
		glue.inMode("module/btvPhyloUtility", function() {
			var whereClause = "sequence.source.name in ('ncbi-outgroup')";
			if(segment == "6") {
				// A bunch of Seg 6 genotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
				// outgroup. Instead we just use PATAV
				whereClause = "sequence.sequenceID = 'JQ070391'";
			}
			// create the outgroup-rerooted phylogeny (with outgroups removed).
			var ogRerootedTreePath = "trees/raxmlNgTbeTrees/S"+segment+"_og_rerooted_"+bootstrapMetric+".tree";
			var mpRerootedTreePath = "trees/raxmlNgTbeTrees/S"+segment+"_mp_rerooted_"+bootstrapMetric+".tree";
			glue.log("FINEST", "Creating outgroup-rerooted "+bootstrapMetric+" tree for segment "+segment);
		    glue.command(["reroot-alignment-phylogeny", 
                "BTV_OUTG_CODON_"+segment, "phylogeny", 
                "--whereClause", whereClause, 
                "--removeOutgroup",
                "-o", ogRerootedTreePath, phyloFormat]);
			// create the midpoint-rerooted phylogeny from the outgroup.
			glue.log("FINEST", "Creating midpoint-rerooted "+bootstrapMetric+" tree for segment "+segment);
		    glue.command(["reroot-phylogeny", 
                "-i", ogRerootedTreePath, phyloFormat,
                "--midpoint", 
                "-o", mpRerootedTreePath, phyloFormat]);
		});
	});
	
	glue.log("FINEST", "Importing rooted FBP tree for segment "+segment);
	
	var whereClause = "sequence.source.name in ('ncbi-curated')";
	if(segment == "6") {
		// A bunch of Seg 6 genotypes group within PATAV+EHDV, so the internal node of these two cannot be used as an
		// outgroup. Instead PATAV is used as an outgroup and so EHDV remains in the tree
		whereClause = whereClause +" or (sequence.sequenceID = 'AM744982')";
	}
	var rooting = segObj.rooting;
	
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", whereClause, 
	                  "-i", "trees/raxmlNgTbeTrees/S"+segment+"_"+rooting+"_rerooted_FBP.tree", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
	glue.log("FINEST", "Merging rooted TBE tree for segment "+segment);
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", whereClause, 
	                  "-i", "trees/raxmlNgTbeTrees/S"+segment+"_"+rooting+"_rerooted_TBE.tree", "NEWICK_TRANSFER_BOOTSTRAPS", 
	                  "-f", "phylogeny", "--merge" ]);
	});
	
});



