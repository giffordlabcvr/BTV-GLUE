var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


_.each(segments, function(segment) {
	glue.inMode("module/btvNexusExporter", function() {
		
		glue.command(["export", "tree", "BTV_OUTG_CODON_"+segment, 
		              "-f", "trees/phyloTrees/S"+segment+"_display.nexus"])
	});
	glue.log("FINEST", "Generated display tree for segment "+segment);
});
/*
glue.inMode("module/btvNexusExporter", function() {
	
	glue.command(["export", "tree", "BTV_OUTG_CODON_FULLGENOME", 
	              "-f", "trees/phyloTrees/FULL_GENOMES_display.nexus"])
});

*/