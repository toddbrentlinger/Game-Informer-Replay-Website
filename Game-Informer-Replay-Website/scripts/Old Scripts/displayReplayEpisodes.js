/* TODO:
 * - Create replayEpisode class that holds the javascript object from JSON data in a
 * data member. Include member functions that utilize the data from each episode.
 * 
 * - Instead of creating whole episode html section from scratch, copy baseline
 * section with all correct attributes but blank/default values to be changed
 * by script.
 * 
 * - Create ul tag list of episodes where each episode section is a li list item.
 * This could help with changing the order of the list items by script.
 * 
 * - ISSUE: Host and featuring show undefined if not listed on Fandom Wiki
 * 
*/

//Constant array to hold episode numbers that each season begins with
// excluding the first season which is assumed to start at episode 1
// NOTE: Could use episode titles in the future if episode number is unreliable
const replaySeasonStartEpisodes = [107, 268, 385, 443, 499]; // [S2, S3, S4, S5, S6]
// Function:
function getReplaySeason(episodeNumber) {
    // Season
    for (index = 0; index < replaySeasonStartEpisodes.length; index++) {
        if (episodeNumber < replaySeasonStartEpisodes[index]) {
            season = index + 1;
            break;
        }
        // If reached end of loop, assign last season
        if (index == replaySeasonStartEpisodes.length - 1)
            season = replaySeasonStartEpisodes.length + 1;
    }

    // Season Episode
    seasonEpisode = (season == 1) ? episodeNumber
        : episodeNumber - replaySeasonStartEpisodes[season - 2] + 1;

    // Return both season and seasonEpisode number
    return [season, seasonEpisode];
}

// Function:
// Find youtube URL in replay episode object of properties
function getYouTubeURL(replayEpisode, returnVideoCodeOnly = false) {
    if (replayEpisode.hasOwnProperty('details') && replayEpisode.details.hasOwnProperty('external_links')) {
        for (externalLinkObject of replayEpisode.details.external_links) {
            if (externalLinkObject.href.includes('youtube')) {
                if (!returnVideoCodeOnly)
                    return externalLinkObject.href;
                else { // Return only video code at end of URL
                    return externalLinkObject.href.split('=')[1];
                }
            }
        }
    }
    // Properties do NOT exist or could NOT find matching URL
    return '';
}

// Function:
// Create src string for playlist in iframe to play each episode
function createPlaylistSrc() {
    srcString = '';
    // Get all episode section elements
    var episodesNodeList = document.getElementsByClassName('episodeThumbnail');
    // Check if there is at least one episode and begin srcString
    if (episodesNodeList.length > 0)
        srcString = 'https://www.youtube.com/embed/';
    for (let i = 1; i < episodeNodeList.length; i++) {
        episodesNodeList[i]
    }
}

// Function:
// Create element with provided class name and innerHTML content. 
// Return created element.
function createElementAdv(elementTag, elementClass, elementInnerHTML) {
    // If only first argument is provided, recommend using document.createElement instead
    if (typeof elementClass === 'undefined' && typeof elementInnerHTML === 'undefined')
        console.log("Use document.createElement() instead");
    var element = document.createElement(elementTag);
    if (typeof elementClass !== 'undefined')
        element.setAttribute('class', elementClass);
    if (typeof elementInnerHTML !== 'undefined')
        element.innerHTML = elementInnerHTML;
    return element;
}

/* TODO:
 * - After creating element, append as child immediately and save the reference to
 * append other elements later. Check if correct and works.
 * ex. 
 * var element = document.createElement(tag);
 * element = parentElement.appendChild(element);
 * or
 * var element = parentElement.appendChild(document.createElement(tag));
 * */
