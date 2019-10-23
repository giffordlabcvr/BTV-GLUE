btvApp.controller('btvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics', 'saveFile', 'FileSaver', '$http', '$window', '$timeout',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics, saveFile, FileSaver, $http, $window, $timeout) {
			
			addUtilsToScope($scope);

			$scope.analytics = $analytics;
			$scope.featureVisualisationUpdating = false;
			$scope.phyloVisualisationUpdating = false;
			$scope.phyloLegendUpdating = false;
			$scope.featureSvgUrlCache = {};
			$scope.phyloSvgResultObjectCache = {};
			$scope.featureNameToScrollLeft = {};
			$scope.lastFeatureName = null;
	    	$scope.displaySection = 'summary';
			
	    	$scope.neighbourSliders = {};
	    	
	    	_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	    		var value;
	    		var ceil;
	    		var getLegend;
	    		var step;
	    		var showTicks;
	    		if(segNum == "2" || segNum == "6") {
		    		value = 100;
		    		ceil = 1000;
		    		getLegend = function(value, sliderId) { return toFixed(value/100, 1); };
		    		step = 5;
		    		showTicks = 50;
	    		} else {
		    		value = 30;
		    		ceil = 300;
		    		getLegend = function(value, sliderId) { return toFixed(value/100, 1); };
		    		step = 1;
		    		showTicks = 20;
	    		}
	    		
		    	$scope.neighbourSliders[segNum] = {
	    			  value: value,
	    			  options: {
	    			    precision: 1,
	    			    floor: 0,
	    			    ceil: ceil,
	    			    hideLimitLabels: true,
	    			    hidePointerLabels: true,
	    			    getLegend: getLegend, 
	    			    step: step,
	    			    showTicks: showTicks,
	    			    keyboardSupport: false,
	    			  }
		    	};
	    		
	    	});
	    	
	    	
	    	
			$controller('fileConsumerCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.allowCladeCategory = function(queryCladeCategoryResult) {
				if(queryCladeCategoryResult.categoryName == 'species') {
					return false;
				}
				return true;
			};
			
			// executed after the project URL is set
			glueWS.addProjectUrlListener( {
				reportProjectURL: function(projectURL) {
				    $scope.uploader.url = projectURL + "/module/btvReportingController";
				    console.info('uploader.url', $scope.uploader.url);
				}
			});
			
			
		    // CALLBACKS
		    $scope.uploader.onBeforeUploadItem = function(item) {
				var commandObject = {
						"invoke-consumes-binary-function" : {
							"functionName": "reportFastaWeb",
							"argument": [item.file.name]
						}
				};
		    	item.formData = [{command: JSON.stringify(commandObject)}];
		        console.info('formData', JSON.stringify(item.formData));
		        console.info('onBeforeUploadItem', item);
				$scope.analytics.eventTrack("submitFastaFile", 
						{   category: 'btvFastaAnalysis', 
							label: 'fileName:'+item.file.name+',fileSize:'+item.file.size});


		    };
		    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
		        console.info('onSuccessItem', fileItem, response, status, headers);
				$scope.analytics.eventTrack("btvFastaAnalysisResult", 
						{  category: 'btvFastaAnalysis', 
							label: 'fileName:'+fileItem.file.name+',fileSize:'+fileItem.file.size });
				fileItem.response = response;
				console.log("btvFastaAnalysis.response", response);
		    };
		    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
		        console.info('onErrorItem', fileItem, response, status, headers);
		        var errorFn = glueWS.raiseErrorDialog(dialogs, "processing sequence file \""+fileItem.file.name+"\"");
		        errorFn(response, status, headers, {});
		    };

			$scope.removeAll = function() {
				$scope.uploader.clearQueue();
				$scope.fileItemUnderAnalysis = null;
			}

			$scope.removeItem = function(item) {
				if($scope.fileItemUnderAnalysis == item) {
					$scope.fileItemUnderAnalysis = null;
				}
				item.remove();
			}
		    
		    $scope.showAnalysisResults = function(item) {
		    	$scope.setFileItemUnderAnalysis(item);
		    };
			
		    $scope.setFileItemUnderAnalysis = function(item) {
				$scope.saveFeatureScrollLeft();
		    	if(item.sequenceReport == null) {
		    		$scope.setSequenceReport(item, item.response.btvWebReport.results[0]);
		    	}
		    	$scope.fileItemUnderAnalysis = item;
		    	$scope.featureVisualisationSvgUrl = null;
		    	$scope.phyloVisualisationSvgResultObject = null;
		    	$scope.phyloVisualisationSvgUrl = null;
		    	$scope.phyloLegendSvgUrl = null;
		    }
		    
		    $scope.setSequenceReport = function(item, sequenceReport) {
		    	// e.g. null genotype
		    	if(sequenceReport.btvReport.sequenceResult.visualisationHints == null) {
		    		$scope.setComparisonRef(sequenceReport, null);
		    		$scope.setFeature(sequenceReport, null);
		    	} else {
			    	if(sequenceReport.btvReport.comparisonRef == null) {
			    		$scope.setComparisonRef(sequenceReport, sequenceReport.btvReport.sequenceResult.visualisationHints.comparisonRefs[0]);
			    	}
		    		var availableFeatures = sequenceReport.btvReport.sequenceResult.visualisationHints.features;
		    		var feature = sequenceReport.btvReport.feature;
			    	if(feature == null) {
			    		feature = availableFeatures[0];
			    	}
		    		if($scope.lastFeatureName != null) {
		    			var equivalentFeature = _.find(availableFeatures, function(availableFeature) { return availableFeature.name == $scope.lastFeatureName; });
		    			if(equivalentFeature != null) {
		    				feature = equivalentFeature;
		    			}
		    		}
		    		$scope.setFeature(sequenceReport, feature);
		    	}
		    	if(sequenceReport.btvReport.sequenceResult.placements == null) {
		    		$scope.setPlacement(sequenceReport, null);
		    	} else {
		    		if(sequenceReport.btvReport.placement == null) {
			    		$scope.setPlacement(sequenceReport, sequenceReport.btvReport.sequenceResult.placements[0]);
		    		}
		    	}

		    	item.sequenceReport = sequenceReport;
		    }

			$scope.$watch('displaySection', function(newObj, oldObj) {
				if(newObj == "phyloPlacement") {
					$scope.refreshSlider();
				}
			});


		    
		    $scope.refreshSlider = function() {
		        $timeout(function () {
		        	console.log("rzSliderForceRender");
		            $scope.$broadcast('rzSliderForceRender');
		        });
		    };
		    
		    $scope.setComparisonRef = function(sequenceReport, comparisonRef) {
		    	// need to nest comparisonRef within btvReport to avoid breaking command doc assumptions.
		    	sequenceReport.btvReport.comparisonRef = comparisonRef;
		    }

		    $scope.setFeature = function(sequenceReport, feature) {
		    	// need to nest feature within btvReport to avoid breaking command doc assumptions.
		    	sequenceReport.btvReport.feature = feature;
		    }
		    
		    $scope.setPlacement = function(sequenceReport, placement) {
		    	// need to nest feature within btvReport to avoid breaking command doc assumptions.
		    	sequenceReport.btvReport.placement = placement;
				$scope.refreshSlider();
		    }

		    
			$scope.featureSvgUpdated = function() {
				console.info('featureSvgUpdated');
				var featureVisualisationSvgElem = document.getElementById('featureVisualisationSvg');
				if(featureVisualisationSvgElem != null) {
					var featureName = $scope.fileItemUnderAnalysis.sequenceReport.btvReport.feature.name;
					console.info('featureName', featureName);
					var featureScrollLeft = $scope.featureNameToScrollLeft[featureName];
					console.info('featureScrollLeft', featureScrollLeft);
					if(featureScrollLeft != null) {
						featureVisualisationSvgElem.scrollLeft = featureScrollLeft;
					} else {
						featureVisualisationSvgElem.scrollLeft = 0;
					}
					$scope.lastFeatureName = featureName;
				} 
				$scope.featureVisualisationUpdating = false;
				
			}
			
			$scope.phyloSvgUpdated = function() {
				$scope.phyloVisualisationUpdating = false;
			}
			
			$scope.phyloLegendSvgUpdated = function() {
				$scope.phyloLegendUpdating = false;
			}
			
			$scope.updateFeatureSvgFromUrl = function(cacheKey, svgUrl) {
				if(svgUrl == $scope.featureVisualisationSvgUrl) {
					// onLoad does not get invoked again for the same URL.
					$scope.featureSvgUpdated();
				} else {
					$scope.featureVisualisationSvgUrl = svgUrl;
					$scope.featureSvgUrlCache[cacheKey] = svgUrl;
				}
			}
			
			$scope.updatePhyloSvgFromResultObject = function(cacheKey, svgResultObject) {
				if(_.isEqual(svgResultObject, $scope.phyloVisualisationSvgResultObject)) {
					// onLoad does not get invoked again for the same URLs.
					$scope.phyloSvgUpdated();
					$scope.phyloLegendSvgUpdated();
				} else {
					$scope.phyloSvgResultObjectCache[cacheKey] = svgResultObject;
					$scope.phyloVisualisationSvgResultObject = svgResultObject;
					$scope.phyloVisualisationSvgUrl = "/glue_web_files/"+
					svgResultObject.treeTransformResult.freemarkerDocTransformerWebResult.webSubDirUuid+"/"+
					svgResultObject.treeTransformResult.freemarkerDocTransformerWebResult.webFileName;
					$scope.phyloLegendSvgUrl = "/glue_web_files/"+
					svgResultObject.legendTransformResult.freemarkerDocTransformerWebResult.webSubDirUuid+"/"+
					svgResultObject.legendTransformResult.freemarkerDocTransformerWebResult.webFileName;
				}
			}
			
			$scope.saveFeatureScrollLeft = function() {
				if($scope.lastFeatureName != null) {
					var featureVisualisationSvgElem = document.getElementById('featureVisualisationSvg');
					if(featureVisualisationSvgElem != null) {
						$scope.featureNameToScrollLeft[$scope.lastFeatureName]	= featureVisualisationSvgElem.scrollLeft;
					}
				}

			}
			
			$scope.updateFeatureSvg = function() {
				
				$scope.featureVisualisationUpdating = true;
				var sequenceReport = $scope.fileItemUnderAnalysis.sequenceReport;
				var visualisationHints = sequenceReport.btvReport.sequenceResult.visualisationHints;

				var cacheKey = $scope.fileItemUnderAnalysis.file.name+":"+
					sequenceReport.btvReport.sequenceResult.id+":"+
					sequenceReport.btvReport.comparisonRef.refName+":"+
					sequenceReport.btvReport.feature.name;
				console.info('cacheKey', cacheKey);
				
				$scope.saveFeatureScrollLeft();
				
				var featureName = sequenceReport.btvReport.feature.name;

		    	$scope.lastFeatureName = featureName;

				var cachedSvgUrl = $scope.featureSvgUrlCache[cacheKey];
				
				if(cachedSvgUrl != null) {
					$timeout(function() {
						$scope.updateFeatureSvgFromUrl(cacheKey, cachedSvgUrl);
					});
				} else {
					console.info('visualisationHints', visualisationHints);
					glueWS.runGlueCommand("module/"+visualisationHints.visualisationUtilityModule, 
							{ "visualise-feature": {
							    "targetReferenceName": visualisationHints.targetReferenceName,
							    "comparisonReferenceName": sequenceReport.btvReport.comparisonRef.refName,
							    "featureName": featureName,
							    "queryNucleotides": visualisationHints.queryNucleotides,
							    "queryToTargetRefSegments": visualisationHints.queryToTargetRefSegments,
							    "queryDetails": visualisationHints.queryDetails
							  } }
					).then(function onSuccess(response) {
						    // Handle success
						    var data = response.data;
							console.info('visualise-feature result', data);
							var featureVisualisation = data;
							var fileName = "visualisation.svg";
							glueWS.runGlueCommand("module/btvFeatureToSvgTransformer", {
								"transform-to-web-file": {
									"webFileType": "WEB_PAGE",
									"commandDocument":{
										transformerInput: {
											featureVisualisation: featureVisualisation.featureVisualisation,
											ntWidth: 16
										}
									},
									"outputFile": fileName
								}
							}).then(function onSuccess(response) {
							    var data = response.data;
								console.info('transform-to-web-file result', data);
								var transformerResult = data.freemarkerDocTransformerWebResult;
								$scope.updateFeatureSvgFromUrl(cacheKey, "/glue_web_files/"+transformerResult.webSubDirUuid+"/"+transformerResult.webFileName);
							}, function onError(response) {
								$scope.featureVisualisationUpdating = false;
								var dlgFunction = glueWS.raiseErrorDialog(dialogs, "rendering genome feature to SVG");
								dlgFunction(response.data, response.status, response.headers, response.config);
							});
					}, function onError(response) {
						    // Handle error
							$scope.featureVisualisationUpdating = false;
							var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising genome feature");
							dlgFunction(response.data, response.status, response.headers, response.config);
					});
				}
			}
			
			
			$scope.updatePhyloSvg = function() {
				
				$scope.phyloVisualisationUpdating = true;
				$scope.phyloLegendUpdating = true;

				var sequenceReport = $scope.fileItemUnderAnalysis.sequenceReport;
				var placement = sequenceReport.btvReport.placement;

				var cacheKey = $scope.fileItemUnderAnalysis.file.name+":"+
					sequenceReport.btvReport.sequenceResult.id+":"+
					placement.placementIndex+":"+$scope.neighbourSliders[sequenceReport.btvReport.sequenceResult.segment].value;
				console.info('cacheKey', cacheKey);
				

				var cachedSvgResultObject = $scope.phyloSvgResultObjectCache[cacheKey];
				
				if(cachedSvgResultObject != null) {
					$timeout(function() {
						console.info('phylo SVG result object found in cache');
						$scope.updatePhyloSvgFromResultObject(cacheKey, cachedSvgResultObject);
					});
				} else {
					var fileName = "visualisation.svg";
					var legendFileName = "legend.svg";
					var scrollbarWidth = 17;
					var segment = sequenceReport.btvReport.sequenceResult.segment;
					glueWS.runGlueCommand("module/btvSvgPhyloVisualisation", 
							{ 
								"invoke-function": {
									"functionName": "visualisePhyloAsSvg", 
									"document": {
										"inputDocument": {
										    "placerResult" : $scope.fileItemUnderAnalysis.response.btvWebReport.placerResult["S"+segment], 
										    "placerModule" : sequenceReport.btvReport.sequenceResult.placerModule,
										    "queryName" : sequenceReport.btvReport.sequenceResult.id,
										    "placementIndex" : placement.placementIndex,
										    "maxDistance" : toFixed($scope.neighbourSliders[sequenceReport.btvReport.sequenceResult.segment].value/100, 2),
											"pxWidth" : 1136 - scrollbarWidth, 
											"pxHeight" : 2500,
											"legendPxWidth" : 1136, 
											"legendPxHeight" : 80,
										    "fileName": fileName,
										    "legendFileName": legendFileName
										}
									}
								} 
							}
					).then(function onSuccess(response) {
						// Handle success
					    var data = response.data;
						console.info('visualisePhyloAsSvg result', data);
						var svgResultObj = data.visualisePhyloAsSvgResult;
						$scope.updatePhyloSvgFromResultObject(cacheKey, svgResultObj);
					}, function onError(response) {
						    // Handle error
							$scope.phyloVisualisationUpdating = false;
							$scope.phyloLegendUpdating = false;
							var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising phylo tree");
							dlgFunction(response.data, response.status, response.headers, response.config);
					});
				}
			}
			
		    $scope.getPlacementLabel = function(placement) {
		    	return placement.placementIndex + " (" + toFixed(placement.likeWeightRatio * 100, 2) + "%)";
		    }
		    
			$scope.downloadExampleSequence = function() {
				var url;
				if(userAgent.os.family.indexOf("Windows") !== -1) {
					url = "exampleSequences/exampleSequences.fasta";
				} else {
					url = "exampleSequencesMsWindows/exampleSequences.fasta";
				}
				$http.get(url)
				.success(function(data, status, headers, config) {
					console.log("data", data);
			    	var blob = new Blob([data], {type: "text/plain"});
			    	saveFile.saveFile(blob, "example sequence file", "exampleSequenceFile.fasta");
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "downloading example sequence file"));
			};
			
		}]);
