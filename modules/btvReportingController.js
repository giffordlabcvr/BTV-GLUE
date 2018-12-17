
var segToSegDetails = {};

segToSegDetails["1"] = {
    mainFeature : { name: "VP1", displayName: "VP1" },
    allFeatures : [{ name: "VP1", displayName: "VP1" }],
    linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["2"] = {
    mainFeature : { name: "VP2", displayName: "VP2" },
    allFeatures : [{ name: "VP2", displayName: "VP2" }],
	linkingAlignment : "BTV_GENO_CODON_2",
	masterReference : "REF_S2_MASTER_JX680458",
	sequenceReporterModule: "btvSeg2SequenceReporter",
	genotyperModule: "btvS2MaxLikelihoodGenotyper",
	placerModule: "btvS2MaxLikelihoodPlacer",
	visualisationUtilityModule: "btvS2VisualisationUtility",
};
segToSegDetails["3"] = {
    mainFeature : { name: "VP3", displayName: "VP3" },
    allFeatures : [{ name: "VP3", displayName: "VP3" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["4"] = {
    mainFeature : { name: "VP4", displayName: "VP4" },
    allFeatures : [{ name: "VP4", displayName: "VP4" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["5"] = {
    mainFeature : { name: "NS1", displayName: "NS1" },
    allFeatures : [{ name: "NS1", displayName: "NS1" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["6"] = {
    mainFeature : { name: "VP5", displayName: "VP5" },
    allFeatures : [{ name: "VP5", displayName: "VP5" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["7"] = {
    mainFeature : { name: "VP7", displayName: "VP7" },
    allFeatures : [{ name: "VP7", displayName: "VP7" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["8"] = {
    mainFeature : { name: "NS2", displayName: "NS2" },
    allFeatures : [{ name: "NS2", displayName: "NS2" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["9"] = {
    mainFeature : { name: "VP6", displayName: "VP6" },
    allFeatures : [{ name: "VP6", displayName: "VP6" }, { name: "VP6a", displayName: "VP6a" }, { name: "NS4", displayName: "NS4" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
};
segToSegDetails["10"] = {
    mainFeature : { name: "NS3", displayName: "NS3" },
    allFeatures : [{ name: "NS3", displayName: "NS3" }, { name: "NS3a", displayName: "NS3a" }, { name: "NS5", displayName: "NS5" }],
	linkingAlignment : null,
	masterReference : null,
	sequenceReporterModule: null,
	genotyperModule: null,
	placerModule: null,
	visualisationUtilityModule: null,
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
	var placerResultContainer = {};
	
	// apply blast recogniser / genotyping together on set, as this is more efficient.
	initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer);
	// apply report generation to each sequence in the set.
	var btvReports = _.map(fastaDocument.nucleotideFasta.sequences, function(sequence) {
		return generateSingleFastaReport(_.pick(fastaMap, sequence.id), resultMap[sequence.id], filePath);
	});
	var result = {
		btvWebReport:  { 
			results: btvReports,
			placerResult: placerResultContainer.placerResult
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
	var placerResultContainer = {};
	initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer);
	var singleFastaReport = generateSingleFastaReport(fastaMap, resultMap[sequenceID], fastaFilePath);
	singleFastaReport["placerResult"] = placerResultContainer.placerResult;
	return singleFastaReport;
}

function initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer) {
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
	genotypeFasta(fastaMap, resultMap, placerResultContainer);

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
	_.each(segToSegDetails[segment].allFeatures, function(feature) {
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
							"featureName":feature.name
						}
			}).fastaSequenceAlignmentFeatureCoverageResult.coveragePercentage;
			featuresWithCoverage.push(
					{
						name: feature.name, 
						displayName: feature.displayName, 
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
		if(targetRefName != null) {
			var queryNucleotides = fastaMap[resultObj.id].sequence;
			var queryToTargetRefSegs = generateQueryToTargetRefSegs(resultObj.segment, targetRefName, queryNucleotides);
			resultObj.featuresWithCoverage = generateFeaturesWithCoverage(resultObj.segment, targetRefName, queryToTargetRefSegs);
			resultObj.visualisationHints = visualisationHints(resultObj.segment, queryNucleotides, targetRefName, genotypingResult, queryToTargetRefSegs);
		}
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


	var targetRefSeqID;
	
	glue.inMode("reference/"+targetRefName, function() {
		var showSeqResult = glue.command(["show", "sequence"]);
		targetRefSeqID = showSeqResult.showSequenceResult["sequence.sequenceID"];
		targetRefSourceName = showSeqResult.showSequenceResult["sequence.source.name"];
	});

	
	return {
		"features": segToSegDetails[segment].allFeatures,
		"comparisonRefs": comparisonReferencesFinal,
		"targetReferenceName":targetRefName,
		"targetReferenceSeqID":targetRefSeqID,
		"targetReferenceSourceName":targetRefSourceName,
		"queryNucleotides":queryNucleotides,
		"queryToTargetRefSegments": queryToTargetRefSegs,
		"visualisationUtilityModule": segToSegDetails[segment].visualisationUtilityModule
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
function genotypeFasta(fastaMap, resultMap, placerResultContainer) {
	placerResultContainer.placerResult = {};
	
	// group result objects by segment.
	var segmentToResults = _.groupBy(_.values(resultMap), "segment");
	glue.log("FINE", "btvReportingController.genotypeFasta segmentToResults:", segmentToResults);

	// apply genotyping for each segment.
	_.each(_.pairs(segmentToResults), function(pair) {
		var segment = pair[0];
		var resultObjs = pair[1];
		if(segment != "null") { // groupBy makes null into a string!
			var genotyperModule = segToSegDetails[segment].genotyperModule 
			// if genotyping is defined for this segment.
			if(genotyperModule != null) {
				// gather the sequences mapped to this segment in a single fasta map
				var genotypingFastaMap = {}; 
				_.each(resultObjs, function(resultObj) {
					if(resultObj.isForwardBtv) {
						genotypingFastaMap[resultObj.id] = fastaMap[resultObj.id];
					}
				});
				

				var genotypingMapValues = _.values(genotypingFastaMap)
				
				if(genotypingMapValues.length > 0) {

					var placerModule = segToSegDetails[segment].placerModule;

					// run the placer and generate a placer result document
					var placerResultDocument;
					glue.inMode("module/"+placerModule, function() {
						placerResultDocument = glue.command({
							"place": {
								"fasta-document": {
									"fastaCommandDocument": {
										"nucleotideFasta" : {
											"sequences": genotypingMapValues
										}
									}
								}
							}
						});
					});
					placerResultContainer.placerResult[segment] = placerResultDocument;

					// list the query summaries within the placer result document
					var placementSummaries;
					glue.inMode("module/"+placerModule, function() {
						placementSummaries = glue.tableToObjects(glue.command({
							"list": {
								"query-from-document": {
									"placerResultDocument": placerResultDocument
								}
							}
						}));
					});

					// for each query in the placer results.
					_.each(placementSummaries, function(placementSummaryObj) {
						var queryName = placementSummaryObj.queryName;
						
						var placements;
						
						// list the placements for that query.
						glue.inMode("module/"+placerModule, function() {
							placements = glue.tableToObjects(glue.command({
								"list": {
									"placement-from-document": {
										"queryName": queryName,
										"placerResultDocument": placerResultDocument
									}
								}
							}));
						});

						resultMap[queryName].placements = placements;
					});

					
					var genotypingResults;
					glue.inMode("module/"+genotyperModule, function() {
						genotypingResults = glue.command({
							"genotype": {
								"placer-result-document": {
									"placerResultDocument": placerResultDocument, 
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
			}
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
		if(seqRecogniserResults == null || seqRecogniserResults.length == 0) {
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

