"use strict";

import { SuperReplay } from "./superReplay.js";
import { Episode } from "./episode.js";
import { YouTubeVideoPlayer } from "./youtubeVideoPlayer.js";
import { shuffleArray, createElement } from "../../scripts/utility.js";

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
    _superReplayObjectArray: [],
    // Array to hold list of SuperReplay objects that reference the
    // base list but the length and order can be changed with sort/filter
    selectedSuperReplays: [],

    // ---------- Element/Node References ----------
    superReplayListElement: document.getElementById('super-replay-list'),

    // Sort
    _sortObj: {
        'type': sort.airdate,
        'ascending': false,
        'isShuffled': false
    },
    // Sort - Sort Type
    sortTypeElement: document.getElementById('sort-type-select'),
    get sortType() { return this._sortObj.type; },
    set sortType(input) {
        let tempSortType; // Initialized to undefined
        // If arg is a string type, compare to properties of sort enum
        if (typeof input === 'string') {
            switch (input) {
                case 'views': tempSortType = sort.views; break;
                case 'likes': tempSortType = sort.likes; break;
                case 'like-ratio': tempSortType = sort.likeRatio; break;
                case 'dislikes': tempSortType = sort.dislikes; break;
                case 'video-length': tempSortType = sort.length; break;
                case 'none': tempSortType = sort.none; break;
                case 'number': tempSortType = sort.number; break;
                case 'airdate':
                default: tempSortType = sort.airdate;
            }
        }
        // Else If arg is a number type, compare to values of sort enum
        else if (typeof input === 'number') {
            for (const property in sort) {
                if (sort[property] == input) {
                    tempSortType = input;
                    break;
                }
            }
        }
        // Assign sortType
        // If tempSortType is still undefined, do NOT assign sortType and throw error
        if (typeof tempSortType === 'undefined') {
            console.error('Could NOT assign sortType to value: ' + input);
            this._sortObj.type = sort.none;
        } else // Else assign tempSortType to sortType
            this._sortObj.type = tempSortType;

        // Check if isShuffled needs to be set to false
        if (this.isShuffled && this.sortType !== sort.none)
            this.isShuffled = false;

        // Check value of HTML select element for sort type
        this.sortTypeElement.value = this.sortTypeAttribute;
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
    sortDirectionElement: document.getElementById('sort-direction-select'),
    get ascending() { return this._sortObj.ascending; },
    set ascending(bool) {
        // If bool is string, convert to bool
        if (typeof bool === 'string')
            this._sortObj.ascending = (bool.toLowerCase() === 'true') ? true : false;
        // Else If bool is boolean, assign as is
        else if (typeof bool === 'boolean')
            this._sortObj.ascending = bool;
        // Else assign false for descending list by default
        else
            this._sortObj.ascending = false;

        // Check value of HTML select element for ascending
        this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    },
    // Sort - Shuffle
    get isShuffled() { return this._sortObj.isShuffled; },
    set isShuffled(bool) {
        this._sortObj.isShuffled = bool;
        if (bool)
            this.sortType = sort.none;
    },
    // Max Displayed - Increments [1, 5, 10, 20]
    // Value of 0 shows all episodes
    maxDisplayedElement: document.getElementById('max-displayed-select'),
    _maxDisplayed: 5,
    get maxDisplayed() { return this._maxDisplayed; },
    set maxDisplayed(num) {
        this._maxDisplayed = num;
        // If string, try to convert to int, assigns NaN if cannot
        if (typeof num == 'string')
            num = parseInt(num, 10);
        // If argument is a number and greater than zero, assign the value
        // of the argument. Else assign value of 0.
        this._maxDisplayed = (!isNaN(num) && num > 0) ? num : 0;
        // Check that HTML select element value is correct
        this.maxDisplayedElement.value = this.maxDisplayed;
    },

    // Filter/Search
    filterFormElement: document.getElementById('filterForm'),
    searchInputElement: document.querySelector('#search-container input[type = "text"]'),
    // NOTE: Do NOT need object parameter. Just add to updateFilterObj()
    /*
    _filterObj: {}, // Initialized to empty object
    get filterObj() { return this._filterObj; },
    set filterObj(newObj) {
        // Reset selectedSuperReplays to show all SRs from base SR object array
        // If newObj is empty, filter will NOT change selectedSuperReplays listing all SRs
        this.selectedSuperReplays = this._superReplayObjectArray.slice();

        // Loop through each property of newObj
        Object.keys(newObj).forEach(filterType => {

        });
        for (const filterType of Object.keys(newObj)) {

        }
    },
    */
    // Page Selection
    maxDisplayedButtons: 7,
    currentDisplayedMessageElement: document.querySelector('#number-displayed-container div'),
    _currentPageDisplayed: 1,
    get currentPageDisplayed() { return this._currentPageDisplayed; },
    set currentPageDisplayed(num) {
        // If string, try to convert to int, assigns NaN if cannot
        if (typeof num == 'string')
            num = parseInt(num, 10);
        // Limit value between 1 and totalPages
        this._currentPageDisplayed = (num < 1) ? 1 : ((num > this.totalPages) ? this.totalPages : num);
    },
    get totalPages() {
        return (this.maxDisplayed && this.selectedSuperReplays.length)
            ? Math.ceil(this.selectedSuperReplays.length / this.maxDisplayed)
            : 1;
    },

    // YouTub Video Player
    videoPlayer: new YouTubeVideoPlayer(document.getElementById('video-player-container')),

    // Current Super Replay
    //currentSuperReplay: undefined,
};

