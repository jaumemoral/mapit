var mapTrip = angular.module('mapTrip', ['ngRoute','google-maps','mapTripServices','ngDragDrop']);
 
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
      center: {
        latitude: 21,
        longitude: 2
      },
      markers:[],newMarker:{},
      polylines:[{path:[{latitude: 21,longitude: 2},{latitude: 21,longitude: 2}]}],
      zoom: 8,
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
          $scope.map.newMarker={latitude:location.lat(),longitude:location.lng(),name:address};
          $scope.map.center={latitude:location.lat(),longitude:location.lng()};
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
    if (!$scope.map.newMarker) {
        $scope.map.newMarker = {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
        }
    } else {
        $scope.map.newMarker.latitude = event.latLng.lat();
        $scope.map.newMarker.longitude = event.latLng.lng();
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
    $scope.map.newMarker={};
  }

  $scope.selectSection=function(section) {
    $scope.selectedSection=section;
  }

  $scope.addPointToTrip=function() {
    var m=$scope.map.newMarker;
    var newCoords=[m.latitude,m.longitude];
    var name=m.name;
    var lastPoint=lastPointInSection($scope.selectedSection);
    var currentLocations=$scope.selectedSection.locations;
    currentLocations.push({type:"point",coords:newCoords,name:name,description:"prova"});
    $scope.clearSearch();
    var request={
        origin:new google.maps.LatLng(lastPoint[0],lastPoint[1]),
        destination:new google.maps.LatLng(newCoords[0],newCoords[1]),
        travelMode: google.maps.TravelMode.DRIVING
      }
    directionsService.route(request, function(result, status) {
        alert(result);
      if (status == google.maps.DirectionsStatus.OK) {
        alert("ok");
        var route=[];
        for (i in result.routes[0].legs[0]) {
          point=result.routes[0].legs[0][i];
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
  map.markers=[];
  map.polylines=[];
  for (var i in sections) {
    showSectionInMap(sections[i],map)
  }
}

function showSectionInMap(section,map) {
  var locations=section.locations;

  for (var i in locations) {
    var location=locations[i];
    if (location.type=="point") {
      addPoint(location,map);
    }
    if (location.type=="route") {
      addRoute(location,map);
    }
  }
}

function addPoint(location,map) {
  map.markers.push({latitude:location.coords[0],longitude:location.coords[1],showWindow:false,title:location.name});
}

function addRoute(location,map) {
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