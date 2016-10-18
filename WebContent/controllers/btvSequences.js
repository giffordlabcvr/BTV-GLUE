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
                     "gb_isolate"] );
}]);
