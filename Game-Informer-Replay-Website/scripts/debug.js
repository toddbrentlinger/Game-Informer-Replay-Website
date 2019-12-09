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
    return [tempHostArr, tempGuestArr, noHostEpisodes, noGuestEpisodes];
}