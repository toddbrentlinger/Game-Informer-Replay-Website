"use strict";

export class VideoGame {
    static collection = new Map();
    static nextID = 0;

    static isGameInList(videoGame) {
        // Returns True if videoGame is in static map
        // and increment episodeCount in videoGame.
        // Returns False if videoGame is NOT in static map.
    }

    constructor(videoGameDict) {
        this.videoGameDict = videoGameDict;

        this.title = videoGameDict.title;
        this.system = videoGameDict.system;
        this.releaseDate = videoGameDict.releaseDate;
        this.wikipediaURL = videoGameDict.wikipediaURL;

        // Add VideoGame to static map
        collection.set(nextID++, this);
    }

    get title() { return this.videoGameDict.title; }
    get system() { return this.system; }
    get releaseDate() { return this.releaseDate; }
    get wikipediaURL() { return this.wikipediaURL; }
}