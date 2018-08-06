glue.command(["multi-delete", "alignment", "-w", "name like 'PHYLO_UNC_S%'"]);

glue.command(["multi-delete", "alignment", "-w", "name like 'OUTGROUP_MASTER_PAIRWISE_S%'"]);

var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function almtName(segment) {
	return "PHYLO_UNC_S"+segment;
}

_.each(segments, function(segment) {
	var alName = almtName(segment);
	glue.command(["create", "alignment", alName]);
	glue.inMode("alignment/"+alName, function() {
		// add reference for this sequence, so that we can 
		// -- use it to derive segments for the outgroup.
		// -- use it to pick out alignment columns (e.g. coding region).
		glue.command(["add", "member", "-w", "referenceSequences.name = 'REF_S"+segment+"_MASTER'"]);
		// add curated sequences for this segment
		glue.command(["add", "member", "-w", "isolate_segment = '"+segment+"' and excluded = 'false' and complete_segment = 'true' and source.name = 'ncbi-curated'"]);
	});
	glue.command(["compute", "alignment", alName, "mafftAligner"]);
	
	glue.inMode("module/btvBlastFastaProteinAlignmentImporter", function() {
		glue.command(["import", "OUTGROUP_MASTER_PAIRWISE_S"+segment, 
		              "-f", "alignments/outgroupWithReference/S"+segment+"_aligned.faa"]);
	});

	glue.inMode("alignment/"+alName, function() {
		glue.command(["derive", "segments", "OUTGROUP_MASTER_PAIRWISE_S"+segment, 
		              "-l", "REF_S"+segment+"_MASTER", 
		              "-w", "sequence.source.name = 'ncbi-outgroup'"]);
	});
	
	
	glue.inMode("module/fastaAlignmentExporter", function() {
		glue.command(["export", alName, "--allMembers", "--fileName", "alignments/phyloUnconstrained/"+alName+".fna"]);
	});
	glue.inMode("alignment/"+alName, function() {
		glue.command(["export", "command-document", "--fileName", "alignments/phyloUnconstrained/"+alName+".json"]);
	});
});