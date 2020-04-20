"use strict";

class VideoGame {
    constructor(videoGameDict) {
        this.title = videoGameDict.title;
        this.system = videoGameDict.system;
        this.releaseDate = videoGameDict.releaseDate;
        this.wikipediaURL = videoGameDict.wikipediaURL;
    }
}