btvApp.controller('btvAlignmentCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs',
		  function($scope, $routeParams, $controller, glueWS, glueWebToolConfig, dialogs) {
			addUtilsToScope($scope);

			$controller('alignmentCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.init($routeParams.alignmentName, 
					"btvAlignmentRenderer", "sequence.source.name = 'ncbi-curated' and referenceMember = false",
					[
					 "sequence.sequenceID",
                     "sequence.who_country.id",
                     "sequence.who_country.display_name",
                     "sequence.who_country.who_region.id",
                     "sequence.who_country.who_region.display_name",
                     "sequence.who_country.development_status",
                     "sequence.who_country.who_sub_region.id",
                     "sequence.who_country.who_sub_region.display_name",
                     "sequence.who_country.who_intermediate_region.id",
                     "sequence.who_country.who_intermediate_region.display_name",
					 "sequence.gb_collection_year",
					 "sequence.gb_length",
					 "sequence.gb_create_date",
					 "sequence.gb_update_date",
					 "sequence.pmid_reference",
					 "sequence.gb_isolate",
					 "sequence.gb_host"
					 ]);

			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();

			$scope.pagingContext.setDefaultSortOrder([
			    { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);
	
			
			$scope.pagingContext.setSortableProperties([
	            { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" },
	            { property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date" },
	            { property:"sequence.gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"sequence.who_country.id", displayName: "Country of Origin" },
	            { property:"sequence.gb_collection_year", displayName: "Collection Year" },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID" },
	            { property:"sequence.gb_host", displayName: "Host Species" },
	            { property:"sequence.pmid_reference", displayName: "PubMed ID" }
	        ]);

  			$scope.pagingContext.setDefaultFilterElems([]);

			$scope.pagingContext.setFilterProperties([
         		{ property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
        		{ property:"sequence.gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
  	            { property:"sequence.complete_segment", displayName: "Complete Segment?", filterHints: {type: "Boolean"} },
  	            // commented out until alignments are populated
  	            // $scope.featurePresenceFilter(),
        		{ property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
        		{ property:"sequence.gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
  	            $scope.globalRegionFilter(),
  	            $scope.developmentStatusFilter(),
	            { property:"sequence.gb_host", displayName: "Host Species", filterHints: {type: "String"} },
	            { property:"sequence.gb_collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID", filterHints: {type: "String"} },
	            { property:"sequence.sample_type", displayName: "Sample Type", filterHints: {type: "String"} },
  	            { property:"sequence.place_sampled", displayName: "Place Sampled", filterHints: {type: "String"} },
  	            { property:"sequence.tissue_sampled", displayName: "Tissue Sampled", filterHints: {type: "String"} },
  	            { property:"sequence.passage_history", displayName: "Passage History", filterHints: {type: "String"} },
  	            { property:"sequence.passage_cells", displayName: "Passage Cells", filterHints: {type: "String"} },
	            { property:"sequence.pmid_reference", displayName: "PubMed ID", filterHints: {type: "String"} }
			]);

		}]);