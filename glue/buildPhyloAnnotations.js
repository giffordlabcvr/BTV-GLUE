var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function almtName(segment) {
	return "PHYLO_UNC_S"+segment;
}

_.each(segments, function(segment) {
	glue.inMode("module/btvFigTreeAnnotationExporter", function() {
		
		glue.command(["export", "figtree-annotation", almtName(segment), 
		              "--whereClause", "sequence.source.name = 'ncbi-curated' and sequence.isolate_segment = '"+segment+"'",
		              "--fileName", "trees/phyloTrees/S"+segment+"_annotations.txt"])
	});
});
