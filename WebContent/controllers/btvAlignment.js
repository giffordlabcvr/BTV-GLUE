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
					 "alignment.name",
					 "alignment.displayName",
					 "sequence.sequenceID",
                     "sequence.isolate.who_country.id",
                     "sequence.isolate.who_country.display_name",
                     "sequence.isolate.who_country.who_region.id",
                     "sequence.isolate.who_country.who_region.display_name",
                     "sequence.isolate.who_country.who_sub_region.id",
                     "sequence.isolate.who_country.who_sub_region.display_name",
                     "sequence.isolate.who_country.who_intermediate_region.id",
                     "sequence.isolate.who_country.who_intermediate_region.display_name",
                     "sequence.isolate.collection_year",
                     "sequence.complete_segment",
                     "sequence.gb_length",
                     "sequence.gb_create_date",
                     "sequence.gb_update_date",
                     "sequence.isolate.id",
                     "sequence.isolate.display_name",
                     "sequence.isolate.host.display_name"
					 ]);

			$scope.encodeURIComponent = function(string) {
				return encodeURIComponent(string);
			}

			
			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();

			$scope.pagingContext.setDefaultSortOrder([
			    { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);
	
			
			$scope.pagingContext.setSortableProperties([
	            { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" },
	            { property:"alignment.sort_key", displayName: "Clade" },
	            { property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date" },
	            { property:"sequence.gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"sequence.isolate.who_country.id", displayName: "Country of Origin" },
	            { property:"sequence.isolate.collection_year", displayName: "Collection Year" },
	            { property:"sequence.isolate.id", displayName: "Isolate Name" },
	            { property:"sequence.isolate.host.display_name", displayName: "Host Species" }
	        ]);

  			$scope.pagingContext.setDefaultFilterElems([]);

			$scope.pagingContext.setFilterProperties([
         		{ property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
        		{ property:"sequence.gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
  	            { property:"alignment.displayName", displayName: "Clade", filterHints: {type: "String"} },
        		{ property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
        		{ property:"sequence.gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
  	            { property:"sequence.complete_segment", displayName: "Complete Segment?", filterHints: {type: "Boolean"} },
  	            { property:"sequence.isolate.who_country.display_name", nullProperty:"sequence.isolate.who_country", altProperties:["sequence.isolate.who_country.id"], displayName: "Country of Origin", filterHints: {type: "String"} },
  	            $scope.globalRegionFilter(),
         		{ property:"sequence.isolate.host.display_name", nullProperty:"sequence.isolate.host", altProperties:["sequence.isolate.host.host_alternate_name.display_name"], displayName: "Host Species", filterHints: {type: "String"} },
	            { property:"sequence.isolate.collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
	            { property:"sequence.isolate.id", displayName: "Isolate Name", filterHints: {type: "String"} },
	            { property:"sequence.isolate.sample_type", displayName: "Sample Type", filterHints: {type: "String"} },
  	            { property:"sequence.isolate.place_sampled", displayName: "Place Sampled", filterHints: {type: "String"} },
  	            { property:"sequence.isolate.tissue_sampled", displayName: "Tissue Sampled", filterHints: {type: "String"} },
  	            { property:"sequence.isolate.passage_history", displayName: "Passage History", filterHints: {type: "String"} },
  	            { property:"sequence.isolate.passage_cells", displayName: "Passage Cells", filterHints: {type: "String"} }
			]);

		}]);