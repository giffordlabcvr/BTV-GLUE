/**
 * This module generates various objects (reference sequences, module configs, alignments) based on a
 * single JSON file which defines the clade structure and reference sequence choices for each segment.
 * 
 * The point of this is to have these choices in one place, so that they can be updated easily.
 * 
 * Note, currently, the clade structure file is only in place for segment 2.
 */



function getRefSeqName(alignmentObj, refSeqObj) {
	return "REF_"+getCladeID(alignmentObj)+"_"+refSeqObj.sequenceID;
}

function getCladeID(alignmentObj) {
	return alignmentObj.alignmentName.replace("AL_", "");
}


function generateRefSeqNcbiImporter(jsonStructureFile, ncbiImporterFile) {
	
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	
	var refSeqImporterString = 
		"<ncbiImporter>\n"+
		"  <sequenceFormat>GENBANK_XML</sequenceFormat>\n"+
		"  <specificPrimaryAccessions>\n";

	var sourceName = cladeStructure.referenceSourceName;
	
	visitStructureRefseqs(cladeStructure, function(refseq) {
		refSeqImporterString += 
			"    <primaryAccession>"+refseq.sequenceID+"</primaryAccession>\n"
	});
	
	refSeqImporterString += 
		"  </specificPrimaryAccessions>\n"+
		"  <sequenceIdField>PRIMARY_ACCESSION</sequenceIdField>\n"+
		"  <sourceName>"+sourceName+"</sourceName>\n"+
		"</ncbiImporter>\n";
		
	glue.command(["file-util", "save-string", refSeqImporterString, ncbiImporterFile]);
}

function generateGenotypeBlastRecogniser(jsonStructureFile, blastRecogniserFile) {
	
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	
	var blastRecogniserString = 
		"<blastSequenceRecogniser>\n"+
		"  <blastRunner>\n"+
		"    <generalSearch>\n"+
		"      <word_size>8</word_size>\n"+
		"    </generalSearch>\n"+
		"    <restrictSearchOrResults>\n"+
		"    </restrictSearchOrResults>\n"+
		"  </blastRunner>\n";

	var sourceName = cladeStructure.referenceSourceName;
	
	var categoriesString = "";
	
	visitStructureAlignmentsPost(cladeStructure, function(alignment) {
		if(alignment.referenceSequences != null) {
			var cladeID = getCladeID(alignment);
			categoriesString += 
				"  <recognitionCategory>\n"+
				"    <id>"+cladeID+"</id>\n"+
				"    <minimumBitScore>100</minimumBitScore>\n";
			_.each(alignment.referenceSequences, function(refSeqObj) {
				var refSeqName = getRefSeqName(alignment, refSeqObj);
				blastRecogniserString +=
					"  <referenceSequence>"+refSeqName+"</referenceSequence>\n";
				categoriesString +=
					"    <referenceSequence>"+refSeqName+"</referenceSequence>\n";
			});
			categoriesString += 
				"  </recognitionCategory>\n";
		}
	});
	blastRecogniserString += categoriesString;
	
	blastRecogniserString += 
	"  <!-- if one category result has an HSP with a bit score more than 100 higher than the highest bit score in a second category result, \n"+
	"       the second category result is discarded -->\n"+
	"  <maxBitScoreCategoryResultResolver>\n"+
	"    <minDifference>100</minDifference>\n"+
	"  </maxBitScoreCategoryResultResolver>\n"+
	"  <!-- if one category result has an HSP with a total alignment length more 50 higher than the total alignment length in a second category result, \n"+
	"	    the second category result is discarded -->\n"+
	"  <totalAlignLengthCategoryResultResolver>\n"+
	"	 <minDifference>50</minDifference>\n"+
	"  </totalAlignLengthCategoryResultResolver>\n"+
	"</blastSequenceRecogniser>\n";

	glue.command(["file-util", "save-string", blastRecogniserString, blastRecogniserFile]);
}


