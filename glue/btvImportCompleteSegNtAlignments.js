var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.command(["import", "alignment", "-f", "alignments/btvCompSegNt/BTV_COMPL_SEG_NT_"+segment+".json"]);
	glue.log("FINEST", "Imported complete-segment-nt alignment for segment "+segment);
});


