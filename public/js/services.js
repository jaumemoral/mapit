var mapTripServices = angular.module('mapTripServices', ['ngResource']);
 
mapTripServices.factory('Trip', ['$resource',
  function($resource){
    return $resource('/api/maps/:mapId',{mapId:'@_id'});
  }]);