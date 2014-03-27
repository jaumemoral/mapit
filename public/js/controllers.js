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
    showTripInMap(trip,$scope.map);
    console.log($scope.map);
  });

  // default??
  angular.extend($scope,{
    map: {
      control:{},
      center: {
        latitude: 21,
        longitude: 2
      },
      markers:[],
      polylines:[{path:[{latitude: 21,longitude: 2},{latitude: 21,longitude: 2}]}],
      zoom: 8
      }
  });

  geocoder = new google.maps.Geocoder();

  $scope.searchAddress=function() {
    if ($scope.newMarker!=null) $scope.clearSearch();
    geocoder.geocode( { 'address': $scope.address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results);
          var location=results[0].geometry.location;
          var newMarker={latitude:location.lat(),longitude:location.lng(),name:$scope.address,options:{animation:google.maps.Animation.DROP}};
          $scope.map.markers.push(newMarker);
          $scope.newMarker=newMarker;
          // No se perque pero cal!!
          $scope.$apply();
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
  }

  $scope.clearSearch=function() {
    $scope.map.markers.pop();
    $scope.newMarker=null;
  }

  $scope.addPointToTrip=function() {
    var newCoords=[$scope.newMarker.latitude,$scope.newMarker.longitude];
    var name=$scope.newMarker.name;
    var lastPoint=lastPointInSection($scope.trip.sections[0]);
    $scope.trip.sections[0].locations.push({type:"point",coords:newCoords,name:name,description:"prova"});
    $scope.clearSearch();
    try {
      $scope.trip.sections[0].locations.push(
        {type:"route",coords:[lastPoint.coords,newCoords],name:"ruta "+lastPoint.name+" - "+name,description:"Es poden posar descripcions a les rutes"}
      )
    } catch (err) {;}
    showTripInMap($scope.trip,$scope.map);
  }

  $scope.saveTrip=function() {
    $scope.trip.$save();
  }

});

// ----------------------

function showTripInMap(trip,map) {
  var locations=trip.sections[0].locations;
  map.markers=[];
  map.polylines=[]

  for (var i in locations) {
    var location=locations[i];
    if (location.type=="point") {
      addPoint(map,location);
    }
    if (location.type=="route") {
      addRoute(map,location);
    }
  }
}

function addPoint(map,location) {
  map.markers.push({latitude:location.coords[0],longitude:location.coords[1],showWindow:false,title:location.name});
}

function addRoute(map,location) {
  var line=[];
  for (var i in location.coords) {
    var coord=location.coords[i];
      line.push({latitude:coord[0],longitude:coord[1]});
  }
  map.polylines.push({path:line});
}

function lastPointInSection(section) {
  var location=null;
  var locations=section.locations;
  for (i in locations) if (locations[i].type=="point") location=locations[i];
  return location;
}