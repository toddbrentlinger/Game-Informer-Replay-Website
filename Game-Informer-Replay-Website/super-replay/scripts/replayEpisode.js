"use strict";

import { Episode } from "./episode.js";

/** ReplayEpisode representing a single episode of Game Informer Replay video series
 * @author Todd Brentlinger
 */
export class ReplayEpisode extends Episode {
    constructor(episodeDict) {
        super(episodeDict);

        // ---------- Game Informer Article ----------
        this.gameInformerArticle = new GameInformerArticle(episodeDict.gameInformerArticle);
    }
}