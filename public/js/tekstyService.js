/**
 * Created by Meliasz on 2015-06-11.
 */

meliaszApp.factory('auth', ['$http', '$window', function ($http, $window) {
        var auth = {};
        auth.saveToken = function (token) {
            $window.localStorage['zdrowy-rozsadek-token'] = token;
        };
        auth.getToken = function () {
            return $window.localStorage['zdrowy-rozsadek-token'];
        };
        auth.isLoggedIn = function () {
            var token = auth.getToken();
            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };
        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.username;
            }
        };
        auth.register = function(user){
            return $http.post('/register', user).success(function(data){
                auth.saveToken(data.token);
            }) ;
        };
        auth.logIn = function(user){
            return $http.post('/login', user).success(function(data){
                auth.saveToken(data.token);
            });
        };
        auth.logOut = function(){
            $window.localStorage.removeItem('zdrowy-rozsadek-token');
        };
        return auth;
    }]
).factory('teksty', ['$http', 'auth', function ($http, auth) {
    var e = {
        teksty: []
    };

    e.getAllTeksty = function () {
        return $http.get('/teksty').success(function (data) {
            angular.copy(data, e.teksty);
        });
    };
    e.createTekst = function (tekst) {
        return $http.post('/teksty', tekst, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            e.teksty.push(data);
        });
    };
    e.getTekst = function (id) {
        return $http.get('/teksty/' + id).then(function (res) {
            return res.data;
        });
    };
    e.editTekst = function (id) { //DO ZROBIENIA

        return $http.put('/teksty/' + id).success(function (data) {

            for (var i = 0; i < e.teksty.length; i++) {
                var toEdit = e.teksty[i];
                if (toEdit._id === data._id) {
                    data = e.teksty[i];
                }
            }
        });

    };
    e.removeTekst = function (id) {
        return $http.delete('/teksty/' + id,{
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }
        ).success(function (data) {
            for (var i = 0; i < e.teksty.length; i++) {
                var toRemove = e.teksty[i];
                if (toRemove._id === data._id) {
                    e.teksty.splice(e.teksty.indexOf(e.teksty[i]), 1);
                }
            }
        })
    };
    e.addCommentToTekst = function(id, comment){
      return $http.post('/teksty/' + id + '/comments', comment, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
      });
    };
    return e;

}]);