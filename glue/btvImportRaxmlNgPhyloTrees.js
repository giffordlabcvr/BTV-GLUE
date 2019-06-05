var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.log("FINEST", "Importing unrooted FBP tree for segment "+segment);
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", "sequence.source.name in ('ncbi-curated', 'ncbi-outgroup')", 
	                  "-i", "trees/raxmlNgTbeTrees/S"+segment+".raxml.supportFBP", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
});