// Function:
function displayReplayEpisodes() {
    const mainElement = document.getElementById('main');
    var totalTimeSeconds = 0;

    for (let i = 0; i < replayEpisodeArray.length; i++) {
        // Const reference to current replay episode object containing key/value pairs
        const replayEpisode = replayEpisodeArray[i];

        // Increase total time of episodes
        var timeArr = replayEpisode["videoLength"].split(':')
        timeArr.forEach(function (item, index, arr) {
            arr[index] = parseInt(item, 10);
        });
        totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);

        // Create new section to add episode data and append as child to main element
        var episodeSection = mainElement.appendChild(createElementAdv('section', 'episode'));
        
        // --------------
        // Episode Header
        // --------------

        // Create new header and append as child to section element
        var episodeHeaderElement = episodeSection.appendChild(createElementAdv('div', 'episodeHeader'));
        
        // Episode Title
        // Create new title and append as child to header element
        var episodeTitleElement = episodeHeaderElement.appendChild(createElementAdv('h3', 'episodeTitle', replayEpisode.episodeTitle));

        // Episode Number
        // Create new element and append as child to header element
        var episodeNumberElement = episodeHeaderElement.appendChild(createElementAdv('div', 'episodeNumber'));
        seasonEpisode = getReplaySeason(replayEpisode.episodeNumber);
        episodeNumberElement.innerHTML = 'S' + seasonEpisode[0]
            + ':E' + seasonEpisode[1] + ' (#' + replayEpisode.episodeNumber + ')';

        // --------------
        // Episode Main
        // --------------

        // Create new element and append as child to episode section element
        var episodeMainElement = episodeSection.appendChild(createElementAdv('div', 'episodeMain'));

        // Episode Thumbnail
        // Create thumbnail element and append as child to episodeMain element
        var episodeThumbnailElement = episodeMainElement.appendChild(createElementAdv('div', 'episodeThumbnail'));
        // Thumbnail Link
        // Create thumbnail anchor link and append as child to episode thumbnail element
        var thumbnailLinkElement = episodeThumbnailElement.appendChild(document.createElement('a'));
        thumbnailLinkElement.setAttribute('title', '');
        thumbnailLinkElement.setAttribute('href', getYouTubeURL(replayEpisode));
        thumbnailLinkElement.setAttribute('target', '_blank');
        // Episode img
        // Create img element and append as child to thumbnail anchor link element
        var episodeImageElement = thumbnailLinkElement.appendChild(createElementAdv('img', 'episodeImage'));
        episodeImageElement.setAttribute('alt', '');
        episodeImageElement.setAttribute('width', replayEpisode.details.image.width);
        episodeImageElement.setAttribute('height', replayEpisode.details.image.height);
        episodeImageElement.setAttribute('src', replayEpisode.details.image.srcset[0]);
        // Source Set
        srcsetStr = '';
        for (let i = 0, arrLength = replayEpisode.details.image.srcset.length;
            i < arrLength; i++) {
            srcsetStr += replayEpisode.details.image.srcset[i];
            // Add characters between values in array
            srcsetStr += (i == arrLength - 1) ? ''
                : (i == 1) ? ', '
                : ' ';
        }
        episodeImageElement.setAttribute('srcset', srcsetStr);
        // Add image element to anchor element
        //thumbnailLinkElement.appendChild(episodeImageElement);
        // Episode Time
        // Create time element and append as child to thumbnail anchor link element
        var episodeTimeElement = thumbnailLinkElement.appendChild(createElementAdv('time', 'episodeLength', replayEpisode.videoLength));
        // Add time element to anchor element
        //thumbnailLinkElement.appendChild(episodeTimeElement);
        // Add anchor element to thumbnail element

        // Episode Description
        // Create description element and append as child to episodeMain element
        var episodeDescriptionElement = episodeMainElement.appendChild(createElementAdv('div', 'episodeDescription'));

        // If description is empty, create custom description
        if (!replayEpisode.details.description.length)
            replayEpisode.details.description = createCustomDescription(replayEpisode);

        // TODO: Should I create function instead? Am I using it anywhere else?
        for (descriptionTextValue of replayEpisode.details.description) {
            // If value is an array, add ul list of values
            if (Array.isArray(descriptionTextValue)) {
                // Create ul element and append as child to description element
                listElement = episodeDescriptionElement.appendChild(document.createElement('ul'))
                // Loop through each value of array of list values
                for (arrayValueText of descriptionTextValue) {
                    // Create li element and append as child to ul element
                    listElement.appendChild(createElementAdv('li', undefined, arrayValueText));
                }
            }
            else {
                // Create p element and append as child to description element
                episodeDescriptionElement.appendChild(createElementAdv('p', undefined, descriptionTextValue));
            }
        }

        // Episode Air Date
        // Create element and append as child to episode description element
        episodeAirDateElement = episodeDescriptionElement.appendChild(createElementAdv('p', 'episodeAirDate'));
        // Create bold element and append as child of episode air date element
        episodeAirDateElement.appendChild(createElementAdv('b', undefined, 'Original Air Date: '));
        // Create text node and append as child of episode air date element
        episodeAirDateElement.appendChild(document.createTextNode(replayEpisode.details.airdate));

        // ---------------
        // Episode Details
        // ---------------

        // Create episode details element and append as child to episode section element
        var episodeDetailsElement = episodeSection.appendChild(createElementAdv('div', 'episodeDetails'));
        episodeDetailsElement.appendChild(document.createElement('hr'));

        // Episode Hosts
        if (replayEpisode.details.host) {
            // Create episode hosts element and append as child to episode details element
            var episodeHostsElement = episodeDetailsElement.appendChild(createElementAdv('div', 'episodeHosts'));
            // Create bold element and append as child of episode hosts element
            episodeHostsElement.appendChild(createElementAdv('b', undefined, 'Host: '));
            // Create text node and append as child of episode hosts element
            episodeHostsElement.appendChild(document.createTextNode(listArrayAsString(replayEpisode.details.host)));
        }

        // Episode Featuring
        if (replayEpisode.details.featuring) {
            // Create episode featuring element and append as child to episode details element
            var episodeFeaturingElement = episodeDetailsElement.appendChild(createElementAdv('div', 'episodeFeaturing'));
            // Create bold element and append as child of episode featuring element
            episodeFeaturingElement.appendChild(createElementAdv('b', undefined, 'Featuring: '));
            // Create text node and append as child of episode featuring element
            episodeFeaturingElement.appendChild(document.createTextNode(listArrayAsString(replayEpisode.details.featuring)));
        }
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
}

