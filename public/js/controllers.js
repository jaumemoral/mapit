var mapTrip = angular.module('mapTrip', ['ngRoute','ngMap']);
 
mapTrip.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/maps', {
      templateUrl: 'map-list.html',
      controller: 'MapListCtrl'
    }).when('/map/:mapId', {
      templateUrl: 'map-detail.html',
      controller: 'MapDetailCtrl'
    }).otherwise({
      redirectTo: '/maps'
    });
}]);


mapTrip.controller('MapListCtrl', function ($scope,$http) {
  $http.get("/api/maps/").success(function(data) {  
    $scope.trips=data;
  });
});

mapTrip.controller('MapDetailCtrl',function ($scope,$http,$routeParams) {
  $http.get("/api/maps/"+$routeParams.mapId).success(function(trip) {  
    $scope.trip=trip;
    var p=trip.locations[0].coords;
	console.log(p);
    showMap($scope.map,trip);
    $scope.map.center=p;
    $scope.map.zoom=3;
	console.log($scope.map.center);
  });
});

      function showMap(map,data) {
        var locations=data.locations;
var bounds = new google.maps.LatLngBounds();

        for (var i in locations) {
          var location=locations[i];
if (location.type=="point") {
            var marker=addPoint(map,location);
bounds.extend(marker.position);
}
if (location.type=="route") {
            var route=addRoute(map,location);
}
        }
map.fitBounds(bounds);
      }

      function addPoint(map,location) {
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(location.coords[0],location.coords[1]),
              map: map,
              title: location.name
            });
return marker;
      }

      function addRoute(map,location) {
        var googleCoords=[];
        for (var i in location.coords) {
          var coord=location.coords[i];
          googleCoords[i]=new google.maps.LatLng(coord[0],coord[1]);
        }
        var line = new google.maps.Polyline({
          path: googleCoords,
          map: map,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
return line;
      }

