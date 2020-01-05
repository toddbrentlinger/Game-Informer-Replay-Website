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
    searchInputElement: document.querySelector('#search-container input[type = "text"]'),
    // Filter
    filterFormElement: document.querySelector('#filterForm'),
    // Number of episodes displayed element
    currentDisplayedEpisodesMessageElement: document.querySelector('#number-displayed-container div'),

    replayEpisodeObjectArray: [],
    selectedEpisodes: [],

    // Max Displayed Episodes - Increments [10, 25, 50, 100, 200]
    // Value of 0 shows all episodes
    _maxDisplayedEpisodes: window.sessionStorage.getItem('maxDisplayedEpisodes') || 50,
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

    pageNumberList: document.querySelector('#page-number-container .page-number-list'),
    prevButton: document.querySelector('#page-number-container > button:first-child'),
    nextButton: document.querySelector('#page-number-container > button:last-child'),

    // Sort
    _sortType: parseInt(window.sessionStorage.getItem('sortType'), 10) || sort.airdate,
    get sortType() { return this._sortType; },
    set sortType(input) {
        let tempSortType; // Initialized to undefined
        // If arg is a string type, compare to properties of sort enum
        if (typeof input === 'string') {
            switch (input) {
                case 'most-viewed': tempSortType = sort.views; break;
                case 'most-liked': tempSortType = sort.likes; break;
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
        }
        else // Else assign tempSortType to sortType
            this._sortType = tempSortType;

        // Assign to local/session storage
        // If sortType is sort.none, assign default value of sort.airdate
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
            case sort.views: return 'most-viewed'; break;
            case sort.likes: return 'most-liked'; break;
            case sort.length: return 'video-length'; break;
            case sort.number: return 'number'; break;
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
        console.log('----- New filterObj -----');
        for (let [key, value] of Object.entries(newObject)) {
            console.log(`${key}: ${value}`);
        }
        // Reset selectedEpisodes to show all episodes from base episode object array
        // If newObject is empty, filter will NOT change selectedEpisodes listing all episodes
        this.selectedEpisodes = [];
        this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

        // Go through each property of newObject
        for (const filterType in newObject) {
            // If property matches value in filter enum
                // Filter selectedEpisodes based on filter type from newObject property
                // Add newObject property/value to filterObj
            switch (filterType) {
                // Search
                case 'search':
                    this.filterBySearch(newObject[filterType]);
                    //this._filterObj[filterType] = newObject[filterType];
                    break;
                // Season
                case 'season':
                    this.filterBySeason(newObject[filterType]);
                    //this._filterObj[filterType] = newObject[filterType];
                    break;
                // Year
                case 'year':
                    this.filterByYear(newObject[filterType]);
                    //this._filterObj[filterType] = newObject[filterType];
                    break;
                // GI Crew
                case 'giCrew':
                    this.filterByCrew(newObject[filterType]);
                    //this._filterObj[filterType] = newObject[filterType];
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
    videoPlayerContainer: document.getElementById('videoPlayer'),
    videoPlayer: undefined, // Assigned inside global onYouTubePlayerAPIReady()
    currentEpisode: undefined, // reference to ReplayEpisode object
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
    // Initialize object properties
    // Set value of input elements based on sort/filter properties
    console.log(`Properties - \nSortType: ${this.sortTypeString}(${this.sortType}) \nAscending: ${this.ascending} \nMaxDisplayed: ${this.maxDisplayedEpisodes}`);
    console.log(`Element Values - \nSortType: ${this.sortTypeElement.value}(${this.sortType}) \nAscending: ${this.sortDirectionElement.value} \nMaxDisplayed: ${this.maxDisplayedElement.value}`);
    this.sortTypeElement.value = this.sortTypeString;
    this.sortDirectionElement.value = this.ascending ? 'ascending' : 'descending';
    this.maxDisplayedElement.value = this.maxDisplayedEpisodes;
    console.log(`Element Values - \nSortType: ${this.sortTypeElement.value}(${this.sortType}) \nAscending: ${this.sortDirectionElement.value} \nMaxDisplayed: ${this.maxDisplayedElement.value}`);

    // Set filter
    // Set search

    // Clone episode section template to use for episode data
    // Initialize each replay episode object by sending this template
    // as an argument to ReplayEpisode constructor
    this.episodeTemplate = document.querySelector('section.episode')
        .cloneNode(true);

    // Populate replay episode object array in episode collection object
    this.populateEpisodeObjectArray(replayEpisodeArray);
    // Empty replayEpisodeArray
    replayEpisodeArray = [];

    // Initialize selected episodes array to same order of base episode object array
    this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

    // Sort selected episodes
    this.sortByType();

    // Populate main element with initialized selected episodes array
    this.updateDisplayedEpisodes();
    
    // Cue playlist of first 200 selected episodes
    //console.log('Init before');
    //this.cueEpisodePlaylist();
    //console.log('Init after');
    /*
    if (this.videoPlayer) {
        //console.log(`selectedEpisodes.length = ${this.selectedEpisodes.length}`);
        if (this.selectedEpisodes.length)
            this.videoPlayer.cuePlaylist({ playlist: this.selectedVideoIdArray.slice(0, 200) });
        else // Else no selected episodes, cue Replay highlights video
            this.videoPlayer.cueVideoById('0ZtEkX8m6yg');
    }
    */

    // Add stats
    this.populateStats();
    // Add filter options
    this.populateFilterForm();
};

// populateEpisodeObjectArray()
replayEpisodeCollection.populateEpisodeObjectArray = function (replayEpisodeArray) {
    let replayEpisodeObject;
    for (const replayEpisode of replayEpisodeArray) {
        // Create ReplayEpisode object
        replayEpisodeObject = new ReplayEpisode(replayEpisode, this.episodeTemplate);
        // Append episode object to array
        this.replayEpisodeObjectArray.push(replayEpisodeObject);

        // Increase total time of episodes
        this.totalTimeSeconds += replayEpisodeObject.videoLengthInSeconds;
    }
    // Success Message
    console.log('Finished replay episode assignment');
};
 
// clearMainElement()
replayEpisodeCollection.clearMainElement = function () {
    const currentEpisodeElements = this.mainElement.getElementsByClassName('episode');
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
    let start, end;

    // Assign start/end depending on selectedEpisodes length, maxDisplayedEpisodes, and currentPageDisplayed
    /* Ex. 120 episodes and 50 max displayed
     * 1: 0-49 (first 50) start=first end=50
     * 2: 50-99 (second 50) start=50 end=100
     * 3: 100-119 (last 20) start=100 end=last */
    start = (this.currentPageDisplayed - 1) * this.maxDisplayedEpisodes;
    end = (this.maxDisplayedEpisodes)
        ? Math.min(this.currentPageDisplayed * this.maxDisplayedEpisodes, selectedEpisodesLength)
        : selectedEpisodesLength;

    // Clear main element of episode sections
    this.clearMainElement();

    // Fill main element with selected episodes array
    for (let i = start; i < end; i++)
        this.mainElement.appendChild(this.selectedEpisodes[i].episodeSection);

    // Change current number of displayed episodes message string
    if (selectedEpisodesLength) {
        this.currentDisplayedEpisodesMessageElement.innerHTML = 'Showing ' +
            ((this.maxDisplayedEpisodes > 0)
                ? `${start + 1} - ${end} of`
                : 'all')
            + ` ${selectedEpisodesLength} replay episodes`;
    } else
        this.currentDisplayedEpisodesMessageElement.innerHTML = 'Showing no replay episodes';

    // Update page number containers
    this.updatePageNumber();
};

// updateSelectedEpisodes(searchBool, filterBool, sortBool)
// Starts with default selectedEpisodes and changes it based on
// search, filter, sort, etc.
// IN PROGRESS
replayEpisodeCollection.updateSelectedEpisodes = function (setFirstPage = true) {
    // Sort selected episodes
    this.sortByType();
    // Reset current page displayed
    if (setFirstPage) this.currentPageDisplayed = 1;
    // Populate main element with updated selectedEpisodes
    this.updateDisplayedEpisodes();

    // Cue playlist of first 200 selected episodes
    this.cueEpisodePlaylist();
    /*
    if (this.videoPlayer) {
        if (this.selectedEpisodes.length)
            this.videoPlayer.cuePlaylist({ playlist: this.selectedVideoIdArray.slice(0, 200) });
        else // Else no selected episodes, cue Replay highlights video
            this.videoPlayer.cueVideoById('0ZtEkX8m6yg');
    }
    */
};

// --------------------------
// ---------- Misc ----------
// --------------------------

// getEpisodeByNumber(num)
// TODO: NOT being used
replayEpisodeCollection.getEpisodeByNumber = function (num) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.episodeNumber === num)
            return episode;
    }
    // If for loop finishes without return, could NOT find episode,
    // return undefined
    console.error(`Could NOT find episode with number: ${num}`);
};

