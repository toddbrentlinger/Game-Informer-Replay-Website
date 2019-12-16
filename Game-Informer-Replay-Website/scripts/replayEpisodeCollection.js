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
    likes: 4,
    length: 5
});

// Object: Collection of all replay episodes
var replayEpisodeCollection = {
    // Properties
    totalTimeSeconds: 0,
    mainElement: document.getElementById('main'),
    // Sort
    sortTypeElement: document.getElementById('sort-type-select'),
    sortDirectionElement: document.getElementById('sort-direction-select'),
    maxDisplayedElement: document.getElementById('max-displayed-select'),
    // Search
    searchInputElement: document.querySelector('#search-container input[type = "search"]'),
    // Filter
    filterElement: document.querySelector('#filterForm'),

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

    // Page Selection
    _currentPageDisplayed: 1, // Page number of selected episodes list depending on maxDisplayedEpisodes
    get currentPageDisplayed() { return this._currentPageDisplayed; },
    set currentPageDisplayed(num) {
        // If string, try to convert to int, assigns NaN if cannot
        if (typeof num == 'string')
            num = parseInt(num, 10);
        // Limit value between 1 and totalPages
        this._currentPageDisplayed = (num < 1) ? 1
            : (num > this.totalPages) ? this.totalPages
            : num;
    },
    get totalPages() {
        return (this.maxDisplayedEpisodes)
            ? Math.ceil(this.selectedEpisodes.length / this.maxDisplayedEpisodes)
            : 1;
    },
    pageNumberContainer: document.getElementById('page-number-container'),
    prevButton: document.querySelector('#page-number-container button:first-child'),
    nextButton: document.querySelector('#page-number-container button:last-child'),

    // Sort
    _sortType: window.sessionStorage.getItem('sortType') || sort.airdate,
    get sortType() { return this._sortType; },
    set sortType(input) {
        let tempSortType; // Initialized to undefined
        // If arg is a string type, compare to properties of sort enum
        if (typeof input === 'string') {
            switch (input) {
                case 'airdate': tempSortType = sort.airdate; break;
                case 'most-viewed': tempSortType = sort.views; break;
                case 'most-liked': tempSortType = sort.likes; break;
                case 'video-length': tempSortType = sort.length; break;
                case 'none': tempSortType = sort.none; break;
                case 'number':
                default: tempSortType = sort.number;
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
            case sort.length: this.sortTypeElement.value = 'video-length'; break;
            case sort.number:
            case sort.none:
            default: this.sortTypeElement.value = 'none';
        }
    },

    // Converts number type to string for value attribute of select option element
    get sortTypeString() {
        switch (this.sortType) {
            case sort.airdate: return 'airdate'; break;
            case sort.views: return 'most-viewed'; break;
            case sort.likes: return 'most-liked'; break;
            case sort.length: return 'video-length'; break;
            case sort.number: return 'episode-number'; break;
            case sort.none:
            default: return 'none';
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
    isShuffled: false,

    // Video Player
    get selectedVideoIdArray() {
        const videoIdArray = [];
        for (const episode of replayEpisodeCollection.selectedEpisodes) {
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
    // Initialize sort/filter properties based on selected input elements
    //this.ascending = this.sortDirectionElement.value == 'ascending';
    //this.maxDisplayedEpisodes = this.maxDisplayedElement.value;
    this.sortTypeElement.value = this.sortTypeString;
    this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    this.maxDisplayedElement.value = this.maxDisplayedEpisodes;
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
        /*
        let timeArr = replayEpisodeObject.videoLength.split(':');
        timeArr.forEach((item, index, arr) => { arr[index] = parseInt(item, 10);});
        this.totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
            */
        this.totalTimeSeconds += replayEpisodeObject.videoLengthInSeconds;
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
replayEpisodeCollection.updateDisplayedEpisodes = function () {
    // Variables
    const selectedEpisodesLength = this.selectedEpisodes.length;
    let start = 0, end = this.maxDisplayedEpisodes;

    // Change start/end depending on selectedEpisodes length, maxDisplayedEpisodes, and currentPageDisplayed
    /* Ex. 120 episodes and 50 max displayed
     * 1: 0-49 (first 50) start=first end=50
     * 2: 50-99 (second 50) start=50 end=100
     * 3: 100-119 (last 20) start=100 end=last */
    start = (this.currentPageDisplayed - 1) * this.maxDisplayedEpisodes;
    end = Math.min(this.currentPageDisplayed * this.maxDisplayedEpisodes, selectedEpisodesLength)

    /*
    // Check start argument
    if (begin < 0) begin = selectedEpisodesLength - begin;
    // Check end argument
    if (typeof end == 'undefined' || end > selectedEpisodesLength || !end)
        end = selectedEpisodesLength;
    else if (end < 0)
        end = selectedEpisodesLength - end;
    */

    // Clear main element of episode sections
    this.clearMainElement();

    // Fill main element with selected episodes array
    for (let i = start; i < end; i++)
        this.mainElement.appendChild(this.selectedEpisodes[i].episodeSection);

    // Change current number of displayed episodes message string
    /*
    this.currentDisplayedEpisodesMessageElement.innerHTML = 'Displaying '
        + ((this.maxDisplayedEpisodes > 0)
        ? Math.min(this.maxDisplayedEpisodes, this.selectedEpisodes.length)
        : this.selectedEpisodes.length)
        + ' of ' + this.selectedEpisodes.length + ' replay episodes';
    */
    this.currentDisplayedEpisodesMessageElement.innerHTML = 'Showing ' +
        ((this.maxDisplayedEpisodes > 0)
        ? `${start + 1} - ${end} of`
        : 'all')
        + ` ${selectedEpisodesLength} replay episodes`;

    // Update page number containers
    this.updatePageNumber();

    // Update video player to match selectedEpisodes
    if (this.videoPlayer)
        this.videoPlayer.cuePlaylist({ playlist: this.selectedVideoIdArray.slice(0, 200) });
};

// showTotalTime()
// TODO: Static utility function with parameter totalTimeSeconds
replayEpisodeCollection.showTotalTime = function () {
    const days = Math.floor(this.totalTimeSeconds / 86400)
    const hours = Math.floor((this.totalTimeSeconds - days * 86400) / 3600);
    const minutes = Math.floor((this.totalTimeSeconds - days * 86400 - hours * 3600) / 60);
    const seconds = this.totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
    
    const totalTimePara = document.createElement('p');
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
    // If for loop finishes without return, could NOT find episode,
    // return undefined
};
/*
// updateSelectedEpisodes()
// Starts with default selectedEpisodes and changes it based on
// search, filter, sort, etc.
// IN PROGRESS
replayEpisodeCollection.updateSelectedEpisodes = function () {
    // Filter
    // Sort
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

        // Sort selected episodes
        this.sortByType();

        // Reset current page displayed
        this.currentPageDisplayed = 1;

        // Update displayed episodes with filtered episodes
        this.updateDisplayedEpisodes();
    };
};
 
// filterSelectedEpisodes()
// IN-PROGRESS
replayEpisodeCollection.filterSelectedEpisodes = function () {
    // Create filter object of properties corresponding to input
    // name and values of arrays with values of checked inputs
    let filterObj = {};
    // For each input element in the filter form
    for (const input of this.filterElement.getElementsByTagName('input')) {
        if (input.checked) {
            // If filterObj already has input.name as a property, add value to property array
            if (filterObj.hasOwnProperty(input.name))
                filterObj[input.name].push(input.value);
            // Else add filterObj as property and add value as first element
            else
                filterObj[input.name] = [ input.value ];
        }
    }

    // Fill selectedEpisodes with references to replayEpisodeObjectArray objects
    this.selectedEpisodes = [];
    this.replayEpisodeObjectArray
        .forEach(episode => this.selectedEpisodes.push(episode));

    // Season
    if (filterObj.hasOwnProperty('season')) {
        // Convert array of strings to array of numbers
        filterObj.season.forEach(function (item, index, arr) {
            arr[index] = parseInt(item, 10);
        });
        this.filterBySeason(filterObj.season);
    }

    // GI Crew

    // Segment

    // Year

    // Sort selected episodes
    this.sortByType();

    // Reset current page displayed
    this.currentPageDisplayed = 1;

    // Update displayed episodes with filtered episodes
    this.updateDisplayedEpisodes();
};
 
// filterBySeason(seasons)
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

// populateFilterForm()
replayEpisodeCollection.populateFilterForm = function () {
    // Variables
    //let giCrewArr = [];
    let labelElement;
    let inputElement;
    let parentElement;

    // Season

    // GI Crew
    parentElement = document.getElementById('gi-crew-field');
    // getGICrew() returns: 
    // [tempHostArr, tempGuestArr, tempTotalAppearancesArr, noHostEpisodes, noGuestEpisodes]
    //giCrewArr = getGICrew();
    for (const person of getGICrew()[2]) {
        // Create input element
        inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'checkbox');
        inputElement.setAttribute('name', 'giCrew');
        inputElement.setAttribute('value', person.name);
        inputElement.checked = true;
        // Append input element to label, then append the label to the fieldset
        labelElement = ReplayEpisode.createElementAdv('label', undefined, `${person.name} (${person.count})`);
        labelElement.appendChild(inputElement);
        parentElement.append(labelElement);
    }

    // Segment
    parentElement = document.getElementById('segment-field');
    for (const segment of getMiddleSegments()) {
        // Create input element
        inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'checkbox');
        inputElement.setAttribute('name', 'segment');
        inputElement.setAttribute('value', segment.name);
        inputElement.checked = true;
        // Append input element to label, then append the label to the fieldset
        labelElement = ReplayEpisode.createElementAdv('label', undefined, `${segment.name} (${segment.count})`);
        labelElement.appendChild(inputElement);
        parentElement.append(labelElement);
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
    switch (event.currentTarget.name) {
        // Sort Type
        case 'sort-type':
            // Assign sortType
            this.sortType = event.currentTarget.value;
            // Sort selectedEpisodes by sortType
            this.sortByType();
            // Reset current page displayed
            this.currentPageDisplayed = 1;
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
            // Reset current page displayed
            this.currentPageDisplayed = 1;
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
        case sort.length:
            // Sorts in ascending order
            this.selectedEpisodes.sort(function (first, second) {
                return first.videoLengthInSeconds - second.videoLengthInSeconds;
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

// ----------------------------------------
// ---------- Reset Episode List ----------
// ----------------------------------------

replayEpisodeCollection.resetSelectedEpisodes = function () {
    // Fill selectedEpisodes with references to replayEpisodeObjectArray objects
    this.selectedEpisodes = [];
    this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

    // Reset sort/filter/search
    replayEpisodeCollection.resetSortFilterSearch();

    // Reset current page displayed
    this.currentPageDisplayed = 1;

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

// ------------------------------------
// ---------- Page Selection ----------
// ------------------------------------

replayEpisodeCollection.updatePageNumber = function () {
    // Variables
    let tempNode;
    console.log('updatePageNumber started');
    // Remove all page number buttons
    this.pageNumberContainer.querySelectorAll('.page-number').forEach(function (node) {
        node.remove();
    });
    // Remove temp page number container from bottom of main element
    //tempNode = this.mainElement.querySelector('#temp-page-number-container');
    //if (tempNode) tempNode.parentNode.removeChild(tempNode);

    // If total pages is more than one
    if (this.totalPages > 1) {
        // Show 'PREV' if current page is more than 1
        //this.prevButton.style.display = (this.currentPageDisplayed > 1) ? 'inline-block' : 'none';
        this.prevButton.disabled = (this.currentPageDisplayed == 1);
        // Show 'NEXT' if current page is NOT last page
        //this.nextButton.style.display = (this.currentPageDisplayed != this.totalPages) ? 'inline-block' : 'none';
        this.nextButton.disabled = (this.currentPageDisplayed == this.totalPages);
        // Add button for each page number and highlight current page
        for (let i = 1; i <= this.totalPages; i++) {
            tempNode = (i == this.currentPageDisplayed)
                ? ReplayEpisode.createElementAdv('button', 'active page-number', i)
                : ReplayEpisode.createElementAdv('button', 'page-number', i);
            tempNode.setAttribute('type', 'button');
            tempNode.setAttribute('value', i);
            tempNode.addEventListener("click", function () {
                this.setPageNumber(i);
            }.bind(this), false);

            this.nextButton.insertAdjacentElement('beforebegin', tempNode);
        }
        // Clone page button container and add to bottom of main element
        //tempNode = this.pageNumberContainer.cloneNode(true);
        //tempNode.id = 'temp-page-number-container';
        //this.mainElement.insertAdjacentElement('beforeend', tempNode);
    } else { // Else total pages is only one, hide all
        // Hide 'PREV' and 'NEXT' buttons
        //this.prevButton.style.display = "none";
        //this.nextButton.style.display = "none";
    }
};

replayEpisodeCollection.setPageNumber = function (input) {
    const prevPage = this.currentPageDisplayed;
    if (typeof input === 'number')
        this.currentPageDisplayed = input;
    else if (typeof input === 'string') {
        // If input is 'next', increase page by 1
        if (input == 'next') this.currentPageDisplayed++;
        // Else if input is 'prev', decrease page by 1
        else if (input == 'prev') this.currentPageDisplayed--;
        // Else if string is a number, assign number to page
        else if (!isNaN(parseInt(input, 10)))
            this.currentPageDisplayed = parseInt(input, 10);
    }
    // If currentPageDisplayed has changed value, update displayed episodes
    if (prevPage != this.currentPageDisplayed)
        this.updateDisplayedEpisodes();
};

// ------------------------------------------------
// ---------- Video Player - YouTube API ----------
// ------------------------------------------------

// onPlayerReady(event)
// The API will call this function when the video player is ready.
replayEpisodeCollection.onPlayerReady = function (event) {
    event.target.cuePlaylist({
        playlist: this.selectedVideoIdArray.slice(0, 200)
    });
};

// onPlayerStateChange(event)
// The API calls this function when the player's state changes.
replayEpisodeCollection.onPlayerStateChange = function (event) {
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
    console.log('Error: ' + event.data);
};

// -------------------------------------------------
// ---------- Utility Functions (Static?) ----------
// -------------------------------------------------

// isEmpty(obj)
// Test if object is empty
function isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// --------------------------------
// ---------- Debug/Flag ----------
// --------------------------------

// Find episode numbers with no provided YouTube URL
function findEpisodesWithNoYouTubeURL(replayEpisodes) {
    let episodesFlagged = [];
    replayEpisodes.forEach(function (episode) {
        if (!episode.hasOwnProperty('youtubeVideoID')
            || !episode.youtubeVideoID)
            episodesFlagged.push(episode.episodeNumber);
    });
    console.log(episodesFlagged);
}

// Get list of host/featuring with no duplicates
function getGICrew() {
    let tempHostArr = [];
    let tempGuestArr = [];
    let tempTotalAppearancesArr = [];
    let noHostEpisodes = [];
    let noGuestEpisodes = [];
    let isIncluded = false;

    for (const episode of replayEpisodeCollection.replayEpisodeObjectArray) {
        // Host
        if (episode.hasOwnProperty('host')) {
            // For each host in episode host array
            for (const host of episode.host) {
                // Check if host already listed
                isIncluded = false;
                for (const hostObj of tempHostArr) {
                    // If host matches, increment count, move to next host
                    if (hostObj.name == host) {
                        isIncluded = true;
                        hostObj.count++;
                        break;
                    }
                }
                // If host is NOT included, add to list
                if (!isIncluded) {
                    tempHostArr.push({
                        name: host,
                        count: 1
                    });
                }
            }
        } else // No hosts property, add flagged episode
            noHostEpisodes.push(episode.episodeNumber);

        // Featuring
        if (episode.hasOwnProperty('featuring')) {
            // For each guest in the episode featuring array
            for (const guest of episode.featuring) {
                // Check if guest already listed
                isIncluded = false;
                for (const guestObj of tempGuestArr) {
                    // If guest matches, increment count, move to next guest
                    if (guestObj.name == guest) {
                        isIncluded = true;
                        guestObj.count++;
                        break;
                    }
                }
                // If guest is NOT included, add to list
                if (!isIncluded) {
                    tempGuestArr.push({
                        name: guest,
                        count: 1
                    });
                }
            }
        }
        else // No featuring property, add flagged episode
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
    tempHostArr.sort(function (first, second) {
        return second.count - first.count;
    });
    tempGuestArr.sort(function (first, second) {
        return second.count - first.count;
    });
    tempTotalAppearancesArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return [tempHostArr, tempGuestArr, tempTotalAppearancesArr, noHostEpisodes, noGuestEpisodes];
}

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

function getMiddleSegments() {
    let middleSegmentArr = [];
    let isIncluded = false;
    replayEpisodeCollection.replayEpisodeObjectArray.forEach(function (episode) {
        if (episode.hasOwnProperty('middleSegment') || episode.hasOwnProperty('middleSegmentContent')) {
            let tempMiddleSegment = episode.middleSegment || episode.middleSegmentContent;
            // Check if Ad (string.endsWith())
            if (tempMiddleSegment.endsWith('Ad'))
                tempMiddleSegment = 'Ad';
            isIncluded = false;
            for (const segment of middleSegmentArr) {
                if (segment.name === tempMiddleSegment) {
                    isIncluded = true;
                    segment.count++;
                    break;
                }
            }
            // If NOT included, add to list
            if (!isIncluded) {
                middleSegmentArr.push({
                    name: tempMiddleSegment,
                    count: 1
                });
            }
        }
    });

    // Sort array by count in descending order
    middleSegmentArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return middleSegmentArr;
}