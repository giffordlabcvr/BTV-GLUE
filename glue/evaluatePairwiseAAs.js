for(var seg = 1; seg <= 10; seg++) {
	var pairwiseAlmt;

	glue.inMode("module/fastaUtility", function() {
		pairwiseAlmt = glue.command(["load-amino-acid-fasta", "alignments/outgroupWithReference/S"+seg+"_aligned.faa"]);
	});

	var seq0 = pairwiseAlmt.aminoAcidFasta.sequences[0].sequence;
	var seq1 = pairwiseAlmt.aminoAcidFasta.sequences[1].sequence;

	var runLengthToNumRuns = {};
	var position = 0;
	var lastRunStart = -1;
	var totalIdentity = 0;

	for(var position = 0; position < seq0.length; position++) {
		if(position >= seq1.length) {
			break;
		}
		if(seq0[position] == seq1[position]) {
			totalIdentity++;
			if(lastRunStart == -1) {
				lastRunStart = position;
			}
		} else {
			if(lastRunStart != -1) {
				var runLength = position - lastRunStart;
				var numRuns = runLengthToNumRuns[runLength];
				if(numRuns == null) {
					numRuns = 0;
				}
				numRuns++;
				runLengthToNumRuns[runLength] = numRuns;
				lastRunStart = -1;
			}
		}
	}
	if(lastRunStart != -1) {
		var runLength = position - lastRunStart;
		var numRuns = runLengthToNumRuns[runLength];
		if(numRuns == null) {
			numRuns = 0;
		}
		numRuns++;
		runLengthToNumRuns[runLength] = numRuns;
		lastRunStart = -1;
	}

	glue.logInfo("segment", seg);
	glue.logInfo("runLengthToNumRuns", runLengthToNumRuns);
	glue.logInfo("totalLength", position);
	glue.logInfo("totalIdentity", totalIdentity);
}

