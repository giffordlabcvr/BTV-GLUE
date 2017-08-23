glue.command(["multi-delete", "alignment", "-w", "name like 'PHYLO%'"]);

var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function almtName(segment) {
	return "PHYLO_UNC_S"+segment;
}

_.each(segments, function(segment) {
	glue.command(["create", "alignment", almtName(segment)]);
	glue.inMode("alignment/"+almtName(segment), function() {
		glue.command(["add", "member", "-w", "gb_segment = '"+segment+"' and complete_segment = 'true' and source.name = 'ncbi-curated'"]);
	});
	glue.command(["compute", "alignment", almtName(segment), "mafftAligner"]);
});