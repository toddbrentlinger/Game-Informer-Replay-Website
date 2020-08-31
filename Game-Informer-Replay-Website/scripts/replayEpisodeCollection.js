"use strict";

import { ReplayEpisode } from './replayEpisode.js';

// Sort enum
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

/*
// Filter enum
const filter = Object.freeze({
    none: 0,
    search: 1,
    season: 2,
    year: 3,
    giCrew: 4,
    host: 5,
    featuring: 6,
    segment: 7,
    gamesystem: 8,
    releaseDateYear: 9
});
*/

// Object: Collection of all replay episodes
window.replayEpisodeCollection = {
    // Properties
    totalTimeSeconds: 0,
    mainElement: document.getElementById('main'),
    // Sort
    sortTypeElement: document.getElementById('sort-type-select'),
    sortDirectionElement: document.getElementById('sort-direction-select'),
    maxDisplayedElement: document.getElementById('max-displayed-select'),
    // Search
    searchInputElement: document.querySelector('#search-container input[type = "text"]'),
    // Filter
    filterFormElement: document.querySelector('#filterForm'),
    // Number of episodes displayed element
    currentDisplayedEpisodesMessageElement: document.querySelector('#number-displayed-container div'),

    replayEpisodeObjectArray: [],
    selectedEpisodes: [],

    // Max Displayed Episodes - Increments [10, 25, 50, 100, 200]
    // Value of 0 shows all episodes
    _maxDisplayedEpisodes: window.sessionStorage.getItem('maxDisplayedEpisodes') || 10,
    get maxDisplayedEpisodes() { return this._maxDisplayedEpisodes; },
    set maxDisplayedEpisodes(num) {
        //console.log(`Argument num: ${num} (${typeof num}) - Max Displayed: ${this.maxDisplayedEpisodes}`);
        // If string, try to convert to int, assigns NaN if cannot
        if (typeof num == 'string')
            num = parseInt(num, 10);
        // If argument is a number and greater than zero, assign the value
        // of the argument. Else assign value of 0.
        this._maxDisplayedEpisodes = (!isNaN(num) && num > 0) ? num : 0;
        // Assign to local/session storage
        window.sessionStorage.setItem('maxDisplayedEpisodes', this.maxDisplayedEpisodes);
        // Check that HTML select element value is correct
        this.maxDisplayedElement.value = this.maxDisplayedEpisodes;
    },

    // Page Selection
    maxDisplayedButtons: 7,
    _currentPageDisplayed: parseInt(window.sessionStorage.getItem('currentPageDisplayed'), 10) || 1, // Page number of selected episodes list depending on maxDisplayedEpisodes
    get currentPageDisplayed() { return this._currentPageDisplayed; },
    set currentPageDisplayed(num) {
        // If string, try to convert to int, assigns NaN if cannot
        if (typeof num == 'string')
            num = parseInt(num, 10);
        // Limit value between 1 and totalPages
        this._currentPageDisplayed = (num < 1) ? 1 : ((num > this.totalPages) ? this.totalPages : num);
        // Assign to local/session storage
        window.sessionStorage.setItem('currentPageDisplayed', this.currentPageDisplayed);
    },
    get totalPages() {
        return (this.maxDisplayedEpisodes && this.selectedEpisodes.length)
            ? Math.ceil(this.selectedEpisodes.length / this.maxDisplayedEpisodes)
            : 1;
    },

    // Sort
    _sortType: parseInt(window.sessionStorage.getItem('sortType'), 10) || sort.airdate,
    get sortType() { return this._sortType; },
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
            this._sortType = sort.none;
        } else // Else assign tempSortType to sortType
            this._sortType = tempSortType;

        // Assign to local/session storage
        // If sortType is sort.none, assign default value of sort.airdate
        //console.log(`Sort Type: ${this.sortType} (${(this.sortType === sort.none) ? 'true' : 'false'})`);
        window.sessionStorage.setItem('sortType',
            (this.sortType === sort.none)
            ? sort.airdate
            : this.sortType
        );

        // Check that HTML select element value is correct
        this.sortTypeElement.value = this.sortTypeString;
    },

    // Converts number type to string for value attribute of select option element
    get sortTypeString() {
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

    // Bool to sort in ascending/descending order
    _ascending: ((window.sessionStorage.getItem('ascending'))
        ? (window.sessionStorage.getItem('ascending') === 'false' ? false : true)
        : false),
    get ascending() { return this._ascending; },
    set ascending(bool) {
        // If bool is string, convert to bool
        if (typeof bool === 'string')
            this._ascending = (bool === 'false') ? false : true;
        // Else if bool is boolean, assign as is
        else if (typeof bool === 'boolean')
            this._ascending = bool;
        // Else assign false for descending by default
        else
            this._ascending = false;

        // Assign to local/session storage
        window.sessionStorage.setItem('ascending', this._ascending);

        // Check that HTML select element value is correct
        this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    },

    // Filter/Search
    _filterObj: {}, // empty object
    get filterObj() { return this._filterObj; },
    set filterObj(newObject) {
        /*
        console.log('----- New filterObj Assigned -----');
        for (let [key, value] of Object.entries(newObject)) {
            console.log(`${key}: ${value}`);
        }
        console.log('----- End of New filterObj -----');
        */
        // Reset selectedEpisodes to show all episodes from base episode object array
        // If newObject is empty, filter will NOT change selectedEpisodes listing all episodes
        this.selectedEpisodes = this.replayEpisodeObjectArray.slice();

        // Go through each property of newObject
        for (const filterType in newObject) {
            // If property matches value in filter enum
                // Filter selectedEpisodes based on filter type from newObject property
                // Add newObject property/value to filterObj
            switch (filterType) {
                // Search
                case 'search':
                    this.filterBySearch(newObject[filterType]);
                    break;
                // Season
                case 'season':
                    this.filterBySeason(newObject[filterType]);
                    break;
                // Year
                case 'year':
                    this.filterByYear(newObject[filterType]);
                    break;
                // GI Crew
                case 'giCrew':
                    this.filterByCrew(newObject[filterType]);
                    break;
                // Segment
                case 'segment':
                    this.filterBySegment(newObject[filterType]);
                    break;
                default:
            }
            // Assign property/value to _filterObj
            this._filterObj[filterType] = newObject[filterType];
        }

        // Assign to local/session storage
        //window.sessionStorage.setItem('filterObj', this.filterObj);
    },

    // Shuffle
    isShuffled: false,

    // Video Player
    videoPlayerContainer: document.getElementById('video-player-container'),
    videoPlayer: undefined, // Assigned inside global onYouTubePlayerAPIReady()

    currentEpisodeHeaderElement: document.getElementById('current-episode-header'),
    //currentEpisodeDetailsElement: document.getElementById('current-episode-details'),
    currentEpisodeInfoElement: document.getElementById('current-episode-info'),
    currentEpisodeInfoToggleButton: document.getElementById('current-episode-info-toggle-button'),

    _currentEpisode: undefined, // reference to ReplayEpisode object
    get currentEpisode() { return this._currentEpisode; },
    // TODO: Add current episode number to local/session storage. When page loads,
    // find episode reference with number using binary search function getEpisodeByNumber(num)
    set currentEpisode(episode) {
        if (episode instanceof ReplayEpisode && episode !== this._currentEpisode) {
            //console.log(`set currentEpisode = ${episode.episodeNumber}\nselectedVideoIdArray indexOf: ${this.selectedVideoIdArray.indexOf(episode.youtubeVideoID)}`);
            // Remove 'currently-playing' class from previously played episode
            //if (this.currentEpisode) this.currentEpisode.episodeSection.classList.remove('currently-playing');
            // Set episodeSection of selected replayEpisode to class 'currently-playing'
            //episode.episodeSection.classList.add('currently-playing');

            // Assign currentEpisode
            this._currentEpisode = episode;
            // Remove episode info from around video player
            this.removeCurrentEpisodeInfo();
            // Display episode info around video player
            this.addCurrentEpisodeInfo();
        } else {
            if (episode instanceof ReplayEpisode && episode === this._currentEpisode) {
                //console.log(`Attempted to assign same episode to currentEpisode`);
            } else {
                console.error(`Could NOT assign ${episode} to currentEpisode`);
                // Remove 'currently-playing' class from previously played episode
                //if (this.currentEpisode) this.currentEpisode.episodeSection.classList.remove('currently-playing');
                // Assign value of undefined
                this._currentEpisode = undefined;
                // Remove episode info from around video player
                this.removeCurrentEpisodeInfo();
            }
        }
    },
    get selectedVideoIdArray() {
        const videoIdArray = [];
        for (const episode of this.selectedEpisodes) {
            if (episode.youtubeVideoID)
                videoIdArray.push(episode.youtubeVideoID);
        }
        return videoIdArray;
    }
};

