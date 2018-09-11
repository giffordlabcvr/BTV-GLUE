var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


_.each(segments, function(segment) {
	glue.inMode("module/btvNexusExporter", function() {
		
		glue.command(["export", "tree", "BTV_OUTG_CODON_"+segment, 
		              "-f", "trees/phyloTrees/S"+segment+"_protein_display.nexus"])
	});
	glue.log("FINEST", "Generated protein display tree for segment "+segment);
});
