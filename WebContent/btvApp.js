var btvApp = angular.module('btvApp', [
    'ngRoute',
    'projectBrowser', 
    'home',
    'glueWS',
    'glueWebToolConfig',
    'treeControl'
  ]);

console.log("after btvApp module definition");

btvApp.config(['$routeProvider', 'projectBrowserStandardRoutesProvider',
  function($routeProvider, projectBrowserStandardRoutesProvider) {
	
	var projectBrowserStandardRoutes = projectBrowserStandardRoutesProvider.$get();
	var projectBrowserURL = "../gluetools-web/www/projectBrowser";
	// custom single alignment view
	$routeProvider.
    when('/project/reference/:referenceName', {
	  templateUrl: 'views/btvReference.html',
	  controller: 'btvReferenceCtrl'
    });
    // custom alignments view
	$routeProvider.
    when('/project/alignment', {
  	  templateUrl: 'views/btvAlignments.html',
  	  controller: 'btvAlignmentsCtrl'
      });
	// custom single alignment view
	$routeProvider.
    when('/project/alignment/:alignmentName', {
	  templateUrl: 'views/btvAlignment.html',
	  controller: 'btvAlignmentCtrl'
    });
    // custom sequences view
	$routeProvider.
    when('/project/sequence', {
  	  templateUrl: 'views/btvSequences.html',
  	  controller: 'btvSequencesCtrl'
      });
	// custom single sequence view
	$routeProvider.
    when('/project/sequence/:sourceName/:sequenceID', {
	  templateUrl: 'views/btvSequence.html',
	  controller: 'btvSequenceCtrl'
    });
	
    $routeProvider.
      when('/home', {
    	  templateUrl: './modules/home/home.html',
    	  controller: 'homeCtrl'
      }).
      otherwise({
    	  redirectTo: '/home'
      });
}]);

btvApp.controller('btvAppCtrl', 
  [ '$scope', 'glueWS', 'glueWebToolConfig',
function ($scope, glueWS, glueWebToolConfig) {
	$scope.brand = "BTV-GLUE";
	$scope.homeMenuTitle = "Home";
	$scope.projectBrowserMenuTitle = "Sequence Database";
	$scope.projectBrowserAlignmentMenuTitle = "Segment Clade Trees";
	$scope.projectBrowserSequenceMenuTitle = "Sequences";
	glueWS.setProjectURL("../../../gluetools-ws/project/btv");
	glueWebToolConfig.setProjectBrowserURL("../gluetools-web/www/projectBrowser");
	glueWebToolConfig.setGlueWSURL("../gluetools-web/www/glueWS");
} ]);


