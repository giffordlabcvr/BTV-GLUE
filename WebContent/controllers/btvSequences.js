projectBrowser.controller('btvSequencesCtrl', 
		[ '$scope', 'glueWebToolConfig', 'glueWS', '$controller', 'dialogs', 
		    function($scope, glueWebToolConfig, glueWS, $controller, dialogs) {

			$controller('sequencesCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			console.log("initializing btv sequences");

			$scope.init("source.name = 'ncbi-curated' and excluded = false", 
					["source.name",
                     "sequenceID",
                     "who_country.id",
                     "who_country.display_name",
                     "who_country.development_status",
                     "who_country.who_region.id",
                     "who_country.who_region.display_name",
                     "who_country.who_sub_region.id",
                     "who_country.who_sub_region.display_name",
                     "who_country.who_intermediate_region.id",
                     "who_country.who_intermediate_region.display_name",
                     "gb_segment",
                     "gb_collection_year",
                     "gb_length",
                     "gb_create_date",
                     "gb_update_date",
                     "gb_isolate",
                     "gb_host"] );
			
			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();

			
			$scope.pagingContext.setDefaultSortOrder([
  			    { property: "sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
  			]);

  			
  			$scope.pagingContext.setSortableProperties([
  	            { property:"sequenceID", displayName: "NCBI Nucleotide ID" },
  	            { property:"gb_create_date", displayName: "NCBI Entry Creation Date" },
  	            { property:"gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"who_country.id", displayName: "Country of Origin" },
  	            { property:"gb_collection_year", displayName: "Collection Year" },
  	            { property:"gb_isolate", displayName: "Isolate ID" },
  	            { property:"gb_host", displayName: "Host Species" },
  	            { property:"gb_segment", displayName: "Segment" },
  	            { property:"pmid_reference", displayName: "PubMed ID" },
  	            { property:"gb_length", displayName: "Sequence Length" }
              ]);

			$scope.pagingContext.setFilterProperties([
           		{ property:"sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
          		{ property:"gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
          		{ property:"gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
  	            { property:"gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
  	            { property:"gb_segment", displayName: "Segment", filterHints: {type: "Integer"} },
  	            { property:"complete_segment", displayName: "Complete Segment?", filterHints: {type: "Boolean"} },
  	            { property:"who_country.display_name", nullProperty:"who_country", altProperties:["who_country.id"], displayName: "Country of Origin", filterHints: {type: "String"} },
  	            $scope.globalRegionFilter(),
  	            $scope.developmentStatusFilter(),
  	            { property:"gb_host", displayName: "Host Species", filterHints: {type: "String"} },
  	            { property:"gb_collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
  	            { property:"gb_isolate", displayName: "Isolate ID", filterHints: {type: "String"} },
  	            { property:"sample_type", displayName: "Sample Type", filterHints: {type: "String"} },
  	            { property:"place_sampled", displayName: "Place Sampled", filterHints: {type: "String"} },
  	            { property:"tissue_sampled", displayName: "Tissue Sampled", filterHints: {type: "String"} },
  	            { property:"passage_history", displayName: "Passage History", filterHints: {type: "String"} },
  	            { property:"passage_cells", displayName: "Passage Cells", filterHints: {type: "String"} },
  	            { property:"pmid_reference", displayName: "PubMed ID", filterHints: {type: "String"} }
  			]);
  			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);
	
}]);