/**
 * @param {Array} superReplayArray
 */
superReplayCollection.init = function () {
    let requestURL = "data/gameInformerSuperReplayFandomWikiData.json";
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);

    request.responseType = 'json';
    request.send();

    request.onload = function () {
        // Initialize properties
        this.sortTypeElement.value = this.sortTypeAttribute;
        this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';

        // Clone super replay template to use for SuperReplay property
        const nodeTemplate = document.querySelector('#super-replay-template .super-replay-container')
            .cloneNode(true);

        // Create SuperReplay object array
        request.response.forEach(superReplayDict =>
            this._superReplayObjectArray.push(
                new SuperReplay(superReplayDict,
                nodeTemplate,
                this.videoPlayer)
            ));

        // Initialize array of selected SuperReplay objects that can change
        this.selectedSuperReplays = this._superReplayObjectArray.slice();

        // Load YouTube Player API
        this.videoPlayer.loadPlayerAPI();

        // Populate document with initialized displayed Super Replays array
        this.updateDisplayedSuperReplays();

        // Add statistics
        this.populateStats();

        // Populate filter form
        this.populateFilterForm();
    }.bind(this);

    // Date Last Modified
    let requestHeader = new XMLHttpRequest();
    requestHeader.open('HEAD', requestURL);
    requestHeader.onload = function () {
        document.getElementById('lastModifiedDate').innerHTML = new Date(this.getResponseHeader("Last-Modified")).toDateString();
    };
    requestHeader.send();
};

