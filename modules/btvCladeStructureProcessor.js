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

function generateRefseqCopyScript() {

	var copyScript = "";
	
	for(var i = 1; i <= 10; i++) {
		var cladeStructure = loadJsonCladeStructure("json/S"+i+"_clade_structure_and_refs.json");
		var sourceName = cladeStructure.referenceSourceName;
		copyScript += "rm -rf sources/"+sourceName+"\n";
		copyScript += "mkdir -p sources/"+sourceName+"\n";
		
		visitStructureRefseqs(cladeStructure, function(refseq) {
			var oldSourceName = "ncbi-curated";
			if(refseq.sequenceID == "AM744982") {
				oldSourceName = "ncbi-outgroup";
			}
			
			copyScript += 
				"cp sources/"+oldSourceName+"/"+refseq.sequenceID+".xml sources/"+sourceName+"\n"
		});
		glue.logInfo("Generated copy script for segment "+i);
	}

	glue.command(["file-util", "save-string", copyScript, "copyRefsFromCurated.sh"]);

	
}

function generateSegmentBlastRecogniser(blastRecogniserFile) {

	var segNumToRefsString = {};
	
	for(var segNum = 1; segNum <= 10; segNum++) {
		var cladeStructure = loadJsonCladeStructure("json/S"+segNum+"_clade_structure_and_refs.json");
		
		var refsString = "";
		
		visitStructureAlignmentsPost(cladeStructure, function(alignment) {
			if(alignment.referenceSequences != null) {
				var cladeID = getCladeID(alignment);
				_.each(alignment.referenceSequences, function(refSeqObj) {
					var refSeqName = getRefSeqName(alignment, refSeqObj);
					refsString +=
						"<referenceSequence>"+refSeqName+"</referenceSequence>\n";
				});
			}
		});
		
		segNumToRefsString[""+segNum] = refsString;
	}
	
	var blastRecogniserString = 
		"<blastSequenceRecogniser>\n"+
		"  <blastRunner>\n"+
		"    <generalSearch>\n"+
		"      <word_size>8</word_size>\n"+
		"    </generalSearch>\n"+
		"    <restrictSearchOrResults>\n"+
		"    </restrictSearchOrResults>\n"+
		"  </blastRunner>\n";
	
	_.each(_.pairs(segNumToRefsString), function(pair) {
		blastRecogniserString += pair[1];
	});
	_.each(_.pairs(segNumToRefsString), function(pair) {
		blastRecogniserString += "<recognitionCategory>\n"+
		"<id>S"+pair[0]+"</id>\n"+
		"<minimumBitScore>50</minimumBitScore>\n"+
		pair[1]+
		"</recognitionCategory>\n";
	});
	
	blastRecogniserString += "</blastSequenceRecogniser>\n";
		
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
				glue.command(["set", "field", "minimal_name", alignment.almtDisplayName.replace("Genogroup ", "").replace("Genotype ", "")]);
				
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

function generateAllGenotypingCodonAlignments() {
	for(var i = 1; i <= 10; i++) {
		glue.logInfo("Generating genotyping codon alignment for segment "+i);
		var almtName = "BTV_GENO_CODON_"+i;
		generateGenotypingCodonAlignment("json/S"+i+"_clade_structure_and_refs.json", 
				"BTV_OUTG_CODON_"+i, almtName);
		glue.inMode("module/fastaAlignmentExporter", function() {
			glue.command(["export", almtName, "-a", "-o", "alignments/btvGenotypingCodon/"+almtName+".fna"]);
		});
		glue.inMode("alignment/"+almtName, function() {
			glue.command(["export", "command-document", "-f", "alignments/btvGenotypingCodon/"+almtName+".json"]);
		});
	}
}


// replicate a subset of rows of an OUTG_CODON alignment, placing them in a GENO_CODON alignment.
// the specific rows are given by a clade structure file.

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
		
		var oldSourceName = curatedSourceName;
		if(sequenceID == "AM744982") {
			oldSourceName = "ncbi-outgroup";
		}
		
		glue.inMode("alignment/"+outgCodonAlignmentName+"/member/"+oldSourceName+"/"+sequenceID, function() {
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
