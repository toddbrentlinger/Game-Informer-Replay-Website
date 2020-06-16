"use strict";

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

    // Set date for copyright
    document.getElementById('copyright-current-year').innerHTML = `2019-${new Date().getFullYear()}`;

    // Set date the document was last modified at the bottom of the page
    document.getElementById('lastModifiedDate').innerHTML = new Date(document.lastModified).toDateString();
}