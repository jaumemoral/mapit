var mapTrip = angular.module('mapTrip', ['ngRoute','google-maps','mapTripServices']);
 
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


mapTrip.controller('MapListCtrl', function ($scope,Trip) {
  $scope.trips=Trip.query();
});

mapTrip.controller('MapDetailCtrl',function ($scope,$routeParams,Trip) {
  Trip.get({mapId:$routeParams.mapId},function(trip) {  
    $scope.trip=trip;
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
    polylines:[{path:[{latitude: 21,longitude: 2},{latitude: 21,longitude: 2}]}],
    zoom: 8
  };

  function  searchAddress() {
    var map=$scope.map.control.getGMap();
    var address=$("#search").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
  }


});

function showMap(map,data) {
  var locations=data.sections[0].locations;
//  var bounds = new google.maps.LatLngBounds();
  map.markers=[];
  map.polylines=[]

  for (var i in locations) {
    var location=locations[i];
    if (location.type=="point") {
      map.markers.push({latitude:location.coords[0],longitude:location.coords[1],showWindow:false,title:location.name});
      //addPoint(map,location);
    }
    if (location.type=="route") {
      addRoute(map,location);
    }
  }
  console.log(map.polylines);
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
  map.polylines.push({path:line});
}
