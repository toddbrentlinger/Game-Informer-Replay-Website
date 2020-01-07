
// Replay Episode Collection
replayEpisodeCollection.init(replayEpisodeArray);

// TODO: Add code from youtubePlayerController.js

// Sort - Event Listeners
document.querySelector(
    '#sort-container select[name = "sort-type"]')
    .addEventListener("change",
        replayEpisodeCollection.setSortByEvent
        .bind(replayEpisodeCollection),
    false);
document.querySelector(
    '#sort-container select[name = "sort-direction"]')
    .addEventListener("change",
        replayEpisodeCollection.setSortByEvent
        .bind(replayEpisodeCollection),
    false);
document.querySelector(
    '#sort-container select[name = "max-displayed"]')
    .addEventListener("change",
        replayEpisodeCollection.setSortByEvent
        .bind(replayEpisodeCollection),
    false);
/*
// Filter - Event Listeners
document.getElementById('filter-button')
    .addEventListener("click",
        replayEpisodeCollection.updateFilterObj
        .bind(replayEpisodeCollection),
    false);
*/
document.getElementById('filterForm')
    .addEventListener("change",
        replayEpisodeCollection.updateFilterObj
        .bind(replayEpisodeCollection),
    false);

// Filter - Select/Deselect All Toggle
document.getElementById('filter-toggle-select-button')
    .addEventListener("click", function () {
        const inputArr = replayEpisodeCollection.filterFormElement.querySelectorAll('input[type="checkbox"]');
        const bMoreCheckedInputs = (replayEpisodeCollection.filterFormElement.querySelectorAll('input[type="checkbox"]:checked').length
            > .5 * inputArr.length);

        for (const inputNode of inputArr)
            inputNode.checked = !bMoreCheckedInputs;

        replayEpisodeCollection.updateFilterObj();
    }.bind(replayEpisodeCollection), false);

// Filter - Toggle display of filter form
document.getElementById('filter-display-toggle-button')
    .addEventListener("click", function () {
        this.classList.toggle('active');
        if (replayEpisodeCollection.filterFormElement.style.maxHeight)
            replayEpisodeCollection.filterFormElement.style.maxHeight = null;
        else
            replayEpisodeCollection.filterFormElement.style.maxHeight = replayEpisodeCollection.filterFormElement.scrollHeight + 'px';
    }, false);

// Seach - Event Listeners
// Search is button is clicked
document.querySelector('#search-container button')
    .addEventListener("click", function () {
        replayEpisodeCollection.updateFilterObj();
        //replayEpisodeCollection.filterBySearch(replayEpisodeCollection.searchInputElement.value)
    }.bind(replayEpisodeCollection),
    false);
// Search if press enter inside input field by making button click
document.querySelector('#search-container input[type="text"]')
    .addEventListener("keyup", function (event) {
        if (event.keyCode === 13) { // No. 13 is 'enter' key
            // Cancel default action, if needed
            event.preventDefault();
            // Trigger button element with a click
            document.querySelector('#search-container button')
                .click();
        }
    },
    false);

// Shuffle Button
document.getElementById('button-shuffle')
    .addEventListener("click",
        replayEpisodeCollection.shuffleSelectedEpisodes
            .bind(replayEpisodeCollection),
    false);

// Reset Button
document.getElementById('button-reset-list')
    .addEventListener("click", 
        replayEpisodeCollection.resetSelectedEpisodes
            .bind(replayEpisodeCollection),
    false);

// Page Select
document.querySelectorAll('.page-number-container button[value="prev"]')
    .forEach(function (node) {
        node.addEventListener("click", function () {
            replayEpisodeCollection.setPageNumber('prev');
        }, false);
    });
document.querySelectorAll('.page-number-container button[value="next"]')
    .forEach(function (node) {
        node.addEventListener("click", function () {
            replayEpisodeCollection.setPageNumber('next');
        }, false);
    });
document.querySelectorAll('.page-number-container button[value="first"]')
    .forEach(function (node) {
        node.addEventListener("click", function () {
            replayEpisodeCollection.setPageNumber('first');
        }, false);
    });
