(function() {
	'use strict';


	angular.module('app.security').controller('SecuritiesSearchCtrl',
			SecuritiesSearchCtrl);

	SecuritiesSearchCtrl.$inject = [ '$scope', '$location', '$filter', 'Security'];
	
	function SecuritiesSearchCtrl($scope, $location, $filter, Security) {
		
		var vm = this;
		
		vm.search = function(term) {
			return $scope.search_securities = Security.search({
				term : term
			}).$promise.then((function(response) {
				console.log(response);
				return response;
			}));
		};
	};

	

	angular.module('app.security').controller('SecurityController',
			SecurityController);
	
	SecurityController.$inject = ['$stateParams', '$location', 'API_BASE_URL', 'Security', 'SecurityForm' ];
	function SecurityController($stateParams, $location, API_BASE_URL, Security, SecurityForm) {

		var vm = this;
		/*
			The security being viewed, edited, deleted
		*/
		vm.security = {};

		vm.securities = {};

		vm.setFormFields = function(disabled) {
			vm.formFields = SecurityForm.getFormFields(disabled);
		};

		vm.create = function() {
			// Create new Security object
			var security = new Security(vm.security);

			// Redirect after save
			security.$save(function(response) {
				console.log('Security created');
				$location.path('security/' + response.id);
			}, function(errorResponse) {
				vm.error = errorResponse.data.summary;
			});
		};

		// Remove existing Security
		vm.remove = function(security) {

			if (security) {
				security = Security.get({
					securityId : security.id
				}, function() {
					security.$remove(function() {
						console.log('Security deleted');
						vm.tableParams.reload();
					});
				});
			} else {
				vm.security.$remove(function() {
					console.log('Security deleted');
					$location.path('/security');
				});
			}

		};

		// Update existing Security
		vm.update = function() {
			var security = vm.security;

			security.$update(function() {
				console.log('Security updated');
				$location.path('security/' + security.id);
			}, function(errorResponse) {
				vm.error = errorResponse.data.summary;
			});
		};

		vm.toViewSecurity = function() {
			vm.security = Security.get({
				securityId : $stateParams.securityId
			});
			vm.setFormFields(true);
		};

		vm.toEditSecurity = function() {
			vm.security = Security.get({
				securityId : $stateParams.securityId
			});
			vm.setFormFields(false);
		};

		activate();

		function activate() {
			console.log('Activated Security View ' + API_BASE_URL);
			Security.query(function(data) {
				console.log('Securities loaded');
				vm.securities = data;
			}, function(errorResponse) {
				vm.error = errorResponse.data.summary;
			});
		}
	}

})();