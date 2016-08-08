app.factory('SpotifyRetriever', function(AuthService, Spotify, $log, $q){

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

    //retreive all

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

    //Retreives All Songs from All Playlists  //THIS NOW WORKS FOR GETTING ALL SONGS AND AUDIO FEATURESSSSSSS!!!!
    SpotifyRetriever.getAllPlaylistSongs = function(userId){
        return SpotifyRetriever.getAllPlaylists(userId)
        .then(function(playlists){
            var i = 0;
            var gettingSongs = playlists.map(function(playlist){

                if (userId !== playlist.owner.id) return $q.when([]);
                function delay() {
                    var promise = new Promise(function(resolve, reject){
                        window.setTimeout(function(){
                            resolve(SpotifyRetriever.getPlaylistSongs(userId, playlist.id));
                        }, 400*i);
                        i++;
                    });
                    return promise;
                };
                return delay();

            })

            var allTracks;
            return Promise.all(gettingSongs).then(function(songs){
                    return _.flatten(songs);
                }).then(function(tracks){
                    allTracks = tracks;
                    return tracks.map(function(track){
                        return track.id
                    })
                })
                .then(function(trackIds){
                    var trackIdsChunked = _.chunk(trackIds, 100);
                    var gettingFeatures = trackIdsChunked.map(function(chunk){
                        return Spotify.getTracksAudioFeatures(chunk, {market:"US"});
                    })
                    return Promise.all(gettingFeatures);
                })
                .then(function(allTracksFeatures){
                    allTracksFeatures = _.flatten(allTracksFeatures.map(function(e){return e.audio_features}))
                    var mergedTrackInfo = _.map(allTracks, function(item){
                        return _.extend(item, _.findWhere(allTracksFeatures, {id: item.id}));
                    })
                    return mergedTrackInfo;
                })

        })
    }   

    var trySeveral = 0;

    SpotifyRetriever.getSavedTracks = function(){
        var recWrap = function(i){
            return Spotify.getSavedUserTracks({limit:50, offset:i})
            .then(function(tracks){

                trySeveral = 0;

                if (tracks.items.length) {
                    return recWrap(i+50)
                    .then(function(moreTracks){
                        return tracks.items.concat(moreTracks);
                    })
                }
                return [];
            }) 
            .catch(function(err){
                if (err && trySeveral < 4) {
                    trySeveral++;
                    return SpotifyRetriever.getSavedTracks()
                }
                trySeveral = 0;
                $log(err);
            });
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
                return Spotify.getTracksAudioFeatures(chunk, {market:"US"});
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