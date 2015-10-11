import ng from 'angular';
import ngRoute from 'angular-route';
import moment from 'moment';

let app = ng.module('ProtoCiApp', [ngRoute]);

app.config($routeProvider => {
  $routeProvider
    .when('/containers', {
      templateUrl: 'views/container/list.html',
      controller: 'ContainerListCtrl'
    })
    .when('/containers/:containerId', {
      templateUrl: 'views/container/inspect.html',
      controller: 'ContainerInspectCtrl',
    })
    .when('/images', {
      templateUrl: 'views/images/list.html',
      controller: 'ImageListCtrl'
    })
    .when('/info', {
      templateUrl: '/views/info/info.html',
      controller: 'InfoCtrl'
    })
    .when('/builds', {
      templateUrl: '/views/build/index.html',
      controller: 'BuildIndexCtrl'
    })
    .when('/builds/new', {
      templateUrl: '/views/build/form.html',
      controller: 'BuildFormCtrl'
    })
    .otherwise({
      redirectTo: '/containers'
    });
});

app.controller('ContainerListCtrl', ['$scope', '$http', ($scope, $http) => {
  $scope.containers = []
  $http.get('/v1/containers')
    .then(response => $scope.containers = response.data)
    .catch(console.error);
}]);

app.controller('ContainerInspectCtrl', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) => {
  $scope.container = {};
  $http.get('/v1/containers/' + $routeParams.containerId)
    .then(response => $scope.container = response.data)
    .catch(console.error);
}]);

app.controller('ImageListCtrl', ['$scope', '$http', ($scope, $http) => {
  $scope.images = [];
  $http.get('/v1/images/')
    .then(response => $scope.images = response.data)
    .catch(console.error);
}]);

app.controller('BuildIndexCtrl', ['$scope', function($scope) {
  // todo: get list of recent builds
}]);

app.controller('BuildFormCtrl', ['$scope', '$http', function($scope, $http) {
  
  $scope.build = {
    gitUrl: 'https://github.com/joerx/express-static.git',
    gitBranch: 'master',
    testCmd: 'ls -hal',
    image: 'node:4'
  }

  $scope.submitForm = function() {
    $http.post('/v1/builds', $scope.build)
      .then(response => {
        console.log(response);
      })
      .catch(console.error);
  }

}]);

app.controller('InfoCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.info = {};
  $scope.version = {};
  
  $http.get('/v1/info')
    .then(response => $scope.info = response.data)
    .catch(console.error);

  $http.get('/v1')
    .then(response => $scope.version = response.data)
    .catch(console.error);
}]);


app.directive('containerLink', function() {
  return {
    restrict: 'E',
    scope: {
      container: '=container'
    },
    template: '<a href="#/containers/{{container.Id}}" title="container.Id">{{container.Id | elips:15}}</a>'
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
  return (arr, length) => {
    if (!arr) return;
    if (!arr.join) return arr; // assume it's not an array, return it
    return arr.join(', ');
  }
});

app.filter('bool', function() {
  return val => val ? 'yes' : 'no'
});

app.filter('elips', function() {
  return (str, max = 25) => str.length > max ? str.substring(0, max - 2) + '...' : str;
});

app.filter('dockerDate', function() {
  return input => moment(parseInt(input) * 1000).format('dd, MMM Do YYYY; HH:MM:SS')
});

app.filter('dockerBytes', function() {
  return input => Math.ceil(parseInt(input) / 1024 / 1024) + ' MB';
});
