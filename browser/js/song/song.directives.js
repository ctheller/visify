app.directive('songList', function(PlayerFactory){
	return {
		restrict: 'E',
		templateUrl: "js/song/song.list.template.html",
		scope: {
			songs: '='  
		},
		link: function(scope){
				scope.getCurrentSong = function () {
			    return PlayerFactory.getCurrentSong();
			  };

			  scope.isPlaying = function (song) {
			    return PlayerFactory.isPlaying() && PlayerFactory.getCurrentSong() === song;
			  };

			  scope.toggle = function (song) {
			  	//DEAL WITH SONGS THAT DON'T HAVE A PREVIEW OPTION
			  	if (!song.preview_url) return;
			  	
			    if (song !== PlayerFactory.getCurrentSong()) {
			      PlayerFactory.start(song, scope.songs);
			    } else if ( PlayerFactory.isPlaying() ) {
			      PlayerFactory.pause();
			    } else {
			      PlayerFactory.resume();
			    }
			  };

		}
	}
})

app.directive('doubleClick', function(){
	return {
		restrict: 'A',
		scope: {
			'toggle': '&doubleClick'
		},
		link: function(scope, element, attrs){
			element.on('dblclick', function(){
				scope.toggle();
			})
		}
	}
})