/** Update Super Replays displayed on current page. */
superReplayCollection.updateDisplayedSuperReplays = function () {
    // Variables
    const selectedSuperReplaysLength = this.selectedSuperReplays.length;
    // Assign start/end depending on selectedSuperReplays length, maxDisplayed, and currentPageDisplayed
    /* Ex. 120 episodes and 50 max displayed
     * 1: 0-49 (first 50) start=first end=50
     * 2: 50-99 (second 50) start=50 end=100
     * 3: 100-119 (last 20) start=100 end=last */
    const start = (this.currentPageDisplayed - 1) * this.maxDisplayed;
    const end = (this.maxDisplayed)
        ? Math.min(this.currentPageDisplayed * this.maxDisplayed, selectedSuperReplaysLength)
        : selectedSuperReplaysLength;

    // Clear Super Replay list from document
    this.clearSuperReplayListElement();

    // Fill Super Replay list element with displayed super replays
    for (let i = start; i < end; i++)
        this.superReplayListElement.appendChild(this.selectedSuperReplays[i].sectionNode);

    // Change current number of displayed super replays message string
    if (selectedSuperReplaysLength) {
        this.currentDisplayedMessageElement.innerHTML = 'Showing ' +
            ((this.maxDisplayed > 0)
                ? `${start + 1} - ${end} of`
                : 'all')
            + ` ${selectedSuperReplaysLength} Super Replays`;
    } else {
        this.currentDisplayedMessageElement.innerHTML = 'Showing no Super Replays';
    }

    // Update page number containers
    this.updatePageNumber('top');
    this.updatePageNumber('bottom', true);
};

superReplayCollection.clearSuperReplayListElement = function () {
    const superReplayElements = this.superReplayListElement.getElementsByClassName('super-replay-container');
    // Make sure there are NO Super Replay elements already in place
    if (typeof superReplayElements !== 'undefined') {
        while (superReplayElements.length > 0)
            this.superReplayListElement.removeChild(superReplayElements[superReplayElements.length - 1]);
    }
};

/** Update selected Super Replay list. */
superReplayCollection.updateSelectedSuperReplays = function () {
    // Reset current page displayed
    this.currentPageDisplayed = 1;
    // Sort selected super replays if sortType is NOT sort.none
    if (this.sortType !== sort.none)
        this.sortSelectedSuperReplays();
    // Populate main element with updated selected super replays
    this.updateDisplayedSuperReplays();
    // Cue playlist of first super replay
    //this.cueSuperReplayPlaylist();
    this.videoPlayer.cueVideoPlaylist(this.selectedSuperReplays[0].playlistIDArray)
};

