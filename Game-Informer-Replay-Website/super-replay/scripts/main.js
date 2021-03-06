﻿"use strict";

console.log("main.js has started");

superReplayCollection.init();
init();

// -------------------------------
// ---------- Functions ----------
// -------------------------------

function init() {
    // -------------------------------------
    // ---------- Event Listeners ----------
    // -------------------------------------

    // ---------- Sort ----------

    // Sort - Type
    document.querySelector(
        '#sort-container select[name = "sort-type"]')
        .addEventListener("change",
            superReplayCollection.setSortByEvent
                .bind(superReplayCollection),
        false);
    // Sort - Direction
    document.querySelector(
        '#sort-container select[name = "sort-direction"]')
        .addEventListener("change",
            superReplayCollection.setSortByEvent
                .bind(superReplayCollection),
        false);
    // Sort - Max Displayed
    document.querySelector(
        '#sort-container select[name = "max-displayed"]')
        .addEventListener("change",
            superReplayCollection.setSortByEvent
                .bind(superReplayCollection),
        false);

    // ---------- Filter ----------

    // Filter - Clear All
    document.getElementById('filter-toggle-select-button')
        .addEventListener('click', function () {
            superReplayCollection.filterFormElement.reset();
            superReplayCollection.filter();
        }, false);

    // Filter - Toggle display of filter form
    document.getElementById('filter-display-toggle-button')
        .addEventListener('click', function () {
            this.classList.toggle('active');
            superReplayCollection.filterFormElement.style.maxHeight =
                (superReplayCollection.filterFormElement.style.maxHeight)
                    ? null
                    : superReplayCollection.filterFormElement.scrollHeight + 12 + 'px';
        }, false);

    // ---------- Filter - Search ----------

    // Search button is clicked
    document.querySelector('#search-container button')
        .addEventListener('click', function () {
            superReplayCollection.filter();
        }.bind(superReplayCollection),
        false);

    // Search if press ENTER inside input field by making button click
    document.querySelector('#search-container input[type="text"]')
        .addEventListener('keyup', function (event) { 
            if (event.keyCode === 13) { // No. 13 is ENTER key
                // Cancel default action, if needed
                event.preventDefault();
                // Trigger button element with a click
                document.querySelector('#search-container button').click();
            }
        }, false);

    // ---------- Shuffle ----------

    document.getElementById('button-shuffle')
        .addEventListener("click",
            superReplayCollection.shuffleSelectedSuperReplays
                .bind(superReplayCollection),
        false);

    // ---------- Reset ----------

    document.getElementById('button-reset-list')
        .addEventListener("click",
            superReplayCollection.resetSelectedSuperReplays
                .bind(superReplayCollection),
        false);

    // ---------- Page Select ----------

    document.querySelectorAll('.page-number-container > button')
        .forEach(function (node) {
            node.addEventListener("click", function () {
                superReplayCollection
                    .setPageNumber(this.getAttribute('value'),
                        this.parentElement.id.includes('bottom'));
            }, false);
        });

    // ---------- Jump To Top Page ----------

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

    // ---------- Other/Misc ----------

    // Set date for copyright
    document.getElementById('copyright-current-year').innerHTML = `2019-${new Date().getFullYear()}`;

    // Set date the document was last modified at the bottom of the page
    //document.getElementById('lastModifiedDate').innerHTML = new Date(document.lastModified).toDateString();
}

// ---------- Media Queries ----------

const mediaQueriesArr = [
    window.matchMedia("(max-width: 750px)"),
    window.matchMedia("(max-width: 480px)")
];

function mediaQueryResponse() {
    const prevValue = superReplayCollection.maxDisplayedButtons;
    if (mediaQueriesArr[1].matches)
        superReplayCollection.maxDisplayedButtons = 3;
    else if (mediaQueriesArr[0].matches)
        superReplayCollection.maxDisplayedButtons = 5;
    else
        superReplayCollection.maxDisplayedButtons = 7;
    // Update page number containers
    if (superReplayCollection.maxDisplayedButtons !== prevValue) {
        superReplayCollection.updatePageNumber('top');
        superReplayCollection.updatePageNumber('bottom', true);
    }
}

for (let i = 0; i < mediaQueriesArr.length; i++)
    mediaQueriesArr[i].addListener(mediaQueryResponse); // attach listener function to listen in on state changes
// call listener function explicitly at run time
mediaQueryResponse();