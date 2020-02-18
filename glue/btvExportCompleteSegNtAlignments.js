var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.inMode("alignment/BTV_COMPL_SEG_NT_"+segment, function() {
		glue.command(["export", "command-document", "-f", "alignments/btvCompSegNt/BTV_COMPL_SEG_NT_"+segment+".json"]);
	});
	glue.log("FINEST", "Exported complete-segment-nt alignment for segment "+segment);
});


