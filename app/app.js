(function(){

  /*global angular */
  /*jshint unused:false */
  'use strict';

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
  angular.module('oncommand', ['ngRoute'])
    .config(function($routeProvider){
      $routeProvider
        .when('/', {
          templateUrl: 'app/modules/todo/todo.html',
          controller: 'TodoCtrl'
        })
        .otherwise({redirectTo: '/'});
    });


}());
