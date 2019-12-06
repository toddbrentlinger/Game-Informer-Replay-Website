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
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var videoPlayer;
function onYouTubePlayerAPIReady() {
    videoPlayer = new YT.Player('youtubePlayerPlaceholder', {
        height: 360,
        width: 640,
        //videoId: videoIdArray[0],
        playerVars: {
            //listType: 'playlist',
            //playlist: videoIdArray.slice(0, 10),
            controls: 1,
            //'showinfo': 0,
            iv_load_policy: 3, // default: 1
            modestbranding: 1,
            enablejsapi: 1
            //'origin': specify domain
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }
    });
    console.log('onYouTubePlayerAPIReady has finished');
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.cuePlaylist({
        playlist: videoIdArray.slice(-200).reverse()
    });
}

// The API calls this function when the player's state changes.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        // done = true;
    } else if (event.data == YT.PlayerState.ENDED) {
        // location.reload();
    }
}

function onPlayerError(event) {
    console.log('Error: ' + event.data);
}

