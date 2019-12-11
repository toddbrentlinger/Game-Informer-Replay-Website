// Find episode numbers with no provided YouTube URL
function findEpisodesWithNoYouTubeURL(replayEpisodes) {
    let episodesFlagged = [];
    replayEpisodes.forEach(function (episode) {
        if (!episode.hasOwnProperty('youtubeVideoID')
            || !episode.youtubeVideoID)
            episodesFlagged.push(episode.episodeNumber);
    });
    console.log(episodesFlagged);
}

// Object Array Test
var baseObjectArray = [{ name: 'first' }, { name: 'second' }, { name: 'third' }, { name: 'fourth' }];
var alteredObjectArrayDeepCopy = baseObjectArray.slice();
var alteredObjectArrayReference = [];
objectArrayTest(baseObjectArray);
function objectArrayTest(baseArr) {
    for (obj of baseArr)
        alteredObjectArrayReference.push(obj);
}

// ReplayEpisode.populateEpisodeSection()
ReplayEpisode.populateEpisodeSection = function (episodeTemplateNode) {
    // Variables (temp can be array, string, ...)
    let parentNode, childNode, temp;

    // Initialize this.episodeSection to template clone
    this.episodeSection = episodeTemplateNode.cloneNode(true);

    // ---------------------------
    // --------- Header ----------
    // ---------------------------

    // Title
    this.episodeSection.querySelector('.episodeTitle')
        .insertAdjacentText('afterbegin',
            this.episodeTitle);

    // Number
    // Assign temp to array of season number and season episode number
    temp = this.getReplaySeason();
    this.episodeSection.querySelector('.episodeNumber')
        .insertAdjacentText('afterbegin',
            `S${temp[0]}:E${temp[1]} (#${this.episodeNumber})`);

    // -------------------------------
    // ---------- Thumbnail ----------
    // -------------------------------

    // Anchor link
    parentNode = this.episodeSection.querySelector('.episodeThumbnail > a');
    //childNode.setAttribute('title', '');
    parentNode.setAttribute('href', 'https://www.youtube.com/watch?v=' + this.youtubeVideoID);

    // Image
    parentNode = this.episodeSection.querySelector('.episodeImage');
    //childNode.setAttribute('alt', '');
    parentNode.setAttribute('width', this.image.width);
    parentNode.setAttribute('height', this.image.height);
    parentNode.setAttribute('src', this.image.srcset[0]);
    // Source Set (srcset)
    temp = ''; // Assign temp to empty string
    this.image.srcset.forEach(function (source, index, array) {
        temp += source;
        // Add characters between values in array
        temp = (index === array.length - 1) ? ''
            : (index === 1) ? ', ' : ' ';
    });
    parentNode.setAttribute('srcset', temp);

    // Video Length
    this.episodeSection.querySelector('.episodeLength')
        .insertAdjacentText('afterbegin', this.videoLength);

    // -------------------------------------
    // ---------- Episode Details ----------
    // -------------------------------------

    // Air Date
    this.episodeSection.querySelector('.episodeAirDate')
        .insertAdjacentText('afterbegin', this.getDateString());

    // Host
    if (this.hasOwnProperty('host')) {
        this.episodeSection.querySelector('episodeHosts')
            .insertAdjacentText('afterbegin',
                ReplayEpisode.listArrayAsString(this.host));
    }

    // Featuring
    if (this.hasOwnProperty('featuring')) {
        this.episodeSection.querySelector('episodeFeaturing')
            .insertAdjacentText('afterbegin',
                ReplayEpisode.listArrayAsString(this.featuring));
    }

    // Main Segment Games
    // Add 's' to 'Main Segment Game: ' if more than one game
    if (this.mainSegmentGamesAdv.length > 1)
        this.episodeSection.querySelector('.mainSegment > b')
            .innerHTML = 'Main Segment Games: ';
    // Add list of games as text node
    temp = []; // Assign temp to empty array for game titles
    this.mainSegmentGamesAdv.forEach(game => temp.push(game.title));
    this.episodeSection.querySelector('.mainSegment')
        .insertAdjacentText('beforeend', ReplayEpisode.listArrayAsString(temp));

    // Middle Segment (3rd season only)
    if (this.hasOwnProperty('middleSegment') || this.hasOwnProperty('middleSegmentContent')) {
        this.episodeSection.querySelector('middleSegment')
            .insertAdjacentText('beforeend',
                (this.hasOwnProperty('middleSegment')
                    ? ReplayEpisode.getSegmentTitle(this.middleSegment)
                    + (this.hasOwnProperty('middleSegmentContent') ? ' - ' : '')
                    : '')
                + (this.hasOwnProperty('middleSegmentContent')
                    ? ReplayEpisode.listArrayAsString(this.middleSegmentContent)
                : '')
            );
    } else // Else NO middle segment, remove middleSegment node
        this.episodeSection.querySelector('middleSegment').remove();

    // Second Segment
    if (this.hasOwnProperty('secondSegment') || this.hasOwnProperty('secondSegmentGames')) {
        this.episodeSection.querySelector('secondSegment')
            .insertAdjacentText('beforeend',
                (this.hasOwnProperty('secondSegment')
                    ? ReplayEpisode.getSegmentTitle(this.secondSegment)
                    + (this.hasOwnProperty('secondSegmentGames') ? ' - ' : '')
                    : '')
                + (this.hasOwnProperty('secondSegmentGames')
                    ? ReplayEpisode.listArrayAsString(this.secondSegmentGames)
                : '')
            );
    } else // Else NO second segment, remove secondSegment node
        this.episodeSection.querySelector('secondSegment').remove();

    // -------------------------------
    // ---------- More Info ----------
    // -------------------------------

    // Description
    parentNode = this.episodeSection.querySelector('episodeMoreInfo');
    for (const descriptionTextValue of this.description) {
        // If value is an array, add ul list of values
        if (Array.isArray(descriptionTextValue)) {
            // Create ul element and append as child to more info element
            childNode = parentNode.appendChild(document.createElement('ul'));
            // Loop through each value of array of list values
            for (const arrayValueText of descriptionTextValue) {
                // Create li element and append as child to ul element
                listElement.appendChild(ReplayEpisode.createElementAdv('li', undefined, arrayValueText));
            }
        } else { // Else create p element and append as child to more info element
            parentNode.appendChild(ReplayEpisode.createElementAdv('p', undefined, descriptionTextValue));
        }
    }

    // Other Headings (External Links should go last)

};

