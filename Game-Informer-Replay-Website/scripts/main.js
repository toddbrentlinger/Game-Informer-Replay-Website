"use strict";

import { loadPlayerAPI } from "./youtubePlayerController.js";

// Replay Episode Collection
// Using JS file
replayEpisodeCollection.init(replayEpisodeArray);
loadPlayerAPI();
/* Using JSON file
getReplayEpisodeArr();
function getReplayEpisodeArr() {
    // Use data from JSON file
    let requestURL = 'data/gameInformerReplayFandomWikiData.json';
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        replayEpisodeCollection.init(request.response);
        loadPlayerAPI();
    }
    
}
*/

// Current Episode Display Toggle
replayEpisodeCollection.currentEpisodeInfoToggleButton
    .addEventListener("click",
        replayEpisodeCollection.toggleCurrentEpisodeInfo.bind(replayEpisodeCollection),
        false);

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

// Filter - Event Listeners
// TODO: Move to replayEpisodeCollection.populateFilterForm()
document.getElementById('filterForm')
    .addEventListener("change",
        replayEpisodeCollection.updateFilterObj
        .bind(replayEpisodeCollection),
    false);

// Filter - Select/Deselect All Toggle
document.getElementById('filter-toggle-select-button')
    .addEventListener("click", function () {
        replayEpisodeCollection.filterFormElement.reset();
        replayEpisodeCollection.updateFilterObj();
        /*
        const inputArr = replayEpisodeCollection.filterFormElement.querySelectorAll('input[type="checkbox"]');
        const bMoreCheckedInputs = (replayEpisodeCollection.filterFormElement.querySelectorAll('input[type="checkbox"]:checked').length
            > .5 * inputArr.length);

        for (const inputNode of inputArr)
            inputNode.checked = !bMoreCheckedInputs;

        replayEpisodeCollection.updateFilterObj();
        */
    }, false);

// Filter - Toggle display of filter form
document.getElementById('filter-display-toggle-button')
    .addEventListener("click", function () {
        this.classList.toggle('active');
        replayEpisodeCollection.filterFormElement.style.maxHeight =
            (replayEpisodeCollection.filterFormElement.style.maxHeight)
                ? null
                : replayEpisodeCollection.filterFormElement.scrollHeight + 12 + 'px';
        /*
        if (replayEpisodeCollection.filterFormElement.style.maxHeight)
            replayEpisodeCollection.filterFormElement.style.maxHeight = null;
        else
            replayEpisodeCollection.filterFormElement.style.maxHeight = replayEpisodeCollection.filterFormElement.scrollHeight + 'px';
        */
    }, false);
/*
document.querySelectorAll('#filterForm fieldset').forEach(
    function (fieldset) {
        fieldset.querySelector('legend').addEventListener("click", function () {
            this.parentElement.classList.toggle('active');
            const element = this.parentElement.querySelector('ul');
            element.style.maxHeight =
                (element.style.maxHeight)
                    ? null
                    : element.scrollHeight + 'px';
            // If whole filterForm is expanded, change maxHeight
            if (replayEpisodeCollection.filterFormElement.style.maxHeight)
                replayEpisodeCollection.filterFormElement.style
                    .maxHeight = replayEpisodeCollection.filterFormElement.scrollHeight + 12 + 'px';
        }, false);
    }
);
*/
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
document.querySelectorAll('.page-number-container > button')
    .forEach(function (node) {
        node.addEventListener("click", function () {
            replayEpisodeCollection
                .setPageNumber(this.getAttribute('value'),
                    this.parentElement.id.includes('bottom'));
        }, false);
    });

// Jump To Top Page
const jumpToTopPageElement = document.getElementById('jump-top-page-container');
const topPageElement = document.getElementById('top-page');
const mainElement = document.querySelector('main');
window.addEventListener("scroll", function () {
    jumpToTopPageElement.style.display =
        (mainElement.getBoundingClientRect().top < 0) ? "block" : "none";
}, false);
jumpToTopPageElement.addEventListener("click", function () {
    topPageElement.scrollIntoView();
}, false);

// Set date for copyright
document.getElementById('copyright-current-year').innerHTML = `2019-${new Date().getFullYear()}`;

// Set date the document was last modified at the bottom of the page
document.getElementById('lastModifiedDate').innerHTML = new Date(document.lastModified).toDateString();
//document.getElementById('lastModifiedReplayList').innerHTML = lastModifiedReplayList;

// Media Queries
/*
function setMaxDisplayedButtonsByMediaQuery(mediaQueryObj) {
    console.log(`setMaxDisplayedButtonsByMediaQuery started with paramter: media(${mediaQueryObj.media}) - matches(${mediaQueryObj.matches})`);
    const prevValue = replayEpisodeCollection.maxDisplayedButtons;
    replayEpisodeCollection.maxDisplayedButtons = 
        (mediaQueryObj.matches) ? 5 : 7;
    // Update page number containers
    if (replayEpisodeCollection.maxDisplayedButtons !== prevValue) {
        replayEpisodeCollection.updatePageNumberAdv('top');
        replayEpisodeCollection.updatePageNumberAdv('bottom', true);
    }
}
const maxWidthForFiveNumberButtons = window.matchMedia("(max-width: 750px)"); // 550

// Call listener function at run time
setMaxDisplayedButtonsByMediaQuery(maxWidthForFiveNumberButtons);
// Attach listener function on state changes
maxWidthForFiveNumberButtons.addListener(setMaxDisplayedButtonsByMediaQuery);
*/
const mediaQueriesArr = [
    window.matchMedia("(max-width: 750px)"),
    window.matchMedia("(max-width: 480px)")
];

function mediaQueryResponse() {
    const prevValue = replayEpisodeCollection.maxDisplayedButtons;
    if (mediaQueriesArr[1].matches)
        replayEpisodeCollection.maxDisplayedButtons = 3;
    else if (mediaQueriesArr[0].matches)
        replayEpisodeCollection.maxDisplayedButtons = 5;
    else
        replayEpisodeCollection.maxDisplayedButtons = 7;
    // Update page number containers
    if (replayEpisodeCollection.maxDisplayedButtons !== prevValue) {
        replayEpisodeCollection.updatePageNumberAdv('top');
        replayEpisodeCollection.updatePageNumberAdv('bottom', true);
    }
}

for (let i = 0; i < mediaQueriesArr.length; i++)
    mediaQueriesArr[i].addListener(mediaQueryResponse) // attach listener function to listen in on state changes
// call listener function explicitly at run time
mediaQueryResponse(mediaQueriesArr[0])