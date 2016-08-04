'use strict';

app.factory('PlayerFactory', function ($rootScope) {

  // state

  var playing = false,
      currentSong = null,
      currentList = [],
      progress = 0,
      randomList = [],
      shuffleOn = false;

  // initialize the audio element

  var audio = document.createElement('audio');

  // define the factory value

  var player = {};

  player.pause = function () {
    audio.pause();
    playing = false;
  };

  player.resume = function () {
    audio.play();
    playing = true;
  };

  player.start = function (song, list) {
    player.pause();
    audio.src = song.preview_url;
    audio.load();
    currentSong = song;
    currentList = list;
    player.resume();
  };

  player.isPlaying = function () {
    return playing;
  };

  player.isShuffling = function () {
    return shuffleOn;
  };

  player.getCurrentSong = function () {
    return currentSong;
  };

  function mod (num, m) { return ((num % m) + m) % m; };

  function skip (interval) {
    if (shuffleOn) {
      var index = randomList.indexOf(currentSong);
      index = mod(index + interval, randomList.length);
       player.pause();
      audio.src = randomList[index].preview_url;
      audio.load();
      currentSong = randomList[index];
      player.resume();
    }
    else {
    var index = currentList.indexOf(currentSong);
    index = mod(index + interval, currentList.length);
    player.start(currentList[index], currentList);
    }
  }

  player.next = function () {
    skip(1);
  };

  player.previous = function () {
    skip(-1);
  };

  player.getProgress = function () {
    return progress;
  };

  player.seek = function (decimal) {
    audio.currentTime = audio.duration * decimal;
  };

  player.random = function(){
    shuffleOn = !shuffleOn;
    if (!shuffleOn) return;
    var temp = currentList.slice(0);
    while(randomList.length < currentList.length){
      var randomElem = temp[Math.floor(Math.random()*temp.length)];
      if (randomList.indexOf(randomElem) == -1){
        randomList.push(randomElem);
        temp.splice(temp.indexOf(randomElem), 1);
      }
    }
    if (!playing) {
      player.pause();
      audio.src = randomList[0].preview_url;
      audio.load();
      currentSong = randomList[0];
      player.resume();
    }
    console.log(randomList);
    console.log(currentList);
  }

  // audio event listening

  audio.addEventListener('ended', function () {
    player.pause();
    currentSong = null,
    $rootScope.$evalAsync();
  });

  audio.addEventListener('timeupdate', function () {
    progress = audio.currentTime / audio.duration;
    $rootScope.$evalAsync();
  });

  // return factory value

  return player;

});
