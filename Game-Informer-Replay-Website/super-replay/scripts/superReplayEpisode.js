"use strict";

import { Episode } from "./episode.js";

/** SuperReplayEpisode representing a single episode of a Super Replay video series.
 * @author Todd Brentlinger
 */
export class SuperReplayEpisode extends Episode {
    /**
     * 
     * @param {Object} episodeDict
     * @param {Element} nodeTemplate
     */
    constructor(episodeDict, nodeTemplate) {
        super(episodeDict);
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    get title() { return this.youtubeVideo.title; }

    // ---------- Methods ----------

    /**
     * 
     * @param {any} nodeTemplate
     */
    createSectionNode(nodeTemplate) {
        // Variables (temp can be array, string, ...)
        let parentNode, childNode, temp;

        // Initialize section node to template clone
        this.sectionNode = nodeTemplate.cloneNode(true);
    }
}