"use strict";

import { GameInformerArticle } from "./gameInformerArticle.js";
//import { YouTubeVideo } from "./youtubeVideo.js";

export class Episode {
    constructor(episodeDict) {
        this._episodeJSON = episodeDict;
        /*
        this.description = episodeDict.description;
        this.airdate = episodeDict.airdate;
        this.runtime = episodeDict.runtime;
        this.host = episodeDict.host;
        this.featuring = episodeDict.featuring;
        this.externalLinks = episodeDict.externalLinks;
        this.headlines = episodeDict.headlines;
        */

        // ---------- Game Informer Article ----------
        this.gameInformerArticle = new GameInformerArticle(episodeDict.gameInformerArticle)

        // ---------- YouTube Video ----------
        //this.youtubeVideo = new YouTubeVideo(episodeDict.youtubeVideo)
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    get description() { return this._episodeJSON.description; }
    get airdate() { return this._episodeJSON.airdate; }
    get runtime() { return this._episodeJSON.runtime; }
    get host() { return this._episodeJSON.host; }
    get featuring() { return this._episodeJSON.featuring; }
    get externalLinks() { return this._episodeJSON.externalLinks; }
    get headlines() { return this._episodeJSON.headlines; }
}