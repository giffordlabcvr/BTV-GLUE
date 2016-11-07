btvApp.controller('btvAlignmentCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'dialogs',
		  function($scope, $routeParams, $controller, glueWS, dialogs) {
			addUtilsToScope($scope);

			$controller('alignmentCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.init($routeParams.alignmentName, 
					"btvAlignmentRenderer", "sequence.source.name = 'ncbi-curated'",
					[
					 "sequence.sequenceID",
					 "sequence.gb_country_official",
					 "sequence.gb_collection_year",
					 "sequence.gb_length",
					 "sequence.gb_create_date",
					 "sequence.pmid_reference",
					 "sequence.gb_isolate"
					 ]);

			$scope.pagingContext.setDefaultSortOrder([
			    { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);
	
			
			$scope.pagingContext.setSortableProperties([
	            { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_create_date", displayName: "Creation Date" },
	            { property:"sequence.gb_country_official", displayName: "Country of Origin" },
	            { property:"sequence.gb_collection_year", displayName: "Collection Year" },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID" },
	            { property:"sequence.gb_segment", displayName: "Segment" },
	            { property:"sequence.pmid_reference", displayName: "PubMed ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" }
	        ]);

			
		}]);