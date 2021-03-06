(function(){
  'use strict';
  angular.module('app', ['ionic', 'formly', 'formlyIonic', 'firebase', 'blocks.router', 'blocks.logger', 'ngResource'])
    .constant('FirebaseUrl', 'https://lifeofatrade.firebaseio.com/')
    .config(configBlock)
    .config(['$httpProvider', function($httpProvider) {  
      //$httpProvider.interceptors.push('sessionInjector');
    }])
    .run(runBlock);

  function configBlock($stateProvider, $urlRouterProvider, $provide){
    $stateProvider
    .state('loading', {
      url: '/loading',
      template: '<ion-spinner style="text-align: center; margin-top: 50%;"></ion-spinner>',
      controller: 'LoadingCtrl'
    })
    .state('login', {
      url: '/login',
      views: {
        'mainContent': {
          templateUrl: 'app/authentication/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app', {
      url: '/app',
      abstract: true,
      views: {
        'mainContent': {
          templateUrl: 'app/layout/layout.html',
          controller: 'LayoutCtrl',
        }
      },
      resolve: {
        authData: AuthDataResolver
      }
    })
    .state('app.twitts', {
      url: '/twitts',      
      templateUrl: 'app/twitts/twitts.html',
      controller: 'TwittsCtrl'
    })
    .state('app.twitt', {
      url: '/twitts/:id',
      templateUrl: 'app/twitts/twitt.html',
      controller: 'TwittCtrl'
    })
    .state('app.settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsCtrl',
      resolve: {
        resolvedSettings: function(Storage){
          return Storage.getUserSettings();
        }
      }
    });

    $urlRouterProvider.otherwise('/login');

    // catch Angular errors
    $provide.decorator('$exceptionHandler', ['$delegate', function($delegate){
      return function(exception, cause){
        $delegate(exception, cause);
        var data = {};
        if(cause)               { data.cause    = cause;              }
        if(exception){
          if(exception.message) { data.message  = exception.message;  }
          if(exception.name)    { data.name     = exception.name;     }
          if(exception.stack)   { data.stack    = exception.stack;    }
        }
        Logger.error('Angular error: '+data.message, {cause: data.cause, stack: data.stack});
      };
    }]);
  }

  function AuthDataResolver($location) {
    console.log("AuthDataResolver called");
    var requireAuth = firebase.auth().currentUser;
    console.log("requireAuth = " + requireAuth);
    if(requireAuth) {
      $location.path('/app/securities');
    } else {
      $location.path('/'); 
    }
  }
  
  // catch JavaScript errors
  window.onerror = function(message, url, line, col, error){
    var stopPropagation = false;
    var data = {};
    if(message)       { data.message      = message;      }
    if(url)           { data.fileName     = url;          }
    if(line)          { data.lineNumber   = line;         }
    if(col)           { data.columnNumber = col;          }
    if(error){
      if(error.name)  { data.name         = error.name;   }
      if(error.stack) { data.stack        = error.stack;  }
    }
    if(navigator){
      if(navigator.userAgent)   { data['navigator.userAgent']     = navigator.userAgent;    }
      if(navigator.platform)    { data['navigator.platform']      = navigator.platform;     }
      if(navigator.vendor)      { data['navigator.vendor']        = navigator.vendor;       }
      if(navigator.appCodeName) { data['navigator.appCodeName']   = navigator.appCodeName;  }
      if(navigator.appName)     { data['navigator.appName']       = navigator.appName;      }
      if(navigator.appVersion)  { data['navigator.appVersion']    = navigator.appVersion;   }
      if(navigator.product)     { data['navigator.product']       = navigator.product;      }
    }
    Logger.error('JavaScript error: '+data.message, {cause: data.cause, stack: data.stack});
    return stopPropagation;
  };

  function runBlock($rootScope, FirebaseDB){
    $rootScope.safeApply = function(fn){
      var phase = this.$root ? this.$root.$$phase : this.$$phase;
      if(phase === '$apply' || phase === '$digest'){
        if(fn && (typeof(fn) === 'function')){
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

     
    
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === 'AUTH_REQUIRED') {
        $state.go('login');
      }
    });

  }

})();
