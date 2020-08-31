"use strict";

//import { VideoGame } from "./videoGame.js";
import { GameInformerArticle } from "./gameInformerArticle.js";
import { Episode } from "./episode.js";
import { SuperReplayEpisode } from "./superReplayEpisode.js";
import { NumberedButtonList } from "./numberedButtonList.js";
import { isEmptyObject, createElement } from "../../scripts/utility.js";

export class SuperReplay {
    // ---------------------------------
    // ---------- Constructor ----------
    // ---------------------------------

    constructor(superReplayDict, nodeTemplate, videoPlayer) {
        this._superReplayJSON = superReplayDict;

        // Properties that reference Objects in JSON (Array, Function, Object)
        this.description = this._superReplayJSON.content.description;
        this.externalLinks = this._superReplayJSON.content.external_links;
        this.image = this._superReplayJSON.image;
        // Other Headings
        const propsToIgnore = [
            'description', 'external_links', 'episodes', 'image', 'system', 'gamedate', 'airdate', 'runtime', 'host', 'featuring'
        ];
        let tempHeadingsObj = {};
        for (const [key, value] of Object.entries(superReplayDict.content)) {
            // Check if ignore prop
            if (propsToIgnore.includes(key)) continue;
            // If property is array and array is empty, continue
            if (Array.isArray(value) && !value.length) continue;
            // Add to tempHeadingsObj
            tempHeadingsObj[key] = value;
        }
        // If tempHeadingsObj is NOT empty, assign to this.otherHeadingsObj
        if (!isEmptyObject(tempHeadingsObj))
            this.otherHeadingsObj = tempHeadingsObj;

        // ---------- Game(s) ----------
        this.games = this._superReplayJSON.games;
        //this.games = new VideoGame(superReplayDict.games[0]);

        // ---------- GI Article(s) ----------
        this.gameInformerArticle = ('gameInformerArticle' in this._superReplayJSON)
            ? new GameInformerArticle(this._superReplayJSON.gameInformerArticle)
            : undefined;

        // ---------- Episodes ----------
        this.episodes = [];
        const episodeNodeTemplate = nodeTemplate.querySelector('.super-replay-episode');
        this._superReplayJSON.episodeList.forEach((episodeDict, index) =>
            this.episodes.push(new SuperReplayEpisode(episodeDict, this.image, episodeNodeTemplate, videoPlayer, this, index))
        );
        this.currentEpisode = 1;

        // ---------- HTML Section Node ----------
        this.createSectionNode(nodeTemplate, videoPlayer);

        // ---------- Episode List ----------
        this.numberedButtonList = new NumberedButtonList(
            this.sectionNode.querySelector('.page-number-container'),
            this.episodes.length,
            this.setCurrentEpisode.bind(this));

        // Return reference to class instance
        return this;
    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------

    // Properties that reference primitive types in JSON (Boolean, null, undefined, String, Number)
    get title() { return this._superReplayJSON.title; }
    get number() { return this._superReplayJSON.number; }
    get playlistRuntime() {
        return this.episodes.reduce(
            (total, episode) => total + episode.runtimeInSeconds,
            0);
    }
    get averageViews() {
        const totalViews = this.episodes.reduce(
            (total, episode) => total + episode.youtubeVideo.views,
            0);
        return totalViews / this.episodes.length;
    }
    get averageLikes() {
        const totalLikes = this.episodes.reduce(
            (total, episode) => total + episode.youtubeVideo.likes,
            0);
        return totalLikes / this.episodes.length;
    }
    get averageDislikes() {
        const totalDislikes = this.episodes.reduce(
            (total, episode) => total + episode.youtubeVideo.dislikes,
            0);
        return totalDislikes / this.episodes.length;
    }
    get averageLikeRatio() {
        let totalLikes = 0, totalDislikes = 0;
        this.episodes.forEach(episode => {
            totalLikes += episode.youtubeVideo.likes;
            totalDislikes += episode.youtubeVideo.dislikes;
        });
        return totalLikes / (totalLikes + totalDislikes);
    }
    get playlistIDArray() {
        return this.episodes.map(episode => episode.youtubeVideo.id);
    }

    // ---------------------------------------
    // ---------- Methods/Functions ----------
    // ---------------------------------------

    createSectionNode(nodeTemplate, videoPlayer) {
        // Variables (temp can be array, string, ...)
        let parentNode, childNode, temp;

        // Initialize section node to template clone
        this.sectionNode = nodeTemplate.cloneNode(true);

        // ----------------------------------
        // ---------- Super Replay ----------
        // ----------------------------------

        // ---------- Header - Title ----------
        this.sectionNode.querySelector('.super-replay .episode-title')
            .insertAdjacentText('afterbegin',
                this.title);

        // ---------- Header - Number ----------
        this.sectionNode.querySelector('.super-replay .episode-number')
            .insertAdjacentText('afterbegin',
                `SR #${this.number < 10 ? "0" : ""}${this.number}`);

        // ---------- Thumbnail ----------
        // Reference to anchor link
        parentNode = this.sectionNode.querySelector('.super-replay .thumbnail > a');

        // Add event listener that starts playlist of Super Replay beginning with first episode
        parentNode.addEventListener('click', function () {
            videoPlayer.cueVideoPlaylist(this.playlistIDArray, 0, true);
        }.bind(this), false);

        // Image
        parentNode = this.sectionNode.querySelector('.super-replay .video-image');
        parentNode.setAttribute('width', this.image.width);
        parentNode.setAttribute('height', this.image.height);
        parentNode.setAttribute('src', this.image.srcset[0]);
        // Image - Source Set
        temp = "";
        this.image.srcset.forEach((source, index, arr) => {
            temp += source;
            // Add characters between values in array
            temp += (index === arr.length - 1) ? ""
                : (index === 1) ? ", " : " ";
        });
        parentNode.setAttribute('srcset', temp);

        // Video Length
        this.sectionNode.querySelector('.super-replay .video-length')
            .insertAdjacentText('afterbegin', this.getPlaylistRuntimeString());

        // ---------- Details ----------

        // Airdate
        this.sectionNode.querySelector('.episode-airdate')
            .insertAdjacentText('beforeend',
                this.episodes.length > 1 
                    ? `${this.episodes[0].airdateString} - ${this.episodes[this.episodes.length - 1].airdateString}`
                    : this.episodes[0].airdateString
            );

        // Total Episodes
        this.sectionNode.querySelector('.super-replay-total-episodes')
            .insertAdjacentText('beforeend', this.episodes.length);

        // YouTube / Host / Featuring
        temp = {
            'views': 0, 'likes': 0, 'dislikes': 0, 'host': {}, 'featuring': {}
        };
        this.episodes.forEach(episode => {
            temp.views += episode.youtubeVideo.views;
            temp.likes += episode.youtubeVideo.likes;
            temp.dislikes += episode.youtubeVideo.dislikes;
            if ('host' in episode && episode.host !== undefined) {
                episode.host.forEach(name => {
                    if (name in temp.host)
                        temp.host[name] += 1;
                    else
                        temp.host[name] = 1;
                });
            }
            if ('featuring' in episode && episode.featuring !== undefined) {
                episode.featuring.forEach(name => {
                    if (name in temp.featuring)
                        temp.featuring[name] += 1;
                    else
                        temp.featuring[name] = 1;
                });
            }
        });
        // YouTube - Avg. Views
        this.sectionNode.querySelector('.super-replay .views')
            .insertAdjacentText('beforeend',
                Episode.addCommasToNumber((temp.views / this.episodes.length).toFixed(0))
            );
        // YouTube - Avg. Likes (Like Ratio)
        this.sectionNode.querySelector('.super-replay .likes')
            .insertAdjacentText('beforeend',
                `${Episode.addCommasToNumber((temp.likes / this.episodes.length).toFixed(0))} (${(temp.likes * 100 / (temp.likes + temp.dislikes)).toFixed(1)}%)`
            );
        // Host(s)
        if (isEmptyObject(temp.host))
            this.sectionNode.querySelector('.super-replay .episode-hosts').remove();
        else {
            this.sectionNode.querySelector('.super-replay .episode-hosts')
                .insertAdjacentText('beforeend', this.convertNameCountDictToString(temp.host));
        }
        // Featuring
        if (isEmptyObject(temp.featuring))
            this.sectionNode.querySelector('.super-replay .episode-featuring').remove();
        else {
            this.sectionNode.querySelector('.super-replay .episode-featuring')
                .insertAdjacentText('beforeend', this.convertNameCountDictToString(temp.featuring));
        }

        // ---------- More Info ----------

        // Assign parentNode to episodeMoreInfo element
        parentNode = this.sectionNode.querySelector('.super-replay .episode-more-info');

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
                /*
                for (const para of this.gameInformerArticle.content) {
                    if (para.replace(/\s/g, '').length)
                        parentNode.appendChild(createElement('p', undefined, para));
                }
                */
            }
        }

