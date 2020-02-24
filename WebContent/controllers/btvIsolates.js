btvApp.controller('btvIsolatesCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'glueWebToolConfig', 'pagingContext', 'FileSaver', 'saveFile', '$analytics', 'filterUtils',
		    function($scope, $route, $routeParams, glueWS, dialogs, glueWebToolConfig, pagingContext, FileSaver, saveFile, $analytics, filterUtils) {

			$scope.listIsolatesResult = null;
			$scope.pagingContext = null;
			$scope.whereClause = null;
			$scope.loadingSpinner = false;
			$scope.analytics = $analytics;
			$scope.segmentDisplay = 'sequences';
			
			addUtilsToScope($scope);

			$scope.encodeURIComponent = function(string) {
				return encodeURIComponent(string);
			}
			
			$scope.downloadIsolateMetadata = function() {
				console.log("Downloading isolate metadata");
				
				saveFile.saveAsDialog("Isolate metadata file", 
						"isolate_metadata.txt", function(fileName) {
					var cmdParams = {
							"lineFeedStyle": "LF"
					};
					if($scope.whereClause) {
						cmdParams.whereClause = $scope.whereClause;
					}
					$scope.pagingContext.extendCmdParamsWhereClause(cmdParams);
					$scope.pagingContext.extendCmdParamsSortOrder(cmdParams);

					if(userAgent.os.family.indexOf("Windows") !== -1) {
						cmdParams["lineFeedStyle"] = "CRLF";

					}

					$scope.analytics.eventTrack("isolateMetadataDownload", 
							{   category: 'dataDownload', 
						label: 'totalItems:'+$scope.pagingContext.getTotalItems() });

					glueWS.runGlueCommandLong("module/btvIsolateWebExporter", {
						"invoke-function": {
							"functionName" : "exportIsolateTable", 
							"argument": [
								cmdParams.whereClause,
								cmdParams.sortProperties,
								fileName,
								cmdParams.lineFeedStyle
							]
						},
					},
					"Isolate metadata file preparation in progress")
					.success(function(data, status, headers, config) {
						var result = data.tabularWebFileResult;
						var dlg = dialogs.create(
								glueWebToolConfig.getProjectBrowserURL()+'/dialogs/fileReady.html','fileReadyCtrl',
								{ 
									url:"gluetools-ws/glue_web_files/"+result.webSubDirUuid+"/"+result.webFileName, 
									fileName: result.webFileName,
									fileSize: result.webFileSizeString
								}, {});
					})
					.error(glueWS.raiseErrorDialog(dialogs, "preparing isolate metadata file"));
				});
			}
			
			$scope.updateCount = function(pContext) {
				$scope.listIsolatesResult = null;
				$scope.loadingSpinner = true;

				var cmdParams = {
			            "tableName":"isolate"
				};
				if($scope.whereClause) {
					cmdParams.whereClause = $scope.whereClause;
				}
				$scope.pagingContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"count": { "custom-table-row": cmdParams } 
				})
			    .success(function(data, status, headers, config) {
					console.info('count isolate raw result', data);
					$scope.pagingContext.setTotalItems(data.countResult.count);
					$scope.pagingContext.firstPage();
			    })
			    .error(function(data, status, headers, config) {
					$scope.loadingSpinner = false;
			    	var fn = glueWS.raiseErrorDialog(dialogs, "counting isolates");
			    	fn(data, status, headers, config);
			    });
			}

			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
			            "tableName":"isolate",
			            "rendererModuleName":"btvIsolateRenderer"
				};
				if($scope.whereClause) {
					cmdParams.whereClause = $scope.whereClause;
			        cmdParams.allObjects = false;
				} else {
			        cmdParams.allObjects = true;
				}
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"multi-render": cmdParams 
				})
			    .success(function(data, status, headers, config) {
					  console.info('list isolate raw result', data);
					  $scope.listIsolatesResult = data.multiRenderResult.resultDocument;
					  console.info('list sequence result as object list', $scope.listIsolatesResult);
					  $scope.loadingSpinner = false;
			    })
			    .error(function(data, status, headers, config) {
					$scope.loadingSpinner = false;
			    	var fn = glueWS.raiseErrorDialog(dialogs, "listing isolates");
			    	fn(data, status, headers, config);
			    });
			}
			
			$scope.init = function(whereClause)  {
				$scope.whereClause = whereClause;
				$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);
				$scope.pagingContext.countChanged();
			}

			
			$scope.globalRegionFilter = function() {
				// note property here is a dummy value.
                return { property:"globalRegion", nullProperty:"who_country", displayName: "Global Region", filterHints: 
	            	{ type: "StringFromFixedValueSet",
                	  generateCustomDefault: function() {
	            		  return {
	            			  fixedValue: $scope.globalRegionFixedValueSet[0]
	            		  };
	            	  },
                	  generatePredicateFromCustom: function(filterElem) {
                		  var custom = filterElem.custom;
                		  var fakeFilterElem = {
                		    property:custom.fixedValue.property,
                		    nullProperty:filterElem.nullProperty,
                			type: "String",
                			predicate: {
                				operator: filterElem.predicate.operator,
                				operand: [custom.fixedValue.value]
                			}
                		  };
                		  var cayennePredicate = filterUtils.filterElemToCayennePredicate(fakeFilterElem);
                		  // we want notmatches here to allow sequences with countries that have a null region/subregion/intregion.
                		  if(filterElem.predicate.operator == 'notmatches') {
                			  cayennePredicate = "( ( "+custom.fixedValue.property + " = null ) or ( " + cayennePredicate + " ) )";
                		  }
                		  return cayennePredicate;
                  	  },
	            	  generateFixedValueSet: function() {
	            		  return $scope.globalRegionFixedValueSet;
	            	  }
	            	}
                };
			};
			$scope.initGlobalRegionFixedValueSet = function () {
				$scope.globalRegionFixedValueSet = [];

				glueWS.runGlueCommand("", {
				    "multi-render":{
				        "tableName":"who_region",
				        "allObjects":"true",
				        "rendererModuleName":"whoRegionTreeRenderer"
				    }
				})
				.success(function(data, status, headers, config) {
					var multiRenderResult = data.multiRenderResult;
					console.info('who region multi-render result', data.multiRenderResult);
					$scope.globalRegionFixedValueSet = [];
					for(var i = 0; i < multiRenderResult.resultDocument.length; i++) {
						var whoRegion = multiRenderResult.resultDocument[i].whoRegion;
						$scope.globalRegionFixedValueSet.push({
							property:"who_country.who_region",
				   			  value:whoRegion.id,
				   			  indent:0,
				   			  displayName:whoRegion.displayName
						});
						if(whoRegion.whoSubRegion != null) {
							for(var j = 0; j < whoRegion.whoSubRegion.length; j++) {
								var whoSubRegion = whoRegion.whoSubRegion[j];
								$scope.globalRegionFixedValueSet.push({
									property:"who_country.who_sub_region",
						   			  value:whoSubRegion.id,
						   			  indent:1,
						   			  displayName:whoSubRegion.displayName
								});
								if(whoSubRegion.whoIntermediateRegion != null) {
									for(var k = 0; k < whoSubRegion.whoIntermediateRegion.length; k++) {
										var whoIntermediateRegion = whoSubRegion.whoIntermediateRegion[k];
										$scope.globalRegionFixedValueSet.push({
											property:"who_country.who_intermediate_region",
								   			  value:whoIntermediateRegion.id,
								   			  indent:2,
								   			  displayName:whoIntermediateRegion.displayName
										});
									}
								}
							}
						}
					}
					console.info('$scope.globalRegionFixedValueSet', $scope.globalRegionFixedValueSet);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving WHO region tree"));
			};
			
			$scope.developmentStatusFilter = function() {
                // note property here is a dummy value.
                return { property:"developmentStatus", nullProperty:"who_country", displayName: "Country Development Status", filterHints: 
	            	{ type: "StringFromFixedValueSet",
                	  generateCustomDefault: function() {
	            		  return {
	            			  fixedValue: $scope.developmentStatusFixedValueSet[0]
	            		  };
	            	  },
                	  generatePredicateFromCustom: function(filterElem) {
                		  var custom = filterElem.custom;
                		  var type;
                		  if(custom.fixedValue.property == 'who_country.development_status') {
                			  type = "String";
                		  } else {
                			  type = "Boolean";
                		  }
                		  var fakeFilterElem = {
                		    property:custom.fixedValue.property,
                		    nullProperty:filterElem.nullProperty,
                			type: filterElem.type,
                			predicate: {
                				operator: filterElem.predicate.operator,
                				operand: [custom.fixedValue.value]
                			}
                		  };
                		  return filterUtils.filterElemToCayennePredicate(fakeFilterElem);
                  	  },
	            	  generateFixedValueSet: function() {
	            		  return $scope.developmentStatusFixedValueSet;
	            	  }
	            	}
                };
			};
			$scope.initDevelopmentStatusFixedValueSet = function () {
				$scope.developmentStatusFixedValueSet = [
				                        				 {
				                        					 property:"who_country.development_status",
				                        					 value:"developed",
				                        					 indent:0,
				                        					 displayName:"Developed country"
				                        				 },
				                        				 {
				                        					 property:"who_country.development_status",
				                        					 value:"developing",
				                        					 indent:0,
				                        					 displayName:"Developing country"
				                        				 },
				                        				 {
				                        					 property:"who_country.is_ldc",
				                        					 value:"true",
				                        					 indent:1,
				                        					 displayName:"Least developed country (LDC)"
				                        				 },
				                        				 {
				                        					 property:"who_country.is_lldc",
				                        					 value:"true",
				                        					 indent:1,
				                        					 displayName:"Landlocked developing country (LLDC)"
				                        				 },
				                        				 {
				                        					 property:"who_country.is_sids",
				                        					 value:"true",
				                        					 indent:1,
				                        					 displayName:"Small island developing state (SIDS)"
				                        				 },
				                        			];
			};


			
			$scope.init(null);
			
			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();
			
			$scope.pagingContext.setDefaultSortOrder([
			    { property: "id", displayName: "Name", order: "+" }
  			]);

			$scope.pagingContext.setSortableProperties([
	            { property:"id", displayName: "Name" },
  	            { property:"who_country.id", displayName: "Country of Origin" },
  	            { property:"collection_year", displayName: "Collection Year" },
  	            { property:"host.display_name", displayName: "Host Species" },

            ]);

			$scope.pagingContext.setDefaultFilterElems([]);

			$scope.pagingContext.setFilterProperties([
         		{ property:"id", displayName: "Isolate Name", filterHints: {type: "String", altProperties:["display_name", "alt_names"]} },
  	            { property:"who_country.display_name", nullProperty:"who_country", altProperties:["who_country.id"], displayName: "Country of Origin", filterHints: {type: "String"} },
  	            $scope.globalRegionFilter(),
  	            $scope.developmentStatusFilter(),
         		{ property:"host.display_name", nullProperty:"host", altProperties:["host.host_alternate_name.display_name"], displayName: "Host Species", filterHints: {type: "String"} },
         		{ property:"complete_genome", displayName: "Complete Genome?", filterHints: {type: "Boolean"} },
  	            { property:"seg1genogroup.displayName", nullProperty:"seg1genogroup", altProperties:["seg1genogroup.name", "seg1genogroup.minimal_name"], displayName: "Segment 1 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg2genogroup.displayName", nullProperty:"seg2genogroup", altProperties:["seg2genogroup.name", "seg2genogroup.minimal_name"], displayName: "Segment 2 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg2genotype.displayName", nullProperty:"seg2genotype", altProperties:["seg2genotype.name", "seg2genotype.minimal_name"], displayName: "Segment 2 Genotype", filterHints: {type: "String"} },
  	            { property:"seg3genogroup.displayName", nullProperty:"seg3genogroup", altProperties:["seg3genogroup.name", "seg3genogroup.minimal_name"], displayName: "Segment 3 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg4genogroup.displayName", nullProperty:"seg4genogroup", altProperties:["seg4genogroup.name", "seg4genogroup.minimal_name"], displayName: "Segment 4 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg5genogroup.displayName", nullProperty:"seg5genogroup", altProperties:["seg5genogroup.name", "seg5genogroup.minimal_name"], displayName: "Segment 5 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg6genogroup.displayName", nullProperty:"seg6genogroup", altProperties:["seg6genogroup.name", "seg6genogroup.minimal_name"], displayName: "Segment 6 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg7genogroup.displayName", nullProperty:"seg7genogroup", altProperties:["seg7genogroup.name", "seg7genogroup.minimal_name"], displayName: "Segment 7 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg8genogroup.displayName", nullProperty:"seg8genogroup", altProperties:["seg8genogroup.name", "seg8genogroup.minimal_name"], displayName: "Segment 8 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg9genogroup.displayName", nullProperty:"seg9genogroup", altProperties:["seg9genogroup.name", "seg9genogroup.minimal_name"], displayName: "Segment 9 Genogroup", filterHints: {type: "String"} },
  	            { property:"seg10genogroup.displayName", nullProperty:"seg10genogroup", altProperties:["seg10genogroup.name", "seg10genogroup.minimal_name"], displayName: "Segment 10 Genogroup", filterHints: {type: "String"} },
	            { property:"collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
  	            { property:"sample_type", displayName: "Sample Type", filterHints: {type: "String"} },
  	            { property:"place_sampled", displayName: "Place Sampled", filterHints: {type: "String"} },
  	            { property:"tissue_sampled", displayName: "Tissue Sampled", filterHints: {type: "String"} },
  	            { property:"passage_history", displayName: "Passage History", filterHints: {type: "String"} },
  	            { property:"passage_cells", displayName: "Passage Cells", filterHints: {type: "String"} }
			]);
			                          			
		}]);
