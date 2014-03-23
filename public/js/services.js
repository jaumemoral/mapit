var phonecatServices = angular.module('mapTripServices', ['ngResource']);
 
phonecatServices.factory('Trip', ['$resource',
  function($resource){
    return $resource('/api/maps/:mapId', {}, {
      query: {method:'GET', params:{mapId:''}, isArray:true}
    });
  }]);