        // Other Headings (External Links should go last)
        if (this.otherHeadingsObj !== undefined) {
            for (const heading in this.otherHeadingsObj) {
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
                    Episode.addContentArrToNode(parentNode, this.otherHeadingsObj[heading]);
                }
            }
        }

        // External Links
        if (this.externalLinks !== undefined)
            Episode.addListOfLinks(this.externalLinks, parentNode, 'external links');

        // -----------------------------------------------
        // ---------- Super Replay Episode List ----------
        // -----------------------------------------------

        // NEW
        //parentNode = this.sectionNode.querySelector('.page-number-container');
        //this.numberedButtonList = new NumberedButtonList(parentNode, this.episodes.length);
        /*
        // OLD
        parentNode = this.sectionNode.querySelector('.super-replay-episode-list');
        childNode = parentNode.querySelector('.super-replay-episode-number');
        for (let i = 2, tempNode; i <= this.episodes.length; i++) {
            tempNode = childNode.cloneNode(true);
            tempNode.innerHTML = (i < 10) ? `0${i}` : i.toString();
            parentNode.insertAdjacentElement('beforeend', tempNode);
        }
        */

        // ------------------------------------------
        // ---------- Super Replay Episode ----------
        // ------------------------------------------

        parentNode = this.sectionNode.querySelector('.super-replay-episode');
        parentNode.replaceWith(this.episodes[0].sectionNode);
    }

    /**
     * 
     * @param {Number|String} episodeNumber
     */
    setCurrentEpisode(episodeNumber) {
        // If episodeNumber is string, convert to number
        if (typeof episodeNumber === 'string')
            episodeNumber = parseInt(episodeNumber, 10);

        // Make sure episodeNumber is between 1 and total episodes
        if (episodeNumber < 1)
            episodeNumber = 1;
        else if (episodeNumber > this.episodes.length)
            episodeNumber = this.episodes.length;

        if (episodeNumber !== this.currentEpisode) {
            // Set currentEpisode
            this.currentEpisode = episodeNumber;

            // Display currentEpisode
            this.sectionNode.querySelector('.super-replay-episode')
                .replaceWith(this.episodes[this.currentEpisode-1].sectionNode);
        }
    }

    /** Get total runtime as string of all episodes in Super Replay
     * */
    getPlaylistRuntimeString() {
        const timeInSeconds = this.playlistRuntime;

        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        const seconds = timeInSeconds - hours * 3600 - minutes * 60;

        return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }

    /**
     * Converts dictionary where key is name and value is number of 
     * appearances to string listing names in descending order of appearances.
     * @param {Object} nameDict
     */
    convertNameCountDictToString(nameDict) {
        // Array of objects with 'name' and 'count' to be sorted
        let nameCountArr = [];
        for (let [key, value] of Object.entries(nameDict))
            nameCountArr.push({ 'name': key, 'count': value })

        // Sort array by 'count' in descending order
        nameCountArr.sort((a, b) => b.count - a.count);

        // Convert array object to strings
        nameCountArr = nameCountArr.map(nameObj => `${nameObj.name} (${nameObj.count})`);

        // Convert array of strings to single string and return
        return Episode.convertListArrayToEnglishString(nameCountArr);
    }

    // ---------------------------------------
    // ---------- Utility Functions ----------
    // ---------------------------------------
}