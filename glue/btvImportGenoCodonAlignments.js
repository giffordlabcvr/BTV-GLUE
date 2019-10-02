var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.command(["import", "alignment", "-f", "alignments/btvGenotypingCodon/BTV_GENO_CODON_"+segment+".json"]);
	glue.log("FINEST", "Imported genotyping-codon alignment for segment "+segment);
});