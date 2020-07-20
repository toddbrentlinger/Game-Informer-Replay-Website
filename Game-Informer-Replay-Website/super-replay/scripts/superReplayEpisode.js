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

        // ---------- HTML Section Node ----------
        this.createSectionNode(nodeTemplate);
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

        // ---------- Thumbnail ----------
        // Reference to anchor link
        parentNode = this.sectionNode.querySelector('.episode-main .thumbnail > a');

        // Add event listener that starts playlist of Super Replay beginning with first episode
        parentNode.addEventListener('click', function () {
            // TODO
        }.bind(this), false);
        /*
        // Image
        parentNode = this.sectionNode.querySelector('.episode-main .video-image');
        parentNode.setAttribute('width', this.image.width);
        parentNode.setAttribute('height', this.image.height);
        parentNode.setAttribute('src', this.image.srcset[0]);
        // Image - Source Set
        temp = "";
        this.image.srcset.forEach((source, index, arr) => {
            temp += source;
            // Add characters between values in array
            temp = (index === arr.length - 1) ? ""
                : (index === 1) ? ", " : " ";
        });
        parentNode.setAttribute('srcset', temp);
        */
        // Video Length
        this.sectionNode.querySelector('.episode-main .video-length')
            .insertAdjacentText('afterbegin', this.runtime);

        // ---------- Details ----------
        
        // Title
        this.sectionNode.querySelector('.episode-title')
            .insertAdjacentText('afterbegin',
                this.youtubeVideo.title);
        /*
        // Episode Number
        this.sectionNode.querySelector('.episode-number')
            .insertAdjacentText('afterbegin',
            `SR #${this.number < 10 ? "0" : ""}${this.number}`);
        */

        // Airdate
        this.sectionNode.querySelector('.episode-airdate')
            .insertAdjacentText('beforeend',
                this.airdateString
            );
        
        // YouTube - Views
        this.sectionNode.querySelector('.views')
            .insertAdjacentText('beforeend',
                Episode.addCommasToNumber((this.youtubeVideo.views).toFixed(0))
            );
        
        // YouTube - Likes (Like Ratio)
        this.sectionNode.querySelector('.likes')
            .insertAdjacentText('beforeend',
            `${Episode.addCommasToNumber((this.youtubeVideo.likes).toFixed(0))} (${this.youtubeVideo.likeRatio}%)`
            );
        
        // Host(s)
        parentNode = this.sectionNode.querySelector('.episode-hosts');
        if (this.host)
            parentNode.insertAdjacentText('beforeend', Episode.convertListArrayToEnglishString(this.host));
        else
            parentNode.remove();

        // Featuring
        parentNode = this.sectionNode.querySelector('.episode-featuring');
        if (this.featuring)
            parentNode.insertAdjacentText('beforeend', Episode.convertListArrayToEnglishString(this.featuring));
        else
            parentNode.remove();
    }
}