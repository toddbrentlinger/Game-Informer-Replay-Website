/* TODO:
 * - Create static array of FLAG objects that include episode number
 * and reason for FLAG (ex. air dates from two sources do NOT match)
 */

const linkSourceOptions = [
    ['gameinformer', 'Game Informer'],
    ['youtube', 'YouTube'],
    ['fandom', 'Fandom'],
    ['wikipedia', 'Wikipedia'],
    ['gamespot', 'GameSpot'],
    ['steampowered', 'Steam']
];

class ReplayEpisode {
    // -----------
    // Constructor
    // -----------

    // Initialize data members from JSON object of episode data
    constructor(replayEpisode, episodeTemplate) {
        // this.replayEpisode = replayEpisodeJSON;

        // Episode Number
        this.episodeNumber = replayEpisode.episodeNumber;

        // Episode Title
        this.episodeTitle = replayEpisode.episodeTitle;

        // Fandom Wiki URL
        //this.fandomWikiURL = replayEpisode.fandomWikiURL;

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
        if (replayEpisode.hasOwnProperty('middleSegment')
            && replayEpisode.middleSegment.replace(/-/gi, '').length)
            this.middleSegment = replayEpisode.middleSegment;

        // Middle Segment Content (only 3rd season)
        if (replayEpisode.hasOwnProperty('middleSegmentContent')
            && replayEpisode.middleSegmentContent.replace(/-/gi, '').length) {
            // If content ends with 'Ad' and segment has no provided name, assign name of 'Ad'
            //if (replayEpisode.middleSegmentContent.endsWith('Ad') && !this.hasOwnProperty('middleSegment'))
            //    this.middleSegment = 'Ad';
            // Assign middleSegmentContent
            this.middleSegmentContent = replayEpisode.middleSegmentContent;
        }

        // Second Segment
        if (replayEpisode.secondSegment.replace(/-/gi, '').length)
            this.secondSegment = replayEpisode.secondSegment;

        // Second Segment Games
        if (Array.isArray(replayEpisode.secondSegmentGames)
            && replayEpisode.secondSegmentGames.length
            && replayEpisode.secondSegmentGames[0].replace(/-/gi, '').length) {
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
        if (replayEpisode.details.hasOwnProperty('host'))
            this.host = replayEpisode.details.host;

        // Featuring
        if (replayEpisode.details.hasOwnProperty('featuring'))
            this.featuring = replayEpisode.details.featuring;

        // External Links
        // Add Fandom link as first element of external links list
        this.external_links = [
            { href: `https://replay.fandom.com${replayEpisode.fandomWikiURL}`, title: this.episodeTitle }
        ];
        // Add other external links, if defined
        if (replayEpisode.details.hasOwnProperty('external_links'))
            this.external_links.push.apply(this.external_links, replayEpisode.details.external_links);

        // YouTube video ID
        let tempVideoID = ''; // Default empty string if NO video ID is found
        if (replayEpisode.hasOwnProperty('details')
            && replayEpisode.details.hasOwnProperty('external_links')) {
            let youtubeLink = replayEpisode.details.external_links
                .find(element => element.href.includes('youtube'));
            if (typeof youtubeLink != 'undefined')
                tempVideoID = youtubeLink.href.split('=')[1].slice(0, 11);
        }
        this.youtubeVideoID = tempVideoID;

        // Image
        this.image = replayEpisode.details.image;

        // Other Headings
        const propsToIgnore = [
            'description', 'external_links', 'image', 'system', 'gamedate', 'airdate', 'runtime', 'host', 'featuring'
        ];
        let tempHeadingsObj = {};
        for (const prop in replayEpisode.details) {
            // If prop is NOT in a prop to ignore, add to tempHeadingsObj
            if (!propsToIgnore.includes(prop))
                tempHeadingsObj[prop] = replayEpisode.details[prop];
        }
        // If tempHeadingsObj is NOT empty, assign to this.otherHeadingsObj
        if (!ReplayEpisode.isEmptyObject(tempHeadingsObj))
            this.otherHeadingsObj = tempHeadingsObj;

        // Create HTML element and add episode data
        this.episodeSection = this.populateEpisodeSection();
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
        let season = 0;
        for (let index = 0; index < replaySeasonStartEpisodes.length; index++) {
            if (this.episodeNumber < replaySeasonStartEpisodes[index]) {
                season = index + 1;
                break;
            }
            // If reached end of loop, assign last season
            if (index == replaySeasonStartEpisodes.length - 1) {
                season = replaySeasonStartEpisodes.length + 1;
            }
        }

        // Season Episode
        let seasonEpisode = (season == 1) ? this.episodeNumber
            : this.episodeNumber - replaySeasonStartEpisodes[season - 2] + 1;

        // Return both season and seasonEpisode number
        return [season, seasonEpisode];
    }

    // Function: getDateString
    getDateString() {
        let months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        return months[this.airdate.getMonth()] + ' ' + this.airdate.getDate() +
            ', ' + this.airdate.getFullYear();
    }

    // Function: Populate HTML element with episode data and formatting
    // Return reference to completed HTML section
    populateEpisodeSection(containerClass = 'episode') {

        // Main Section
        let episodeElement = ReplayEpisode.createElementAdv('section', containerClass);

        // Create new element and append as child to episode section element
        let episodeMainElement = episodeElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeMain'));
        episodeElement.appendChild(document.createElement('hr'));

        // ---------------------------
        // --------- Header ----------
        // ---------------------------

        // Main - Episode Header
        // Create new header and append as child to main element
        let episodeHeaderElement = episodeMainElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeHeader'));

        // Main - Header - Episode Title
        // Create new title and append as child to header element
        let episodeTitleElement = episodeHeaderElement.appendChild(ReplayEpisode.createElementAdv('h3', 'episodeTitle', this.episodeTitle));

        // Main - Header - Episode Number
        // Create new element and append as child to header element
        let episodeNumberElement = episodeHeaderElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeNumber'));
        let seasonEpisode = this.getReplaySeason();
        episodeNumberElement.innerHTML = 'S' + seasonEpisode[0]
            + ':E' + seasonEpisode[1] + ' (#' + this.episodeNumber + ')';

        // -------------------------------
        // ---------- Thumbnail ----------
        // -------------------------------

        // Main - Episode Thumbnail Container
        // Create thumbnail container and append as child to episodeMain element
        let thumbnailContainerElement = episodeMainElement.appendChild(ReplayEpisode.createElementAdv('div', 'thumbnail-container'));
        // Create thumbnail element and append as child to thumbnail container element
        let episodeThumbnailElement = thumbnailContainerElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeThumbnail'));
        // Main - Episode Thumbnail - Thumbnail Link
        // Create thumbnail anchor link and append as child to episode thumbnail element
        let thumbnailLinkElement = episodeThumbnailElement.appendChild(document.createElement('a'));
        thumbnailLinkElement.setAttribute('title', '');
        thumbnailLinkElement.setAttribute('href', 'https://www.youtube.com/watch?v=' + this.youtubeVideoID);
        thumbnailLinkElement.setAttribute('target', '_blank');
        // Main - Episode Thumbnail - Thumbnail Link - Episode img
        // Create img element and append as child to thumbnail anchor link element
        let episodeImageElement = thumbnailLinkElement.appendChild(ReplayEpisode.createElementAdv('img', 'episodeImage'));
        episodeImageElement.setAttribute('alt', '');
        episodeImageElement.setAttribute('width', this.image.width);
        episodeImageElement.setAttribute('height', this.image.height);
        episodeImageElement.setAttribute('src', this.image.srcset[0]);
        // Source Set
        let srcsetStr = '';
        for (let i = 0, arrLength = this.image.srcset.length;
            i < arrLength; i++) {
            srcsetStr += this.image.srcset[i];
            // Add characters between values in array
            srcsetStr += (i == arrLength - 1) ? ''
                : (i == 1) ? ', '
                    : ' ';
        }
        episodeImageElement.setAttribute('srcset', srcsetStr);

        // Main - Episode Thumbnail - Thumbnail Link - Episode Time
        // Create time element and append as child to thumbnail anchor link element
        thumbnailLinkElement.appendChild(ReplayEpisode.createElementAdv('time', 'episodeLength', this.videoLength));

        // Main - Episode Thumbnail - Thumbnail Link - Play Overlay
        // Create element for play button overlay that appears when hover
        let videoOverlayElement = thumbnailLinkElement.appendChild(ReplayEpisode.createElementAdv('div', 'playOverlay'))
            .appendChild(document.createElement('img'));
        videoOverlayElement.setAttribute('alt', '');
        videoOverlayElement.setAttribute('width', '256');
        videoOverlayElement.setAttribute('height', '256');
        videoOverlayElement.setAttribute('src', '/images/play-button-icon-gi(1)-256.png');

        // -------------------------------------
        // ---------- Episode Details ----------
        // -------------------------------------

        // Create episode details element and append as child to episode main element
        let episodeDetailsElement = episodeMainElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeDetails'));

        // Episode Air Date
        // Create element and append as child to episode details element
        let episodeAirDateElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeAirDate'));
        // Create bold element and append as child of episode air date element
        episodeAirDateElement.appendChild(ReplayEpisode.createElementAdv('b', undefined, 'Original Air Date: '));
        // Create text node and append as child of episode air date element
        episodeAirDateElement.appendChild(document.createTextNode(this.getDateString()));

        // Episode Hosts
        if (this.hasOwnProperty('host')) {
            // Create episode hosts element and append as child to episode details element
            let episodeHostsElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeHosts'));
            // Create bold element and append as child of episode hosts element
            episodeHostsElement.appendChild(ReplayEpisode.createElementAdv('b', undefined, 'Host: '));
            // Create text node and append as child of episode hosts element
            episodeHostsElement.appendChild(document.createTextNode(ReplayEpisode.listArrayAsString(this.host)));
        }

        // Episode Featuring
        if (this.hasOwnProperty('featuring')) {
            // Create episode featuring element and append as child to episode details element
            let episodeFeaturingElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeFeaturing'));
            // Create bold element and append as child of episode featuring element
            episodeFeaturingElement.appendChild(ReplayEpisode.createElementAdv('b', undefined, 'Featuring: '));
            // Create text node and append as child of episode featuring element
            episodeFeaturingElement.appendChild(document.createTextNode(ReplayEpisode.listArrayAsString(this.featuring)));
        }

        // Main Segment Games
        // Create element and append as child to episode details element
        const mainGamesElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'mainSegment'));
        // Create bold element and append as child of main games element
        mainGamesElement.appendChild(ReplayEpisode.createElementAdv(
            'b', undefined,
            'Main Segment Game' + (this.mainSegmentGamesAdv.length > 1 ? 's' : '')
            + ': '
        ));
        // Create array of main games titles
        let mainGameTitles = [];
        this.mainSegmentGamesAdv.forEach(game => mainGameTitles.push(game.title));
        // Create text node and append as child of main games element
        mainGamesElement.appendChild(document.createTextNode(ReplayEpisode.listArrayAsString(mainGameTitles)));

