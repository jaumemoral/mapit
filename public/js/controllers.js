var mapTrip = angular.module('mapTrip', []);
 
mapTrip.controller('MapListCtrl', function ($scope,$http) {
  $http.get("/maps/").success(function(data) {  
    $scope.maps=data;
  });
});

