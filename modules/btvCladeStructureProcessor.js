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

function generateBlastRecogniser(jsonStructureFile, blastRecogniserFile) {
	
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
	
	visitStructureAlignments(cladeStructure, function(alignment) {
		if(alignment.referenceSequences != null) {
			var cladeID = alignment.alignmentName.replace("AL_", "");
			categoriesString += 
				"  <recognitionCategory>\n"+
				"    <id>"+cladeID+"</id>\n"+
				"    <minimumBitScore>100</minimumBitScore>\n";
			_.each(alignment.referenceSequences, function(refSeqObj) {
				var refSeqName = "REF_"+cladeID+"_"+refSeqObj.sequenceID;
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



function createGlueReferenceSequences(jsonStructureFile) {

	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	var sourceName = cladeStructure.referenceSourceName;


	visitStructureAlignments(cladeStructure, function(alignment) {
		var allRefs = [];
		allRefs.push(alignment.constrainingRef);
		if(alignment.referenceSequences != null) {
			allRefs = allRefs.concat(alignment.referenceSequences);
		}
		allRefs = _.uniq(allRefs, function(refSeqObj) { return refSeqObj.sequenceID; });
		_.each(allRefs, function(refSeqObj) {
			var refSeqName = "REF_"+alignment.alignmentName.replace("AL_", "")+"_"+refSeqObj.sequenceID;
			glue.command(["create", "reference", refSeqName, sourceName, refSeqObj.sequenceID]);
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
function visitStructureAlignments(structureNode, alignmentCallback) {
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureAlignments(childAlignment, alignmentCallback);
		});
	}
	alignmentCallback(structureNode);
}

