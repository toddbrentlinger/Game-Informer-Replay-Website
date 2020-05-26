"use strict";

/** YouTubeVideo represents a single YouTube video. 
 * @author Todd Brentlinger
 */
export class YouTubeVideo {
    constructor(youtubeVideoDict) {
        this._youtubeVideoJSON = youtubeVideoDict;

        // Object Types
        this.thumbnails = this._youtubeVideoJSON.thumbnails;
        this.tags = this._youtubeVideoJSON.tags || undefined;
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    // Primitive Types
    get id() { return this._youtubeVideoJSON.id; }
    get views() { return this._youtubeVideoJSON.views; }
    get likes() { return this._youtubeVideoJSON.likes; }
    get dislikes() { return this._youtubeVideoJSON.dislikes; }
    get airdate() { return this._youtubeVideoJSON.airdate; }
    get title() { return this._youtubeVideoJSON.title; }
    get description() { return this._youtubeVideoJSON.description; }
    get runtime() { return this._youtubeVideoJSON.runtime; }

    get likeRatio() {
        if (this.likes !== undefined && this.dislikes !== undefined)
            return ((this.likes * 100) / (this.likes + this.dislikes)).toFixed(1);
    }
}