/** Populate Super Replay statistics on bottom on page. */
superReplayCollection.populateStats = function () {
    let totalEpisodes, totalTime, totalViews, totalLikes, totalDislikes;
    totalEpisodes = totalTime = totalViews = totalLikes = totalDislikes = 0;

    this._superReplayObjectArray.forEach(superReplay => {
        totalEpisodes += superReplay.episodes.length;
        superReplay.episodes.forEach(episode => {
            totalTime += episode.runtimeInSeconds;
            totalViews += episode.youtubeVideo.views;
            totalLikes += episode.youtubeVideo.likes;
            totalDislikes += episode.youtubeVideo.dislikes;
        });
    });

    // Total Number of Episodes
    document.getElementById('stats-total-episodes')
        .insertAdjacentText('beforeend', totalEpisodes);

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

/**
 * Get Super Replay reference by official Super Replay number.
 * @param {Number} num
 * @return {SuperReplay}
 */
superReplayCollection.getSuperReplayByNumber = function (num) {
    this._superReplayObjectArray.forEach(superReplay => {
        if (superReplay.number === num) {
            console.log(superReplay);
            return superReplay;
        }
    });
};

// ----------------------------------------------
// -------------------- Sort --------------------
// ----------------------------------------------

superReplayCollection.setSortByEvent = function (event) {
    switch (event.currentTarget.name) {
        // Sort Type
        case 'sort-type':
            // Assign sortType
            this.sortType = event.currentTarget.value;
            // Update main HTML element to display new sorted super replays
            this.updateSelectedSuperReplays();
            break;

        // Sort Direction
        case 'sort-direction':
            // Assign ascending bool
            if (event.currentTarget.value == 'ascending') {
                if (!this.ascending) {
                    this.ascending = true;
                    // Update main HTML element to display new sorted super replays
                    this.updateSelectedSuperReplays();
                }
            } else { // Else descending is selected
                if (this.ascending) {
                    this.ascending = false;
                    // Update main HTML element to display new sorted super replays
                    this.updateSelectedSuperReplays();
                }
            }
            break;

        // Max Displayed
        case 'max-displayed':
            // Max Displayed - Assign this.maxDisplayed
            this.maxDisplayed = event.currentTarget.value;
            // Reset current page displayed
            this.currentPageDisplayed = 1;
            // Update main HTML element to display new sorted episodes
            this.updateDisplayedSuperReplays();
            break;

        // Default
        default:
    }
};

/** Sort selected episodes according to sort object. */
superReplayCollection.sortSelectedSuperReplays = function () {
    // Sort selectedSuperReplays by sortType in ascending order
    switch (this.sortType) {
        // None (No sort such as for shuffled list)
        case sort.none: break;
        // Video Length/Duration
        case sort.length:
            this.selectedSuperReplays.sort((first, second) =>
                first.playlistRuntime - second.playlistRuntime);
            break;
        // Episode Number (Special episodes separate from official)
        case sort.number:
            this.selectedSuperReplays.sort((first, second) =>
                first.number - second.number);
            break;
        // Views
        case sort.views:
            this.selectedSuperReplays.sort((first, second) =>
                first.averageViews - second.averageViews);
            break;
        // Likes
        case sort.likes:
            this.selectedSuperReplays.sort((first, second) =>
                first.averageLikes - second.averageLikes);
            break;
        // Like Ratio
        case sort.likeRatio:
            this.selectedSuperReplays.sort((first, second) =>
                first.averageLikeRatio - second.averageLikeRatio);
            break;
        // Dislikes
        case sort.dislikes:
            this.selectedSuperReplays.sort((first, second) =>
                first.averageDislikes - second.averageDislikes);
            break;
        // Air Date (Default)
        case sort.airdate:
        default:
            this.selectedSuperReplays.sort((first, second) =>
                first.episodes[0].airdate - second.episodes[0].airdate);
    }

    // Reverse array if this.ascending is false
    if (!this.ascending)
        this.selectedSuperReplays.reverse();
};

// -----------------------------------
// ---------- Filter/Search ----------
// -----------------------------------

superReplayCollection.filter = function () {
    // Variables
    let tempObj = {};

    // Reset selectedSuperReplays to show all SRs from base SR object array
    this.selectedSuperReplays = this._superReplayObjectArray.slice();

    // Search
    if (this.searchInputElement.value)
        this.filterBySearch(this.searchInputElement.value);

    // Filter Form: Year and Crew
    // For each checkbox input element in the filter form
    this.filterFormElement.querySelectorAll('input[type="checkbox"]')
        .forEach(input => {
            if (input.checked) {
                // If tempObj already has input.name as property, push value to property array
                if (tempObj[input.name] !== undefined)
                    tempObj[input.name].push(input.value);
                else // Else add input.name as property and assign array with input.value as first element
                    tempObj[input.name] = [input.value];
            }
        });

    // Loop through each property of tempObj
    for (const [key, value] of Object.entries(tempObj)) {
        switch (key) {
            case 'year':
                this.filterByYear(value);
                break;
            case 'giCrew':
                this.filterByCrew(value);
                break;
            default:
        }
    }

    // Update Super Replay list
    this.updateSelectedSuperReplays();
};

/**
 * Filter selectedSuperReplays by search terms in search box.
 * @param {String} searchTerms
 * 
 * Search Operations:
 * game:searchString - Search by game title(s)
 * name:searchString - Search by gi crew name(s)
 * "searchString" - Search exact match instead of separating each keyword between spaces
 * -searchString - Ignore search term
 * string01 OR string02 - Search if either string is matched. OR must be capitalized.
 * string01 string02 - Search if both strings are matched
 * Examples:
 * stealth game:"mario sunshine"
 * Searches all text for 'stealth' and game titles for exactly 'mario sunshine'
 * name:-ryckert game:splinter "metal gear"
 * Excludes host/featuring with 'ryckert' and searches game titles for 'splinter' AND exactly 'metal gear'
 * Ignore spaces between 'property:' and next valid character
 * TODO: If two words are separated by spaces, return results that match both or either one, AND/OR?
 */
superReplayCollection.filterBySearch = function (searchTerms = "") {
    if (searchTerms) {
        // Set search terms to lower case before comparing
        const re = new RegExp("\\b(?:" + searchTerms.toLowerCase() + ")\\b");
        this.selectedSuperReplays = this.selectedSuperReplays.filter(
            superReplay => {
                return superReplay.episodes.some(episode => {
                    return re.test(episode.sectionNode.textContent.toLowerCase());
                });
            }
        );
    }
};

/**
 * 
 * @param {String[]} yearsToFilter
 */
superReplayCollection.filterByYear = function (yearsToFilter) {
    // Make sure that each value is a number
    yearsToFilter.forEach((value, index, arr) => {
        // If value is NOT a number, remove array element
        if (isNaN(value)) arr.splice(index, 1);
        else { // Else value is a number
            // If value is a string type, convert to number
            if (typeof value === 'string')
                arr[index] = parseInt(value, 10);
        }
    });

    // Filter Super Replays
    this.selectedSuperReplays = this.selectedSuperReplays.filter(
        superReplay => {
            return superReplay.episodes.some(episode => {
                return (yearsToFilter.includes(episode.airdate.getFullYear()))
            });
        }
    );
};

/**
 * 
 * @param {String[]} crewToFilter
 */
superReplayCollection.filterByCrew = function (crewToFilter) {
    // Variables
    let crewPerEpisode = [];

    this.selectedSuperReplays = this.selectedSuperReplays.filter(
        superReplay => {
            return superReplay.episodes.some(episode => {
                // If NO host and NO featuring, filter out super replay
                if (episode.host === undefined && episode.featuring === undefined)
                    return false;

                // Combine episode host and featuring into single array
                crewPerEpisode = (episode.host === undefined) ? episode.featuring
                    : (episode.featuring === undefined) ? episode.host
                        : episode.host.concat(episode.featuring);

                return crewPerEpisode.some(
                    name => crewToFilter.includes(name)
                );
            });
        }
    );
};

superReplayCollection.populateFilterForm = function () {
    // Variables
    let parentElement;
    let i = 0; // Used in for loops
    let sortedObjArr = [];
    const currentYear = new Date().getFullYear();

    // Year
    parentElement = document.querySelector('#year-field ul');
    for (i = 2010; i <= currentYear; i++) {
        parentElement.appendChild(document.createElement('li'))
            .append(this.createFieldsetLabel("year", i.toString()));
    }

    // GI Crew
    parentElement = document.querySelector('#gi-crew-field ul');
    // Create array of names for each gi crew
    sortedObjArr = this.getGICrew();
    // Add to filter form
    for (const person of sortedObjArr) {
        parentElement.appendChild(document.createElement('li'))
            .append(this.createFieldsetLabel("giCrew", person.name, `${person.name} (${person.count})`));
    }

    // Add eventListener to filter form
    this.filterFormElement.addEventListener('change',
        this.filter.bind(this), false);
};

/**
 * 
 * @param {String} name
 * @param {String} value
 * @param {String} label
 */
superReplayCollection.createFieldsetLabel = function (name, value, label) {
    // Variables
    let labelElement;
    let inputElement;

    // If label is undefined, assign same value as value
    if (typeof label === "undefined")
        label = value;

    // Create input element
    inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'checkbox');
    inputElement.setAttribute('name', name);
    inputElement.setAttribute('value', value);

    // Append input element to label
    labelElement = createElement('label', undefined, label);
    labelElement.appendChild(inputElement);

    // Append span element for checkmark
    labelElement.appendChild(createElement('span', 'checkmark'));

    // Return label element to append to the fieldset
    return labelElement;
};