// -----------------------------
// ---------- Methods ----------
// -----------------------------
 
// init(replayEpisodeArray)
replayEpisodeCollection.init = function (replayEpisodeArray) {
    // Clone episode section template to use for episode data
    // Initialize each replay episode object by sending this template
    // as an argument to ReplayEpisode constructor
    const episodeTemplate = document.querySelector('section.episode')
        .cloneNode(true);

    // Initialize object properties

    // Set value of input elements based on sort/filter properties
    //console.log(`Properties - \nSortType: ${this.sortTypeString}(${this.sortType}) \nAscending: ${this.ascending} \nMaxDisplayed: ${this.maxDisplayedEpisodes}`);
    //console.log(`Element Values - \nSortType: ${this.sortTypeElement.value}(${this.sortType}) \nAscending: ${this.sortDirectionElement.value} \nMaxDisplayed: ${this.maxDisplayedElement.value}`);
    this.sortTypeElement.value = this.sortTypeString;
    this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    this.maxDisplayedElement.value = this.maxDisplayedEpisodes;
    //console.log(`Element Values - \nSortType: ${this.sortTypeElement.value}(${this.sortType}) \nAscending: ${this.sortDirectionElement.value} \nMaxDisplayed: ${this.maxDisplayedElement.value}`);
    
    // Set filter
    // Set search

    // Populate replay episode object array in episode collection object
    this.populateEpisodeObjectArray(replayEpisodeArray, episodeTemplate);

    // Empty replayEpisodeArray. No longer needed.
    //replayEpisodeArray = null;
    //replayEpisodeArray.length = 0;

    // Initialize selected episodes array to same order of base episode object array
    this.selectedEpisodes = this.replayEpisodeObjectArray.slice();

    // Sort selected episodes
    this.sortByType();

    // Populate main element with initialized selected episodes array
    this.updateDisplayedEpisodes();

    // Add stats
    this.populateStats();

    // Add filter options
    this.populateFilterForm();
};

// populateEpisodeObjectArray()
replayEpisodeCollection.populateEpisodeObjectArray = function (replayEpisodeArray, episodeTemplate) {
    let replayEpisodeObject;
    for (const replayEpisode of replayEpisodeArray) {
        // Create ReplayEpisode object
        replayEpisodeObject = new ReplayEpisode(replayEpisode, episodeTemplate);
        // Append episode object to array
        this.replayEpisodeObjectArray.push(replayEpisodeObject);
        // Increase total time of episodes
        this.totalTimeSeconds += replayEpisodeObject.videoLengthInSeconds;
        //console.log(`Finished episode number: ${replayEpisodeObject.episodeNumber}`);
    }
    // Success Message
    console.log('Finished replay episode assignment');
};
 
// clearMainElement()
replayEpisodeCollection.clearMainElement = function () {
    const episodeElements = this.mainElement.getElementsByClassName('episode');
    // Make sure there are no episode elements already in place
    if (typeof episodeElements !== 'undefined') {
        while (episodeElements.length > 0)
            this.mainElement.removeChild(episodeElements[episodeElements.length - 1]);
    }
};

