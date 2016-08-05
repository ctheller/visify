app.factory('SpotifyRetriever', function(AuthService, Spotify, $log){

    var SpotifyRetriever = {};

    // function sleep(milliseconds) {
    //   var start = new Date().getTime();
    //   for (var i = 0; i < 1e7; i++) {
    //     if ((new Date().getTime() - start) > milliseconds){
    //       break;
    //     }
    //   }
    // }

    //Retrieves ALL of a user's public, private, and followed playlists
    SpotifyRetriever.getAllPlaylists = function(id){
        var recWrap = function(i){
            return Spotify.getUserPlaylists(id, {limit:50, offset:i})
            .then(function(playlists){
                if (playlists.items.length) {
                    return recWrap(i+50)
                    .then(function(morePlaylists){
                        return playlists.items.concat(morePlaylists);
                    });
                }
                return [];
            }) 
            .catch($log);
        }
        return recWrap(0);
    }

    //Retrieves ALL songs from a given playlist
    SpotifyRetriever.getPlaylistSongs = function(userId, playlistId){
        var recWrap = function(i){
            return Spotify.getPlaylistTracks(userId, playlistId, {market:"US", offset:i})
            .then(function(songs){
                var songList = songs.items;
                songList = songList.map(function(item){
                    return item.track;
                })
                if (songList.length) {
                    return recWrap(i+100)
                    .then(function(moreSongs){
                        return songList.concat(moreSongs);
                    })
                }
                return [];
            })
            .catch($log);
        }
        return recWrap(0);
    }

    // //Retreives All Songs from All Playlists
    // SpotifyRetriever.getAllPlaylistSongs = function(userId){
    //     return SpotifyRetriever.getAllPlaylists(userId)
    //     .then(function(playlists){
    //         var gettingSongs = playlists.forEach(function(playlist){
    //             return SpotifyRetriever.getPlaylistSongs(userId, playlist.id)
    //         })
    //         return Promise.all(gettingSongs);
    //     })
    // }   

    SpotifyRetriever.getSavedTracks = function(){
        var recWrap = function(i){
            return Spotify.getSavedUserTracks({limit:50, offset:i})
            .then(function(tracks){
                if (tracks.items.length) {
                    return recWrap(i+50)
                    .then(function(moreTracks){
                        return tracks.items.concat(moreTracks);
                    })
                }
                return [];
            }) 
            .catch($log);
        }
        return recWrap(0);
    }

    SpotifyRetriever.getAudioFeaturesForMany = function(){
        return SpotifyRetriever.getSavedTracks()
        .then(function(tracks){
            return tracks.map(function(track){
                return track.track.id
            })
        })
        .then(function(trackIds){
            var trackIdsChunked = _.chunk(trackIds, 100);
            var gettingFeatures = trackIdsChunked.map(function(chunk){
                return Spotify.getTracksAudioFeatures(chunk);
            })
            return Promise.all(gettingFeatures);
        })
    }

    SpotifyRetriever.getTracksById = function(trackIds){
        var trackIdsChunked = _.chunk(trackIds, 50);
        var gettingTracks = trackIdsChunked.map(function(chunk){
            return Spotify.getTracks(chunk);
        })
        return Promise.all(gettingTracks);
    }




    //Creates a new playlist without the explicit tracks
    SpotifyRetriever.makeCleanPlaylist = function(userId, name, songs){
        var cleanSongArray = songs.filter(function(song){
            return !song.explicit;
        })
        var cleanSongIdArray = cleanSongArray.map(function(song){
            return song.id;
        })
        var createdPlaylistRef;

        return Spotify.createPlaylist(userId, {name: name+" 🙉", public: false})
        .then(function(createdPlaylist){
            createdPlaylistRef = createdPlaylist;
            return Spotify.addPlaylistTracks(userId,createdPlaylist.id,cleanSongIdArray);
        })
        .then(function(snapshot_id){
            return createdPlaylistRef;
        })
        .catch($log);
    }



    // Spotify.removePlaylistTracks('user_id', 'playlist_id', 'comma separated string or array of spotify track ids or uris');
    // Spotify.addPlaylistTracks('user_id', 'playlist_id', 'comma separated string or array of spotify track uris');
    // Spotify.createPlaylist('user_id', {name:'', public: false});


    return SpotifyRetriever;
})