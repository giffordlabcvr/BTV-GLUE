var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function almtName(segment) {
	return "PHYLO_UNC_S"+segment;
}

_.each(segments, function(segment) {
	glue.inMode("module/btvNexusExporter", function() {
		
		glue.command(["export", "tree", almtName(segment), 
		              "-f", "trees/phyloTrees/display/S"+segment+"_display.nexus"])
	});
});
