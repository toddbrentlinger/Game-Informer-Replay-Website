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

        // Properties that reference Objects in JSON (Array, Function, Object)
        this.description = this._superReplayJSON.content.description;
        this.externalLinks = this._superReplayJSON.content.external_links;
        this.image = this._superReplayJSON.image;

        // ---------- Game(s) ----------
        this.games = this._superReplayJSON.games;
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

    // Properties that reference primitive types in JSON (Boolean, null, undefined, String, Number)
    get title() { return this._superReplayJSON.title; }
    get number() { return this._superReplayJSON.number; }
}