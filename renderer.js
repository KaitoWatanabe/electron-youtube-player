// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var parseString = require('xml2js').parseString;
var request = require('request');
const storage = require('electron-json-storage');
const ipcRenderer = require('electron').ipcRenderer;



var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var videoId = null;
var videoIds = [];
var currentVideo = 0;
var iframeReady = false;

var watchedVideoIds;

storage.get('watchedVideoIds', function(error, data) {
    if (error) throw error;
    watchedVideoIds = data.videos || [];
});

var player;
window.onYouTubeIframeAPIReady = function() {
    iframeReady = true;
    initVideo();
};

function initVideo() {
    if (videoIds.length > 0 && iframeReady) {
        currentVideo = Math.floor(Math.random() * videoIds.length);
        player = new YT.Player('player', {
            height: window.innerHeight,
            width: window.innerWidth,
            videoId: videoIds[currentVideo],
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        watchedVideoIds.push(videoIds[currentVideo]);
        storage.set('watchedVideoIds', { videos: watchedVideoIds }, function(error) {
            if (error) throw error;
        });
        videoIds.splice(currentVideo, 1);
        nextVideo();
    }
}
function nextVideo() {
    currentVideo = Math.floor(Math.random() * videoIds.length);
    videoId = videoIds[currentVideo];
    player.loadVideoById(videoId);
}

var url = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzVnCG4ItKitN1SCBM7-AbA';
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        parseString(body, function (err, result) {
            videoIds = videoIds.concat(result.feed.entry.filter(function (elem) {
                return watchedVideoIds.indexOf(elem['yt:videoId'][0]) == -1
            }).map(function (entry) {
                return entry['yt:videoId'][0];
            }));
            initVideo();
        });
    } else {
        console.log('error: '+ response.statusCode);
    }
});

function showClock(){
    console.log('show clock');
    var d = new Date();
    function pad(n){return n<10 ? '0'+n : n}
    document.getElementById('clock').innerText = pad(d.getHours())+':' + pad(d.getMinutes())
}

setInterval(function () {
    showClock();
}, 1000*60);

showClock();


window.addEventListener("resize", function () {
    player.setSize(window.innerWidth, window.innerHeight);
}, false);

ipcRenderer.on('next', function() {
    nextVideo();
});

ipcRenderer.on('pause_play', function() {
    switch (player.getPlayerState()) {
        case YT.PlayerState.PLAYING:
            player.pauseVideo();
            break;
        case YT.PlayerState.PAUSED:
            player.playVideo();
            break;
    }
});