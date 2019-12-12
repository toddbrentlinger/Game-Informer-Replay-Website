// Filter enum
const filter = Object.freeze({
    none: 0,
    text: 1,
    season: 2,
    host: 3,
    featuring: 4,
    segment: 5,
    year: 6,
    gamesystem: 7,
    releaseDateYear: 8
});

// Sort enum
const sort = Object.freeze({
    none: 0,
    number: 1,
    airdate: 2,
    views: 3,
    likes: 4
});

// Object: Collection of all replay episodes
var replayEpisodeCollection = {
    // Properties
    totalTimeSeconds: 0,
    mainElement: document.getElementById('main'),

    sortTypeElement: document.getElementById('sort-type-select'),
    sortDirectionElement: document.getElementById('sort-direction-select'),

    maxDisplayedElement: document.getElementById('max-displayed-select'),

    searchInputElement: document.querySelector('#search-container input[type = "search"]'),

    currentDisplayedEpisodesMessageElement: document.getElementById('number-displayed-container'),

    replayEpisodeObjectArray: [],

    // Better if array of number as indices of base episode array and
    // then get the episode object by index instead of creating separate
    // array of ReplayEpisode objects
    selectedEpisodes: [],

    // Max Displayed Episdoes - Increments [10, 25, 50, 100, 200]
    _maxDisplayedEpisodes: window.sessionStorage.getItem('maxDisplayedEpisodes') || 50,
    get maxDisplayedEpisodes() { return this._maxDisplayedEpisodes; },
    set maxDisplayedEpisodes(num) {
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

    pageDisplayed: 1, // Page number of selected episodes list depending on maxDisplayedEpisodes

    // Sort
    _sortType: window.sessionStorage.getItem('sortType') || sort.airdate,
    get sortType() { return this._sortType; },
    set sortType(input) {
        console.log('sortType is set equal to: ' + input + '(' + typeof input + ')');
        let tempSortType; // Initialized to undefined
        // If arg is a string type, compare to properties of sort enum
        if (typeof input === 'string') {
            console.log('sortType input is string');
            switch (input) {
                case 'airdate': tempSortType = sort.airdate; break;
                case 'most-viewed': tempSortType = sort.views; break;
                case 'most-liked': tempSortType = sort.likes; break;
                case 'none': tempSortType = sort.none; break;
                case 'number':
                default: tempSortType = sort.number;
            }
        }
        // Else If arg is a number type, compare to values of sort enum
        else if (typeof input === 'number') {
            console.log('sortType input is number');
            for (const property in sort) {
                if (sort[property] == input) {
                    tempSortType = input;
                    break;
                }
            }
        }
        // If tempSortType is still undefined, do NOT assign sortType and throw error
        if (typeof tempSortType === 'undefined') {
            console.log('Could NOT assign sortType to value: ' + input);
            this._sortType = sort.number;
        }
        else // Else assign tempSortType to sortType
            this._sortType = tempSortType;

        // Assign to local/session storage
        window.sessionStorage.setItem('sortType', this.sortType);

        // Check that HTML select element value is correct
        switch (this.sortType) {
            case sort.airdate: this.sortTypeElement.value = 'airdate'; break;
            case sort.views: this.sortTypeElement.value = 'most-viewed'; break;
            case sort.likes: this.sortTypeElement.value = 'most-liked'; break;
            case sort.number:
            case sort.none:
            default: this.sortTypeElement.value = 'none';
        }
    },

    // Bool to sort in ascending/descending order
    _ascending: (window.sessionStorage.getItem('ascending') === 'false' ? false : true)
        || false,
    get ascending() { return this._ascending; },
    set ascending(bool) {
        // If bool is string, convert to bool
        if (typeof bool === 'string')
            this._ascending = (bool == 'false') ? false : true;
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
    filter: filter.none,
    isShuffled: false
};

// -----------------------------
// ---------- Methods ----------
// -----------------------------
 
// init(replayEpisodeArray)
replayEpisodeCollection.init = function (replayEpisodeArray) {
    // Initialize sort/filter properties based on selected input elements
    //this.ascending = this.sortDirectionElement.value == 'ascending';
    //this.maxDisplayedEpisodes = this.maxDisplayedElement.value;
    console.log(this.maxDisplayedElement.value + '__' + this.sortDirectionElement.value);
    this.sortTypeElement.value = this.getSortTypeStringValue();
    this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    this.maxDisplayedElement.value = this.maxDisplayedEpisodes;
    console.log(this.maxDisplayedElement.value + '__' + this.sortDirectionElement.value);

    // Clone episode section template to use for episode data
    // Initialize each replay episode object by sending this template
    // as an argument to ReplayEpisode constructor
    this.episodeTemplate = document.querySelector('section.episode')
        .cloneNode(true);

    // Populate replay episode object array in episode collection object
    this.populateEpisodeObjectArray(replayEpisodeArray);

    // Initialize selected episodes array to same order of base episode object array
    this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

    // Sort selected episodes
    this.sortByType();

    // Populate main element with initialized selected episodes array
    this.updateDisplayedEpisodes();
};

// populateEpisodeObjectArray()
replayEpisodeCollection.populateEpisodeObjectArray = function (replayEpisodeArray) {
    for (const replayEpisode of replayEpisodeArray) {
        // Create ReplayEpisode object
        const replayEpisodeObject = new ReplayEpisode(replayEpisode, this.episodeTemplate);
        // Append episode object to array
        this.replayEpisodeObjectArray.push(replayEpisodeObject);

        // Increase total time of episodes
        let timeArr = replayEpisodeObject.videoLength.split(':');
        timeArr.forEach((item, index, arr) => { arr[index] = parseInt(item, 10);});
        this.totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }
    // Success Message
    console.log('Finished replay episode assignment');
};
 
// clearMainElement()
replayEpisodeCollection.clearMainElement = function () {
    let currentEpisodeElements = this.mainElement.getElementsByClassName('episode');
    // Make sure there are no episode elements already in place
    if (typeof currentEpisodeElements != 'undefined') {
        while (currentEpisodeElements.length > 0)
            this.mainElement.removeChild(currentEpisodeElements[currentEpisodeElements.length - 1]);
    }
}

/* updateDisplayedEpisodes(begin, end)
 * Populate main HTML element with episode HTML from displayed episodes array
 * A negative index can be used, indicating an offset from the end of the sequence. 
 * If end is omitted, extracts through the end of the sequence(arr.length).
 * If end is greater than the length of the sequence, extracts through to the end of the sequence(arr.length).
*/
replayEpisodeCollection.updateDisplayedEpisodes = function (begin = 0, end = this.maxDisplayedEpisodes) {
    // Variables
    const arrLength = this.selectedEpisodes.length;

    // Clear main element of episode sections
    this.clearMainElement();

    // Check start argument
    if (begin < 0) begin = arrLength - begin;

    // Check end argument
    if (typeof end == 'undefined' || end > arrLength || !end)
        end = arrLength;
    else if (end < 0)
        end = arrLength - end;

    // Fill main element with selected episodes array
    for (let i = begin; i < end; i++)
        this.mainElement.appendChild(this.selectedEpisodes[i].episodeSection);

    // Change current number of displayed episodes message string
    this.currentDisplayedEpisodesMessageElement.innerHTML = 'Displaying '
        + ((this.maxDisplayedEpisodes > 0)
        ? Math.min(this.maxDisplayedEpisodes, this.selectedEpisodes.length)
        : this.selectedEpisodes.length)
        + ' out of ' + this.selectedEpisodes.length + ' replay episodes';
};

// showTotalTime()
replayEpisodeCollection.showTotalTime = function () {
    // Show total time of episodes
    let seconds, minutes, hours, days = 0;
    days = Math.floor(this.totalTimeSeconds / 86400)
    hours = Math.floor((this.totalTimeSeconds - days * 86400) / 3600);
    minutes = Math.floor((this.totalTimeSeconds - days * 86400 - hours * 3600) / 60);
    seconds = this.totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
    let totalTimePara = document.createElement('p');
    totalTimePara.textContent = "Total length of all replay episodes: "
        + days + " days, " + hours + " hours, " + minutes + " minutes, "
        + seconds + " seconds!";
    totalTimePara.textContent += "\nTotal seconds: " + this.totalTimeSeconds;
    this.mainElement.appendChild(totalTimePara);
};

// getEpisodeByNumber(num)
replayEpisodeCollection.getEpisodeByNumber = function (num) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.episodeNumber == num)
            return episode;
    }
    // If for loop finishes without return, could NOT find episode
    return 0;
};
/*
// updateSelectedEpisodes()
// IN PROGRESS
replayEpisodeCollection.updateSelectedEpisodes = function (filterType) {

    if (this.shuffle) {
        this.shuffleArray(this.selectedEpisodes);
        // After selectedEpisodes is shuffled, set shuffle back to false
        this.shuffle = false;
    } else if (this.ascending)
        this.selectedEpisodes.reverse();

    // Populate main element with new selected objects
    this.updateDisplayedEpisodes();
};
*/
// -----------------------------
// ---------- Shuffle ----------
// -----------------------------