function generateSegmentBlastRecogniser(blastRecogniserFile) {
	var s2CladeStructure = loadJsonCladeStructure("json/S2_clade_structure_and_refs.json");
	
	var s2RefsString = "";
	
	visitStructureAlignmentsPost(s2CladeStructure, function(alignment) {
		if(alignment.referenceSequences != null) {
			var cladeID = getCladeID(alignment);
			_.each(alignment.referenceSequences, function(refSeqObj) {
				var refSeqName = getRefSeqName(alignment, refSeqObj);
				s2RefsString +=
					"<referenceSequence>"+refSeqName+"</referenceSequence>\n";
			});
		}
	});
	
	var blastRecogniserString = 
		"<blastSequenceRecogniser>\n"+
		"  <blastRunner>\n"+
		"    <generalSearch>\n"+
		"      <word_size>8</word_size>\n"+
		"    </generalSearch>\n"+
		"    <restrictSearchOrResults>\n"+
		"    </restrictSearchOrResults>\n"+
		"  </blastRunner>\n"+
		"<referenceSequence>REF_S1_MASTER</referenceSequence>\n"+
		s2RefsString+
		"<referenceSequence>REF_S3_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S4_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S5_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S7_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S8_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S9_MASTER</referenceSequence>\n"+
		"<referenceSequence>REF_S10_MASTER</referenceSequence>\n"+
	  	"<referenceSequence>REF_S6_genotype_1</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_2</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_3</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_4</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_5</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_6</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_7</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_8</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_9</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_10</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_11</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_12</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_13</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_14</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_15</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_16</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_17</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_18</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_19</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_20</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_21</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_22</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_23</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_24</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_25</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_26</referenceSequence>\n"+
		"<referenceSequence>REF_S6_genotype_27</referenceSequence>\n"+
		"<recognitionCategory>\n"+
		"<id>S1</id>\n"+
		"<minimumBitScore>50</minimumBitScore>\n"+
		"<referenceSequence>REF_S1_MASTER</referenceSequence>\n"+
	"</recognitionCategory>\n"+
	"<recognitionCategory>\n"+
		"<id>S2</id>\n"+
	    "<minimumBitScore>50</minimumBitScore>\n"+
	    s2RefsString+
	    "</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S3</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S3_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S4</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S4_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S5</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S5_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S6</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S6_genotype_1</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_2</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_3</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_4</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_5</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_6</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_7</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_8</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_9</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_10</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_11</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_12</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_13</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_14</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_15</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_16</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_17</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_18</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_19</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_20</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_21</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_22</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_23</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_24</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_25</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_26</referenceSequence>\n"+
			"<referenceSequence>REF_S6_genotype_27</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S7</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S7_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S8</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S8_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S9</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S9_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
		"<recognitionCategory>\n"+
			"<id>S10</id>\n"+
			"<minimumBitScore>50</minimumBitScore>\n"+
			"<referenceSequence>REF_S10_MASTER</referenceSequence>\n"+
		"</recognitionCategory>\n"+
	"</blastSequenceRecogniser>\n";
		
	glue.command(["file-util", "save-string", blastRecogniserString, blastRecogniserFile]);
	
}

function createGlueReferenceSequences(jsonStructureFile) {

	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	var sourceName = cladeStructure.referenceSourceName;

	
	visitStructureAlignmentsPost(cladeStructure, function(alignment) {
		var allRefs = [];
		allRefs.push(alignment.constrainingRef);
		if(alignment.referenceSequences != null) {
			allRefs = allRefs.concat(alignment.referenceSequences);
		}
		allRefs = _.uniq(allRefs, function(refSeqObj) { return refSeqObj.sequenceID; });
		_.each(allRefs, function(refSeqObj) {
			var refSeqName = getRefSeqName(alignment, refSeqObj);
			glue.command(["create", "reference", refSeqName, sourceName, refSeqObj.sequenceID]);
		});
	});

}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) {
    	s = "0" + s;
    }
    return s;
}

