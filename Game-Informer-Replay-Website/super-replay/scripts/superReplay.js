"use strict";

//import { VideoGame } from "./videoGame.js";
//import { GameInformerArticle } from "./gameInformerArticle.js";
import { Episode } from "./episode.js";

export class SuperReplay {
    // ---------------------------------
    // ---------- Constructor ----------
    // ---------------------------------

    constructor(superReplayDict) {
        this._superReplayJSON = superReplayDict;

        //this.title = superReplayDict.title;
        //this.number = superReplayDict.number;
        //this.description = superReplayDict.content.description;
        //this.externalLinks = superReplayDict.content.external_links;

        // ---------- Game(s) ----------
        //this.games = new VideoGame(superReplayDict.games[0]);

        // ---------- GI Article(s) ----------
        //this.gameInformerArticle = new GameInformerArticle();

        // ---------- Episodes ----------
        this.episodes = [];
        this._superReplayJSON.episodeList.forEach(episodeDict =>
            this.episodes.push(new Episode(episodeDict))
        );

        // Return reference to class instance
        return this;
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    get title() { return this._superReplayJSON.title; }
    get number() { return this._superReplayJSON.number; }
    get description() { return this._superReplayJSON.content.description; }
    get externalLinks() { return this._superReplayJSON.content.external_links; }
}