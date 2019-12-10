// Dark Mode Switch
var darkModeSwitch = document.getElementById('dark-mode-checkbox');
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme == 'dark') {
        darkModeSwitch.checked = 'true';
        console.log(darkModeSwitch.checked);
    }
}
darkModeSwitch.addEventListener('click', function (event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Sort - Event Listeners
document.querySelector(
    '#sort-container > select[name="sort-direction"]')
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
document.querySelector('#search-container button')
    .addEventListener("click",
        replayEpisodeCollection.search
            .bind(replayEpisodeCollection),
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

// Replay Episode Collection
replayEpisodeCollection.init(replayEpisodeArray);

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