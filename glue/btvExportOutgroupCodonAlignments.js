var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


_.each(segments, function(segment) {
	glue.inMode("alignment/BTV_OUTG_CODON_"+segment, function() {
		glue.command(["export", "command-document", "-f", "alignments/btvOutgroupCodon/BTV_OUTG_CODON_"+segment+".json"]);
	});
	glue.log("FINEST", "Exported outgroup-codon alignment for segment "+segment);
});


