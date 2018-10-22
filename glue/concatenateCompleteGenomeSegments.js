// number of N's used between segments in concatenated sequences.
var gapSize = 100;

// delete old data.
glue.command(["delete", "reference", "REF_MASTER_FULLGENOME"]);
glue.command(["delete", "source", "ncbi-curated-fullgenomes"]);
glue.command(["delete", "source", "ncbi-refseqs-fullgenomes"]);
glue.command(["delete", "source", "ncbi-outgroup-fullgenomes"]);
glue.command(["delete", "alignment", "BTV_OUTG_CODON_FULLGENOME"]);

// find the widths of the PHYLO_UNC_S... alignments (maximum max reference coordinate of any member)
var alignmentWidths = {};
_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 
		function(segNum) {
			glue.inMode("alignment/BTV_OUTG_CODON_"+segNum, function() {
				alignmentWidths[segNum] = _.max(glue.getTableColumn(glue.command(["show", "statistics", "maxRefNt"]), "maxRefNt"));
			});
		}
);

//create an unconstrained alignment for the full genomes
glue.command(["create", "alignment", "BTV_OUTG_CODON_FULLGENOME"]);


// create a sequence ncbi-refseqs-fullgenomes/referenceFullGenome by concatenating all the segment reference sequences
var segNumToRefSeq = {};
glue.command(["create", "source", "ncbi-refseqs-fullgenomes"]);
var refConcatenateCmd = ["concatenate", "sequence", "-g", gapSize, "ncbi-refseqs-fullgenomes", "referenceFullGenome"];
_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	var refSeqID;
	var refSourceName;
	var refObj = glue.tableToObjects(glue.command(["list", "reference", "-w", "name like 'REF_S"+segNum+"_MASTER%'"]))[0];
	refSeqID = refObj["sequence.sequenceID"];
	refSourceName = refObj["sequence.source.name"];
	refConcatenateCmd.push(refSourceName);
	refConcatenateCmd.push(refSeqID);
	var gbLength;
	glue.inMode("sequence/"+refSourceName+"/"+refSeqID, function() {
		gbLength = glue.command(["show", "length"]).lengthResult.length;
	});
	segNumToRefSeq[segNum] = {
		"source.name": refSourceName,
		sequenceID: refSeqID,
		gb_length: gbLength
	}
});
glue.command(refConcatenateCmd);

// add ncbi-refseqs-fullgenomes/referenceFullGenome to this alignment
populateFullGenomeAlignmentRow(segNumToRefSeq, "ncbi-refseqs-fullgenomes", "referenceFullGenome");

// outgroup full genomes.
glue.command(["create", "source", "ncbi-outgroup-fullgenomes"]);

var outgroups = [ {
	accessionPrefix : "AM7449",
	concatenatedSeqID : "ehdvFullGenome"
}, {
	accessionPrefix : "JQ0703",
	concatenatedSeqID : "patavFullGenome"
} ];

_.each(outgroups, function(outgroup) {
	// create a sequence ncbi-outgroup-fullgenomes/outgroupFullGenome by
	// concatenating all the segment outgroup sequences
	var segNumToOutgroupSeq = {};
	var outgroupConcatenateCmd = ["concatenate", "sequence", "-g", gapSize, "ncbi-outgroup-fullgenomes", outgroup.concatenatedSeqID];
	_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
		var outgroupSeqObj = glue.tableToObjects(glue.command(["list", "sequence", 
		                                          "-w", 
		                                          	"source.name = 'ncbi-outgroup' and "+
		                                          	"isolate_segment = '"+segNum+"' and "+
		                                          	"sequenceID like '"+outgroup.accessionPrefix+"%'", 
		                                          "source.name", "sequenceID", "gb_length"]))[0];
		outgroupConcatenateCmd.push("ncbi-outgroup");
		outgroupConcatenateCmd.push(outgroupSeqObj.sequenceID);
		segNumToOutgroupSeq[segNum] = outgroupSeqObj;
	});
	glue.command(outgroupConcatenateCmd);

	// add ncbi-outgroup-fullgenomes/outgroupFullGenome to this alignment
	populateFullGenomeAlignmentRow(segNumToOutgroupSeq, "ncbi-outgroup-fullgenomes", outgroup.concatenatedSeqID);
});

// create a full genome reference sequence based on ncbi-refseqs-fullgenomes/referenceFullGenome, with the main coding regions defined.
var segToFeatureName = {};
segToFeatureName["1"] = "VP1";
segToFeatureName["2"] = "VP2";
segToFeatureName["3"] = "VP3";
segToFeatureName["4"] = "VP4";
segToFeatureName["5"] = "NS1";
segToFeatureName["6"] = "VP5";
segToFeatureName["7"] = "VP7";
segToFeatureName["8"] = "NS2";
segToFeatureName["9"] = "VP6";
segToFeatureName["10"] = "NS3";

glue.command(["create", "reference", "REF_MASTER_FULLGENOME", "ncbi-refseqs-fullgenomes", "referenceFullGenome"]);

var refOffset = 0;