// shuffleArray(arr)
// Accepts array as argument to shuffle
// TODO: Make static function
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
    // Update displayed episodes
    this.updateDisplayedEpisodes();
};

// -----------------------------------
// ---------- Filter/Search ----------
// -----------------------------------

// filterBySearch(searchTerms)
// IN-PROGRESS
replayEpisodeCollection.search = function () {
    const searchTerms = this.searchInputElement.value;

    if (searchTerms) {
        // Reset selectedEpisodes to complete list
        this.selectedEpisodes = this.replayEpisodeObjectArray.slice();
        // Reverse if ascending is true
        if (this.ascending) this.selectedEpisodes.reverse();

        // Set search terms to lower case before comparing
        // \b(?:searchTerms)\b
        const re = new RegExp('\\b(?:' + searchTerms.toLowerCase() + ')\\b');
        //searchTerms = searchTerms.toLowerCase();
        this.selectedEpisodes = this.selectedEpisodes.filter(
            function (episode) {
                return re.test(episode.episodeSection
                    .textContent.toLowerCase());
            });
        // Update displayed episodes with filtered episodes
        this.updateDisplayedEpisodes();
    };
};
 
// filterSelectedEpisodes()
// IN-PROGRESS
replayEpisodeCollection.filterSelectedEpisodes = function () {
    switch (this.filter) {
        case filter.text: break;
        case filter.none:
        default:
    }
};
 
