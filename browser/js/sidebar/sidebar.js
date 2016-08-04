'use strict';

app.controller('SidebarCtrl', function ($rootScope, $scope, AUTH_EVENTS, SpotifyRetriever) {

	$rootScope.$on(AUTH_EVENTS.loginSuccess, function (event) {
        SpotifyRetriever.getAllPlaylists($scope.user.id)
        .then(function(playlists){
        	$rootScope.playlists = playlists;
        })
	})


});