// -----------------------------
// ---------- Shuffle ----------
// -----------------------------

superReplayCollection.shuffleSelectedSuperReplays = function () {
    this.isShuffled = true;
    // Change sortType to none
    this.sortType = sort.none;
    // Shuffle selectedEpisodes
    shuffleArray(this.selectedSuperReplays);
    // Update selected episodes
    this.updateSelectedSuperReplays();
};

// ---------------------------------------------
// ---------- Reset Super Replay List ----------
// ---------------------------------------------

superReplayCollection.resetSelectedSuperReplays = function () {
    // Set array of selected SuperReplay objects that can change
    this.selectedSuperReplays = this._superReplayObjectArray.slice();

    // Reset sort/filter/search
    // Change HTML select element values to default
    this.sortType = sort.airdate;
    this.ascending = false;
    this.searchInputElement.value = "";
    this.filterFormElement.reset();

    this.updateSelectedSuperReplays();
};

// ------------------------------------
// ---------- Page Selection ----------
// ------------------------------------

superReplayCollection.createNumberedButton = function (buttonValue, buttonStr, scrollToTop = false) {
    // Variables
    let tempNode;
    // If buttonStr is undefined, assign same value as buttonValue
    if (typeof buttonStr === 'undefined')
        buttonStr = buttonValue;
    // Create button
    tempNode = (buttonValue == this.currentPageDisplayed)
        ? createElement('button', 'active custom-button', buttonStr)
        : createElement('button', 'custom-button', buttonStr);
    tempNode.setAttribute('type', 'button');
    tempNode.setAttribute('value', buttonValue);
    tempNode.addEventListener("click", function () {
        this.setPageNumber(buttonValue, scrollToTop);
    }.bind(this), false);
    // Return button
    return tempNode;
};

