var mapTrip = angular.module('mapTrip', ['ngRoute','google-maps']);
 
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
    $scope.map.center= {latitude: p[0], longitude: p[1]};
    showMap($scope.map,trip);
    console.log($scope.map);
  });
  // default??
    $scope.map = {
    center: {
        latitude: 21,
        longitude: 2
    },
    markers:[],
    polyline:[],
    zoom: 8
  };

});

function showMap(map,data) {
  var locations=data.locations;
//  var bounds = new google.maps.LatLngBounds();
  map.markers=[];
  map.polyline=[]

  for (var i in locations) {
    var location=locations[i];
    if (location.type=="point") {
      map.markers.push({latitude:location.coords[0],longitude:location.coords[1]});
      //addPoint(map,location);
    }
    if (location.type=="route") {
      addRoute(map,location);
    }
  }
  console.log(map.polyline);
}

function addPoint(map,location) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(location.coords[0],location.coords[1]),
    title: location.name
  });
  map.markers.push(marker);
}

function addRoute(map,location) {
  var line=[];
  for (var i in location.coords) {
    var coord=location.coords[i];
      line.push({latitude:coord[0],longitude:coord[1]});
  }
  map.polyline=line;
}
