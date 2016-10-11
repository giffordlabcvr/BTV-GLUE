projectBrowser.controller('btvSequencesCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs',
    function($scope, $route, $routeParams, glueWS, dialogs) {

	$scope.listSequenceResult = null;
	addUtilsToScope($scope);

	glueWS.runGlueCommand("", {
    	"list": { "sequence": {
			"whereClause":"source.name = 'ncbi-curated' and excluded = null",
            "fieldName":[
                         "source.name",
                         "sequenceID",
                         "gb_country_official",
                         "gb_segment",
                         "gb_collection_year",
                         "gb_length",
                         "gb_create_date",
                         "gb_isolate"
                     ]
    	} } 
	})
    .success(function(data, status, headers, config) {
		  console.info('list sequence raw result', data);
		  $scope.listSequenceResult = tableResultAsObjectList(data);
		  console.info('list sequence result as object list', $scope.listSequenceResult);
    })
    .error(glueWS.raiseErrorDialog(dialogs, "listing sequences"));

	
}]);
