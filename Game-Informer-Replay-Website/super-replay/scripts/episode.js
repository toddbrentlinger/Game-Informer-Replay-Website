"use strict";

class Episode {
    constructor(episodeDict) {
        this.description = episodeDict.description;
        this.airdate = episodeDict.airdate;
        this.runtime = episodeDict.runtime;
        this.host = episodeDict.host;
        this.featuring = episodeDict.featuring;
        this.externalLinks = episodeDict.externalLinks;
        this.headlines = episodeDict.headlines;

        // ---------- Game Informer Article ----------
        this.gameInformerArticle = new GameInformerArticle(episodeDict.gameInformerArticle)

        // ---------- YouTube Video ----------
        this.youtubeVideo = new YouTubeVideo(episodeDict.youtubeVideo)
    }
}