// updateDisplayedEpisodes()
// Populate main HTML element with episode HTML from displayed episodes array
replayEpisodeCollection.updateDisplayedEpisodes = function () {
    // Variables
    const selectedEpisodesLength = this.selectedEpisodes.length;
    // Assign start/end depending on selectedEpisodes length, maxDisplayedEpisodes, and currentPageDisplayed
    /* Ex. 120 episodes and 50 max displayed
     * 1: 0-49 (first 50) start=first end=50
     * 2: 50-99 (second 50) start=50 end=100
     * 3: 100-119 (last 20) start=100 end=last */
    const start = (this.currentPageDisplayed - 1) * this.maxDisplayedEpisodes;
    const end = (this.maxDisplayedEpisodes)
        ? Math.min(this.currentPageDisplayed * this.maxDisplayedEpisodes, selectedEpisodesLength)
        : selectedEpisodesLength;

    // Clear main element of episode sections
    this.clearMainElement();

    // Fill main element with selected episodes array
    for (let i = start; i < end; i++) {
        this.mainElement.appendChild(this.selectedEpisodes[i].episodeSection);
    }

    // Change current number of displayed episodes message string
    if (selectedEpisodesLength) {
        this.currentDisplayedEpisodesMessageElement.innerHTML = 'Showing ' +
            ((this.maxDisplayedEpisodes > 0)
                ? `${start + 1} - ${end} of`
                : 'all')
            + ` ${selectedEpisodesLength} replay episodes`;
    } else {
        this.currentDisplayedEpisodesMessageElement.innerHTML = 'Showing no replay episodes';
    }

    // Update page number containers
    this.updatePageNumberAdv('top');
    this.updatePageNumberAdv('bottom', true);
};

// updateSelectedEpisodes()
replayEpisodeCollection.updateSelectedEpisodes = function () {
    // Reset current page displayed
    this.currentPageDisplayed = 1;
    // Sort selected episodes
    this.sortByType();
    // Populate main element with updated selectedEpisodes
    this.updateDisplayedEpisodes();
    // Cue playlist of first 200 selected episodes
    this.cueEpisodePlaylist();
};

// -----------------------------
// ---------- Shuffle ----------
// -----------------------------

