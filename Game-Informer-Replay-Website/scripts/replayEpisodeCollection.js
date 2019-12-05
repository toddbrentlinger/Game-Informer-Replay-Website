// Object: Collection of all replay episodes
var replayEpisodeCollection = {
    // Properties
    totalTimeSeconds: 0,
    mainElement: document.getElementById('main'),
    replayEpisodeObjectArray: [],
    episodesToPlayArray: []
};

// -----------------------------
// ---------- Methods ----------
// -----------------------------

replayEpisodeCollection.populateEpisodeObjectArray = function () {
    for (let i = 0; i < replayEpisodeArray.length; i++) {
        const replayEpisode = replayEpisodeArray[i];
        const replayEpisodeObject = new ReplayEpisode(replayEpisode);

        //this.mainElement.appendChild(replayEpisodeObject.episodeSection);

        this.replayEpisodeObjectArray.push(replayEpisodeObject);

        // Increase total time of episodes
        let timeArr = replayEpisodeObject.videoLength.split(':');
        timeArr.forEach(function (item, index, arr) {
            arr[index] = parseInt(item, 10);
        });
        this.totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }
    console.log('Finished replay episode assignment');
};

replayEpisodeCollection.clearMainElement = function () {
    // Make sure there are no episode elements already in place
    
    let currentEpisodeElements = this.mainElement.getElementsByClassName('episode');
    //Array.prototype.forEach.call(currentEpisodeElements, function () {
    //    this.mainElement.removeChild()
    //});
    if (typeof currentEpisodeElements != 'undefined') {
        while (currentEpisodeElements.length > 0) {
            this.mainElement.removeChild(currentEpisodeElements[currentEpisodeElements.length - 1]);
        }
    }
    /*
    let currentEpisodeElements = this.mainElement.getElementsByClassName('episode');
    if (typeof currentEpisodeElements != 'undefined') {
        for (let node of currentEpisodeElements)
            node.remove();
    }
    */
}

replayEpisodeCollection.populateMainElement = function (showOriginal = false, reverse = false, shuffle = false) {
    // Clear main element of episode sections
    this.clearMainElement();

    // Fill main element with new array of episodes
    if (reverse) {
        for (const episode of this.replayEpisodeObjectArray.reverse()) {
            this.mainElement.appendChild(episode.episodeSection);
        }
    } else {
        for (const episode of this.replayEpisodeObjectArray) {
            this.mainElement.appendChild(episode.episodeSection);
        }
    }
};

replayEpisodeCollection.showTotalTime = function () {
    // Show total time of episodes
    let seconds, minutes, hours, days = 0;
    days = Math.floor(this.totalTimeSeconds / 86400)
    hours = Math.floor((this.totalTimeSeconds - days * 86400) / 3600);
    minutes = Math.floor((this.totalTimeSeconds - days * 86400 - hours * 3600) / 60);
    seconds = this.totalTimeSeconds - (days * 86400) - (hours * 3600) - (minutes * 60);
    let totalTimePara = document.createElement('p');
    totalTimePara.textContent = "Total length of all replay episodes: "
        + days + " days, " + hours + " hours, " + minutes + " minutes, "
        + seconds + " seconds!";
    totalTimePara.textContent += "\nTotal seconds: " + this.totalTimeSeconds;
    this.mainElement.appendChild(totalTimePara);
};

replayEpisodeCollection.getEpisodeByNumber = function (num) {
    for (const episode of this.replayEpisodeObjectArray) {
        if (episode.episodeNumber == num) {
            return episode;
        }
    }
    // If for loop finishes without return, could NOT find episde
    return 0;
};

replayEpisodeCollection.shuffleArray = function (arr) {

    for (let i = arr.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i 
        let j = Math.floor(Math.random() * (i + 1));

        // Swap arr[i] with the element at random index
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    // Use a different seed value so don't get same result each time 
    // srand(time(NULL));
};