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
                     "isolate.who_country.id",
                     "isolate.who_country.display_name",
                     "isolate.who_country.who_region.id",
                     "isolate.who_country.who_region.display_name",
                     "isolate.who_country.who_sub_region.id",
                     "isolate.who_country.who_sub_region.display_name",
                     "isolate.who_country.who_intermediate_region.id",
                     "isolate.who_country.who_intermediate_region.display_name",
                     "isolate_segment",
                     "complete_segment",
                     "isolate.collection_year",
                     "gb_length",
                     "gb_create_date",
                     "gb_update_date",
                     "isolate.id",
                     "isolate.display_name",
                     "isolate.host"] );
			
			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();

			
			$scope.pagingContext.setDefaultSortOrder([
  			    { property: "sequenceID", displayName: "GenBank Accession", order: "+" }
  			]);

  			
  			$scope.pagingContext.setSortableProperties([
  	            { property:"sequenceID", displayName: "GenBank Accession" },
  	            { property:"gb_create_date", displayName: "GenBank Creation Date" },
  	            { property:"gb_update_date", displayName: "GenBank Last Update Date" },
  	            { property:"isolate.who_country.id", displayName: "Country of Origin" },
  	            { property:"isolate.collection_year", displayName: "Collection Year" },
  	            { property:"isolate.id", displayName: "Isolate Name" },
  	            { property:"isolate.host", displayName: "Host Species" },
  	            { property:"isolate_segment", displayName: "Segment" },
  	            { property:"gb_length", displayName: "Sequence Length" }
              ]);

			$scope.pagingContext.setFilterProperties([
           		{ property:"sequenceID", displayName: "GenBank Accession", filterHints: {type: "String"} },
          		{ property:"gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
          		{ property:"gb_create_date", displayName: "GenBank Creation Date", filterHints: {type: "Date"} },
  	            { property:"gb_update_date", displayName: "GenBank Last Update Date", filterHints: {type: "Date"} },
  	            { property:"isolate_segment", displayName: "Segment", filterHints: {type: "Integer"} },
  	            { property:"complete_segment", displayName: "Complete Segment?", filterHints: {type: "Boolean"} },
  	            { property:"isolate.who_country.display_name", nullProperty:"isolate.who_country", altProperties:["isolate.who_country.id"], displayName: "Country of Origin", filterHints: {type: "String"} },
  	            $scope.globalRegionFilter(),
  	            { property:"isolate.host", displayName: "Host Species", filterHints: {type: "String"} },
  	            { property:"isolate.collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
  	            { property:"isolate.id", altProperties:["isolate.display_name", "isolate.alt_names"], displayName: "Isolate Name", filterHints: {type: "String"} },
  	            { property:"isolate.seg2clade.displayName", nullProperty:"isolate.seg2clade", altProperties:["isolate.seg2clade.name"], displayName: "Segment 2 Genotype", filterHints: {type: "String"} },
  	            { property:"isolate.sample_type", displayName: "Sample Type", filterHints: {type: "String"} },
  	            { property:"isolate.place_sampled", displayName: "Place Sampled", filterHints: {type: "String"} },
  	            { property:"isolate.tissue_sampled", displayName: "Tissue Sampled", filterHints: {type: "String"} },
  	            { property:"isolate.passage_history", displayName: "Passage History", filterHints: {type: "String"} },
  	            { property:"isolate.passage_cells", displayName: "Passage Cells", filterHints: {type: "String"} }
  			]);
  			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);
	
}]);
