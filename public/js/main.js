var ng = require('angular');
var moment = require('moment');

var app = ng.module('ProtoCiApp', []);

app.controller('ContainerList', ['$scope', '$http', function($scope, $http) {

  $scope.containers = []

  $http.get('/v1/containers')
    .then(function(response) {
      console.log(response.data);
      $scope.containers = response.data;
    })
    .catch(console.error);


}]);

app.directive('containerLink', function() {
  return {
    restrict: 'E',
    scope: {
      container: '=container'
    },
    template: '<a href="#/container/{{container.Id}}" title="container.Id">{{container.Id | elips:10}}</a>'
  }
});

app.directive('containerPorts', function() {
  return {
    restrict: 'E',
    scope: {
      container: '=container'
    },
    template: 
      '<span ng-repeat="port in container.Ports">' + 
        '{{port.PrivatePort}}/{{port.Type}} -> {{port.IP}}:{{port.PublicPort}}<br/>' + 
      '</span>'
  }
});

app.filter('join', function() {
  return function(arr, length) {
    if (!arr.join) return arr; // assume it's not an array, return it
    return arr.join(', ');
  }
});

app.filter('elips', function() {
  return function(input, length) {
    length = length || 25;
    return input.length > length ? input.substring(0, length - 2) + '...' : input;
  }
});

app.filter('dockerDate', function() {
  return function(input) {
    return moment(parseInt(input) * 1000).format('dd, MMM Do YYYY; HH:MM:SS');
  }
});
