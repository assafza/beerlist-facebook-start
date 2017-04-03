var app = angular.module('beerList', ['ui.router']);

app.config(function( $stateProvider, $urlRouterProvider, $httpProvider,$locationProvider) {

  $locationProvider.html5Mode(true);
  $stateProvider
    .state('home', {
      url: '/home',
      controller: 'mainController',
      templateUrl: '/templates/home.html'
    })
    .state('beer', {
      url: '/beer/:id',
      controller: 'beerController',
      templateUrl: '/templates/beer.html',
      params: {
        beerParam: null
      }
    })
    .state('auth', {
      url: '/authorization?token&name',
      controller: function($stateParams, $rootScope, $state , $http) {
        console.log($stateParams);
        if ($stateParams.token) {
          var user = {
            name: $stateParams.name,
            token: $stateParams.token
          }
        localStorage.setItem("user", JSON.stringify(user));
        $rootScope.currentUser = $stateParams.name;
        //set the header for all requests
        $http.defaults.headers.common.Authorization = 'Bearer ' + user.token;
        $state.go('home');
      }
    }})
  $urlRouterProvider.otherwise('/home');

  //Regenerate tokem automatically when token is passed the time
  $httpProvider.interceptors.push(function($q, $window) {
    return {
      responseError: function(error) {
        if (error.data.message == "jwt expired") {
          $window.location.href = "/auth/facebook"
          return error
        } else {
          return $q.reject(error)
        }
      }
    };
  })
});

app.run(function($rootScope) {
  //retrieve user from local storage
  //if a user was retrieved set the currentUser
  user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    $rootScope.currentUser = user.name;
  }
});