// Function:
// Take array and return list items in a single string formatted in proper English
// ex. 'list00, list01, list02, and list03'
//     'list00 and list01'
function listArrayAsString(stringArray) {
    // Check if argument is an array
    if (Array.isArray(stringArray)) {
        arrayItemText = '';
        // Loop through each value of array
        for (let index = 0, arrLength = stringArray.length; index < arrLength; index++) {
            arrayItemText += stringArray[index];
            // If array length is more than 1 and index is NOT the last element
                // If array length is 2, only add ' and '
                // Else: If index is second to last element, add ', and ' Else add ', '
            if (arrLength > 1 && index != arrLength - 1) {
                arrayItemText += (arrLength == 2) ? ' and '
                    : (index == arrLength - 2) ? ', and ' : ', ';
            }
        }
        // Return created string
        return arrayItemText;
    }
}

// Function:
// Return string with provided number and correct suffix (ex. 41st, 57th, 2nd)
function numOrdinalSuffix(num) {
    var j = num % 10,
        k = num % 100;
    if (j == 1 && k != 11)
        return num + 'st';
    if (j == 2 && k != 12)
        return num + 'nd';
    if (j == 3 && k != 13)
        return num + 'rd';
    return num + 'th';
}

// Function:
// Create custom description for replay episode in case there is none from scraping
function createCustomDescription(replayEpisode) {
    var firstPara = 'CUSTOM: ';
    var secondPara = '';
    var thirdPara = '';
    // First Para
    // If only one game in main segment
    if (replayEpisode.mainSegmentGamesAdv.length == 1) {
        firstPara += replayEpisode.mainSegmentGamesAdv[0].title + ' is the featured game in the '
            + numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay.';
    }
    else { // Else more than one game in main segment
        mainSegmentGamesTitleArray = [];
        replayEpisode.mainSegmentGamesAdv.forEach(function (item, index, arr) {
            mainSegmentGamesTitleArray.push(item.title);
        });
        firstPara += 'The ' + numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay is '
            + replayEpisode.episodeTitle.replace('Replay: ', '') + ', featuring '
            + listArrayAsString(mainSegmentGamesTitleArray);
    }
    // Second Para
    if (replayEpisode.secondSegment) {
        if (replayEpisode.secondSegment == 'RR')
            secondPara += 'The Replay Roulette for this episode features ' + listArrayAsString(replayEpisode.secondSegmentGames);
        else
            secondPara += 'The second segment for this episode is an installment of ' + replayEpisode.secondSegment + ' featuring ' + listArrayAsString(replayEpisode.secondSegmentGames);
    }
    // Third Para
    if (replayEpisode.details.host && replayEpisode.details.featuring) {
        thirdPara = 'This episode is hosted by ' + listArrayAsString(replayEpisode.details.host)
            + ' and features ' + listArrayAsString(replayEpisode.details.featuring) + '.';
    }
    // Return array of strings
    return [firstPara, secondPara, thirdPara];

    /*
     * Ex. 1 (if one game and one Replay Roulette)
     * 'Armored Core' is the featured game in the '460th' episode of Replay. 
     * The 'Replay Roulette' for this episode features 'Rayman Rush'.
     * 
     * This episode is hosted by 'Andrew Reiner' and features 'Jeff Marchiafava, 
     * Kyle Hilliard, and Ben Hanson'.
     * 
     * Ex. 2 (special episode)
     * The '458th' episode of Replay is 'The 2018 Halloween Spooktacular', featuring 
     * 'Fatal Frame II: Crimson Butterfly'.
     * 
     * Ex. 3
     * 'Spyro the Dragon' is the name of the 'eleventh' episode of Replay. 
     * The 'Replay Roulette' is 'Future Cop LAPD'.
     * 
     * Ex. 4
     * The second segment for this episode is an installment of 'RePorted' featuring 'Rune Caster'.
     * 
     * Ex. 5
     * The episodes second segment is 'Reported'.
     */
}