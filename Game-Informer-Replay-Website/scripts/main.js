/*
// Dark Mode Switch
var darkModeSwitch = document.getElementById('dark-mode-checkbox');
//const currentTheme = window.localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    //document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme == 'dark') {
        darkModeSwitch.checked = 'true';
    }
}
darkModeSwitch.addEventListener('click', function (event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        window.localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        window.localStorage.setItem('theme', 'light');
    }
}, false);
*/
// Replay Episode Collection
replayEpisodeCollection.init(replayEpisodeArray);

// Sort - Event Listeners
document.querySelector(
    '#sort-container > select[name = "sort-type"]')
    .addEventListener("change",
        replayEpisodeCollection.setSortByEvent
            .bind(replayEpisodeCollection),
        false);
document.querySelector(
    '#sort-container > select[name = "sort-direction"]')
    .addEventListener("change",
    replayEpisodeCollection.setSortByEvent
    .bind(replayEpisodeCollection),
    false);
document.querySelector(
    '#sort-container > select[name = "max-displayed"]')
    .addEventListener("change",
        replayEpisodeCollection.setSortByEvent
            .bind(replayEpisodeCollection),
        false);

// Filter - Event Listeners

// Seach - Event Listeners
// Search is button is clicked
document.querySelector('#search-container button')
    .addEventListener("click",
        replayEpisodeCollection.search
            .bind(replayEpisodeCollection),
    false);
// Search if press enter inside input field by making button click
document.querySelector('#search-container input[type="search"]')
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

// Jump To Top Page
var jumpToTopPageElement = document.getElementById('jump-top-page-container');
window.addEventListener("scroll", function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)
        jumpToTopPageElement.style.display = "block";
    else
        jumpToTopPageElement.style.display = "none";
}, false);

// Set date the document was last modified at the bottom of the page
document.getElementById('lastModifiedDate').innerHTML = new Date(document.lastModified).toDateString();
document.getElementById('lastModifiedReplayList').innerHTML = lastModifiedReplayList;

/*
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