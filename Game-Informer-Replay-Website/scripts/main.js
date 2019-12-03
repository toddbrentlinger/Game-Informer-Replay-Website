// TEMP
// displayReplayEpisodes();

var replayEpisodeObjectArray = []
for (let i = 0; i < replayEpisodeArray.length; i++) {
    const replayEpisode = replayEpisodeArray[i];
    replayEpisodeObject = new ReplayEpisode(replayEpisode);
    replayEpisodeObjectArray.push(replayEpisodeObject);

    // TEMP
    tempStr = replayEpisodeObject.episodeNumber + ' __ ';
    if (replayEpisodeObject.hasOwnProperty('middleSegment'))
        tempStr += ReplayEpisode.getSegmentTitle(replayEpisodeObject.middleSegment) + ' __ ';
    if (replayEpisodeObject.hasOwnProperty('secondSegment'))
        tempStr += ReplayEpisode.getSegmentTitle(replayEpisodeObject.secondSegment);
    console.log(tempStr);
}

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