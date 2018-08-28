var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.command(["import", "alignment", "-f", "alignments/btvCompSegNt/BTV_COMPL_SEG_NT_"+segment+".json"]);
	glue.command(["import", "alignment", "-f", "alignments/btvOutgroupCodon/BTV_OUTG_CODON_"+segment+".json"]);
	
	
	glue.log("FINEST", "Imported complete-segment-nt / outgroup-codon alignments for segment "+segment);
});


var segments = ["2"];

_.each(segments, function(segment) {
	glue.command(["import", "alignment", "-f", "alignments/btvGenotypingCodon/BTV_GENO_CODON_"+segment+".json"]);
	glue.log("FINEST", "Imported genotyping-codon alignments for segment "+segment);
});