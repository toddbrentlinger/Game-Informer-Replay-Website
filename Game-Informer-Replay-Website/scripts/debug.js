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