// TEMP
// displayReplayEpisodes();
/*
let totalTimeSeconds = 0;

let mainElement = document.getElementById('main');

var replayEpisodeObjectArray = [];
for (let i = 0; i < replayEpisodeArray.length; i++) {
    const replayEpisode = replayEpisodeArray[i];
    replayEpisodeObject = new ReplayEpisode(replayEpisode);

    mainElement.appendChild(replayEpisodeObject.episodeSection);

    replayEpisodeObjectArray.push(replayEpisodeObject);

    // Increase total time of episodes
    let timeArr = replayEpisodeObject.videoLength.split(':');
    timeArr.forEach(function (item, index, arr) {
        arr[index] = parseInt(item, 10);
    });
    totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
        + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);

}
console.log('Finished replay episode assignment');
*/
/*
// YouTube Playlist URL: Add to youtube playlist URL
let playlistSrcString = ''
for (const replayEpisode of replayEpisodeObjectArray) {
    // If replay episode has YouTube video id
    if (replayEpisode.youtubeVideoID.length) {
        if (playlistSrcString.length) {
            playlistSrcString += ',' + replayEpisode.youtubeVideoID;
        } else {
            playlistSrcString = 'https://www.youtube.com/embed/' + replayEpisode.youtubeVideoID
                + '?playlist=';
        }
    }
}
document.getElementById('videoPlayer').getElementsByTagName('iframe')[0].setAttribute('src', playlistSrcString);
*/

// Populate replay episode object array in episode collection object
replayEpisodeCollection.populateEpisodeObjectArray();
replayEpisodeCollection.populateMainElement();

var videoIdArray = [];
for (const replayEpisode of replayEpisodeCollection.replayEpisodeObjectArray) {
    if (replayEpisode.youtubeVideoID.length) {
        videoIdArray.push(replayEpisode.youtubeVideoID);
    }
}
/*
// Show total time of episodes
let seconds, minutes, hours, days = 0;
days = Math.floor(totalTimeSeconds / 86400)
hours = Math.floor((totalTimeSeconds - days * 86400) / 3600);
minutes = Math.floor((totalTimeSeconds - days * 86400 - hours * 3600) / 60);
seconds = totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
let totalTimePara = document.createElement('p');
totalTimePara.textContent = "Total length of all replay episodes: " + days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds!";
totalTimePara.textContent += "\nTotal seconds: " + totalTimeSeconds;
mainElement.appendChild(totalTimePara);
*/
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