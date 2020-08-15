"use strict";

import { Episode } from "./episode.js";
import { isEmptyObject, createElement } from "../../scripts/utility.js";

/** SuperReplayEpisode representing a single episode of a Super Replay video series.
 * @author Todd Brentlinger
 */
export class SuperReplayEpisode extends Episode {
    /**
     * 
     * @param {Object} episodeDict
     * @param {Object} thumbnailDict
     * @param {Element} nodeTemplate
     */
    constructor(episodeDict, thumbnailDict, nodeTemplate) {
        super(episodeDict);

        // ---------- HTML Section Node ----------
        this.createSectionNode(nodeTemplate, thumbnailDict);
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
    createSectionNode(nodeTemplate, thumbnailDict) {
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
        
        // Image
        parentNode = this.sectionNode.querySelector('.episode-main .video-image');
        parentNode.setAttribute('width', thumbnailDict.width);
        parentNode.setAttribute('height', thumbnailDict.height);
        parentNode.setAttribute('src', thumbnailDict.srcset[0]);
        // Image - Source Set
        temp = "";
        thumbnailDict.srcset.forEach((source, index, arr) => {
            temp += source;
            // Add characters between values in array
            temp = (index === arr.length - 1) ? ""
                : (index === 1) ? ", " : " ";
        });
        parentNode.setAttribute('srcset', temp);
        
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

        // ---------- More Info ----------

        // Assign parentNode to episodeMoreInfo element
        parentNode = this.sectionNode.querySelector('.episode-more-info');

        // Description
        if (this.description)
            Episode.addContentArrToNode(parentNode, this.description);

        // Article
        if (this.gameInformerArticle !== undefined) {
            // Add container for article heading to more-info element
            childNode = parentNode.appendChild(createElement('div', 'article-heading'));
            // Add title as header element to article heading element
            childNode.appendChild(createElement(
                'h4', 'article-title', this.gameInformerArticle.title));
            // Add author and date posted
            childNode.appendChild(createElement(
                'div', 'article-author', `by ${this.gameInformerArticle.author}${this.gameInformerArticle.date}`));
            // Add article content
            if (this.gameInformerArticle.content !== undefined) {
                childNode = document.createElement('div');
                childNode.innerHTML = this.gameInformerArticle.content;
                parentNode.appendChild(childNode);
            }
        }
        
        // Other Headings (External Links should go last)
        if (this.headlines !== undefined && !isEmptyObject(this.headlines)) {
            for (const heading in this.headlines) {
                // If heading is 'See Also', add list of URL links
                if (heading == 'see_also')
                    Episode.addListOfLinks(this.otherHeadingsObj[heading], parentNode, 'see also', 'https://replay.fandom.com');
                // Else If heading is 'Gallery'
                else if (heading == 'gallery') {
                    // Add header of 'Gallery' to episodeMoreInfo element
                    parentNode.appendChild(createElement('h4', undefined, heading));
                    // Add gallery container to episodeMoreInfo element
                    parentNode = parentNode.appendChild(createElement('div', 'gallery-container'));
                    // For each image in gallery property
                    for (const image of this.otherHeadingsObj[heading]) {
                        // Add gallery item to container
                        childNode = parentNode.appendChild(createElement('div', 'gallery-item'));
                        // Add figure element to gallery item
                        childNode = childNode.appendChild(document.createElement('figure'));
                        // Add caption to figure
                        childNode.appendChild(createElement('figcaption', undefined, image.caption));
                        // Add anchor to gallery item figure
                        childNode = childNode.appendChild(document.createElement('a'));
                        childNode.setAttribute('href', image.link);
                        childNode.setAttribute('target', '_blank');
                        childNode.setAttribute('rel', 'noopener');
                        // Add image to figure
                        childNode = childNode.appendChild(document.createElement('img'));
                        childNode.setAttribute('src', image.src);
                        childNode.setAttribute('width', image.width);
                        childNode.setAttribute('height', image.height);
                        childNode.setAttribute('title', image.title);
                    }
                    // Reset parentNode to episodeMoreInfo element
                    parentNode = this.sectionNode.querySelector('.super-replay .episode-more-info');
                }
                else {
                    // Add heading as a header element to episodeMoreInfo element
                    parentNode.appendChild(createElement(
                        'h4', undefined, heading.replace(/_/g, ' ')));
                    Episode.addContentArrToNode(parentNode, this.headlines[heading]);
                }
            }
        }
        
        // External Links
        if (this.externalLinks !== undefined)
            Episode.addListOfLinks(this.externalLinks, parentNode, 'external links');
    }
}