superReplayCollection.updatePageNumber = function (positionStr, scrollToTop = false) {
    // Variables
    const pageNumberContainer = document.getElementById(`page-number-container${(positionStr) ? '-' + positionStr : ''}`);
    const pageNumberList = pageNumberContainer.querySelector('.page-number-list');
    const maxButtonsMidCeil = Math.ceil(this.maxDisplayedButtons / 2);

    // Hide page container if total pages is less than 2
    pageNumberContainer.style.display = (this.totalPages < 2) ? 'none' : null;

    // Remove all page number buttons
    pageNumberContainer.querySelectorAll('.page-number-list .custom-button')
        .forEach(node => node.remove());

    // Disable 'PREV' if current page is equal to 1
    pageNumberContainer.querySelector('button[value="prev"]')
        .disabled = (this.currentPageDisplayed === 1);

    // Disable 'FIRST' if totalPages is less than or equal to maxDisplayedButtons
    // OR current page is near beginning of list
    pageNumberContainer.querySelector('button[value="first"]')
        .disabled = (this.totalPages <= this.maxDisplayedButtons
            || this.currentPageDisplayed <= maxButtonsMidCeil
        );

    // Page number list
    let start, end;
    // If totalPages is more than maxDisplayedButtons
    if (this.totalPages > this.maxDisplayedButtons) {
        if (this.currentPageDisplayed > this.totalPages - maxButtonsMidCeil) {
            // Show last maxDisplayedButtons
            start = this.totalPages - this.maxDisplayedButtons + 1;
            end = this.totalPages;
        } else if (this.currentPageDisplayed > maxButtonsMidCeil) {
            // Show buttons with currentPageDisplayed in middle
            start = this.currentPageDisplayed - maxButtonsMidCeil + 1;
            end = this.currentPageDisplayed + maxButtonsMidCeil - 1;
        } else {
            // Show first maxDisplayedButtons
            start = 1;
            end = this.maxDisplayedButtons;
        }
    } else { // Else totalPages is less than or equal to maxDisplayedButtons
        // Add buttons ranging from 1 to totalPages
        start = 1;
        end = this.totalPages;
    }
    for (let i = start; i <= end; i++)
        pageNumberList.appendChild(this.createNumberedButton(i, i, scrollToTop));

    // Disable 'LAST' if totalPages is less than or equal to maxDisplayedButtons
    // OR current page is near end of list
    pageNumberContainer.querySelector('button[value="last"]')
        .disabled = (this.totalPages <= this.maxDisplayedButtons
            || this.currentPageDisplayed >= this.totalPages - maxButtonsMidCeil + 1
        );

    // Disable 'NEXT' if current page is equal to last page (totalPages)
    pageNumberContainer.querySelector('button[value="next"]')
        .disabled = (this.currentPageDisplayed === this.totalPages);
};

