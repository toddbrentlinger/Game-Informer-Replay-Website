"use strict";

export class GameInformerArticle {
    constructor(gameInformerArticleJSON) {
        this._gameInformerArticleJSON = gameInformerArticleJSON;
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    get url() { return this._gameInformerArticleJSON.url; }
    get title() { return this._gameInformerArticleJSON.title; }
    get author() { return this._gameInformerArticleJSON.author; }
    get date() { return this._gameInformerArticleJSON.date; }
    get content() { return this._gameInformerArticleJSON.contentHTML; }
}