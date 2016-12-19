projectBrowser.controller('btvSequencesCtrl', 
		[ '$scope', 'glueWebToolConfig', 'glueWS', '$controller', 'dialogs', 
		    function($scope, glueWebToolConfig, glueWS, $controller, dialogs) {

			$controller('sequencesCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			console.log("initializing btv sequences");

			$scope.init("source.name = 'ncbi-curated' and excluded = null", 
					["source.name",
                     "sequenceID",
                     "gb_country_official",
                     "gb_segment",
                     "gb_collection_year",
                     "gb_length",
                     "gb_create_date",
                     "gb_isolate",
                     "gb_host"] );
			
			
			$scope.pagingContext.setDefaultSortOrder([
  			    { property: "sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
  			]);

  			
  			$scope.pagingContext.setSortableProperties([
  	            { property:"sequenceID", displayName: "NCBI Nucleotide ID" },
  	            { property:"gb_create_date", displayName: "Creation Date" },
  	            { property:"gb_country_official", displayName: "Country of Origin" },
  	            { property:"gb_collection_year", displayName: "Collection Year" },
  	            { property:"gb_isolate", displayName: "Isolate ID" },
  	            { property:"gb_host", displayName: "Host Species" },
  	            { property:"gb_segment", displayName: "Segment" },
  	            { property:"pmid_reference", displayName: "PubMed ID" },
  	            { property:"gb_length", displayName: "Sequence Length" }
              ]);

			
}]);