// shuffleArray(arr)
// Accepts array as argument to shuffle
// TODO: Make static function or just add to shuffleSelectedEpisodes()
replayEpisodeCollection.shuffleArray = function (arr) {

    for (let i = arr.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i 
        let j = Math.floor(Math.random() * (i + 1));

        // Swap arr[i] with the element at random index
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
};

// shuffleSelectedEpisodes()
replayEpisodeCollection.shuffleSelectedEpisodes = function () {
    this.isShuffled = true;
    // Change sortType to none
    this.sortType = sort.none;
    // Shuffle selectedEpisodes
    this.shuffleArray(this.selectedEpisodes);
    // Update selected episodes
    this.updateSelectedEpisodes();
};

/*
// getShuffledOrder
// Array of episode numbers in shuffled order
// TODO: Use to save shuffled order to local/session storage
replayEpisodeCollection.getShuffleOrder = function () {
    const arrLength = this.selectedEpisodes.length;
    const shuffledOrderArr = new Array(arrLength);
    for (let i = 0; i < arrLength; i++)
        shuffledOrderArr[i] = this.selectedEpisodes[i].episodeNumber;
    return shuffledOrderArr;
};
*/

// -----------------------------------
// ---------- Filter/Search ----------
// -----------------------------------

// updateFilterObj()
replayEpisodeCollection.updateFilterObj = function () {
    // Variables
    const tempObj = {};

    // Search
    if (this.searchInputElement.value)
        tempObj.search = this.searchInputElement.value;

    // Other: Season, Year, GI Crew, etc.
    // For each checkbox input element in the filter form
    for (const input of this.filterFormElement.querySelectorAll('input[type="checkbox"]')) {
        if (input.checked) {
            // If filterObj already has input.name as a property, add value to property array
            if (tempObj[input.name] !== undefined)
                tempObj[input.name].push(input.value);
            else // Else add filterObj as property and add value as first element
                tempObj[input.name] = [input.value];
        }
    }
    // Assign to filterObj. Setter filters selectedEpisodes
    this.filterObj = tempObj;

    // Update selectedEpisodes
    this.updateSelectedEpisodes();
};

// filterBySearch(searchTerms)
// IN-PROGRESS
/* Search Operations:
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
replayEpisodeCollection.filterBySearch = function (searchTerms = '') {
    if (searchTerms) {
        // Reset selectedEpisodes to show complete list
        // TODO: NOT necessary. Already reset in updateFilterObj()
        this.selectedEpisodes = this.replayEpisodeObjectArray.slice();

        // Set search terms to lower case before comparing
        // \b(?:searchTerms)\b
        const re = new RegExp('\\b(?:' + searchTerms.toLowerCase() + ')\\b');
        //searchTerms = searchTerms.toLowerCase();
        this.selectedEpisodes = this.selectedEpisodes.filter(
            function (episode) {
                return re.test(episode.episodeSection
                    .textContent.toLowerCase());
            });
    } else { // Else show all episodes applying filter and sort
        // TODO
        //console.log('No search text');
    }
};

// filterBySeason(seasons)
// Filters the current array of filtered episodes by season
// Argument can be number or array of numbers
// TODO: Write function to call in filterBySeason and filterByYear
replayEpisodeCollection.filterBySeason = function (seasonsToFilter) {
    // Make sure that each value is a number
    seasonsToFilter.forEach(function (value, index, arr) {
        // If value is NOT a number, remove array element
        if (isNaN(value)) arr.splice(index, 1);
        // Else If value is string (and is a number), convert to number type
        else if (typeof value === 'string')
            arr[index] = parseInt(value, 10);
    });

    if (typeof seasonsToFilter == 'number') {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => (episode.getReplaySeason()[0] === seasonsToFilter)
        );
    } else if (Array.isArray(seasonsToFilter)) {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => seasonsToFilter.includes(episode.getReplaySeason()[0])
        );
    }
};

// filterByYear(yearsToFilter)
replayEpisodeCollection.filterByYear = function (yearsToFilter) {
    // Make sure that each value is a number
    yearsToFilter.forEach(function (value, index, arr) {
        // If value is NOT a number, remove array element
        if (isNaN(value)) arr.splice(index, 1);
        else { // Else value is a number
            // If value is string type, convert to number type
            if (typeof value === 'string')
                arr[index] = parseInt(value, 10);
        }
    });

    if (typeof yearsToFilter == 'number') {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => (episode.airdate.getFullYear() === yearsToFilter)
        );
    } else if (Array.isArray(yearsToFilter)) {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => yearsToFilter.includes(episode.airdate.getFullYear())
        );
    }
};

// filterByCrew(crewToFilter)
// crewToFilter - array of strings
replayEpisodeCollection.filterByCrew = function (crewToFilter) {
    // Variables
    let crewPerEpisode = [];
    let isMatched = false;
    // Filter by crew
    this.selectedEpisodes = this.selectedEpisodes.filter(function (episode) {
        // If no host and no featuring property, keep episode in list
        if (episode.host === undefined && episode.featuring === undefined)
            return true;

        // Assign crewPerEpisode
        crewPerEpisode = episode.host.concat(episode.featuring);

        // For each crew member in the episode
        // If crew member is in crewToFilter, remove episode from list
        isMatched = false;
        crewPerEpisode.some(function (name) {
            if (crewToFilter.includes(name)) {
                isMatched = true;
                return true;
            }
        });
        // Return true if match was found
        return isMatched;
    });
};

// filterBySegment()
replayEpisodeCollection.filterBySegment = function (segmentsToFilter) {
    // Variables
    let isMatched;
    this.selectedEpisodes = this.selectedEpisodes.filter(function (episode) {
        isMatched = false;
        // Middle Segment
        if (episode.middleSegment !== undefined || episode.middleSegmentContent !== undefined) {
            if (episode.middleSegment !== undefined)
                isMatched = segmentsToFilter.includes(episode.middleSegment);
            else { // Else episode has middleSegmentContent property
                isMatched = segmentsToFilter.includes(
                    (episode.middleSegmentContent.endsWith('Ad')) ?
                        'Ad' :
                        episode.middleSegmentContent
                );
            }
        }

        // Second Segment if NOT already matched
        if (!isMatched && episode.secondSegment !== undefined)
            isMatched = segmentsToFilter.includes(episode.secondSegment);

        return isMatched;
    });
};

// populateFilterForm()
replayEpisodeCollection.populateFilterForm = function () {
    // Variables
    let parentElement;
    let i = 0;
    let sortedObjArr = [];
    const currentYear = new Date().getFullYear();

    // Year
    parentElement = document.querySelector('#year-field ul');
    for (i = 2010; i <= currentYear; i++) {
        parentElement.appendChild(document.createElement('li'))
            .append(this.createFieldsetLabel('year', i.toString()));
    }

    // GI Crew
    parentElement = document.querySelector('#gi-crew-field ul');
    // Create array of names for each gi crew filtered by more than 1 appearance 
    // and sort alphabetically
    sortedObjArr = getGICrew()[2].filter( personObj => (personObj.count > 1) );
    sortedObjArr.sort((firstPerson, secondPerson) => {
        return (firstPerson.name < secondPerson.name) ? -1 :
            (firstPerson.name > secondPerson.name) ? 1 :
                0;
    });
    for (const person of sortedObjArr) {
        parentElement.appendChild(document.createElement('li'))
            .append(this.createFieldsetLabel('giCrew', person.name, `${person.name} (${person.count})`));
    }
    // Segment
    parentElement = document.querySelector('#segment-field ul');
    // Create array of names for each segments filtered by more than 1 appearance 
    // and sort alphabetically
    sortedObjArr = getSegments().filter( personObj => (personObj.count > 1) );
    sortedObjArr.sort((first, second) => {
        return (ReplayEpisode.getSegmentTitle(first.name) < ReplayEpisode.getSegmentTitle(second.name)) ? -1 :
            (ReplayEpisode.getSegmentTitle(first.name) > ReplayEpisode.getSegmentTitle(second.name)) ? 1 :
                0;
    });
    for (const segment of sortedObjArr) {
        parentElement.appendChild(document.createElement('li'))
            .append(this.createFieldsetLabel(
                'segment',
                segment.name,
                `${ReplayEpisode.getSegmentTitle(segment.name)} (${segment.count})`
            ));
    }
};

// createFieldsetLabel(nameStr, valueStr, labelStr)
replayEpisodeCollection.createFieldsetLabel = function (nameStr, valueStr, labelStr) {
    // Variables
    let labelElement;
    let inputElement;

    // If labelStr is undefined, assign same value as valueStr
    if (typeof labelStr === "undefined")
        labelStr = valueStr;

    // Create input element
    inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'checkbox');
    inputElement.setAttribute('name', nameStr);
    inputElement.setAttribute('value', valueStr);
    //inputElement.defaultChecked = true;
    // Append input element to label
    labelElement = ReplayEpisode.createElementAdv('label', undefined, labelStr);
    labelElement.appendChild(inputElement);
    // Append span element for checkmark
    labelElement.appendChild(ReplayEpisode.createElementAdv('span', 'checkmark'));
    // Return label element to append to the fieldset
    return labelElement;
};

// ------------------------------------
// --------------- Sort ---------------
// ------------------------------------

// sortByEvent(event)
// Event Listener
// TODO - Can remove some const variables by putting them directly into
// the later assignment but may have to use them like sortTypeSelect
// TODO - Could combine two switchs in case 'sort-type'
replayEpisodeCollection.setSortByEvent = function (event) {
    switch (event.currentTarget.name) {
        // Sort Type
        case 'sort-type':
            // Assign sortType
            this.sortType = event.currentTarget.value;
            // Update main HTML element to display new sorted episodes
            this.updateSelectedEpisodes();
            break;

        // Sort Direction
        case 'sort-direction':
            // Assign ascending bool
            if (event.currentTarget.value == 'ascending') {
                if (!this.ascending) {
                    this.ascending = true;
                    // Update main HTML element to display new sorted episodes
                    this.updateSelectedEpisodes();
                }
            } else { // Else descending is selected
                if (this.ascending) {
                    this.ascending = false;
                    // Update main HTML element to display new sorted episodes
                    this.updateSelectedEpisodes();
                }
            }
            break;

        // Max Displayed
        case 'max-displayed':
            // Max Displayed Episodes - Assign this.maxDisplayedEpisodes
            this.maxDisplayedEpisodes = event.currentTarget.value;
            // Reset current page displayed
            this.currentPageDisplayed = 1;
            // Update main HTML element to display new sorted episodes
            this.updateDisplayedEpisodes();
            break;

        // Default
        default:
    }
};

// sortByType
// Sort selected episodes by sort type and ascending bool
replayEpisodeCollection.sortByType = function () {
    // If list was shuffled sort type is NOT sort.none, 
    // assign isShuffled to false
    if (this.isShuffled && this.sortType !== sort.none)
        this.isShuffled = false;

    // Sort selectedEpisodes by sortType in ascending order
    switch (this.sortType) {
        // None (No sort such as for shuffled list)
        case sort.none: break;
        // Video Length/Duration
        case sort.length:
            this.selectedEpisodes.sort((first, second) => first.videoLengthInSeconds - second.videoLengthInSeconds);
            break;
        // Episode Number (Special episodes separate from official)
        case sort.number:
            this.selectedEpisodes.sort((first, second) => first.episodeNumber - second.episodeNumber);
            break;
        // Views
        case sort.views:
            this.selectedEpisodes.sort((first, second) => {
                if (first.views !== undefined && second.views !== undefined)
                    return first.views - second.views;
                else if (first.views !== undefined)
                    return 1;
                else if (second.views !== undefined)
                    return -1;
            });
            break;
        // Likes
        case sort.likes:
            this.selectedEpisodes.sort((first, second) => {
                if (first.likes !== undefined && second.likes !== undefined)
                    return first.likes - second.likes;
                else if (first.likes !== undefined)
                    return 1;
                else if (second.likes !== undefined)
                    return -1;
            });
            break;
        // Like Ratio
        case sort.likeRatio:
            this.selectedEpisodes.sort((first, second) => {
                if (first.likes !== undefined && second.likes !== undefined)
                    return first.likeRatio - second.likeRatio;
                else if (first.likes !== undefined)
                    return 1;
                else if (second.likes !== undefined)
                    return -1;
            });
            break;
        // Dislikes
        case sort.dislikes:
            this.selectedEpisodes.sort((first, second) => {
                if (first.dislikes !== undefined && second.dislikes !== undefined)
                    return first.dislikes - second.dislikes;
                else if (first.dislikes !== undefined)
                    return 1;
                else if (second.dislikes !== undefined)
                    return -1;
            });
            break;
        // Air Date (Default)
        case sort.airdate:
        default:
            this.selectedEpisodes.sort((first, second) => first.airdate - second.airdate);
    }

    // Reverse array if this.ascending is false and sort type is NOT sort.none
    if (!this.ascending && this.sortType !== sort.none)
        this.selectedEpisodes.reverse();
};

// ----------------------------------------
// ---------- Reset Episode List ----------
// ----------------------------------------

replayEpisodeCollection.resetSelectedEpisodes = function () {
    // Fill selectedEpisodes with references to replayEpisodeObjectArray objects
    this.selectedEpisodes = this.replayEpisodeObjectArray.slice();

    // Reset sort/filter/search
    // Change HTML select element values to default
    this.sortType = sort.airdate;
    this.ascending = false;
    this.searchInputElement.value = '';
    this.filterFormElement.reset();

    this.updateSelectedEpisodes();
};

// ------------------------------------
// ---------- Page Selection ----------
// ------------------------------------

replayEpisodeCollection.createNumberedButton = function (buttonValue, buttonStr, scrollToTop = false) {
    // Variables
    let tempNode;
    // If buttonStr is undefined, assign same value as buttonValue
    if (typeof buttonStr === 'undefined')
        buttonStr = buttonValue;
    // Create button
    tempNode = (buttonValue == this.currentPageDisplayed)
        ? ReplayEpisode.createElementAdv('button', 'active custom-button', buttonStr)
        : ReplayEpisode.createElementAdv('button', 'custom-button', buttonStr);
    tempNode.setAttribute('type', 'button');
    tempNode.setAttribute('value', buttonValue);
    tempNode.addEventListener("click", function () {
        this.setPageNumber(buttonValue, scrollToTop);
    }.bind(this), false);
    // Return button
    return tempNode;
};

replayEpisodeCollection.updatePageNumberAdv = function (positionStr, scrollToTop = false) {
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

// TODO: 
replayEpisodeCollection.setPageNumber = function (input, scrollToTop = false) {
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
        this.updateDisplayedEpisodes();
        // Scroll to top
        if (scrollToTop)
            document.getElementById('top-page').scrollIntoView({behavior: "smooth"});
    }
};

// ------------------------------------------------
// ---------- Video Player - YouTube API ----------
// ------------------------------------------------

// cueEpisodePlaylist(replayEpisode)
replayEpisodeCollection.cueEpisodePlaylist = function (replayEpisode) {
    if (!this.videoPlayer) {
        console.error('No reference to video player');
        return;
    }

    // If argument is undefined, cue playlist of first 200 selected episodes
    if (typeof replayEpisode === 'undefined') {
        //console.log(`CuePlaylist: First 200 videos cued`);
        if (this.selectedEpisodes.length) {
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(0, 200));
            //this.currentEpisode = this.getEpisodeByVideoID(this.selectedVideoIdArray[0]);
        } else { // Else no selected episodes, cue Replay highlights video
            this.videoPlayer.cueVideoById('0ZtEkX8m6yg');
            this.removeCurrentEpisodeInfo();
            //this.currentEpisode = undefined;
        }
    } else { // Cue playlist starting with episodeIndex
        const episodeIndex = this.selectedVideoIdArray.indexOf(replayEpisode.youtubeVideoID);
        //console.log(`CuePlaylist: episodeIndex: ${episodeIndex}\nepisodeNumber: ${replayEpisode.episodeNumber}`);
        // Check for errors
        if (episodeIndex === -1) {
            console.error('Requested video is NOT in selected episodes array');
            return;
        }
        /* Variables:
         * playlistStartIndex = 0
         * If more than 200 episodes in selected episodes
         *     If episodeIndex is within first 200
         *         cuePlaylist(slice(0, 200), episodeIndex)
         *     Else If episodeIndex is within last 200
         *         playlistStartIndex = selectedVideoIdArray.length - 201;
         *         cuePlaylist(slice(-200), episodeIndex - playlistStartIndex)
         *     Else episodeIndex larger than 200, and more than 400 total
         *         playlistStartIndex = 200 * Math.floor(episodeIndex / 200)
         *         cuePlaylist(slice(playlistStartIndex, playlistStartIndex + 200), episodeIndex - playlistStartIndex)
         * Else less than or equal to 200 episodes in selected episodes
         *     cuePlaylist(selectedVideoIdArray, episodeIndex)
        */
        let playlistStartIndex;
        // If more than 200 episodes in selected video array
        if (this.selectedVideoIdArray.length > 200) {
            // If episodeIndex is within first 200 on selected video array
            if (episodeIndex < 200)
                playlistStartIndex = 0;
            // Else If episodeIndex is within last 200 (more than 200 total videos)
            // 350 total(0-349) -- 350-200=150 -- 150-349(200 total)
            else if (episodeIndex >= this.selectedVideoIdArray.length - 200)
                playlistStartIndex = this.selectedVideoIdArray.length - 200;
            // Else (episodeIndex is larger than 200, and more than 400 total videos)
            else
                playlistStartIndex = 200 * Math.floor(episodeIndex / 200);
            // Cue playlist using playlistStartIndex
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(
                playlistStartIndex,
                playlistStartIndex + 200
            ), episodeIndex - playlistStartIndex);
        } else { // Else 200 or less episodes in selected episodes
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray, episodeIndex);
        }
        // Assign new currently playing episode
        //this.currentEpisode = replayEpisode;
    }
};