        // Middle Segment (only 3rd season)
        // If episode has middle segment name or content
        if (this.hasOwnProperty('middleSegment') || this.hasOwnProperty('middleSegmentContent')) {
            // Create element and append as child to episode details element
            let middleSegmentElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'middleSegment'));
            // Create bold element and append as child of middle segment element
            middleSegmentElement.appendChild(ReplayEpisode.createElementAdv('b', undefined, 'Middle Segment: '))
            // Create text node and append as child of middle segment element
            middleSegmentElement.appendChild(document.createTextNode(
                (this.hasOwnProperty('middleSegment')
                    ? ReplayEpisode.getSegmentTitle(this.middleSegment)
                    + (this.hasOwnProperty('middleSegmentContent') ? ' - ' : '')
                    : '')
                + (this.hasOwnProperty('middleSegmentContent')
                    ? ReplayEpisode.listArrayAsString(this.middleSegmentContent)
                    : '')
            ));
        }

        // Second Segment
        // If episode has second segment name or games
        if (this.hasOwnProperty('secondSegment') || this.hasOwnProperty('secondSegmentGames')) {
            // Create element and append as child to episode details element
            let secondSegmentElement = episodeDetailsElement.appendChild(ReplayEpisode.createElementAdv('div', 'secondSegment'));
            // Create bold element and append as child of second segment element
            secondSegmentElement.appendChild(ReplayEpisode.createElementAdv('b', undefined, 'Second Segment: '))
            // Create text node and append as child of second segment element
            secondSegmentElement.appendChild(document.createTextNode(
                (this.hasOwnProperty('secondSegment')
                    ? ReplayEpisode.getSegmentTitle(this.secondSegment)
                    + (this.hasOwnProperty('secondSegmentGames') ? ' - ' : '')
                    : '')
                + (this.hasOwnProperty('secondSegmentGames')
                    ? ReplayEpisode.listArrayAsString(this.secondSegmentGames)
                    : '')
            ));
        }

        // -------------------------------
        // ---------- More Info ----------
        // -------------------------------

        // More Info
        // Create description element and append as child to episode element
        let episodeMoreInfoElement = episodeElement.appendChild(ReplayEpisode.createElementAdv('div', 'episodeMoreInfo'));

        // Description
        for (const descriptionTextValue of this.description) {
            // If value is an array, add ul list of values
            if (Array.isArray(descriptionTextValue)) {
                // Create ul element and append as child to more info element
                let listElement = episodeMoreInfoElement.appendChild(document.createElement('ul'));
                // Loop through each value of array of list values
                for (const arrayValueText of descriptionTextValue) {
                    // Create li element and append as child to ul element
                    listElement.appendChild(ReplayEpisode.createElementAdv('li', undefined, arrayValueText));
                }
            } else { // Else create p element and append as child to more info element
                episodeMoreInfoElement.appendChild(ReplayEpisode.createElementAdv('p', undefined, descriptionTextValue));
            }
        }

        // External Links
        if (this.hasOwnProperty('external_links')) {
            // Create element and append as child to more info element
            let externalLinksElement = episodeMoreInfoElement.appendChild(ReplayEpisode.createElementAdv('div', 'external-links'));
            externalLinksElement.appendChild(ReplayEpisode.createElementAdv('h4', undefined, 'External Links:'));
            // Create ul element and append as child to external links element
            let listElement = externalLinksElement.appendChild(document.createElement('ul'));
            // Loop through each value of array of list values
            for (const linkObj of this.external_links) {
                // Create li element and append as child to ul element
                let listItemElement = listElement.appendChild(document.createElement('li'));
                // Create i element and append as child to li list element
                // then create anchor element and append as child to i element
                let anchorElement = listItemElement.appendChild(document.createElement('i'))
                    .appendChild(ReplayEpisode.createElementAdv('a', undefined, linkObj.title));
                anchorElement.setAttribute('href', linkObj.href);
                anchorElement.setAttribute('target', '_blank');
                // Add text listing source of link
                let linkSource = '';
                let linkURL = linkObj.href;
                // Find matching link source
                for (let i = 0; i < linkSourceOptions.length; i++) {
                    if (linkURL.includes(linkSourceOptions[i][0])) {
                        linkSource = linkSourceOptions[i][1];
                        break;
                    }
                }
                // If no match was found don't include anything
                if (linkSource)
                    listItemElement.appendChild(document.createTextNode(' on '
                        + linkSource));
            }
        }

        // Return episode section HTML
        return episodeElement;
    }

    // --------------------------------------
    // ---------- Static Functions ----------
    // --------------------------------------

    // Function: Create element with provided class name and innerHTML 
    // content. Return created element.
    static createElementAdv(elementTag, elementClass, elementInnerHTML) {
        // If only first argument is provided, recommend using document.createElement instead
        if (typeof elementClass === 'undefined' && typeof elementInnerHTML === 'undefined')
            console.log("Use document.createElement() instead");
        let element = document.createElement(elementTag);
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
        } else if (typeof stringArray == 'string') // Else if argument is string, return the same string
            return stringArray;
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

    // addContentArrToNode(parentNode, contentArr)
    // Parameters: 
    // 'parentNode' - node to append child nodes created in function
    // 'contentArr' - array consisting of strings or arrays to add as child nodes
    static addContentArrToNode(parentNode, contentArr) {
        let listElement;
        for (const content of contentArr) {
            // If content is an array, add ul list of values
            if (Array.isArray(content)) {
                // Create ul element and append as child to parentNode
                listElement = parentNode.appendChild(document.createElement('ul'));
                // Loop through each value of array of list values
                for (const arrayValueText of content)
                    // Create li element and append as child to ul element
                    listElement.appendChild(ReplayEpisode.createElementAdv('li', undefined, arrayValueText));
            } else // Else create p element and append as child to more info element
                parentNode.appendChild(ReplayEpisode.createElementAdv('p', undefined, content));
        }
    }

    // Function: Create custom description for replay episode in case there is none from scraping
    static createCustomDescription(replayEpisode) {
        let descriptionArr = ['Custom'];
        // Main Segment
        // If only one game in main segment
        if (replayEpisode.mainSegmentGamesAdv.length == 1) {
            descriptionArr.push(replayEpisode.mainSegmentGamesAdv[0].title + ' is the featured game in the '
                + this.numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay.');
        }
        else { // Else more than one game in main segment
            let mainSegmentGamesTitleArray = [];
            replayEpisode.mainSegmentGamesAdv.forEach(function (item, index, arr) {
                mainSegmentGamesTitleArray.push(item.title);
            });
            descriptionArr.push('The ' + this.numOrdinalSuffix(replayEpisode.episodeNumber) + ' episode of Replay is '
                + replayEpisode.episodeTitle.replace('Replay: ', '') + ', featuring '
                + this.listArrayAsString(mainSegmentGamesTitleArray) + '.');
        }
        // Middle Segment
        // If episode has segment name
        if (replayEpisode.hasOwnProperty('middleSegment') && replayEpisode.middleSegment.length) {
            let str = 'The middle segment is an installment of ' + this.getSegmentTitle(replayEpisode.middleSegment);
            // If episode has segment content
            if (replayEpisode.hasOwnProperty('middleSegmentContent') && replayEpisode.middleSegmentContent.length)
                str += ' featuring ' + this.listArrayAsString(replayEpisode.middleSegmentContent);
            descriptionArr.push(str + '.');
        }
        // Else If episode has segment content (should NOT have segment name)
        else if (replayEpisode.hasOwnProperty('middleSegmentContent')) {
            descriptionArr.push('The middle segment features '
                + this.listArrayAsString(replayEpisode.middleSegmentContent + '.'));
        }

        // Second Segment
        if (replayEpisode.hasOwnProperty('secondSegment') && replayEpisode.secondSegment.length) {
            if (replayEpisode.secondSegment == 'RR')
                descriptionArr.push('The Replay Roulette for this episode features ' +
                    this.listArrayAsString(replayEpisode.secondSegmentGames) + '.');
            else {
                descriptionArr.push('The second segment for this episode is an installment of ' +
                    this.getSegmentTitle(replayEpisode.secondSegment) + ' featuring ' +
                    this.listArrayAsString(replayEpisode.secondSegmentGames) + '.');
            }
        }
        // Host/Featuring
        if (replayEpisode.hasOwnProperty('host')) {
            descriptionArr.push('This episode is hosted by ' + this.listArrayAsString(replayEpisode.host)
                + ' and features ' + this.listArrayAsString(replayEpisode.featuring) + '.');
        }
        // Return array of strings
        return descriptionArr;

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

    // Test if object is empty (supported by older browsers)
    static isEmptyObject(object) {
        for (const key in object) {
            if (object.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}