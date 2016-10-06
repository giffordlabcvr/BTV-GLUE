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

	projectBrowserStandardRoutes.addReferencesRoute($routeProvider, projectBrowserURL);
	projectBrowserStandardRoutes.addReferenceRoute($routeProvider, projectBrowserURL);
	projectBrowserStandardRoutes.addSequencesRoute($routeProvider, projectBrowserURL);
	projectBrowserStandardRoutes.addSequenceRoute($routeProvider, projectBrowserURL);
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
	projectBrowserStandardRoutes.addAlignmentMemberRoute($routeProvider, projectBrowserURL);
	
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
	$scope.projectBrowserAlignmentMenuTitle = "Clade Tree";
	$scope.projectBrowserReferenceSequenceMenuTitle = "Reference Sequences";
	$scope.projectBrowserSequenceMenuTitle = "Sequences";
	glueWS.setProjectURL("../../../gluetools-ws/project/btv");
	glueWebToolConfig.setProjectBrowserURL("../gluetools-web/www/projectBrowser");
	glueWebToolConfig.setGlueWSURL("../gluetools-web/www/glueWS");
} ]);