// Event functions

// onPlayerReady(event)
// The API will call this function when the video player is ready.
replayEpisodeCollection.onPlayerReady = function (event) {
    this.videoPlayer.addEventListener('onStateChange',
        this.onPlayerStateChange.bind(replayEpisodeCollection));
    console.log('Video Player is ready');
};

// onPlayerStateChange(event)
// The API calls this function when the player's state changes.
replayEpisodeCollection.onPlayerStateChange = function (event) {
    let str = 'YT Player State: ';
    switch (event.data) {
        case -1:
            str += 'Unstarted';
            if (this.videoPlayer.getPlaylist()) {
                this.currentEpisode = this.getEpisodeByVideoID(this.videoPlayer.getPlaylist()[this.videoPlayer.getPlaylistIndex()]);
                if (this.getPageOfEpisode(this.currentEpisode) !== this.currentPageDisplayed) {
                    this.setPageNumber(this.getPageOfEpisode(this.currentEpisode));
                }
                //str += `\nPlaylist Index: ${this.videoPlayer.getPlaylistIndex()} - Episode At Index: ${this.currentEpisode.episodeNumber}`;
            }
            break;
        case 0:
            str += 'Ended';
            if (this.videoPlayer.getPlaylist()) {
                str += `\nPlaylist Index: ${this.videoPlayer.getPlaylistIndex()}`;
                const lastEpisodeVideoId = this.videoPlayer.getPlaylist()[
                    this.videoPlayer.getPlaylist().length - 1
                ];
                // If current episode is last episode in youtube playlist
                if (this.currentEpisode.youtubeVideoID === lastEpisodeVideoId) {
                    // Cue next 200 episodes
                    let episodeIndex = this.selectedVideoIdArray.indexOf(this.currentEpisode.youtubeVideoID);
                    this.cueEpisodePlaylist(this.getEpisodeByVideoID(this.selectedVideoIdArray[++episodeIndex]));
                    //console.log(`Playlist ended with index: ${episodeIndex}`);
                }
            }
            break;
        case 1: str += 'Playing'; break;
        case 2: str += 'Paused'; break;
        case 3: str += 'Buffering'; break;
        case 5: str += 'Cued'; break;
        default:
    }
    //console.log(str);
    /*
    if (event.data == YT.PlayerState.PLAYING && !done) {
        // done = true;
    } else if (event.data == YT.PlayerState.ENDED) {
        // location.reload();
    }
    */
};

