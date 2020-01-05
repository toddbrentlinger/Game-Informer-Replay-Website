/* TODO:
 * - Max video count in playlist viewer is 200. Create function that 
 * will play an array of videos in 200 video increments. After 200th
 * episode ends, change playlist to view next 200 videos in array.
 * Perhaps wait until video 150 finishes to create new playlist in
 * order to leave 50 episodes in playlist to view what is next. Similar
 * function to display 
 */

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var videoPlayer;
window.onYouTubePlayerAPIReady = function () {
    videoPlayer = new YT.Player('youtubePlayerPlaceholder', {
        height: 360,
        width: 640,
        //videoId: '0ZtEkX8m6yg', // default video: Replay Highlights
        playerVars: {
            playlist: [replayEpisodeCollection.selectedVideoIdArray.slice(0, 200) || '0ZtEkX8m6yg'],
            iv_load_policy: 3, // default: 1
            modestbranding: 1,
            enablejsapi: 1,
            loop: 0
            //'origin': 'https://toddbrentlinger.github.io/Game-Informer-Replay-Website/Game-Informer-Replay-Website/'
        },
        events: {
            onReady: replayEpisodeCollection.onPlayerReady.bind(replayEpisodeCollection),
            //onStateChange: replayEpisodeCollection.onPlayerStateChange.bind(replayEpisodeCollection),
            onError: replayEpisodeCollection.onPlayerError.bind(replayEpisodeCollection)
        }
    });

    // Assign reference to videoPlayer in replayEpisodeCollection
    replayEpisodeCollection.videoPlayer = videoPlayer;

    console.log('window.onYouTubePlayerAPIReady has finished');
};
let videoPlayerState = -1;
setInterval(function () {
    if (videoPlayer && typeof videoPlayer.getPlayerState === 'function') {
        const state = videoPlayer.getPlayerState() || -1;
        if (videoPlayerState !== state) {
            replayEpisodeCollection.onPlayerStateChange({
                data: state
            });
            videoPlayerState = state;
        }
    }
}, 10);

/*
// onPlayerReady(event)
// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.cuePlaylist({
        playlist: videoIdArray.slice(-200).reverse()
    });
}

// onPlayerStateChange(event)
// The API calls this function when the player's state changes.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        // done = true;
    } else if (event.data == YT.PlayerState.ENDED) {
        // location.reload();
    }
}

// onPlayerError(event)
function onPlayerError(event) {
    console.log('Error: ' + event.data);
}
*/

