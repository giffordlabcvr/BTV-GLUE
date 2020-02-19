var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	// can switch to using BLAST here rather than json, as json is too brittle in the face of ncbi-curated updates.
	// when these alignments are re-exported we can switch back for a faster build.
	// glue.inMode("module/btvBlastFastaAlignmentImporter", function() {
	//	glue.command(["import", "BTV_OUTG_CODON_"+segment, "-f", "alignments/btvOutgroupCodon/BTV_OUTG_CODON_"+segment+".fna"]);
	//});
	glue.command(["import", "alignment", "-f", "alignments/btvOutgroupCodon/BTV_OUTG_CODON_"+segment+".json"]);
	glue.log("FINEST", "Imported outgroup-codon alignment for segment "+segment);
});