// onPlayerError(event)
replayEpisodeCollection.onPlayerError = function (event) {
    console.error(`Video Player onError: ${event.data}`);
};

// playEpisode(replayEpisode)
replayEpisodeCollection.playEpisode = function (replayEpisode) {
    // Scroll to top of video player
    this.videoPlayerContainer.scrollIntoView();
    // Cue playlist
    this.cueEpisodePlaylist(replayEpisode);
};
/*
// playNextEpisode()
replayEpisodeCollection.playNextEpisode = function () {

};

// playPrevEpisode()
replayEpisodeCollection.playPrevEpisode = function () {

};
*/

// -------------------------------------
// ---------- Current Episode ----------
// -------------------------------------

// removeCurrentEpisodeInfo()
replayEpisodeCollection.removeCurrentEpisodeInfo = function () {
    // Remove episode header
    while (this.currentEpisodeHeaderElement.firstChild) {
        this.currentEpisodeHeaderElement
            .removeChild(this.currentEpisodeHeaderElement.firstChild);
    }
    // Remove episode info
    while (this.currentEpisodeInfoElement.firstChild) {
        this.currentEpisodeInfoElement
            .removeChild(this.currentEpisodeInfoElement.firstChild);
    }
};

// addCurrentEpisodeInfo()
replayEpisodeCollection.addCurrentEpisodeInfo = function (keepOpen = false) {
    const currentEpisodeSection = this.currentEpisode.episodeSection.cloneNode(true);
    /*
    // If episode info element is expanded, close
    if (this.currentEpisodeInfoElement.style.maxHeight && !keepOpen) {
        this.currentEpisodeInfoElement.classList.remove('active');
        this.currentEpisodeInfoElement.style.maxHeight = null;
    }
    */
    // Add episode header
    this.currentEpisodeHeaderElement
        .appendChild(currentEpisodeSection.querySelector('.episodeHeader'));
    // Move views-likes-container to episodeDetails
    currentEpisodeSection.querySelector('.episodeDetails')
        .appendChild(currentEpisodeSection.querySelector('.views-likes-container'));
    // Add episode info below
    this.currentEpisodeInfoElement.appendChild(currentEpisodeSection);
    /*
    // Change size of current episode info expanding container
    if (this.currentEpisodeInfoElement.style.maxHeight) {
        this.currentEpisodeInfoElement.style.maxHeight = this.currentEpisodeInfoElement.scrollHeight + 'px';
    }
    */
};