_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	var refSeqID;
	var oldFeatureSegs;
	var featureName = segToFeatureName[segNum];
	
	var refObj = glue.tableToObjects(glue.command(["list", "reference", "-w", "name like 'REF_S"+segNum+"_MASTER%'"]))[0];
	glue.inMode("reference/"+refObj.name+"/feature-location/"+featureName, function() {
		oldFeatureSegs = glue.tableToObjects(glue.command(["list", "segment"]));
	});
	var newFeatureSegs = _.map(oldFeatureSegs, function(oldFeatureSeg) {
		return {
				refStart: oldFeatureSeg.refStart + refOffset,
				refEnd: oldFeatureSeg.refEnd + refOffset
		};
	});
	glue.inMode("reference/REF_MASTER_FULLGENOME", function() {
		glue.command(["add", "feature-location", "FG_S"+segNum+"_whole_genome"]);
		glue.inMode("/feature-location/FG_S"+segNum+"_whole_genome", function() {
			glue.command(["add", "segment", refOffset+1, refOffset+segNumToRefSeq[segNum].gb_length]);
		});
		
		
		glue.command(["add", "feature-location", "FG_"+featureName]);
		glue.inMode("/feature-location/FG_"+featureName, function() {
			_.each(newFeatureSegs, function(newFeatureSeg) {
				glue.command(["add", "segment", newFeatureSeg.refStart, newFeatureSeg.refEnd]);
			});
		});
	});
	
	refOffset = refOffset + segNumToRefSeq[segNum].gb_length + gapSize;
});

// create concatenated sequences in ncbi-curated-fullgenomes for each of the full genome isolates.

var seqIndex = 1;

glue.command(["create", "source", "ncbi-curated-fullgenomes"]);

var isolateIDs = glue.getTableColumn(glue.command(["list", "custom-table-row", "isolate", "-w", "complete_genome = true"]), "id");

_.each(isolateIDs, function(isolateID) {
	var seqObjs;
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		seqObjs = glue.tableToObjects(glue.command(["list", "link-target", "sequence", "source.name", "sequenceID", "gb_length", "isolate_segment", "gb_create_date"]));
	});
	
	var segNumToSeqs = _.groupBy(seqObjs, "isolate_segment");
	
	var segNumToSingleSeqs = {};
	_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 
		function(segNum) {
			var seqs = segNumToSeqs[segNum];
			// sort sequences with preferred sequence at beginning of list.
			var sortedSeqs = seqs.sort(seqCompare);
			segNumToSingleSeqs[segNum] = sortedSeqs[0];
		}
	);

	var concatenatedSeqID = "concatenated_"+seqIndex;
	var concatenateCmd = ["concatenate", "sequence", "-g", gapSize, "ncbi-curated-fullgenomes", concatenatedSeqID];
	seqIndex++;
	_.each(_.pairs(segNumToSingleSeqs), function(pair) {
		concatenateCmd.push(pair[1]["source.name"]);
		concatenateCmd.push(pair[1].sequenceID);
	});
	
	glue.command(concatenateCmd);
	
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		glue.command(["add", "link-target", "sequence", "sequence/ncbi-curated-fullgenomes/"+concatenatedSeqID]);
	});

	// add the sequence to the unconstrained alignment of full genome sequences.
	populateFullGenomeAlignmentRow(segNumToSingleSeqs, "ncbi-curated-fullgenomes", concatenatedSeqID);
});



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

// function to add a sequence to the unconstrained alignment of full genome sequences.
function populateFullGenomeAlignmentRow(segNumToSingleSeqObj, concatenatedSource, concatenatedSeqID) {
	glue.inMode("alignment/BTV_OUTG_CODON_FULLGENOME", function() {
		glue.command(["add", "member", concatenatedSource, concatenatedSeqID]);
	});

	var refOffset = 0;
	var memberOffset = 0;
	_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 
			function(segNum) {
		var segSeqObj = segNumToSingleSeqObj[segNum];
		var alignmentWidth = alignmentWidths[segNum];
		var alignedSegs;
		glue.inMode("alignment/BTV_OUTG_CODON_"+segNum+"/member/"+segSeqObj["source.name"]+"/"+segSeqObj.sequenceID, function() {
			alignedSegs = glue.tableToObjects(glue.command(["list", "segment"]));
		});
		glue.inMode("alignment/BTV_OUTG_CODON_FULLGENOME/member/"+concatenatedSource+"/"+concatenatedSeqID, function() {
			_.each(alignedSegs, function(alignedSeg) {
				var refStart = alignedSeg.refStart + refOffset; 
				var refEnd = alignedSeg.refEnd + refOffset; 
				var memberStart = alignedSeg.memberStart + memberOffset; 
				var memberEnd = alignedSeg.memberEnd + memberOffset; 
				glue.command(["add", "segment", refStart, refEnd, memberStart, memberEnd]);
			});
		});
		refOffset = refOffset + alignmentWidth;
		memberOffset = memberOffset + segSeqObj.gb_length + gapSize;
	}
	);
}