// ---------------------------------------------
// ---------- Get Properties By Count ----------
// ---------------------------------------------

// Get list of host/featuring with no duplicates
function getGICrew(replayEpisodes) {
    let tempHostArr = [];
    let tempGuestArr = [];
    let noHostEpisodes = [];
    let noGuestEpisodes = [];
    let isIncluded = false;

    for (const episode of replayEpisodes) {
        // Host
        if (episode.hasOwnProperty('host')) {
            // For each host in episode host array
            for (const host of episode.host) {
                // Check if host already listed
                isIncluded = false;
                for (const hostObj of tempHostArr) {
                    // If host matches, increment count, move to next host
                    if (hostObj.name == host) {
                        isIncluded = true;
                        hostObj.count++;
                        break;
                    }
                }
                // If host is NOT included, add to list
                if (!isIncluded) {
                    tempHostArr.push({
                        name: host,
                        count: 1
                    });
                }
            }
        } else // No hosts property, add flagged episode
            noHostEpisodes.push(episode.episodeNumber);

        // Featuring
        if (episode.hasOwnProperty('featuring')) {
            // For each guest in the episode featuring array
            for (const guest of episode.featuring) {
                // Check if guest already listed
                isIncluded = false;
                for (const guestObj of tempGuestArr) {
                    // If guest matches, increment count, move to next guest
                    if (guestObj.name == guest) {
                        isIncluded = true;
                        guestObj.count++;
                        break;
                    }
                }
                // If guest is NOT included, add to list
                if (!isIncluded) {
                    tempGuestArr.push({
                        name: guest,
                        count: 1
                    });
                }
            }
        }
        else // No featuring property, add flagged episode
            noGuestEpisodes.push(episode.episodeNumber);
    }

    // Sort arrays by count
    tempHostArr.sort(function (first, second) {
        return second.count - first.count;
    });
    tempGuestArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return [tempHostArr, tempGuestArr, noHostEpisodes, noGuestEpisodes];
}

// Get all extra headings from details property
function getEpisodeHeadings() {
    let extraHeadingsArr = []; 
    let isIncluded = false;
    replayEpisodeCollection.replayEpisodeObjectArray.forEach(function (episode) {
        if (episode.hasOwnProperty('otherHeadingsObj')) {
            for (const key in episode.otherHeadingsObj) {
                // If key is already on list, increment count
                isIncluded = false;
                for (const extraHeading of extraHeadingsArr) {
                    if (extraHeading.heading === key) {
                        isIncluded = true;
                        extraHeading.count++;
                        break;
                    }
                }
                // If NOT included, add heading to list
                if (!isIncluded) {
                    extraHeadingsArr.push({
                        heading: key,
                        count: 1
                    });
                }
            }
        }
    });

    // Sort array by heading count in descending order
    extraHeadingsArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return extraHeadingsArr;
}

function getMiddleSegments() {
    let middleSegmentArr = [];
    let isIncluded = false;
    replayEpisodeCollection.replayEpisodeObjectArray.forEach(function (episode) {
        if (episode.hasOwnProperty('middleSegment') || episode.hasOwnProperty('middleSegmentContent')) {
            let tempMiddleSegment = episode.middleSegment || episode.middleSegmentContent;
            // Check if Ad (string.endsWith())
            if (tempMiddleSegment.endsWith('Ad'))
                tempMiddleSegment = 'Ad';
            isIncluded = false;
            for (const segment of middleSegmentArr) {
                if (segment.name === tempMiddleSegment) {
                    isIncluded = true;
                    segment.count++;
                    break;
                }
            }
            // If NOT included, add to list
            if (!isIncluded) {
                middleSegmentArr.push({
                    name: tempMiddleSegment,
                    count: 1
                });
            }
        }
    });

    // Sort array by count in descending order
    middleSegmentArr.sort(function (first, second) {
        return second.count - first.count;
    });

    return middleSegmentArr;
}