// getEpisodeByVideoID(youtubeVideoID)
// TODO: NOT being used
replayEpisodeCollection.getEpisodeByVideoID = function (youtubeVideoID) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.hasOwnProperty('youtubeVideoID') && episode.youtubeVideoID === youtubeVideoID)
            return episode;
    }
    // If for loop finishes without return, could NOT find episode, return undefined
    console.error(`Could NOT find episode with youtubeVideoID: ${youtubeVideoID}`);
};

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
    //this.updateDisplayedEpisodes();
    this.updateSelectedEpisodes();
};

// -----------------------------------
// ---------- Filter/Search ----------
// -----------------------------------

// updateFilterObj()
// TODO: Add to updateSelectedEpisodes
replayEpisodeCollection.updateFilterObj = function () {
    // Variables
    const tempObj = {};

    // Search
    if (this.searchInputElement.value)
        tempObj.search = this.searchInputElement.value;

    // Other: Season, Year, GI Crew, etc.
    // For each checkbox input element in the filter form
    for (const input of this.filterFormElement.querySelectorAll('input[type="checkbox"]')) {
        switch (input.name) {
            case 'giCrew':
                if (input.checked) {
                    // If filterObj already has input.name as a property, add value to property array
                    if (tempObj.hasOwnProperty(input.name))
                        tempObj[input.name].push(input.value);
                    else // Else add filterObj as property and add value as first element
                        tempObj[input.name] = [input.value];
                }
                break;
            default:
                if (!input.checked) {
                    // If filterObj already has input.name as a property, add value to property array
                    if (tempObj.hasOwnProperty(input.name))
                        tempObj[input.name].push(input.value);
                    else // Else add filterObj as property and add value as first element
                        tempObj[input.name] = [input.value];
                }
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
 * TODO: If two words are separated by spaces, return results that match both or either one, AND/OR?
 * NOTE: Ignore spaces between 'property:' and next valid character
 */
replayEpisodeCollection.filterBySearch = function (searchTerms = '') {
    if (searchTerms) {
        // Reset selectedEpisodes to show complete list
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
        this.updateSelectedEpisodes();
    } else { // Else show all episodes applying filter and sort
        // TODO
        //console.log('No search text');
    }
};

// filterBySeason(seasons)
// Filters the current array of filtered episodes by season
// Argument can be number or array of numbers
replayEpisodeCollection.filterBySeason = function (seasonToFilter) {
    // Make sure that each value is a number
    seasonToFilter.forEach(function (value, index, arr) {
        // If value is NOT a number, remove array element
        if (isNaN(value))
            arr.splice(index, 1);
        else { // Else value is a number
            // If value is string type, convert to number type
            if (typeof value === 'string')
                arr[index] = parseInt(value, 10);
        }
    });

    if (typeof seasonToFilter == 'number') {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => (episode.getReplaySeason()[0] !== seasonToFilter)
        );
    }
    else if (Array.isArray(seasonToFilter)) {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => !seasonToFilter.includes(episode.getReplaySeason()[0])
        );
    }
};

// filterByYear(yearsToFilter)
replayEpisodeCollection.filterByYear = function (yearsToFilter) {
    // Make sure that each value is a number
    yearsToFilter.forEach(function (value, index, arr) {
        // If value is NOT a number, remove array element
        if (isNaN(value))
            arr.splice(index, 1);
        else { // Else value is a number
            // If value is string type, convert to number type
            if (typeof value === 'string')
                arr[index] = parseInt(value, 10);
        }
    });

    if (typeof yearsToFilter == 'number') {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => (episode.airdate.getFullYear() !== yearsToFilter)
        );
    }
    else if (Array.isArray(yearsToFilter)) {
        this.selectedEpisodes = this.selectedEpisodes.filter(
            episode => !yearsToFilter.includes(episode.airdate.getFullYear())
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
        if (!episode.hasOwnProperty('host') && !episode.hasOwnProperty('featuring'))
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

// populateFilterForm()
replayEpisodeCollection.populateFilterForm = function () {
    // Variables
    let parentElement;
    let sortedGICrewObjArr = [];
    let i = 0;
    const currentYear = new Date().getFullYear();

    // TODO: Create array of references to each gi crew object
    // and sort alphabetically
    getGICrew()[2].forEach(personObj => {
        if (personObj.count > 1)
            sortedGICrewObjArr.push(personObj);
    });
    sortedGICrewObjArr.sort(function (firstPerson, secondPerson) {
        if (firstPerson.name < secondPerson.name)
            return -1;
        else if (firstPerson.name > secondPerson.name)
            return 1;
        else
            return 0;
    });

    // Season

    // Year
    parentElement = document.getElementById('year-field');
    for (i = 2010; i <= currentYear; i++) {
        parentElement.append(this.createFieldsetLabel('year', i.toString()));
    }

    // GI Crew
    parentElement = document.getElementById('gi-crew-field');
    // getGICrew() returns: 
    // [tempHostArr, tempGuestArr, tempTotalAppearancesArr, noHostEpisodes, noGuestEpisodes]
    //giCrewArr = getGICrew();
    for (const person of sortedGICrewObjArr) {
        parentElement.append(this.createFieldsetLabel('giCrew', person.name, `${person.name} (${person.count})`));
    }
    /*
    // Segment
    parentElement = document.getElementById('segment-field');
    for (const segment of getMiddleSegments()) {
        parentElement.append(this.createFieldsetLabel('segment', segment.name, `${segment.name} (${segment.count})`));
    }
    */
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
    inputElement.defaultChecked = true;
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
            // Sort selectedEpisodes by sortType
            //this.sortByType();
            // Reset current page displayed
            //this.currentPageDisplayed = 1;
            this.updateSelectedEpisodes();
            break;

        // Sort Direction
        case 'sort-direction':
            // Assign ascending bool
            if (event.currentTarget.value == 'ascending') {
                if (!this.ascending) {
                    this.ascending = true;
                    //this.selectedEpisodes.reverse();
                    // Update main HTML element to display new sorted episodes
                    this.updateSelectedEpisodes();
                }
            } else { // Else descending is selected
                if (this.ascending) {
                    this.ascending = false;
                    //this.selectedEpisodes.reverse();
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
            this.selectedEpisodes.sort(function (first, second) {
                return first.videoLengthInSeconds - second.videoLengthInSeconds;
            });
            break;
        // Episode Number (Special episodes separate from official)
        case sort.number:
            this.selectedEpisodes.sort(function (first, second) {
                return first.episodeNumber - second.episodeNumber;
            });
            break;
        // Views
        case sort.views:
            this.selectedEpisodes.sort(function (first, second) {
                if (first.hasOwnProperty('views') && second.hasOwnProperty('views'))
                    return first.views - second.views;
                else if (first.hasOwnProperty('views'))
                    return 1;
                else if (second.hasOwnProperty('views'))
                    return -1;
            });
            break;
        // Likes
        case sort.likes:
            this.selectedEpisodes.sort(function (first, second) {
                if (first.hasOwnProperty('likes') && second.hasOwnProperty('likes'))
                    return first.likes - second.likes;
                else if (first.hasOwnProperty('likes'))
                    return 1;
                else if (second.hasOwnProperty('likes'))
                    return -1;
            });
            break;
        // Air Date (Default)
        case sort.airdate:
        default:
            this.selectedEpisodes.sort(function (firstEl, secondEl) {
                return firstEl.airdate - secondEl.airdate;
            });
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
    this.selectedEpisodes = [];
    this.replayEpisodeObjectArray.forEach(episode => this.selectedEpisodes.push(episode));

    // Reset sort/filter/search
    // Change HTML select element values to default
    this.sortType = sort.airdate;
    this.ascending = false;
    this.searchInputElement.value = '';
    this.filterFormElement.reset();

    // Reset current page displayed
    //this.currentPageDisplayed = 1;
    // Update displayed episodes
    //this.updateDisplayedEpisodes();
    this.updateSelectedEpisodes();
};

// ------------------------------------
// ---------- Page Selection ----------
// ------------------------------------

replayEpisodeCollection.createNumberedButton = function (buttonValue, buttonStr) {
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
        this.setPageNumber(buttonValue);
    }.bind(this), false);
    // Return button
    return tempNode;
};

replayEpisodeCollection.updatePageNumber = function () {
    // Variables
    //let tempNode;

    // Remove all page number buttons
    this.pageNumberList.querySelectorAll('.custom-button').forEach(function (node) {
        node.remove();
    });

    // Show 'PREV' if current page is more than 1
    this.prevButton.disabled = (this.currentPageDisplayed == 1);
    // Show 'NEXT' if current page is NOT last page
    this.nextButton.disabled = (this.currentPageDisplayed == this.totalPages);

    // If total pages is more than one
    if (this.totalPages > 1) {
        // Make sure page number container is displayed
        // TODO: Toggle class that hides element instead of changing display
        this.prevButton.parentElement.style.display = 'flex';

        // Add button for each page number and highlight current page
        for (let i = 1; i <= this.totalPages; i++) {
            this.pageNumberList.appendChild(this.createNumberedButton(i));
            /*
            tempNode = (i == this.currentPageDisplayed)
                ? ReplayEpisode.createElementAdv('button', 'active custom-button', i)
                : ReplayEpisode.createElementAdv('button', 'custom-button', i);
            tempNode.setAttribute('type', 'button');
            tempNode.setAttribute('value', i);
            tempNode.addEventListener("click", function () {
                this.setPageNumber(i);
            }.bind(this), false);

            //this.nextButton.insertAdjacentElement('beforebegin', tempNode);
            this.pageNumberList.appendChild(tempNode);
            */
        }
        // Clone page button container and add to bottom of main element
        // TODO
    } else { // Else total pages is only one, hide all
        // Make sure page number container is NOT displayed
        this.prevButton.parentElement.style.display = 'none';
    }
};

replayEpisodeCollection.updatePageNumberAdv = function () {
    // Variables
    const pageNumberList = document.getElementById('page-number-container-bottom');
    const maxDisplayedButtons = 5
    let numberedButtons = maxDisplayedButtons

    // Remove all page number buttons
    pageNumberList.querySelectorAll('.page-number-list .custom-button')
        .forEach(function (node) {
        node.remove();
        });

    // Disable 'PREV' if current page is equal to 1
    this.prevButton.disabled = (this.currentPageDisplayed == 1);

    // If current page is near beginning of list
    if (this.currentPageDisplayed <= maxDisplayedButtons) {

    }
    // Else If current page is near end of list
    else if (this.currentPageDisplayed >= this.totalPages - maxDisplayedButtons) {

    }
    // Else current page is in middle of list
    else {

    }

    // Disable 'NEXT' if current page is equal to last page (totalPages)
    this.prevButton.disabled = (this.currentPageDisplayed == this.totalPages);
};

// TODO: 
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

// TODO
replayEpisodeCollection.getPageNumberOfEpisode = function (replayEpisode) {

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
        if (this.selectedEpisodes.length) {
            this.videoPlayer.cuePlaylist({ playlist: this.selectedVideoIdArray.slice(0, 200) });
            this.currentlyPlayingEpisode = this.getEpisodeByVideoID(this.selectedVideoIdArray[0]);
        }
        else { // Else no selected episodes, cue Replay highlights video
            this.videoPlayer.cueVideoById('0ZtEkX8m6yg');
            this.currentlyPlayingEpisode = undefined;
        }
    }
    else { // Cue playlist starting with episodeIndex
        const episodeIndex = this.selectedVideoIdArray.indexOf(replayEpisode.youtubeVideoID);
        console.log(`episodeIndex: ${episodeIndex} - videoID: ${replayEpisode.youtubeVideoID}`);
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
        } else // Else 200 or less episodes in selected episodes
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray, episodeIndex);
        /*
        // If more than 200 episodes in selected episodes
        if (this.selectedVideoIdArray.length > 200) {
            // If episode is after first 200 on selected episode list
            if (episodeIndex > 199)
                this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(episodeIndex, episodeIndex + 200));
            else // Else episode is within first 200
                this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(0, 200), episodeIndex);
        } else { // Else 200 or less episodes in selected episodes
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray, episodeIndex);
        }
        */
        // Assign new currently playing episode
        this.currentlyPlayingEpisode = replayEpisode;
    }
};

