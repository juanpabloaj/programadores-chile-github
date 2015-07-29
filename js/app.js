'use strict';

var firebaseUrl = 'https://programadores-chile.firebaseio.com/';
var ref = new Firebase(firebaseUrl);
var refUsers = ref.child('users');

var app = angular.module('app', ['firebase']);

app
  .factory('Auth', ['$firebaseAuth', function($firebaseAuth){
    return($firebaseAuth(ref));
  }])
  .controller('UsersController', function($scope, Auth, $firebaseArray){
    $scope.users = $firebaseArray(refUsers);

    $scope.auth = Auth;

    $scope.auth.$onAuth(function(authData){
      $scope.authData = authData;
      if (authData) {
        var username = authData.github.username;
        var displayName = authData.github.displayName || '';
        var profileImageURL = profileImageURL;
        $scope.username = username;
        $scope.displayName = displayName;
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

  });
