var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/client/templates/index.html',
        controller: 'index'
      })
      .when('/info', {
        templateUrl: '/client/templates/info.html',
        controller: 'info'
      });
  }]);

app.controller('index', function($scope){
  $scope.button = 'login justin';
});

app.controller('info', function($scope){
  $scope.message = 'YOUR INfo HERE';
});