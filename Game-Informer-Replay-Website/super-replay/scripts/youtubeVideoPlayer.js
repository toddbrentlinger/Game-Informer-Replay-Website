"use strict";

/** YouTubeVideoPlayer represents a single video player for YouTube videos. 
 * @author Todd Brentlinger
 */
export class YouTubeVideoPlayer {
    constructor(videoPlayerContainerElement) {
        this.containerElement = videoPlayerContainerElement;
        this.videoPlayer = undefined; // Assigned inside global onYouTubePlayerAPIReady()
    }
}