var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


_.each(segments, function(segment) {
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_"+segment, 
	                  "-w", "sequence.source.name in ('ncbi-curated', 'ncbi-outgroup')", 
	                  "-i", "trees/phyloTrees/S"+segment+"_protein_rerooted.tree", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
	glue.log("FINEST", "Imported protein tree for segment "+segment);
});
