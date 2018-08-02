
var isolateIDs = glue.getTableColumn(glue.command(["list", "custom-table-row", "isolate", "-w", "complete_genome = true"]), "id");

// function used to pick a sequence when there are multiple available for a segment.
// prefer longer sequences first, break ties by preferring earlier GB create date.
// finally sort on sequenceID
function seqCompare(seq1, seq2) {
	if(seq1.gb_length > seq2.gb_length) {
		// prefer seq1
		return -1;
	}
	if(seq1.gb_length < seq2.gb_length) {
		// prefer seq2
		return 1;
	}
	var date1 = new Date(seq1.gb_create_date.replace(/-/g, " "));
	var date2 = new Date(seq2.gb_create_date.replace(/-/g, " "));
	if(date1.getTime() < date2.getTime()) {
		return -1;
	} else if(date1.getTime() > date2.getTime()) {
		return 1;
	} 
	if(seq1.sequenceID < seq2.sequenceID) {
		return -1;
	} else {
		return 1;
	}
}

glue.command(["delete", "source", "ncbi-fullgenomes"]);
glue.command(["create", "source", "ncbi-fullgenomes"]);

glue.command(["delete", "alignment", "PHYLO_UNC_FULLGENOMES"])
glue.command(["create", "alignment", "PHYLO_UNC_FULLGENOMES"])

var seqIndex = 1;

// find the widths of the PHYLO_UNC_S... alignments (maximum max reference coordinate of any member)
var alignmentWidths = {};
_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 
		function(segNum) {
			glue.inMode("alignment/PHYLO_UNC_S"+segNum, function() {
				alignmentWidths[segNum] = _.max(glue.getTableColumn(glue.command(["show", "statistics", "maxRefNt"]), "maxRefNt"));
			});
		}
);



_.each(isolateIDs, function(isolateID) {
	var seqObjs;
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		seqObjs = glue.tableToObjects(glue.command(["list", "link-target", "sequence", "sequenceID", "gb_length", "isolate_segment", "gb_create_date"]));
	});
	
	var segNumToSeqs = _.groupBy(seqObjs, "isolate_segment");
	
	var chosenSeqs = {};
	_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 
		function(segNum) {
			var seqs = segNumToSeqs[segNum];
			// sort sequences with preferred sequence at beginning of list.
			var sortedSeqs = seqs.sort(seqCompare);
			chosenSeqs[segNum] = sortedSeqs[0];
		}
	);

	var concatenatedSeqID = "concatenated_"+seqIndex;
	var concatenateCmd = ["concatenate", "sequence", "-g", "100", "ncbi-fullgenomes", concatenatedSeqID];
	seqIndex++;
	_.each(_.pairs(chosenSeqs), function(pair) {
		concatenateCmd.push("ncbi-curated");
		concatenateCmd.push(pair[1].sequenceID);
	});
	
	glue.command(concatenateCmd);
	
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		glue.command(["add", "link-target", "sequence", "sequence/ncbi-fullgenomes/"+concatenatedSeqID]);
	});

	glue.inMode("alignment/PHYLO_UNC_FULLGENOMES", function() {
		
	});
	
});

glue.logInfo("alignmentWidths", alignmentWidths);