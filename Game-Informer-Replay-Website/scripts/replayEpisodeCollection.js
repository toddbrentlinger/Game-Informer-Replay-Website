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
    airdate: 0,
    views: 1,
    likes: 2,
    shuffle: 3
});

// Object: Collection of all replay episodes
var replayEpisodeCollection = {
    // Properties
    totalTimeSeconds: 0,
    mainElement: document.getElementById('main'),
    replayEpisodeObjectArray: [],
    // Better if array of number as indices of base episode array and
    // then get the episode object by index instead of creating separate
    // array of ReplayEpisode objects
    selectedEpisodes: [],
    maxDisplayedEpisodes: 50, // Increments [10, 25, 50, 100, 200]
    pageDisplayed: 1, // Page number of selected episodes list depending on maxDisplayedEpisodes
    sort: sort.default, // initialize to sort.episodeNumber
    ascending: false, // whether to sort in ascending/descending order
    //shuffle: false,
    filter: filter.none
};

// -----------------------------
// ---------- Methods ----------
// -----------------------------

// Function: init()
replayEpisodeCollection.init = function (replayEpisodeArray) {
    // Populate replay episode object array in episode collection object
    this.populateEpisodeObjectArray(replayEpisodeArray);

    // Initialize selected episodes array to same order of base episode object array
    this.selectedEpisodes = this.replayEpisodeObjectArray.slice();

    // Clone episode section template to use for episode data
    this.episodeTemplate = document.querySelector('section.episode')
        .cloneNode(true);

    // Populate main element with initialized selected episodes array
    this.populateMainElement();
};

// Function: populateEpisodeObjectArray()
replayEpisodeCollection.populateEpisodeObjectArray = function (replayEpisodeArray) {
    for (const replayEpisode of replayEpisodeArray) {
        const replayEpisodeObject = new ReplayEpisode(replayEpisode);

        this.replayEpisodeObjectArray.push(replayEpisodeObject);

        // Increase total time of episodes
        let timeArr = replayEpisodeObject.videoLength.split(':');
        timeArr.forEach((item, index, arr) => { arr[index] = parseInt(item, 10);});
        this.totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }

    // Initialize displayed episodes array to same order of base episode object array
    //this.updateSelectedEpisodes(sort.default);

    // Success Message
    console.log('Finished replay episode assignment');
};

// Function: clearMainElement()
replayEpisodeCollection.clearMainElement = function () {
    let currentEpisodeElements = this.mainElement.getElementsByClassName('episode');
    // Make sure there are no episode elements already in place
    if (typeof currentEpisodeElements != 'undefined') {
        while (currentEpisodeElements.length > 0)
            this.mainElement.removeChild(currentEpisodeElements[currentEpisodeElements.length - 1]);
    }
}

/* Function: populateMainElement(begin, end)
 * Populate main HTML element with episode HTML from displayed episodes array
 * A negative index can be used, indicating an offset from the end of the sequence. 
 * If end is omitted, extracts through the end of the sequence(arr.length).
 * If end is greater than the length of the sequence, extracts through to the end of the sequence(arr.length).
*/
replayEpisodeCollection.populateMainElement = function (begin = 0, end = this.maxDisplayedEpisodes) {
    // Clear main element of episode sections
    this.clearMainElement();

    const arrLength = this.selectedEpisodes.length;
    // Check start argument
    if (begin < 0) begin = arrLength - begin;

    // Check end argument
    if (typeof end == 'undefined' || end > arrLength)
        end = arrLength;
    else if (end < 0)
        end = arrLength - end;

    // Fill main element with selected episodes array
    for (let i = begin; i < end; i++)
        this.mainElement.appendChild(this.selectedEpisodes[i].episodeSection);
};

// Function: showTotalTime()
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

// Function: getEpisodeByNumber(num)
replayEpisodeCollection.getEpisodeByNumber = function (num) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.episodeNumber == num)
            return episode;
    }
    // If for loop finishes without return, could NOT find episode
    return 0;
};

// Function: updateSelectedEpisodes()
replayEpisodeCollection.updateSelectedEpisodes = function (sortType, filterType) {
    switch (filterType) {
        case filter.none:
            this.selectedEpisodes = this.replayEpisodeObjectArray.slice();
            break;
        default:
    }

    if (this.shuffle) {
        this.shuffleArray(this.selectedEpisodes);
        // After selectedEpisodes is shuffled, set shuffle back to false
        this.shuffle = false;
    } else if (this.ascending)
        this.selectedEpisodes.reverse();

    // Populate main element with new selected objects
    this.populateMainElement();
};

// Function: filterBySeason
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

// Function: shuffleArray(arr)
// Accepts array as argument to shuffle
replayEpisodeCollection.shuffleArray = function (arr) {

    for (let i = arr.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i 
        let j = Math.floor(Math.random() * (i + 1));

        // Swap arr[i] with the element at random index
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    // Use a different seed value so don't get same result each time 
    // srand(time(NULL));
};

// Function: shuffleSelectedEpisodes()
replayEpisodeCollection.shuffleSelectedEpisodes = function () {
    this.shuffleArray(this.selectedEpisodes);
    this.updateSelectedEpisodes();
};