// toggleCurrentEpisodeInfo()
replayEpisodeCollection.toggleCurrentEpisodeInfo = function () {
    if (this.currentEpisodeInfoElement.style.maxHeight) {
        this.currentEpisodeInfoElement.classList.remove('active');
        this.currentEpisodeInfoToggleButton.classList.remove('active');
        this.currentEpisodeInfoElement.style.maxHeight = null;
        this.currentEpisodeInfoToggleButton.textContent = 'Show Episode Details';
    } else {
        this.currentEpisodeInfoElement.classList.add('active');
        this.currentEpisodeInfoToggleButton.classList.add('active');
        this.currentEpisodeInfoElement.style.maxHeight = this.currentEpisodeInfoElement.scrollHeight + 'px';
        this.currentEpisodeInfoToggleButton.textContent = 'Hide Episode Details';
    }
}

// -------------------------------------------
// ---------- Scroll Top Adjustment ----------
// -------------------------------------------

// TODO: When current episode info is added below video player, the 
// different element height of episode section auto adjusts the scroll
// of the page. Create function to adjust scrollTop when new episode
// is added to current episode info.

// --------------------------
// ---------- Misc ----------
// --------------------------

// getEpisodeByNumber(num)
// TODO: NOT being used
// Binary Search function since replayEpisodeObjectArray is sorted
// by episode number in descending order
replayEpisodeCollection.getEpisodeByNumber = function (num) {
    let midIndex,
        leftIndex = 0,
        rightIndex = this.replayEpisodeObjectArray.length - 1;
    while (leftIndex <= rightIndex) {
        midIndex = Math.ceil(leftIndex + (rightIndex - leftIndex) / 2);
        // Check if num matches episode number at midIndex
        if (this.replayEpisodeObjectArray[midIndex].episodeNumber == num)
            return this.replayEpisodeObjectArray[midIndex];
        // If num is greater than episode number, ignore right half
        if (this.replayEpisodeObjectArray[midIndex].episodeNumber < num)
            rightIndex = midIndex - 1;
        // Else num is smaller than episode number, ignore left half
        else
            leftIndex = midIndex + 1;
    }
    // If for loop finishes without return, could NOT find episode,
    return undefined
    console.error(`Could NOT find episode with number: ${num}`);
};

// getEpisodeByVideoID(youtubeVideoID)
replayEpisodeCollection.getEpisodeByVideoID = function (youtubeVideoID) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.youtubeVideoID !== undefined && episode.youtubeVideoID === youtubeVideoID)
            return episode;
    }
    // If for loop finishes without return, could NOT find episode, return undefined
    console.error(`Could NOT find episode with youtubeVideoID: ${youtubeVideoID}`);
};

// getPageOfEpisode(replayEpisode)
// Search for index of replayEpisode in selectedEpisodes and calculate page number
// with maxDisplayedEpisodes
replayEpisodeCollection.getPageOfEpisode = function (replayEpisode) {
    let episodeIndexInSelectedEpisodes = this.selectedEpisodes.indexOf(replayEpisode);
    if (episodeIndexInSelectedEpisodes === -1)
        console.error('Cannot find episode');
    else
        return Math.ceil(++episodeIndexInSelectedEpisodes / this.maxDisplayedEpisodes);
};

// ---------------------------
// ---------- Stats ----------
// ---------------------------

// populateStats()
replayEpisodeCollection.populateStats = function () {
    // Total Time
    this.showTotalTime();
    // Total Views, Total Likes
    let totalViews = 0, totalLikes = 0, totalDislikes = 0;
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.views !== undefined)
            totalViews += episode.views;
        if (episode.likes !== undefined)
            totalLikes += episode.likes;
        if (episode.dislikes !== undefined)
            totalDislikes += episode.dislikes;
    }
    document.getElementById('stats-total-views').insertAdjacentText('beforeend', ReplayEpisode.addCommasToNumber(totalViews));
    document.getElementById('stats-total-likes').insertAdjacentText(
        'beforeend',
        `${ReplayEpisode.addCommasToNumber(totalLikes)} (${((totalLikes * 100) / (totalLikes + totalDislikes)).toFixed(1)}%)`
    );
    // Games Played (add 50 for games not listed from special episodes ex. Commodore Special)
    document.getElementById('stats-games-played').insertAdjacentText(
        'beforeend',
        `${ReplayEpisode.addCommasToNumber(getGamesPlayed().length + 50)} (estimate)`
    );
};

// showTotalTime()
// TODO: Static utility function with parameter totalTimeSeconds
// TODO: OR getter function
replayEpisodeCollection.showTotalTime = function () {
    const days = Math.floor(this.totalTimeSeconds / 86400)
    const hours = Math.floor((this.totalTimeSeconds - days * 86400) / 3600);
    const minutes = Math.floor((this.totalTimeSeconds - days * 86400 - hours * 3600) / 60);
    const seconds = this.totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
    const totalTimeStr = `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds! (Total seconds: ${ReplayEpisode.addCommasToNumber(this.totalTimeSeconds)})`;

    document.getElementById('stats-total-time').insertAdjacentText('beforeend', totalTimeStr);
};

// --------------------------------
// ---------- Debug/Flag ----------
// --------------------------------

// Find episode numbers with no provided YouTube URL
function findEpisodesWithNoYouTubeURL(replayEpisodes) {
    let episodesFlagged = [];
    for (const episode of replayEpisodes) {
        if (!episode.youtubeVideoID !== undefined
            || !episode.youtubeVideoID)
            episodesFlagged.push(episode.episodeNumber);
    }
    console.log(episodesFlagged);
}

// -----------------------------------------------
// ---------- Get Crew, Segments, Games ----------
// -----------------------------------------------

