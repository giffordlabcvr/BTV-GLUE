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
			
		}]);