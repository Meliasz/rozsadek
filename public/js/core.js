/**
 * Created by Meliasz on 2015-06-09.
 */
var meliaszApp = angular.module('meliaszApp', ['ui.router']);

meliaszApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('teksty', {
                url: '/teksty',
                templateUrl: '/teksty.html',
                controller: 'tekstyCtrl',
                resolve: {
                    tekstPromise: ['teksty', function (teksty) {
                        return teksty.getAllTeksty();
                    }]
                }
            })
            .state('tekst', {
                url: '/teksty/{id}',
                templateUrl: '/tekst.html',
                controller: 'tekstCtrl',
            resolve: {
                tekst: ['$stateParams', 'teksty', function ($stateParams, teksty) {
                    return teksty.getTekst($stateParams.id);
                }]
            }
            })
            .state('login', {
                url: '/login',
                templateUrl :'/login.html',
                controller: 'AuthCtrl',
                onEnter:['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('teksty')
                    }
                }]
            }).state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter:['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('teksty')
                    }
                }]
            }).state('rzady', {
                url:'/rzady',
                templateUrl: '/rzady.html',
                controller: 'rzadyCtrl'
            });

        $urlRouterProvider.otherwise('teksty');
    }]);
