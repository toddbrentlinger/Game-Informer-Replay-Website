// Function:
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