function createAlignmentTree(jsonStructureFile, genoCodonAlignmentName) {

	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	var sourceName = cladeStructure.referenceSourceName;
	var masterRefObj = cladeStructure.constrainingRef;
	var masterRefName = getRefSeqName(cladeStructure, masterRefObj);
	var masterAlmtName = cladeStructure.alignmentName;
	glue.command(["delete", "alignment", masterAlmtName]);
	glue.command(["create", "alignment", masterAlmtName, "--refSeqName", masterRefName]);
	visitStructureAlignmentsPre(cladeStructure, function(alignment) {
		glue.inMode("/alignment/"+alignment.alignmentName, function() {
			glue.command(["set", "field", "clade_category", alignment.cladeCategory]);
			if(alignment.almtDisplayName != null) {
				glue.command(["set", "field", "displayName", alignment.almtDisplayName]);
			}
			var numericSortKey = alignment.numericSortKey;
			if(numericSortKey == null) {
				numericSortKey = 0;
			}
			var alphaSortKey = alignment.alphaSortKey;
			if(alphaSortKey == null) {
				alphaSortKey = "";
			}
			var sortKey = pad(numericSortKey, 5)+alphaSortKey;
			glue.command(["set", "field", "sort_key", sortKey]);
		});
		if(alignment.childAlignments != null) {
			_.each(alignment.childAlignments, function(childAlignment) {
				glue.command(["delete", "alignment", childAlignment.alignmentName]);
				glue.inMode("/alignment/"+alignment.alignmentName, function() {
					var childRefName = getRefSeqName(childAlignment, childAlignment.constrainingRef);
					glue.command(["add", "member", "--refName", childRefName]);
					glue.command(["extract", "child", childAlignment.alignmentName, "--refName", childRefName]);
					// this demote member command is just to get the referenceMember flag set to true on the member
					// in the parent alignment.
					glue.command(["demote", "member", childAlignment.alignmentName, "--member", sourceName, childAlignment.constrainingRef.sequenceID]);

				});
			});
		}
		if(alignment.referenceSequences != null) {
			_.each(alignment.referenceSequences, function(refObj) {
				glue.inMode("/alignment/"+alignment.alignmentName, function() {
					glue.command(["add", "member", sourceName, refObj.sequenceID]);
				});
				glue.inMode("/sequence/"+sourceName+"/"+refObj.sequenceID, function() {
					glue.command(["set", "field", "annotated_clade_id", getCladeID(alignment)]);
				});
			});
		}
		glue.inMode("/alignment/"+alignment.alignmentName, function() {
			glue.command(["derive", "segments", genoCodonAlignmentName, "--existingMembersOnly", "--allMembers"]);
		});
			
	});

}



function generateGenotypingCodonAlignment(jsonStructureFile, outgCodonAlignmentName, genoCodonAlignmentName) {
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);

	glue.command(["delete", "alignment", genoCodonAlignmentName]);

	glue.command(["create", "alignment", genoCodonAlignmentName]);
	

	// we assume that the members of outgCodonAlignment which we need to replicate, are in this source.
	var curatedSourceName = "ncbi-curated";

	var sourceName = cladeStructure.referenceSourceName;
	
	visitStructureRefseqs(cladeStructure, function(refseq) {
		var sequenceID = refseq.sequenceID;
		
		var segmentObjs;
		
		glue.inMode("alignment/"+outgCodonAlignmentName+"/member/"+curatedSourceName+"/"+sequenceID, function() {
			segmentObjs = glue.tableToObjects(glue.command(["list", "segment"]));
		});
		

		glue.inMode("alignment/"+genoCodonAlignmentName, function() {
			glue.command(["add", "member", sourceName, sequenceID]);
			glue.inMode("member/"+sourceName+"/"+sequenceID, function() {
				_.each(segmentObjs, function(segmentObj) {
					glue.command(["add", "segment", 
					              segmentObj.refStart, segmentObj.refEnd, segmentObj.memberStart, segmentObj.memberEnd]);
				});
			});

		});
	});

	
}



function loadJsonCladeStructure(jsonStructureFile) {
	var loadedString = 
		glue.command(["file-util", "load-string", jsonStructureFile]).fileUtilLoadStringResult.loadedString;
	return JSON.parse(loadedString);
}

// visit all refseq objects in post-order fashion
function visitStructureRefseqs(structureNode, refseqCallback) {
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureRefseqs(childAlignment, refseqCallback);
		});
	}
	if(structureNode.referenceSequences != null) {
		_.each(structureNode.referenceSequences, refseqCallback);
	}
}

//visit all alignment objects in post-order fashion
function visitStructureAlignmentsPost(structureNode, alignmentCallback) {
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureAlignmentsPost(childAlignment, alignmentCallback);
		});
	}
	alignmentCallback(structureNode);
}

//visit all alignment objects in pre-order fashion
function visitStructureAlignmentsPre(structureNode, alignmentCallback) {
	alignmentCallback(structureNode);
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureAlignmentsPre(childAlignment, alignmentCallback);
		});
	}
}
