"use strict";

import VideoGame from './videoGame.js'

class SuperReplay {
    // ---------------------------------
    // ---------- Constructor ----------
    // ---------------------------------
    constructor(superReplayDict) {
        this.title = superReplayDict.title;
        this.number = superReplayDict.number;
        this.description = superReplayDict.content.description;
        this.externalLinks = superReplayDict.content.external_links;

        // ---------- Game(s) ----------
        this.games = new VideoGame(superReplayDict.games[0]);

        // ---------- GI Article(s) ----------
        this.gameInformerArticle = new GameInformerArticle();
    }
}