var mapTrip = angular.module('mapTrip', ['ngRoute','leaflet-directive','mapTripServices','ngDragDrop']);
 
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
  $scope.newTrip={};

  $scope.createMap=function() {
    var trip=new Trip();
    trip._id=$scope.newTrip._id;
    trip.title=$scope.newTrip.title;
    trip.description=$scope.newTrip.description;
    trip.sections=[{
        name:"Section 1",
        description:"Section 1 description",
        locations: []
    }];
    trip.$save();
    $scope.trips=Trip.query();
    // Aixo no es gaire angularesc...
    $("#addMapDialog").modal('hide');
  };

  $scope.deleteMap=function(trip) {
    trip.$delete();
    $scope.trips=Trip.query();
    $("#deleteMapDialog").modal('hide');
  }

  $scope.prepareToDeleteMap=function(trip) {
    $scope.tripToDelete=trip;
  }


});

mapTrip.controller('MapDetailCtrl',function ($scope,$routeParams,Trip) {
  Trip.get({mapId:$routeParams.mapId},function(trip) {  
    $scope.trip=trip;
    showTripInMap(trip,$scope.map);
    $scope.selectedSection=trip.sections[0];
  });

  // default??
  angular.extend($scope,{
    map: {
      control:{},
      center: {lat: 41.40401,lng: 2.17454,zoom:8},
      markers:{},
      paths:[],
      events: {
        click: function (mapModel, eventName, originalEventArgs) {
            $scope.clickOnMap(originalEventArgs[0]);
        }
      }
    }
  });

  var geocoder = new google.maps.Geocoder();
  var directionsService = new google.maps.DirectionsService();

  $scope.searchAddress=function() {
    var address=$scope.address;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var location=results[0].geometry.location;
          $scope.clearSearch();
          $scope.map.markers.newMarker={lat:location.lat(),lng:location.lng(),message:address};
          $scope.map.center.lat=location.lat();
          $scope.map.center.lng=location.lng();
          // No se perque pero cal!!
          $scope.$apply();
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
  }

  $scope.onDrop=function(origin,location) {
    movedElement=$scope.selectedSection.locations[origin];
    $scope.selectedSection.locations.splice(origin,1)
    i=$scope.selectedSection.locations.indexOf(location);
    $scope.selectedSection.locations.splice(i,0,movedElement);
  }

  $scope.clickOnMap=function (event) {

    if (!$scope.map.markers.newMarker) {
        $scope.map.markers.newMarker = {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
        }
    } else {
        $scope.map.markers.newMarker.latitude = event.latLng.lat();
        $scope.map.markers.newMarker.longitude = event.latLng.lng();
    }
    geocoder.geocode( { 'latLng': event.latLng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $scope.address=results[0].formatted_address;
          $scope.results=results[0].formatted_address;
          $scope.$apply();
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });

  }

  $scope.clearSearch=function() {
    $scope.address=null;
    $scope.map.markers.newMarker={};
  }

  $scope.selectSection=function(section) {
    $scope.selectedSection=section;
  }

  $scope.addPointToTrip=function() {
    var m=$scope.map.markers.newMarker;
    var newCoords=[m.lat,m.lng];
    var name=m.message;
    var lastPoint=lastPointInSection($scope.selectedSection);
    var currentLocations=$scope.selectedSection.locations;
    currentLocations.push({type:"point",coords:newCoords,name:name,description:"prova"});
    $scope.clearSearch();
    var request={
        origin:new google.maps.LatLng(lastPoint.coords[0],lastPoint.coords[1]),
        destination:new google.maps.LatLng(newCoords[0],newCoords[1]),
        travelMode: google.maps.TravelMode.DRIVING
      }
      console.log(newCoords[0]+"-"+newCoords[1]);
    directionsService.route(request, function(result, status) {
        console.log(result);
      if (status == google.maps.DirectionsStatus.OK) {
        var route=[];
        for (i in result.routes[0].overview_path) {
          point=result.routes[0].overview_path[i];
          route[i]=[point.lat(),point.lng()];
        }
        currentLocations.push({type:"route",coords:route,name:name,description:"prova"});
        showTripInMap($scope.trip,$scope.map);
      }
    });
  }

  $scope.saveTrip=function() {
    $scope.trip.$save();
  }

  $scope.deleteLocation=function(section,location) {
    var s=$scope.trip.sections.indexOf(section);
    var l=$scope.trip.sections[s].locations.indexOf(location);
    $scope.trip.sections[s].locations.splice(l,1);
    showTripInMap($scope.trip,$scope.map);
  }

});

// ----------------------

function showTripInMap(trip,map) {
  var sections=trip.sections;
  map.markers={};
  map.polylines=[];
  for (var i in sections) {
    showSectionInMap(sections[i],map)
  }
  map.center=calculateBounds(trip);
  console.log(map.center);
}

function showSectionInMap(section,map) {
  var locations=section.locations;
  var bounds = new google.maps.LatLngBounds();

  for (var i in locations) {
    var location=locations[i];
    if (location.type=="point") {
      addPoint(location,map);
      latLng = new google.maps.LatLng(location[0], location[1]);
      bounds.extend(latLng);
    }
    if (location.type=="route") {
      addRoute(location,map);
    }
  }
}

function calculateBounds(trip) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in trip.sections) {
    for (var j in trip.sections[i].locations) {
      var location=trip.sections[i].locations[j];
      if (location.type=="point") {
        latLng = new google.maps.LatLng(location.coords[0], location.coords[1]);
        bounds.extend(latLng);
      }
    }
  }
  var center=bounds.getCenter();
  return {lat:center.lat(),lng:center.lng(),zoom:8};
}


function addPoint(location,map) {
  console.log(map.markers);
  map.markers["p"+Object.keys(map.markers).length]={lat:location.coords[0],lng:location.coords[1],message:location.name};
}

function addRoute(location,map) {
  var line=[];
  for (var i in location.coords) {
    var coord=location.coords[i];
      line.push({lat:coord[0],lng:coord[1]});
  }
  map.paths.push({latlngs:line});
}

function lastPointInSection(section) {
  var location=null;
  var locations=section.locations;
  for (i in locations) if (locations[i].type=="point") location=locations[i];
  return location;
}