superReplayCollection.setPageNumber = function (input, scrollToTop = false) {
    const prevPage = this.currentPageDisplayed;
    if (typeof input === 'number')
        this.currentPageDisplayed = input;
    else if (typeof input === 'string') {
        // If input is 'next', increase page by 1
        if (input == 'next') this.currentPageDisplayed++;
        // Else If input is 'prev', decrease page by 1
        else if (input == 'prev') this.currentPageDisplayed--;
        // Else If input is 'first', set page to 1
        else if (input == 'first') this.currentPageDisplayed = 1;
        // Else If input is 'last', set page to totalPages
        else if (input == 'last') this.currentPageDisplayed = this.totalPages;
        // Else If string is a number, assign number to page
        else if (!isNaN(parseInt(input, 10)))
            this.currentPageDisplayed = parseInt(input, 10);
    }
    // If currentPageDisplayed has changed value
    if (prevPage != this.currentPageDisplayed) {
        // Update displayed episodes
        this.updateDisplayedSuperReplays();
        // Scroll to top
        if (scrollToTop)
            document.getElementById('top-page').scrollIntoView({ behavior: "smooth" });
    }
};

// ------------------------------------------------
// ---------- Video Player - YouTube API ----------
// ------------------------------------------------

superReplayCollection.cueSuperReplayPlaylist = function (superReplay, episodeIndex = 0) {
    // If superReplay parameter is undefined, cue playlist of first SuperReplay in collection
    if (typeof superReplay === 'undefined') {
        this.videoPlayer.cueVideoPlaylist(this.selectedSuperReplays[0].playlistIDArray);
    } else { // Else cue playlist with superReplay parameter and episodeIndex

    }
};

// ------------------------------
// ---------- Get Crew ----------
// ------------------------------

/** Get list of GI crew members with number of appearances.
 * @return {Object[]} Array of Dictionary objects with keys 'name' and 'count' sorted alphabetically.*/
superReplayCollection.getGICrew = function () {
    // Variables
    let tempCrewArr = [];
    let isIncluded = false;

    // Function to add GI crew name if NOT in list or increment count
    // if is in list.
    function addCrew(nameToAdd) {
        // Check if nameToAdd is already in tempCrewArr
        isIncluded = false;
        for (const person of tempCrewArr) {
            if (person.name == nameToAdd) {
                isIncluded = true;
                person.count++;
                break;
            }
        }
        // If nameToAdd is NOT included, add to list
        if (!isIncluded)
            tempCrewArr.push({ name: nameToAdd, count: 1 });
    }

    for (const superReplay of this._superReplayObjectArray) {
        for (const episode of superReplay.episodes) {
            // Host
            if (episode.host !== undefined)
                episode.host.forEach(host => addCrew(host));

            // Featuring
            if (episode.featuring !== undefined)
                episode.featuring.forEach(guest => addCrew(guest));
        }
    }

    // Sort array alphabetically
    tempCrewArr.sort((first, second) => {
        return (first.name < second.name) ? -1 :
            (first.name > second.name) ? 1 :
                0;
    });

    return tempCrewArr;
};