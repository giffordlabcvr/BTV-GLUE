projectBrowser.controller('btvReferencesCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs',
    function($scope, $route, $routeParams, glueWS, dialogs) {

	$scope.listReferenceResult = null;
	addUtilsToScope($scope);

	glueWS.runGlueCommand("", {
	    "list":{
	        "reference":{
	            "sortProperties":"sequence.gb_segment,sequence.gb_serotype",
	            "fieldName":[
	                "name",
	                "displayName",
	                "sequence.source.name",
	                "sequence.sequenceID"
	            ]
	        }
	    }
	})
    .success(function(data, status, headers, config) {
		  console.info('list reference raw result', data);
		  $scope.listReferenceResult = tableResultAsObjectList(data);
		  console.info('list reference result as object list', $scope.listSequenceResult);
    })
    .error(glueWS.raiseErrorDialog(dialogs, "listing references"));

	
}]);
