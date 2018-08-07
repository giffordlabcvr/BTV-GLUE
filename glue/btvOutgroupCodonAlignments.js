glue.command(["multi-delete", "alignment", "-w", "name like 'BTV_OUTG_CODON_%'"]);

var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function almtName(segment) {
	return "BTV_OUTG_CODON_"+segment;
}

_.each(segments, function(segNum) {
	var alName = almtName(segNum);
	glue.inMode("module/btvBlastFastaProteinAlignmentImporter", function() {
		glue.command(["import", alName, "-f", "alignments/btvOutgroupProtein/BTV_OUTG_ALIGNED_"+segNum+".faa"]);
	});
	
	
	glue.inMode("module/fastaAlignmentExporter", function() {
		glue.command(["export", alName, "--allMembers", "--fileName", "alignments/btvOutgroupCodon/"+alName+".fna"]);
	});
	glue.inMode("alignment/"+alName, function() {
		glue.command(["export", "command-document", "--fileName", "alignments/btvOutgroupCodon/"+alName+".json"]);
	});

	
});