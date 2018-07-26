btvApp.controller('btvIsolateCtrl', 
		[ '$scope', '$routeParams', '$controller',
		    function($scope, $routeParams, $controller) {

			addUtilsToScope($scope);

			$scope.isolateID = $routeParams.isolateID;
			$scope.glueObjectPath = "custom-table-row/isolate/"+$scope.isolateID;
		
			$controller('renderableObjectBaseCtrl', { 
				$scope: $scope, 
				glueObjectPath: $scope.glueObjectPath,
				rendererModule: "btvIsolateRenderer"
			});	
			
			$scope.renderGlobalRegion = function(isolate) {
				if(isolate.who_region == null) {
					return "-";
				}
				var result = isolate.who_region_display_name;
				if(isolate.who_sub_region) {
					result = result + " / " + isolate.who_sub_region_display_name;
					if(isolate.who_intermediate_region) {
						result = result + " / " + isolate.who_intermediate_region_display_name;
					}
				}
				return result;
			}

			$scope.renderDevelopmentStatus = function(isolate) {
				if(isolate.country_development_status == null) {
					return "-";
				}
				var result = "";
				if(isolate.country_development_status == 'developing') {
					result = result + "Developing country";
					if(isolate.country_is_ldc) {
						result = result + " / Least developed country"
					}
					if(isolate.country_is_lldc) {
						result = result + " / Landlocked developing country"
					}
					if(isolate.country_is_sids) {
						result = result + " / Small island developing state"
					}
				}
				if(isolate.country_development_status == 'developed') {
					result = result + "Developed country";
				}
				return result;
			}


		}]);