// filterBySeason
// Filters the current array of filtered episodes by season
// Argument can be number or array of numbers
replayEpisodeCollection.filterBySeason = function (seasonToFilter) {
    if (typeof seasonToFilter == 'number') {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => (episode.getReplaySeason()[0] == seasonToFilter)
        );
    }
    else if (Array.isArray(seasonToFilter)) {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => seasonToFilter.includes(episode.getReplaySeason()[0])
        );
    }
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
    console.log('setSortByEvent called with event: ' + event.currentTarget.name);
    switch (event.currentTarget.name) {
        // Sort Type
        case 'sort-type':
            // Assign sortType
            this.sortType = event.currentTarget.value;
            // Sort selectedEpisodes by sortType
            this.sortByType();
            break;

        // Sort Direction
        case 'sort-direction':
            // Assign ascending bool
            if (event.currentTarget.value == 'ascending') {
                if (!this.ascending) {
                    this.ascending = true;
                    this.selectedEpisodes.reverse();
                }
            } else { // Else descending is selected
                if (this.ascending) {
                    this.ascending = false;
                    this.selectedEpisodes.reverse();
                }
            }
            break;

        // Max Displayed
        case 'max-displayed':
            // Max Displayed Episodes - Assign this.maxDisplayedEpisodes
            this.maxDisplayedEpisodes = event.currentTarget.value;
            break;

        // Default
        default:
    }

    // Update main HTML element to display new sorted episodes
    this.updateDisplayedEpisodes();
};
/*
// setSortByInput()
replayEpisodeCollection.setSortByInput = function () {
    // Sort Type
    const sortTypeInput = this.sortTypeElement.value;
    switch (sortTypeInput) {
        case 'airdate': this.sortType = sort.airdate; break;
        case 'most-viewed': this.sortType = sort.views; break;
        case 'most-liked': this.sortType = sort.likes; break;
        default: this.sortType = sort.number;
    }
    this.sortType

    this.ascending = this.sortDirectionElement.value == 'ascending';
    this.maxDisplayedEpisodes = this.maxDisplayedElement.value;

    console.log(this.maxDisplayedElement.value + '__' + this.sortDirectionElement.value);

};
*/
// sortByType
// Sort selected episodes by sort type and ascending bool
replayEpisodeCollection.sortByType = function () {
    // If list was shuffled, assign isShuffled to false
    if (this.isShuffled) this.isShuffled = false;

    // Sort selectedEpisodes by sortType
    switch (this.sortType) {
        // Air Date
        case sort.airdate:
            // Sorts in ascending order
            this.selectedEpisodes.sort(function (firstEl, secondEl) {
                return firstEl.airdate - secondEl.airdate;
            });
            // Reverse array if this.ascending is false
            if (!this.ascending) this.selectedEpisodes.reverse();
            break;
        // None (No sort such as for shuffled list)
        case sort.none: break;
        // Default (episodeNumber)
        case sort.number:
        default:
            // Default sort by episodeNumber in descending order
            this.selectedEpisodes.sort(function (first, second) {
                return second.episodeNumber - first.episodeNumber;
            });
            // Reverse if ascending is true
            if (this.ascending) this.selectedEpisodes.reverse();
    }
};

// getSortTypeStringValue()
// Converts number type to string for value attribute of select option element
replayEpisodeCollection.getSortTypeStringValue = function () {
    switch (this.sortType) {
        case sort.airdate: return 'airdate'; break;
        case sort.views: return 'most-viewed'; break;
        case sort.likes: return 'most-liked'; break;
        case sort.number: return 'episode-number'; break;
        case sort.none:
        default: return 'none';
    }
};

// ----------------------------------------
// ---------- Reset Episode List ----------
// ----------------------------------------

replayEpisodeCollection.resetSelectedEpisodes = function () {
    // Fill selectedEpisodes with references to replayEpisodeObjectArray objects
    this.selectedEpisodes = [];
    this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

    // Reset sort/filter/search
    replayEpisodeCollection.resetSortFilterSearch();

    // Update displayed episodes
    this.updateDisplayedEpisodes();
};

replayEpisodeCollection.resetSortFilterSearch = function() {
    // Change HTML select element values to default
    //this.sortTypeElement.value = sort.airdate;
    this.sortType = sort.airdate;
    //this.sortDirectionElement.value = 'descending';
    this.ascending = false;
    this.searchInputElement.value = '';
};