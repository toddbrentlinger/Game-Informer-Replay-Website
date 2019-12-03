/* TODO:
 * - Create static array of FLAG objects that include episode number
 * and reason for FLAG (ex. air dates from two sources do NOT match)
 */

class ReplayEpisode {
    // Initialize data members from JSON object of episode data
    constructor(replayEpisode) {
        // this.replayEpisode = replayEpisodeJSON;

        // Episode Number
        this.episodeNumber = replayEpisode.episodeNumber;

        // Episode Title
        this.episodeTitle = replayEpisode.episodeTitle;

        // Fandom Wiki URL
        this.fandomWikiURL = replayEpisode.fandomWikiURL;

        // Main Segment Games
        this.mainSegmentGamesAdv = replayEpisode.mainSegmentGamesAdv;

        // Air Date
        const dateString = replayEpisode.details.airdate;
        // If air date does not exist, assign empty string
        if (!dateString || dateString.length == 0)
            this.airdate = '';
        else { // Else air date does exist
            if (dateString.includes('/')) {
                let newDateString = ((dateString[2] < 50) ? '20' : '') +
                    dateString[2];
                newDateString += '-' + dateString[0] + '-' +
                    dateString[1];
                this.airdate = new Date(newDateString);
            }
            else if (dateString.includes(','))
                this.airdate = new Date(dateString);
            else
                this.airdate = dateString;
        }

        // Video Length
        this.videoLength = replayEpisode.details.runtime;

        // Middle Segment (only 3rd season)
        if (replayEpisode.hasOwnProperty('middleSegment') &&
            replayEpisode.middleSegment.replace(/-/gi, '').length)
            this.middleSegment = replayEpisode.middleSegment;

        // Middle Segment Content (only 3rd season)
        if (replayEpisode.hasOwnProperty('middleSegmentContent') &&
            replayEpisode.secondSegment.replace(/-/gi, '').length)
                this.middleSegmentContent = replayEpisode.middleSegmentContent;

        // Second Segment
        if (replayEpisode.secondSegment.replace(/-/gi, '').length)
            this.secondSegment = replayEpisode.secondSegment;

        // Second Segment Games
        if (Array.isArray(replayEpisode.secondSegmentGames) &&
            replayEpisode.secondSegmentGames.length &&
            replayEpisode.secondSegmentGames[0].replace(/-/gi).length) {
            this.secondSegmentGames = replayEpisode.secondSegmentGames;
        }

        // Description (array)
        // If description is empty, create custom description
        if (Array.isArray(replayEpisode.details.description) &&
            replayEpisode.details.description.length)
            this.description = replayEpisode.details.description;
        else //Else description is empty, create custom description
            this.description = ReplayEpisode.createCustomDescription(this);

        // Host(s)
        this.host = replayEpisode.details.host;

        // Featuring
        this.featuring = replayEpisode.details.featuring;

        // External Links
        this.external_links = replayEpisode.details.external_links;

        // YouTube video ID
        if (replayEpisode.hasOwnProperty('details') && replayEpisode.details.hasOwnProperty('external_links')) {
            for (const externalLinkObject of replayEpisode.details.external_links) {
                if (externalLinkObject.href.includes('youtube'))
                    this.youtubeVideoID = externalLinkObject.href.split('=')[1];
            }
        } else // Properties do NOT exist or could NOT find matching URL
            this.youtubeVideoID = '';

        // Image
        this.image = replayEpisode.details.image;

        /*
        // Increase static totalTimeSeconds for each Replay episode
        let timeArr = this.videoLength.split(':')
        timeArr.forEach(function (item, index, arr) {
            arr[index] = parseInt(item, 10);
        });
        totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
        */

        // Create HTML element to add episode data and reference as property
        this.episodeSection = createElementAdv('section', 'episode');

        // Populate HTML element with episode data
        ReplayEpisode.populateEpisodeSection(this);
    }

    // ---------------------------------------
    // ---------- Methods/Functions ----------
    // ---------------------------------------

    // Function: Get replay season and season episode number
    getReplaySeason() {
        //Constant array to hold episode numbers that each season begins with
        // excluding the first season which is assumed to start at episode 1
        // NOTE: Could use episode titles in the future if episode number is unreliable
        const replaySeasonStartEpisodes = [107, 268, 385, 443, 499]; // [S2, S3, S4, S5, S6]

        // Season
        for (index = 0; index < replaySeasonStartEpisodes.length; index++) {
            if (this.episodeNumber < replaySeasonStartEpisodes[index]) {
                season = index + 1;
                break;
            }
            // If reached end of loop, assign last season
            if (index == replaySeasonStartEpisodes.length - 1)
                season = replaySeasonStartEpisodes.length + 1;
        }

        // Season Episode
        seasonEpisode = (season == 1) ? this.episodeNumber
            : this.episodeNumber - replaySeasonStartEpisodes[season - 2] + 1;

        // Return both season and seasonEpisode number
        return [season, seasonEpisode];
    }

