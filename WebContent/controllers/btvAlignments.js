projectBrowser.controller('btvAlignmentsCtrl', 
		[ '$scope', 'glueWebToolConfig', 'glueWS', '$controller', 'dialogs', 
		    function($scope, glueWebToolConfig, glueWS, $controller, dialogs) {

			$controller('cladeTreeCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.initFromRootNodes([
  			    //{ almtName: "AL_S1_MASTER", initiallyExpanded: false },
			    { almtName: "AL_S2_MASTER", initiallyExpanded: true, sortProperties:"displayName" },
			    //{ almtName: "AL_S3_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S4_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S5_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S6_MASTER", initiallyExpanded: false, sortProperties:"refSequence.sequence.gb_serotype" },
			    //{ almtName: "AL_S7_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S8_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S9_MASTER", initiallyExpanded: false },
			    //{ almtName: "AL_S10_MASTER", initiallyExpanded: false },
			]);
	
}]);
