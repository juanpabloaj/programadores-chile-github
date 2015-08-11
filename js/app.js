'use strict';

var firebaseUrl = 'https://programadores-chile.firebaseio.com/';
var ref = new Firebase(firebaseUrl);
var refUsers = ref.child('users');

var app = angular.module('app', ['firebase']);

app
  .factory('Auth', ['$firebaseAuth', function($firebaseAuth){
    return($firebaseAuth(ref));
  }])
  .factory('Github', function($http, $q){

    var service = {
      repos: [],
      languages: [],
      getRepos: getRepos,
      getLanguages: getLanguages
    };
    return service;

    function getRepos(username){
      var def = $q.defer();
      var url = 'https://api.github.com/users/' + username + '/repos';

      $http.get(url)
        .success(function(data){
          service.repos = data;
          def.resolve(data);
        })
        .error(function(){
          def.reject("Failed to get repos");
        });
      return def.promise;
    }

    function getLanguages(username) {
      var def = $q.defer();
      var languages = [];

      getRepos(username).then(function(repos){
        angular.forEach(repos, function(repo){
          if (!repo.fork){
            var language = repo.language;
            if (language && languages.indexOf(language) === -1) {
              this.push(language);
            }
          }
        }, languages);

        def.resolve(languages);
      });

      return def.promise;
    }
  })
  .controller('UsersController', function($scope, Auth, Github, $firebaseArray){
    $scope.users = $firebaseArray(refUsers);

    $scope.auth = Auth;

    $scope.auth.$onAuth(function(authData){
      $scope.authData = authData;
      if (authData) {
        var username = authData.github.username;
        var displayName = authData.github.displayName || '';
        var profileImageURL = profileImageURL;
        $scope.username = username;
        $scope.displayName = displayName || username;
        $scope.profileImageURL = profileImageURL;


        refUsers.child(username).once('value', function(data){
          // if user not exist create
          if(!data.val()){
            refUsers.child(username).set({
              displayName: displayName,
              username:username
            });
          }
        })
      }
    });

    $scope.getGithubInfo = function(username){
      Github.getRepos(username)
        .then(function(repos){
          refUsers.child(username).update({
            repos:repos.length
          });
        });

      Github.getLanguages(username)
        .then(function(languages){
          refUsers.child(username).update({
            languages:languages
          });
        });
    };

  });