    // --------------------------------------
    // ---------- Static Functions ----------
    // --------------------------------------

    // Function: Populate HTML element with episode data and formatting
    // Return reference to completed HTML section
    static populateEpisodeSection(replayEpisode) {
        return replayEpisode.episodeSection;
    }

    // Function: Create element with provided class name and innerHTML 
    // content. Return created element.
    static createElementAdv(elementTag, elementClass, elementInnerHTML) {
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

    // Function: Return string of segment title in words rather than
    // an abbreviation.
    static getSegmentTitle(segment) {
        // If segment is empty, there is no segment, return empty string
        if (typeof segment == 'string' && segment != undefined && segment.length == 0)
            return '';
        else { // Else there is a segment title to compare
            switch (segment) {
                case 'RR': return 'Replay Roulette'; break;
                case 'SRS': return 'Super Replay Showdown'; break;
                case 'YDIW': return "You're Doing It Wrong"; break;
                case 'ST': return 'Stress Test'; break;
                case 'RP': return 'RePorted'; break;
                case 'DP': return 'Developer Pick'; break;
                case '2037': return 'Replay 2037'; break;
                case 'HF': return 'Horror Fest'; break;
                case 'RRL': return 'Replay Real Life'; break;
                default: return segment;
                // Other Segments: GI Versus, Developer Spotlight, 
                // Reevesplay, Moments
            }
        }
    }

    // Function:
    // Take array and return list items in a single string formatted in proper English
    // ex. 'list00, list01, list02, and list03'
    //     'list00 and list01'
    static listArrayAsString(stringArray) {
        // Check if argument is an array
        if (Array.isArray(stringArray)) {
            let arrayItemText = '';
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

    // Function: Return string with provided number and correct suffix 
    // (ex. 41st, 57th, 2nd)
    static numOrdinalSuffix(num) {
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

    // Function: Create custom description for replay episode in case there is none from scraping
    static createCustomDescription(replayEpisode) {
        let firstPara = 'CUSTOM: ';
        let secondPara = '';
        let thirdPara = '';
        // First Para
        // If only one game in main segment
        if (replayEpisode.mainSegmentGamesAdv.length == 1) {
            firstPara += replayEpisode.mainSegmentGamesAdv[0].title + ' is the featured game in the '
                + this.numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay.';
        }
        else { // Else more than one game in main segment
            let mainSegmentGamesTitleArray = [];
            replayEpisode.mainSegmentGamesAdv.forEach(function (item, index, arr) {
                mainSegmentGamesTitleArray.push(item.title);
            });
            firstPara += 'The ' + this.numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay is '
                + replayEpisode.episodeTitle.replace('Replay: ', '') + ', featuring '
                + this.listArrayAsString(mainSegmentGamesTitleArray);
        }
        // Second Para
        if (replayEpisode.secondSegment) {
            if (replayEpisode.secondSegment == 'RR')
                secondPara += 'The Replay Roulette for this episode features ' + this.listArrayAsString(replayEpisode.secondSegmentGames);
            else
                secondPara += 'The second segment for this episode is an installment of ' + replayEpisode.secondSegment + ' featuring ' + this.listArrayAsString(replayEpisode.secondSegmentGames);
        }
        // Third Para
        if (replayEpisode.host && replayEpisode.featuring) {
            thirdPara = 'This episode is hosted by ' + this.listArrayAsString(replayEpisode.host)
                + ' and features ' + this.listArrayAsString(replayEpisode.featuring) + '.';
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

    static addEpisodeTotalTime(episode) {
        // Increase total time of episodes
        var timeArr = replayEpisode["videoLength"].split(':')
        timeArr.forEach(function (item, index, arr) {
            arr[index] = parseInt(item, 10);
        });
        totalTimeSeconds += timeArr[timeArr.length - 1] + timeArr[timeArr.length - 2] * 60
            + (timeArr.length == 3 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }

    // Static function and data member to track number of ReplayEpisode objects
    static totalEpisodesNumber() {

    }
}

// Static(class- side) data properties and prototype data properties must 
// be defined outside of the ClassBody declaration

ReplayEpisode.totalTimeSeconds = 0;