// Get list of host/featuring with no duplicates
function getGICrew() {
    let tempHostArr = [];
    let tempGuestArr = [];
    let tempTotalAppearancesArr = [];
    let noHostEpisodes = [];
    let noGuestEpisodes = [];
    let isIncluded;

    function addCrew(nameToAdd, personArr) {
        // Check if nameToAdd is already in personArr
        isIncluded = false;
        for (const person of personArr) {
            // If person matches nameToAdd, increment count
            if (person.name == nameToAdd) {
                isIncluded = true;
                person.count++;
                break;
            }
        }
        // If nameToAdd is NOT included, add to list
        if (!isIncluded) {
            personArr.push({ name: nameToAdd, count: 1 });
        }
    }

    for (const episode of replayEpisodeCollection.replayEpisodeObjectArray) {
        // Host
        if (episode.host !== undefined) {
            // For each host in episode host array
            for (const host of episode.host)
                addCrew(host, tempHostArr);
        } else // No hosts property, add flagged episode
            noHostEpisodes.push(episode.episodeNumber);

        // Featuring
        if (episode.featuring !== undefined) {
            // For each guest in the episode featuring array
            for (const guest of episode.featuring)
                addCrew(guest, tempGuestArr);
        } else // No featuring property, add flagged episode
            noGuestEpisodes.push(episode.episodeNumber);
    }

    // Combine host/guest to get total episode appearances by GI crew
    // Initialize total appearances array to guest array
    tempTotalAppearancesArr = tempGuestArr.slice();
    // For each host in host array
    for (const hostObj of tempHostArr) {
        isIncluded = false;
        for (const totalAppearanceObj of tempTotalAppearancesArr) {
            // If total appearances name matches the host name, add count, break to get next host
            if (totalAppearanceObj.name === hostObj.name) {
                totalAppearanceObj.count += hostObj.count;
                isIncluded = true;
                break;
            }
        }
        // If NOT included, push to total appearances array
        if (!isIncluded) tempTotalAppearancesArr.push(hostObj);
    }

    // Sort arrays by count
    tempHostArr.sort((first, second) => second.count - first.count);
    tempGuestArr.sort((first, second) => second.count - first.count);
    tempTotalAppearancesArr.sort((first, second) => second.count - first.count);

    return [tempHostArr, tempGuestArr, tempTotalAppearancesArr, noHostEpisodes, noGuestEpisodes];
}
/*
// Get all extra headings from details property
function getEpisodeHeadings() {
    let extraHeadingsArr = [];
    let isIncluded = false;
    replayEpisodeCollection.replayEpisodeObjectArray.forEach(function (episode) {
        if (episode.hasOwnProperty('otherHeadingsObj')) {
            for (const key in episode.otherHeadingsObj) {
                // If key is already on list, increment count
                isIncluded = false;
                for (const extraHeading of extraHeadingsArr) {
                    if (extraHeading.heading === key) {
                        isIncluded = true;
                        extraHeading.count++;
                        break;
                    }
                }
                // If NOT included, add heading to list
                if (!isIncluded) {
                    extraHeadingsArr.push({
                        heading: key,
                        count: 1
                    });
                }
            }
        }
    });

    // Sort array by heading count in descending order
    extraHeadingsArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return extraHeadingsArr;
}
*/
function getSegments() {
    let segmentArr = [];
    let isIncluded;
    let tempSegment;
    function addSegment(segmentToAdd) {
        isIncluded = false;
        for (const segment of segmentArr) {
            if (segment.name === segmentToAdd) {
                isIncluded = true;
                segment.count++;
                break;
            }
        }
        // If NOT included, add to list
        if (!isIncluded) {
            segmentArr.push({
                name: segmentToAdd,
                count: 1
            });
        }
    }
    for (const episode of replayEpisodeCollection.replayEpisodeObjectArray) {
        // Middle Segment
        if (episode.middleSegment !== undefined || episode.middleSegmentContent !== undefined) {
            tempSegment = episode.middleSegment || episode.middleSegmentContent;
            // Check if Ad (string.endsWith())
            if (tempSegment.endsWith('Ad'))
                tempSegment = 'Ad';
            addSegment(tempSegment);
        }
        // Second Segment
        if (episode.secondSegment !== undefined)
            addSegment(episode.secondSegment);
    }

    // Sort array by count in descending order
    segmentArr.sort((first, second) => second.count - first.count);

    /*
    // Convert segment names from abbreviation
    for (const segment of segmentArr)
        segment.name = ReplayEpisode.getSegmentTitle(segment.name);
    */

    return segmentArr;
}

function getGamesPlayed(sortAlphabetical = false) {
    let gameArr = [];
    let isIncluded;
    function checkGame(game) {
        isIncluded = false;
        for (const tempGame of gameArr) {
            if (typeof game === 'object' && tempGame.title === game.title ||
                typeof game === 'string' && tempGame.title === game) {
                isIncluded = true;
                tempGame.count++;
                break;
            }
        }
        // If NOT included, add to list
        if (!isIncluded) {
            gameArr.push({
                title: (typeof game === 'object') ? game.title : game,
                count: 1
            });
        }
    }
    for (const episode of replayEpisodeCollection.replayEpisodeObjectArray) {
        // Main Segment
        if (episode.mainSegmentGamesAdv !== undefined) {
            for (const game of episode.mainSegmentGamesAdv) {
                checkGame(game);
            }
        }
        // Second Segment
        if (episode.secondSegmentGames !== undefined) {
            for (const game of episode.secondSegmentGames) {
                checkGame(game);
            }
        }
        // Middle Segment
        if (episode.middleSegmentContent !== undefined) {
            const ignoreMiddleSegments = ['A Poor Retelling of Gaming History', 'Reflections', 'Embarassing Moments'];
            const ignoreMiddleSegmentsContentEndingWith = [' Ad', ' Reel', ' Skit', ' Buttz', ' Pamphlet'];
            let isGame = true;
            // Check middleSegment type
            if (episode.middleSegment !== undefined
                && ignoreMiddleSegments.includes(episode.middleSegment))
                isGame = false;
            // Check end of middleSegmentContent
            if (isGame && ignoreMiddleSegmentsContentEndingWith
                .some(str => episode.middleSegmentContent.endsWith(str)))
                isGame = false;
            // If isGame, add to game list
            if (isGame)
                checkGame(episode.middleSegmentContent);
        }
    }

    // Sort
    if (sortAlphabetical) { // Sort array by alphabetical order
        gameArr.sort((first, second) => (first.title < second.title) ? -1 :
            (first.title > second.title) ? 1 :
                0
        );
    } else { // Sort array by count in descending order
        gameArr.sort((first, second) => second.count - first.count);
    }

    return gameArr;
}