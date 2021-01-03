"use strict";

/** YouTubeVideoPlayer represents a single video player for YouTube videos. 
 * @author Todd Brentlinger
 */
export class YouTubeVideoPlayer {
    constructor(videoPlayerContainerElement) {
        this._videoPlayer = undefined; // Assigned inside global onYouTubePlayerAPIReady()
        this.containerElement = videoPlayerContainerElement;
    }

    // Load the iframe player API code asynchronously
    loadPlayerAPI() {
        // Add script
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/player_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // This function creates an <iframe> (and YouTube player) after the API code downloads.
        window.onYouTubePlayerAPIReady = function () {
            this._videoPlayer = new YT.Player('youtubePlayerPlaceholder', {
                height: 360,
                width: 640,
                //videoId: '0ZtEkX8m6yg', // default video: Replay Highlights
                playerVars: {
                    playlist: [superReplayCollection.selectedSuperReplays[0].playlistIDArray || '0ZtEkX8m6yg'],
                    iv_load_policy: 3, // video annotations (default: 1)
                    modestbranding: 1,
                    enablejsapi: 1,
                    loop: 0,
                    origin: 'https://toddbrentlinger.github.io'
                },
                events: {

                }
            });
        }.bind(this);
    }

    /**
     * 
     * @param {String[]} videoIDArray
     * @param {Number} startIndex
     * @param {Boolean} scrollIntoView
     */
    cueVideoPlaylist(videoIDArray, startIndex = 0, scrollIntoView = false) {
        // TEMP
        //console.log(`cueVideoPlaylist(\n[${videoIDArray}], \n${startIndex})\nthis: ${this}(typeof ${typeof this})`);

        // Check video player is NOT undefined
        if (!this._videoPlayer) {
            console.error("No reference to YT video player");
            return;
        }

        // Scroll to top of container
        if (scrollIntoView)
            this.containerElement.scrollIntoView();

        // Cue playlist
        if (videoIDArray && videoIDArray.length) {
            this._videoPlayer.cuePlaylist(videoIDArray, startIndex);
        } else // Else parameter videoIDArray is undefined OR empty, cue Replay highlights video
            this._videoPlayer.cueVideoById('0ZtEkX8m6yg');
    }
}