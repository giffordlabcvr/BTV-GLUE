	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https:www.google-analytics.com/analytics.js','ga');
	
	  console.log("document.location.hostname", document.location.hostname);
	  var trackingID;
	  if(document.location.hostname.indexOf("btv.glue.cvr.ac.uk") >= 0) {
		  // BTV-GLUE production analytics account
		  trackingID = 'UA-93741740-1';
		  ga('create', trackingID, 'auto');
	  } else {
		  // sandbox analytics account
		  trackingID = 'UA-93752139-1';
		  ga('create', trackingID, 'none');
	  }

var btvApp = angular.module('btvApp', [
    'ngRoute',
    'projectBrowser', 
    'home',
    'glueWS',
    'glueWebToolConfig',
    'treeControl',
    'angulartics',
    'angulartics.google.analytics',
    'angular-cookie-law'
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
	// single isolate view
    $routeProvider.
    when('/project/isolate/:isolateID', {
  	  templateUrl: 'views/btvIsolate.html',
  	  controller: 'btvIsolateCtrl'
      });
    // isolates view
	$routeProvider.
    when('/project/isolate', {
  	  templateUrl: 'views/btvIsolates.html',
  	  controller: 'btvIsolatesCtrl'
      });
	
    $routeProvider.
    when('/btvFastaAnalysis', {
      templateUrl: '../views/btvFastaAnalysis.html',
      controller: 'btvFastaAnalysisCtrl'
    });
    
    $routeProvider.when('/versionInfo', {
  	  templateUrl: './views/versionInfo.html',
	  controller: 'versionInfoCtrl'
    });
    
    $routeProvider.when('/team', {
	  templateUrl: './views/team.html',
	  controller: 'teamCtrl'
    });
    
    $routeProvider.when('/howToCite', {
	  templateUrl: './views/howToCite.html',
	  controller: 'howToCiteCtrl'
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
	$scope.projectBrowserIsolateMenuTitle = "Isolates";
	$scope.analysisMenuTitle = "Analysis";
	$scope.analysisToolMenuTitle = "Genotyping and Interpretation";
	$scope.aboutBtvGlueMenuTitle = "About";
	$scope.aboutMenuTitle = "About";
	$scope.teamTitle = "The BTV-GLUE team";
	$scope.versionInfoTitle = "Version information";
	$scope.howToCiteTitle = "How to cite";
	glueWS.setProjectURL("../../../gluetools-ws/project/btv");
	glueWebToolConfig.setAnalysisToolURL("../gluetools-web/www/analysisTool");
	glueWebToolConfig.setAnalysisToolExampleSequenceURL("exampleSequences/btvSeg2Example.fasta");
	glueWebToolConfig.setAnalysisToolExampleMsWindowsSequenceURL("exampleSequencesMsWindows/btvSeg2Example.fasta");
	glueWebToolConfig.setAnalysisModuleName("btvSeg2WebAnalysisTool");
	glueWebToolConfig.setProjectBrowserURL("../gluetools-web/www/projectBrowser");
	glueWebToolConfig.setGlueWSURL("../gluetools-web/www/glueWS");
} ]);


