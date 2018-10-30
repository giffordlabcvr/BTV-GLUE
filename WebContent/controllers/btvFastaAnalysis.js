btvApp.controller('btvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics', 'saveFile', 'FileSaver', '$http', '$window', '$timeout',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics, saveFile, FileSaver, $http, $window, $timeout) {
			
			addUtilsToScope($scope);

			$scope.analytics = $analytics;
			$scope.visualisationUpdating = false;
			$scope.svgUrlCache = {};
			$scope.featureNameToScrollLeft = {};
			$scope.lastFeatureName = null;
	    	$scope.summary = true;
			$scope.genomeVisualisation = false;
			
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
			
			$scope.canVisualiseReport = function(report) {
				if(report.btvReport.sequenceResult.visualisationHints != null) {
					return true;
				}
				return false;
			}
			
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
		    		for(var i = 0; i < item.response.btvWebReport.results.length; i++) {
		    			if($scope.canVisualiseReport(item.response.btvWebReport.results[i])) {
				    		$scope.setSequenceReport(item, item.response.btvWebReport.results[i]);
				    		break;
		    			}
		    		}
		    	}
		    	$scope.fileItemUnderAnalysis = item;
		    	$scope.visualisationSvgUrl = null;
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
		    	item.sequenceReport = sequenceReport;
		    }

		    
		    $scope.setComparisonRef = function(sequenceReport, comparisonRef) {
		    	// need to nest comparisonRef within btvReport to avoid breaking command doc assumptions.
		    	sequenceReport.btvReport.comparisonRef = comparisonRef;
		    }

		    $scope.setFeature = function(sequenceReport, feature) {
		    	// need to nest feature within btvReport to avoid breaking command doc assumptions.
		    	sequenceReport.btvReport.feature = feature;
		    }

			$scope.$watch('summary', function(newObj, oldObj) {
				if(!$scope.updating) {
					$scope.updating = true;
					if(newObj) {
						$scope.genomeVisualisation = false;
					}
					$scope.updating = false;
				}
			}, false);

			$scope.$watch('genomeVisualisation', function(newObj, oldObj) {
				if(!$scope.updating) {
					$scope.updating = true;
					if(newObj) {
						$scope.summary = false;
					}
					$scope.updating = false;
				}
			}, false);

			$scope.svgUpdated = function() {
				console.info('svgUpdated');
				var visualisationSvgElem = document.getElementById('visualisationSvg');
				if(visualisationSvgElem != null) {
					var featureName = $scope.fileItemUnderAnalysis.sequenceReport.btvReport.feature.name;
					console.info('featureName', featureName);
					var featureScrollLeft = $scope.featureNameToScrollLeft[featureName];
					console.info('featureScrollLeft', featureScrollLeft);
					if(featureScrollLeft != null) {
						visualisationSvgElem.scrollLeft = featureScrollLeft;
					} else {
						visualisationSvgElem.scrollLeft = 0;
					}
					$scope.lastFeatureName = featureName;
				} 
				$scope.visualisationUpdating = false;
				
			}
			$scope.updateSvgFromUrl = function(cacheKey, svgUrl) {
				$scope.visualisationSvgUrl = svgUrl;
				$scope.svgUrlCache[cacheKey] = svgUrl;
			}
			
			$scope.saveFeatureScrollLeft = function() {
				if($scope.lastFeatureName != null) {
					var visualisationSvgElem = document.getElementById('visualisationSvg');
					if(visualisationSvgElem != null) {
						$scope.featureNameToScrollLeft[$scope.lastFeatureName]	= visualisationSvgElem.scrollLeft;
					}
				}

			}
			
			$scope.updateSvg = function() {
				
				$scope.visualisationUpdating = true;
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

				var cachedSvgUrl = $scope.svgUrlCache[cacheKey];
				
				if(cachedSvgUrl != null) {
					$timeout(function() {
						$scope.updateSvgFromUrl(cacheKey, cachedSvgUrl);
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
								$scope.updateSvgFromUrl(cacheKey, "/glue_web_files/"+transformerResult.webSubDirUuid+"/"+transformerResult.webFileName);
							}, function onError(response) {
								$scope.visualisationUpdating = false;
								var dlgFunction = glueWS.raiseErrorDialog(dialogs, "rendering genome feature to SVG");
								dlgFunction(response.data, response.status, response.headers, response.config);
							});
					}, function onError(response) {
						    // Handle error
							$scope.visualisationUpdating = false;
							var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising genome feature");
							dlgFunction(response.data, response.status, response.headers, response.config);
					});
				}
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
