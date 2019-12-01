/*
const mainElement = document.getElementById('main');
var totalTimeSeconds = 0;

for (let i = 0; i < replayEpisodeArray.length; i++) {
    // Create new paragraph element to add episode data
    var para = document.createElement('p');

    // Reference to each replay episode object containing key/value pairs
    const replayEpisode = replayEpisodeArray[i];

    // Total time of episodes
    var timeArr = replayEpisode["videoLength"].split(':')
    timeArr.forEach(parseIntArrayFunc);
    function parseIntArrayFunc(item, index, arr) {
        arr[index] = parseInt(item, 10);
    }
    totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
        + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);

    // Add episode data to paragraph element
    para.textContent = "Episode: " + replayEpisode["episodeNumber"] + " - Title: " + replayEpisode["episodeTitle"];
    para.textContent += " - Video Length: ";
    for (let i = 0; i < timeArr.length; i++) {
        para.textContent += timeArr[i];
        if (i < timeArr.length - 1)
            para.textContent += ":"
    }
    para.textContent += " - Cummulative Time(s): " + totalTimeSeconds;

    // Append paragraph element with episode data to main element
    mainElement.appendChild(para);
}

// Show total time of episodes
var seconds, minutes, hours, days = 0;
days = Math.floor(totalTimeSeconds / 86400)
hours = Math.floor((totalTimeSeconds - days * 86400) / 3600);
minutes = Math.floor((totalTimeSeconds - days * 86400 - hours * 3600) / 60);
seconds = totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
const totalTimePara = document.createElement('p');
totalTimePara.textContent = "Total length of all replay episodes: " + days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds!";
totalTimePara.textContent += "\nTotal seconds: " + totalTimeSeconds;
mainElement.appendChild(totalTimePara);
*/

// TEMP
displayReplayEpisodes();

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