// Event functions

// onPlayerReady(event)
// The API will call this function when the video player is ready.
replayEpisodeCollection.onPlayerReady = function (event) {
    console.log('replayEpisodeCollection.onPlayerReady(event) started');
    // Cue playlist of first 200 selected episodes
    //this.cueEpisodePlaylist();

    // If selected episodes length is greater than 0
        // If episode to play is defined, load playlist 200 videos in
        // length with selected episode first
        // Else cue playlist of first 200 selected episodes
    // Else selected episodes length is zero, cue Replay highlights
    /*
    if (this.selectedEpisodes.length) {
        if (this.currentEpisode) {

        } else {

        }
    } else
        this.videoPlayer.cueVideoById('0ZtEkX8m6yg');
    */
};

// onPlayerStateChange(event)
// The API calls this function when the player's state changes.
replayEpisodeCollection.onPlayerStateChange = function (event) {
    let str = 'YT Player State: ';
    switch (event.data) {
        case -1: str += 'Unstarted'; break;
        case 0: str += 'Ended'; break;
        case 1: str += 'Playing'; break;
        case 2: str += 'Paused'; break;
        case 3: str += 'Buffering'; break;
        case 5:
            str += 'Cued';
            console.log(`Cued Video URL: ${this.getEpisodeByVideoID(this.videoPlayer.getVideoUrl().split('=')[1].slice(0, 11)).episodeNumber} - Playlist Index: ${this.videoPlayer.getPlaylistIndex()}`);
            break;
        default:
    }
    console.log(str);
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

// playEpisode(replayEpisode)
replayEpisodeCollection.playEpisode = function (replayEpisode) {
    // Remove 'currently-playing' class from previously played episode
    if (this.currentEpisode) this.currentEpisode.episodeSection.classList.remove('currently-playing');

    // Set episodeSection of selected replayEpisode to class 'currently-playing'
    replayEpisode.episodeSection.classList.add('currently-playing');

    // Move video player before selected replay episode
    // TODO: Instead, move episode sections before video player
    //replayEpisode.episodeSection.before(this.videoPlayerContainer);

    // Scroll to top of video player
    this.videoPlayerContainer.scrollIntoView();

    this.cueEpisodePlaylist(replayEpisode);

    /*
    const episodeIndex = this.selectedVideoIdArray.indexOf(replayEpisode.youtubeVideoID);
    if (episodeIndex === -1) {
        console.log('ERROR: Requested video is NOT in selected episodes array');
    } else {
        if (this.selectedVideoIdArray.length > 200) {
            // If episode is after first 200 on selected episode list
            if (episodeIndex > 199)
                this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(episodeIndex, episodeIndex + 200));
            else // Else episode is within first 200
                this.videoPlayer.cuePlaylist(this.selectedVideoIdArray.slice(0, episodeIndex + 200), episodeIndex);
        } else { // Else 200 or less episodes in selected episodes
            this.videoPlayer.cuePlaylist(this.selectedVideoIdArray, episodeIndex);
        }
    }

    // Assign new currently playing episode
    this.currentlyPlayingEpisode = replayEpisode;
    */
    // Play video of episode
    //this.videoPlayer.cueVideoById(replayEpisode.youtubeVideoID);

    /* EXAMPLE:
     * index = n (episodeIndex, end, newIndex)
     * index = 100 (0, 199, 100)
     * index = 250 (200, 399, 50)
     * 
     * Use previous episode to play to check if need to cue new playlist
     * or just play current playlist at certain index.
    */
};

// moveEpisodeSectionsAroundVideoPlayer()
// Move all displayed episode sections prior to episode to play before video player
replayEpisodeCollection.moveEpisodeSectionsAroundVideoPlayer = function () {

};

// playNextEpisode()
replayEpisodeCollection.playNextEpisode = function () {

};

// playPrevEpisode()
replayEpisodeCollection.playPrevEpisode = function () {

};

// --------------------------
// ---------- Misc ----------
// --------------------------

// getPageOfEpisode(replayEpisode)
// Search for index of replayEpisode in selectedEpisodes and calculate page number
// with maxDisplayedEpisodes
replayEpisodeCollection.getPageOfEpisode = function (replayEpisode) {
    const episodeIndexInSelectedEpisodes = this.selectedEpisodes.indexOf(replayEpisode);
    if (episodeIndexInSelectedEpisodes === -1)
        console.error('Cannot find episode');
    else
        return Math.ceil(episodeIndexInSelectedEpisodes / this.maxDisplayedEpisodes);
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

// ---------------------------
// ---------- Stats ----------
// ---------------------------

// populateStats()
replayEpisodeCollection.populateStats = function () {
    // Total Time
    this.showTotalTime();
    // Total Views, Total Likes
    let totalViews = 0, totalLikes = 0;
    this.replayEpisodeObjectArray.forEach(function (episode) {
        if (episode.hasOwnProperty('views'))
            totalViews += episode.views;
        if (episode.hasOwnProperty('likes'))
            totalLikes += episode.likes;
    });
    document.getElementById('stats-total-views').insertAdjacentText('beforeend', ReplayEpisode.addCommasToNumber(totalViews));
    document.getElementById('stats-total-likes').insertAdjacentText('beforeend', ReplayEpisode.addCommasToNumber(totalLikes));
};

// showTotalTime()
// TODO: Static utility function with parameter totalTimeSeconds
replayEpisodeCollection.showTotalTime = function () {
    const days = Math.floor(this.totalTimeSeconds / 86400)
    const hours = Math.floor((this.totalTimeSeconds - days * 86400) / 3600);
    const minutes = Math.floor((this.totalTimeSeconds - days * 86400 - hours * 3600) / 60);
    const seconds = this.totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
    const totalTimeStr = `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds! (Total seconds: ${ReplayEpisode.addCommasToNumber(this.totalTimeSeconds)})`;

    document.getElementById('stats-total-time').insertAdjacentText('beforeend', totalTimeStr);
};

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