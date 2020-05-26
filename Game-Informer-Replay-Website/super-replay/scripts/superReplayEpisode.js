"use strict";

import { Episode } from "./episode.js";

/** SuperReplayEpisode representing a single episode of a Super Replay video series.
 * @author Todd Brentlinger
 */
export class SuperReplayEpisode extends Episode {
    /** @param {any} episodeDict */
    constructor(episodeDict) {
        super(episodeDict);
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    get title() { return this.youtubeVideo.title; }
}