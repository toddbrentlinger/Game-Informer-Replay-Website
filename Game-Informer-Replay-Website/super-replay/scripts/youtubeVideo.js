"use strict";

class YouTubeVideo {
    constructor(youtubeVideoDict) {
        this.id = youtubeVideoDict.id;
        this.views = youtubeVideoDict.views;
        this.likes = youtubeVideoDict.likes;
        this.dislikes = youtubeVideoDict.dislikes;
    }
}