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
}