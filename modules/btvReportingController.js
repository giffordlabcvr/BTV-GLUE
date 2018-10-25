
var segToSegDetails = {};

segToSegDetails["1"] = {
    mainFeature : "VP1",
    allFeatures : ["VP1"],
    linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["2"] = {
    mainFeature : "VP2",
    allFeatures : ["VP2"],
	linkingAlignment : "BTV_GENO_CODON_2",
	masterReference : "REF_S2_MASTER_JX680458",
	sequenceReporterModule: "btvSeg2SequenceReporter",
	genotyperModule: "btvS2MaxLikelihoodGenotyper",
};
segToSegDetails["3"] = {
    mainFeature : "VP3",
    allFeatures : ["VP3"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["4"] = {
    mainFeature : "VP4",
    allFeatures : ["VP4"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["5"] = {
    mainFeature : "NS1",
    allFeatures : ["NS1"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["6"] = {
    mainFeature : "VP5",
    allFeatures : ["VP5"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["7"] = {
    mainFeature : "VP7",
    allFeatures : ["VP7"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["8"] = {
    mainFeature : "NS2",
    allFeatures : ["NS2"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["9"] = {
    mainFeature : "VP6",
    allFeatures : ["VP6", "VP6a", "NS4"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};
segToSegDetails["10"] = {
    mainFeature : "NS3",
    allFeatures : ["NS3", "NS3a", "NS5"],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
};

function segmentCladeCategories(segment) {
	var genotyperModule = segToSegDetails[segment].genotyperModule;
	if(segToSegDetails[segment].cladeCategories == null) {
		glue.inMode("module/"+genotyperModule, function() {
			segToSegDetails[segment].cladeCategories = glue.tableToObjects(glue.command(["list", "clade-category"]));
		});
	}
	return segToSegDetails[segment].cladeCategories;
}


//var staticResult = ;


function reportFastaWeb(base64, filePath) {
	glue.log("FINE", "btvReportingController.reportFastaWeb invoked");
	var fastaDocument;
	glue.inMode("module/fastaUtility", function() {
		fastaDocument = glue.command(["base64-to-nucleotide-fasta", base64]);
	});
	return reportFastaMultiAux(fastaDocument, filePath);
}

function reportFastaMulti(filePath) {
	glue.log("FINE", "btvReportingController.reportFastaWeb invoked");
	var fastaDocument;
	glue.inMode("module/fastaUtility", function() {
		fastaDocument = glue.command(["load-nucleotide-fasta", filePath]);
	});
	return reportFastaMultiAux(fastaDocument, filePath);
}

function reportFastaMultiAux(fastaDocument, filePath) {
	var numSequencesInFile = fastaDocument.nucleotideFasta.sequences.length;
	if(numSequencesInFile == 0) {
		throw new Error("No sequences found in FASTA file");
	}
	var fastaMap = {};
	var resultMap = {};
	// apply blast recogniser / genotyping together on set, as this is more efficient.
	initResultMap(fastaDocument, fastaMap, resultMap);
	// apply report generation to each sequence in the set.
	var btvReports = _.map(fastaDocument.nucleotideFasta.sequences, function(sequence) {
		return generateSingleFastaReport(_.pick(fastaMap, sequence.id), resultMap[sequence.id], filePath);
	});
	var result = {
		btvWebReport:  { 
			results: btvReports
		}
	};

	glue.log("FINE", "btvReportingController.reportFastaMultiAux result", result);
	return result;
}

/**
 * Entry point for generating a report for a fasta file containing a single sequence.
 */
function reportFasta(fastaFilePath) {
	glue.log("FINE", "btvReportingController.reportFasta invoked, input file:"+fastaFilePath);
	// Load fasta and put in a fastaMap
	var fastaDocument;
	glue.inMode("module/fastaUtility", function() {
		fastaDocument = glue.command(["load-nucleotide-fasta", fastaFilePath]);
	});
	var numSequencesInFile = fastaDocument.nucleotideFasta.sequences.length;
	if(numSequencesInFile == 0) {
		throw new Error("No sequences found in FASTA file");
	}
	if(numSequencesInFile > 1) {
		throw new Error("Please use only one sequence per FASTA file");
	}
	var sequenceID = fastaDocument.nucleotideFasta.sequences[0].id;
	var fastaMap = {};
	var resultMap = {};
	initResultMap(fastaDocument, fastaMap, resultMap);
	return generateSingleFastaReport(fastaMap, resultMap[sequenceID], fastaFilePath);
}

function initResultMap(fastaDocument, fastaMap, resultMap) {
	glue.log("FINE", "btvReportingController.initResultMap fastaDocument:", fastaDocument);
	_.each(fastaDocument.nucleotideFasta.sequences, function(sequenceObj) {
		fastaMap[sequenceObj.id] = sequenceObj;
	});
	// initialise result map.
	var sequenceObjs = _.values(fastaMap);
	_.each(sequenceObjs, function(sequenceObj) {
		resultMap[sequenceObj.id] = { id: sequenceObj.id };
	});
	// apply recogniser to fastaMap
	recogniseFasta(fastaMap, resultMap);

	glue.log("FINE", "btvReportingController.initResultMap, result map after recogniser", resultMap);

	// apply genotyping
	genotypeFasta(fastaMap, resultMap);

	glue.log("FINE", "btvReportingController.initResultMap, result map after genotyping", resultMap);
}

function generateQueryToTargetRefSegs(segment, targetRefName, nucleotides) {
	var alignerModule;
	glue.inMode("module/"+segToSegDetails[segment].sequenceReporterModule, function() {
		alignerModule = glue.command(["show", "property", "alignerModuleName"]).moduleShowPropertyResult.propertyValue;
	});
	var alignResult;
	glue.inMode("module/"+alignerModule, function() {
		alignResult = glue.command({align: {
				referenceName: targetRefName,
				sequence: [
				    { 
				    	queryId: "query", 
				    	nucleotides: nucleotides
				    }
				]
			}
		});
		glue.log("FINE", "btvReportingController.generateQueryToTargetRefSegs, alignResult", alignResult);
	});
	return alignResult.compoundAlignerResult.sequence[0].alignedSegment;
	
}

function generateFeaturesWithCoverage(segment, targetRefName, queryToTargetRefSegs) {
	var featuresWithCoverage = []; 
	_.each(segToSegDetails[segment].allFeatures, function(featureName) {
		glue.inMode("module/"+segToSegDetails[segment].sequenceReporterModule, function() {
			var coveragePercentage = glue.command({
				"alignment-feature-coverage" :{
							"queryToTargetSegs": {
								queryToTargetSegs: {
									alignedSegment: queryToTargetRefSegs
								}
							},
							"targetRefName":targetRefName,
							"relRefName":segToSegDetails[segment].masterReference,
							"linkingAlmtName":segToSegDetails[segment].linkingAlignment,
							"featureName":featureName
						}
			}).fastaSequenceAlignmentFeatureCoverageResult.coveragePercentage;
			featuresWithCoverage.push(
					{
						name: featureName, 
						coveragePct: coveragePercentage
					} );
		});
	});
	return featuresWithCoverage;
}

function generateSingleFastaReport(fastaMap, resultObj, fastaFilePath) {
	var genotypingResult = resultObj.genotypingResult;
	if(genotypingResult != null) {
		var targetRefName = genotypingResultToTargetRefName(resultObj.segment, genotypingResult);
		var queryNucleotides = fastaMap[resultObj.id].sequence;
		var queryToTargetRefSegs = generateQueryToTargetRefSegs(resultObj.segment, targetRefName, queryNucleotides);
		resultObj.featuresWithCoverage = generateFeaturesWithCoverage(resultObj.segment, targetRefName, queryToTargetRefSegs);
		resultObj.visualisationHints = visualisationHints(resultObj.segment, queryNucleotides, targetRefName, genotypingResult, queryToTargetRefSegs);
	}
	
	var btvReport = { 
		btvReport: {
			sequenceDataFormat: "FASTA",
			filePath: fastaFilePath,
			sequenceResult: resultObj
		}
	};
	addOverview(btvReport);

	glue.log("FINE", "btvReportingController.generateSingleFastaReport btvReport:", btvReport);
	return btvReport;
}

function visualisationHints(segment, queryNucleotides, targetRefName, genotypingResult, queryToTargetRefSegs) {
	// consider the target ref, subtype ref, genotype ref and master ref as comparison refs.
	var comparisonReferences = [{
		"refName": segToSegDetails[segment].masterReference, 
		"refDisplayName" : "Segment "+segment+" Master Reference"
	}];
	var cladeCategories = segmentCladeCategories(segment);
	_.each(cladeCategories, function(cladeCategory) {
		var categoryResult = _.find(genotypingResult.queryCladeCategoryResult, function(qcCatResult) {return qcCatResult.categoryName == cladeCategory.name;});
		if(categoryResult.finalClade != null) {
			glue.inMode("alignment/"+categoryResult.finalClade, function() {
				var referenceName = glue.command(["show", "reference"]).showReferenceResult.referenceName;
				var cladeDisplayName = glue.command(["show", "property", "displayName"]).propertyValueResult.value;
				comparisonReferences.push({
					"refName": referenceName,
					"refDisplayName": cladeDisplayName+" Reference"
				});
			});
		}
	});
	comparisonReferences.push({
		"refName":targetRefName,
		"refDisplayName": "Closest Reference"
	});
	var seqs = [];
	var comparisonReferencesFinal = [];
	
	// eliminate duplicates and enhance with sequence ID.
	_.each(comparisonReferences, function(ref) {
		glue.inMode("reference/"+ref.refName, function() {
			var seqID = glue.command(["show", "sequence"]).showSequenceResult["sequence.sequenceID"];
			if(seqs.indexOf(seqID) < 0) {
				seqs.push(seqID);
				if(!ref.refDisplayName.startsWith("Unclassified")) {
					ref.refDisplayName = ref.refDisplayName + " ("+seqID+")";
				}
				comparisonReferencesFinal.push(ref);
			}
		});
	});
	
	return {
		"features": segToSegDetails[segment].allFeatures,
		"comparisonRefs": comparisonReferencesFinal,
		"targetReferenceName":targetRefName,
		"queryNucleotides":queryNucleotides,
		"queryToTargetRefSegments": queryToTargetRefSegs
	};
}



/*
 * Given a segment number and genotypingResult, return the name of the "target" reference
 */
function genotypingResultToTargetRefName(segment, genotypingResult) {
	var targetRefSourceName;
	var targetRefSequenceID;
	var cladeCategories = segmentCladeCategories(segment);
	_.each(cladeCategories, function(cladeCategory) {
		var categoryResult = _.find(genotypingResult.queryCladeCategoryResult, function(qcCatResult) {return qcCatResult.categoryName == cladeCategory.name;});
		if(categoryResult.finalClade != null) {
			targetRefSourceName = categoryResult.closestMemberSourceName;
			targetRefSequenceID = categoryResult.closestMemberSequenceID;
		}
	});
	if(targetRefSourceName != null && targetRefSequenceID != null) {
		var targetRefOptions = glue.tableToObjects(glue.command([
	         "list", "reference", 
	         "--whereClause", "sequence.source.name = '"+targetRefSourceName+"' and sequence.sequenceID = '"+targetRefSequenceID+"'"]));
		return targetRefOptions[0].name;
	}
	return null;
}

/*
 * This function takes a fastaMap of id -> { id, nucleotideFasta }, and a result map of id -> ? 
 * and runs max likelihood genotyping on the subset of sequences that have been identified as forward BTV.
 * The the genotyping result object is recorded in the result map for each sequence.
 */
function genotypeFasta(fastaMap, resultMap) {
	// group result objects by segment.
	var segmentToResults = _.groupBy(_.values(resultMap), "segment");
	glue.log("FINE", "btvReportingController.genotypeFasta segmentToResults:", segmentToResults);

	// apply genotyping for each segment.
	_.each(_.pairs(segmentToResults), function(pair) {
		var segment = pair[0];
		var resultObjs = pair[1];
		var genotyperModule = segToSegDetails[segment].genotyperModule 
		// if genotyping is defined for this segment.
		if(segment != null && genotyperModule != null) {
			// gather the sequences mapped to this segment in a single fasta map
			var genotypingFastaMap = {}; 
			_.each(resultObjs, function(resultObj) {
				genotypingFastaMap[resultObj.id] = fastaMap[resultObj.id];
			});
			var genotypingResults;
			glue.inMode("module/"+genotyperModule, function() {
				genotypingResults = glue.command({
					"genotype": {
						"fasta-document":
						{
							"fastaCommandDocument": {
								"nucleotideFasta" : {
									"sequences": _.values(genotypingFastaMap)
								}
							}, 
							"documentResult" : true
						}
					}
				}).genotypingDocumentResult.queryGenotypingResults;
			});
			glue.log("FINE", "btvReportingController.genotypeFasta genotypingResults:", genotypingResults);
			_.each(genotypingResults, function(genotypingResult) {
				resultMap[genotypingResult.queryName].genotypingResult = genotypingResult;
			});
		}
	});
	
}


/*
 * This function takes a fastaMap of id -> { id, nucleotideFasta }, and a result map of id -> ? 
 * and runs BLAST recogniser, to determine whether the sequence is BTV, and if so, which segment.
 */
function recogniseFasta(fastaMap, resultMap) {
	var sequenceObjs = _.values(fastaMap);
	_.each(_.values(resultMap), function(resultObj) {
		resultObj.noRecogniserHits = false;
		resultObj.multipleRecogniserHits = false;
		resultObj.isForwardBtv = false;
		resultObj.isReverseBtv = false;
		resultObj.segment = null;
	});
	var fastaDocument = {
		"nucleotideFasta" : {
			"sequences" : sequenceObjs
		}
	};
	var recogniserResults;
	glue.inMode("module/btvSegmentRecogniser", function() {
		recogniserResults = glue.tableToObjects(glue.command({
				"recognise": {
					"fasta-document": {
						"fastaCommandDocument": fastaDocument
					}
				}
		}));
	});
	glue.log("FINE", "btvReportingController.recogniseFasta recogniserResults:", recogniserResults);
	var sequenceIDToRecogniserResults = _.groupBy(recogniserResults, "querySequenceId");
	glue.log("FINE", "btvReportingController.recogniseFasta sequenceIDToRecogniserResults:", sequenceIDToRecogniserResults);
	
	_.each(_.pairs(resultMap), function(pair) {
		var sequenceID = pair[0];
		var resultObj = pair[1];
		var seqRecogniserResults = sequenceIDToRecogniserResults[sequenceID];
		if(seqRecogniserResults.length == 0) {
			resultObj.noRecogniserHits = true;
		} else if(seqRecogniserResults.length > 1) {
			resultObj.multipleRecogniserHits = true;
		} else {
			var recogniserResult = seqRecogniserResults[0];
			if(recogniserResult.direction == 'FORWARD') {
				resultObj.isForwardBtv = true;
			} else if(recogniserResult.direction == 'REVERSE') {
				resultObj.isReverseBtv = true;
			}
			resultObj.segment = recogniserResult.categoryId.replace('S', '');
		}
	});
}

function addOverview(btvReport) {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; // January is 0!
	var yyyy = today.getFullYear();
	if(dd < 10) {
	    dd = '0'+dd
	} 
	if(mm < 10) {
	    mm = '0'+mm
	} 
	btvReport.btvReport.reportGenerationDate = dd + '/' + mm + '/' + yyyy;
	btvReport.btvReport.engineVersion = 
		glue.command(["glue-engine","show-version"]).glueEngineShowVersionResult.glueEngineVersion;
	btvReport.btvReport.projectVersion = 
		glue.command(["show","setting","project-version"]).projectShowSettingResult.settingValue;
	
}