document.querySelectorAll('.page-number-container button[value="last"]')
    .forEach(function (node) {
        node.addEventListener("click", function () {
            replayEpisodeCollection.setPageNumber('last');
        }, false);
    });
/*
replayEpisodeCollection.prevButton.addEventListener("click",
    function () {
        replayEpisodeCollection.setPageNumber('prev');
    }.bind(replayEpisodeCollection), false
);
replayEpisodeCollection.nextButton.addEventListener("click",
    function () {
        replayEpisodeCollection.setPageNumber('next');
    }.bind(replayEpisodeCollection), false
);
*/

// Jump To Top Page
const jumpToTopPageElement = document.getElementById('jump-top-page-container');
const mainElement = document.querySelector('main');
window.addEventListener("scroll", function () {
    jumpToTopPageElement.style.display =
        (mainElement.getBoundingClientRect().top < 0) ? "block" : "none";
}, false);
/*
// Toggle Video Player
var isVideoPlayerDisplayed = true;
const videoPlayerContainer = document.getElementById('videoPlayer');
document.getElementById('button-toggleVideoPlayer')
    .addEventListener("click", 
    function () {
        // Toggle videoPlayerDisplayed
        isVideoPlayerDisplayed = !isVideoPlayerDisplayed;
        // Hide/Display video player
        videoPlayerContainer.style.display = (isVideoPlayerDisplayed) ? 'block' : 'none';
    }, false);
*/

// Set date for copyright
document.getElementById('copyright-current-year').innerHTML = `2019-${new Date().getFullYear()}`;

// Set date the document was last modified at the bottom of the page
document.getElementById('lastModifiedDate').innerHTML = new Date(document.lastModified).toDateString();
//document.getElementById('lastModifiedReplayList').innerHTML = lastModifiedReplayList;

// Media Queries
function setMaxDisplayedButtonsByMediaQuery(mediaQueryObj) {
    const prevValue = replayEpisodeCollection.maxDisplayedButtons;
    replayEpisodeCollection.maxDisplayedButtons = 
        (mediaQueryObj.matches) ? 5 : 7;
    // Update page number containers
    if (replayEpisodeCollection.maxDisplayedButtons !== prevValue) {
        replayEpisodeCollection.updatePageNumberAdv('top');
        replayEpisodeCollection.updatePageNumberAdv('bottom');
    }
}
var maxWidthForFiveNumberButtons = window.matchMedia("(max-width: 550px)");
// Call listener function at run time
setMaxDisplayedButtonsByMediaQuery(maxWidthForFiveNumberButtons);
// Attach listener function on state changes
maxWidthForFiveNumberButtons.addListener(setMaxDisplayedButtonsByMediaQuery);

/* JSON
let requestURL = 'https://github.com/toddbrentlinger/Game-Informer-Scraper/blob/master/Game%20Informer%20Scraper/gameInformerReplayFandomWikiData.json';
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function () {
    const replayEpisodeJSON = request.response;
    populatePara(replayEpisodeJSON);
}

function populatePara(jsonObj) {
    console.log("function populatePara runs");
    const para = document.createElement('p');

    for (let i = 0; i < jsonObj.length; i++) {
        var replayEpisode = jsonObj[i];
        para.textContent = "Episode: " + replayEpisode["episodeNumber"] + "\t    Title: " + replayEpisode["episodeTitle"] + "\n";
    }

    mainElement.appendChild(para);
}
*/
/*
$.getJSON("https://github.com/toddbrentlinger/Game-Informer-Scraper/blob/master/Game%20Informer%20Scraper/gameInformerReplayFandomWikiData.json",
    function (replayEpisodeArray) {
        const para = document.createElement('p');

        for (let i = 0; i < jsonObj.length; i++) {
            var replayEpisode = jsonObj[i];
            para.textContent = "Episode: " + replayEpisode["episodeNumber"] + "\t    Title: " + replayEpisode["episodeTitle"] + "\n";
        }

        mainElement.appendChild(para);
    });
*/