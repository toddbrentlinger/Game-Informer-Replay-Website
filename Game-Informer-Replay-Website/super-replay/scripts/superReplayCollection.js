"use strict";

import { SuperReplay } from "./superReplay.js";
import { Episode } from "./episode.js";

// TODO: Put in superReplayCollection._sortObj['sort']
window.sort = Object.freeze({
    'none': 0,
    'number': 1,
    'airdate': 2,
    'views': 3,
    'likes': 4,
    'likeRatio': 5,
    'dislikes': 6,
    'length': 7
});

/** @author Todd Brentlinger */
window.superReplayCollection = {
    // Array to hold base list of SuperReplay objects
    superReplayObjectArray: [],
    // Array to hold list of SuperReplay objects that reference the
    // base list but the length and order can be changed
    displayedSuperReplays: [],
    
    // Sort
    _sortObj: {
        'type': sort.airdate,
        'ascending': false,
        'isShuffled': false
    },
    // sort - Sort Type
    get sortType() { return this._sortObj.type; },
    set sortType(input) {

    },
    get sortTypeAttribute() {
        switch (this.sortType) {
            case sort.airdate: return 'airdate'; break;
            case sort.number: return 'number'; break;
            case sort.views: return 'views'; break;
            case sort.likes: return 'likes'; break;
            case sort.likeRatio: return 'like-ratio'; break;
            case sort.dislikes: return 'dislikes'; break;
            case sort.length: return 'video-length'; break;
            case sort.none:
            default: return 'none';
        }
    },
    // Sort - Ascending
    get ascending() { return this._sortObj.ascending; },
    set ascending(bIsAscending) {

    },
    // Sort - Shuffle
    get isShuffled() { return this._sortObj.isShuffled; },
    set isShuffled(bIsShuffled) {

    },

    // Filter
    filterObj: {},

    // Search

    // Max Displayed - Increments [10, 25, 50, 100, 200]
    // Value of 0 shows all episodes
    _maxDisplayed: 10,
    get maxDisplayed() { return this._maxDisplayed; },
    set maxDisplayed(num) {

    },

    // Page Selection
    maxDisplayedButtons: 7,
    _currentPageDisplayed: 1,
    get currentPageDisplayed() { return this._currentPageDisplayed; },
    set currentPageDisplayed(num) {

    },
    get totalPages() {

    },

    // ---------- Node/Element References ----------
    superReplayListElement: document.getElementById('super-replay-list')
};

/**
 * @param {Array} superReplayArray
 */
superReplayCollection.init = function (superReplayArray) {
    let requestURL = "data/gameInformerSuperReplayFandomWikiData.json";
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);

    request.responseType = 'json';
    request.send();

    request.onload = function () {
        // Clone super replay template to use for SuperReplay property
        const nodeTemplate = document.querySelector('#super-replay-template .super-replay-container')
            .cloneNode(true);

        // Create SuperReplay object array
        request.response.forEach(superReplayDict =>
            this.superReplayObjectArray.push(new SuperReplay(superReplayDict, nodeTemplate))
        );

        // Initialize array of displayed SuperReplay objects that can change
        this.displayedSuperReplays = this.superReplayObjectArray.slice();

        // Populate document with initialized displayed Super Replays array
        this.updateSuperReplayListElement();

        // Add statistics
        this.populateStats();

        // Filter
        //this.populateFilterForm();
    }.bind(superReplayCollection);
};

superReplayCollection.updateSuperReplayListElement = function () {
    // Clear Super Replay list from document
    this.clearSuperReplayListElement();

    // Fill Super Replay list element with displayed episodes
    this.displayedSuperReplays.forEach(superReplay => {
        this.superReplayListElement.appendChild(superReplay.sectionNode);
    });
};

superReplayCollection.clearSuperReplayListElement = function () {
    const superReplayElements = this.superReplayListElement.getElementsByClassName('super-replay-container');
    // Make sure there are NO Super Replay elements already in place
    if (typeof superReplayElements !== 'undefined') {
        while (superReplayElements.length > 0)
            this.superReplayListElement.removeChild(superReplayElements[superReplayElements.length - 1]);
    }
};

superReplayCollection.updateDisplayedSuperReplays = function () {

};

superReplayCollection.populateStats = function () {
    let totalTime, totalViews, totalLikes, totalDislikes;
    totalTime = totalViews = totalLikes = totalDislikes = 0;

    this.superReplayObjectArray.forEach(superReplay => {
        superReplay.episodes.forEach(episode => {
            totalTime += episode.runtimeInSeconds;
            totalViews += episode.youtubeVideo.views;
            totalLikes += episode.youtubeVideo.likes;
            totalDislikes += episode.youtubeVideo.dislikes;
        });
    });

    // Total Time
    const days = Math.floor(totalTime / 86400)
    const hours = Math.floor((totalTime - days * 86400) / 3600);
    const minutes = Math.floor((totalTime - days * 86400 - hours * 3600) / 60);
    const seconds = totalTime - (days * 86400) - (hours * 3600) - (minutes * 60);
    document.getElementById('stats-total-time')
        .insertAdjacentText('beforeend',
        `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds! (Total seconds: ${Episode.addCommasToNumber(totalTime)})`
        );

    // Total Views
    document.getElementById('stats-total-views').insertAdjacentText('beforeend', Episode.addCommasToNumber(totalViews));
    // Total Likes (Like Ratio)
    document.getElementById('stats-total-likes').insertAdjacentText(
        'beforeend',
        `${Episode.addCommasToNumber(totalLikes)} (${((totalLikes * 100) / (totalLikes + totalDislikes)).toFixed(1)}%)`
    );
};

superReplayCollection.getSuperReplayByNumber = function (num) {
    this.superReplayObjectArray.forEach(superReplay => {
        if (superReplay.number === num) {
            console.log(superReplay);
            return superReplay;
        }
    });
};