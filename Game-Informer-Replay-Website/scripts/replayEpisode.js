"use strict";

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

        // YouTube views/likes
        if (replayEpisode.hasOwnProperty('youtube')) {
            // Views
            if (replayEpisode.youtube.hasOwnProperty('views'))
                this.views = parseInt(replayEpisode.youtube.views, 10);
            // Likes
            if (replayEpisode.youtube.hasOwnProperty('likes'))
                this.likes = parseInt(replayEpisode.youtube.likes, 10);
            // Dislikes
            if (replayEpisode.youtube.hasOwnProperty('dislikes'))
                this.dislikes = parseInt(replayEpisode.youtube.dislikes, 10);
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
            { href: `https://replay.fandom.com${replayEpisode.fandomWikiURL}`, title: this.episodeTitle}
        ];
        // Add other external links, if defined
        if (replayEpisode.details.hasOwnProperty('external_links'))
            this.external_links.push.apply(this.external_links,replayEpisode.details.external_links);

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
            // If prop is NOT in a prop to ignore
            if (!propsToIgnore.includes(prop)) {
                // If property is array and array is empty, continue
                if (Array.isArray(replayEpisode.details[prop]) && !replayEpisode.details[prop].length)
                    continue;
                // Add to tempHeadingsObj
                tempHeadingsObj[prop] = replayEpisode.details[prop];
            }
        }
        // If tempHeadingsObj is NOT empty, assign to this.otherHeadingsObj
        if (!ReplayEpisode.isEmptyObject(tempHeadingsObj))
            this.otherHeadingsObj = tempHeadingsObj;
        
        // Game Informer article
        if (replayEpisode.hasOwnProperty('article')) {
            this.replayArticle = {};
            for (const prop in replayEpisode.article)
                this.replayArticle[prop] = replayEpisode.article[prop];
        }
        
        // Create HTML element and add episode data
        this.populateEpisodeSection(episodeTemplate);
    }

    // -----------------------------------
    // ---------- Getter/Setter ----------
    // -----------------------------------

    get videoLengthInSeconds() {
        const timeArr = this.videoLength.split(':');
        timeArr.forEach(function (digit, index, arr) {
            arr[index] = parseInt(digit, 10);
        });

        return timeArr[timeArr.length - 1]
            + (timeArr.length > 1 ? timeArr[timeArr.length - 2] * 60 : 0)
            + (timeArr.length > 2 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }

    get likeRatio() {
        if (this.hasOwnProperty('likes') && this.hasOwnProperty('dislikes'))
            return ((this.likes * 100) / (this.likes + this.dislikes)).toFixed(1);
    }

    // ---------------------------------------
    // ---------- Methods/Functions ----------
    // ---------------------------------------

    // ReplayEpisode.populateEpisodeSection()
    populateEpisodeSection(episodeTemplateNode) {
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
        if (temp[0]) {
            this.episodeSection.querySelector('.episodeNumber')
                .insertAdjacentText('afterbegin',
                    `S${temp[0]}:E${temp[1]} (#${this.episodeNumber})`);
        } else { // Else season is 0 (unofficial episode)
            this.episodeSection.querySelector('.episodeNumber')
                .insertAdjacentText('afterbegin',
                    `Unofficial #${Math.floor(this.episodeNumber * 100)}`);
        }

        // -------------------------------
        // ---------- Thumbnail ----------
        // -------------------------------

        // Anchor link
        parentNode = this.episodeSection.querySelector('.episodeThumbnail > a');
        //parentNode.setAttribute('href', 'https://www.youtube.com/watch?v=' + this.youtubeVideoID);

        // Add event listener that plays video of episode
        parentNode.addEventListener("click", function () {
            replayEpisodeCollection.playEpisode(this);
        }.bind(this), false);

        // Image
        parentNode = this.episodeSection.querySelector('.episodeImage');
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
            .insertAdjacentText('beforeend', this.getDateString());

        // Host
        if (this.hasOwnProperty('host')) {
            this.episodeSection.querySelector('.episodeHosts')
                .insertAdjacentText('beforeend',
                    ReplayEpisode.listArrayAsString(this.host));
        }

        // Featuring
        if (this.hasOwnProperty('featuring')) {
            this.episodeSection.querySelector('.episodeFeaturing')
                .insertAdjacentText('beforeend',
                    ReplayEpisode.listArrayAsString(this.featuring));
        }

        // Main Segment Games
        // Add 's' to 'Main Segment Game: ' if more than one game
        if (this.mainSegmentGamesAdv.length > 1)
            this.episodeSection.querySelector('.mainSegment > b')
                .innerHTML = 'Main Segment: ';
        // Add list of games as text node
        temp = []; // Assign temp to empty array for game titles
        this.mainSegmentGamesAdv.forEach(game => temp.push(game.title));
        this.episodeSection.querySelector('.mainSegment')
            .insertAdjacentText('beforeend', ReplayEpisode.listArrayAsString(temp));

        // Middle Segment (3rd season only)
        if (this.hasOwnProperty('middleSegment') || this.hasOwnProperty('middleSegmentContent')) {
            this.episodeSection.querySelector('.middleSegment')
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
            this.episodeSection.querySelector('.middleSegment').remove();

        // Second Segment
        if (this.hasOwnProperty('secondSegment') || this.hasOwnProperty('secondSegmentGames')) {
            this.episodeSection.querySelector('.secondSegment')
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
            this.episodeSection.querySelector('.secondSegment').remove();

        // YouTube (views/likes)
        if (this.hasOwnProperty('views')) {
            // Views
            this.episodeSection.querySelector('.views')
                .insertAdjacentText('beforeend', ReplayEpisode.addCommasToNumber(this.views));

            // Likes
            this.episodeSection.querySelector('.likes').insertAdjacentText(
                'beforeend',
                `${ReplayEpisode.addCommasToNumber(this.likes)} (${this.likeRatio}%)`
            );
        }

        // -------------------------------
        // ---------- More Info ----------
        // -------------------------------

        // Assign parentNode to episodeMoreInfo element
        parentNode = this.episodeSection.querySelector('.episodeMoreInfo');

        // Description
        ReplayEpisode.addContentArrToNode(parentNode, this.description);
        
        // Article
        if (this.hasOwnProperty('replayArticle')) {
            // Add container for article heading to episodeMoreInfo element
            parentNode = parentNode.appendChild(ReplayEpisode.createElementAdv('div', 'article-heading'));
            // Add title as header element to article heading element
            parentNode.appendChild(ReplayEpisode.createElementAdv(
                'h4', 'article-title', this.replayArticle.title));
            // Add author and date posted
            parentNode.appendChild(ReplayEpisode.createElementAdv(
                'div', 'article-author', `by ${this.replayArticle.author}${this.replayArticle.date}`));
            // Reset parentNode to episodeMoreInfo element
            parentNode = this.episodeSection.querySelector('.episodeMoreInfo');
            // Add article content
            if (this.replayArticle.hasOwnProperty('content')) {
                for (const para of this.replayArticle.content) {
                    if (para.replace(/\s/g, '').length)
                        parentNode.appendChild(ReplayEpisode.createElementAdv('p', undefined, para));
                }
            }
        }

        // Other Headings (External Links should go last)
        if (this.hasOwnProperty('otherHeadingsObj')) {
            for (const heading in this.otherHeadingsObj) {
                // If heading is 'See Also', add list of URL links
                if (heading == 'see_also')
                    ReplayEpisode.addListOfLinks(this.otherHeadingsObj[heading], parentNode, 'see also', 'https://replay.fandom.com');
                // Else If heading is 'Gallery'
                else if (heading == 'gallery') {
                    // Add header of 'Gallery' to episodeMoreInfo element
                    parentNode.appendChild(ReplayEpisode.createElementAdv('h4', undefined, heading));
                    // Add gallery container to episodeMoreInfo element
                    parentNode = parentNode.appendChild(ReplayEpisode.createElementAdv('div', 'gallery-container'));
                    // For each image in gallery property
                    for (const image of this.otherHeadingsObj[heading]) {
                        // Add gallery item to container
                        childNode = parentNode.appendChild(ReplayEpisode.createElementAdv('div', 'gallery-item'));
                        // Add figure element to gallery item
                        childNode = childNode.appendChild(document.createElement('figure'));
                        // Add caption to figure
                        childNode.appendChild(ReplayEpisode.createElementAdv('figcaption', undefined, image.caption));
                        // Add anchor to gallery item figure
                        childNode = childNode.appendChild(document.createElement('a'));
                        childNode.setAttribute('href', image.link);
                        childNode.setAttribute('target', '_blank');
                        childNode.setAttribute('rel', 'noopener');
                        // Add image to figure
                        childNode = childNode.appendChild(document.createElement('img'));
                        childNode.setAttribute('src', image.src);
                        childNode.setAttribute('width', image.width);
                        childNode.setAttribute('height', image.height);
                        childNode.setAttribute('title', image.title);
                    }
                    // Reset parentNode to episodeMoreInfo element
                    parentNode = this.episodeSection.querySelector('.episodeMoreInfo');
                }
                else {
                    // Add heading as a header element to episodeMoreInfo element
                    parentNode.appendChild(ReplayEpisode.createElementAdv(
                        'h4', undefined, heading.replace(/_/g, ' ')));
                    ReplayEpisode.addContentArrToNode(parentNode, this.otherHeadingsObj[heading]);
                }
            }
        }

        // External Links (bottom of episodeMoreInfo)
        if (this.hasOwnProperty('external_links'))
            ReplayEpisode.addListOfLinks(this.external_links, parentNode, 'external links');

        // Return episode section HTML
        return this.episodeSection;
    }

    // Get replay season and season episode number
    // TODO: Make getter of Replay Episode
    getReplaySeason() {
        //Constant array to hold episode numbers that each season begins with.
        // Episode numbers less than 1 are special unoffical episodes
        // NOTE: Could use episode titles in the future if episode number is unreliable
        const replaySeasonStartEpisodes = [1, 107, 268, 385, 443, 499]; // [S1, S2, S3, S4, S5, S6]

        // Season
        let season = 0;
        for (let index = 0; index < replaySeasonStartEpisodes.length; index++) {
            if (this.episodeNumber < replaySeasonStartEpisodes[index]) {
                season = index;
                break;
            }
            // If reached end of loop, assign last season
            if (index == replaySeasonStartEpisodes.length - 1) {
                season = replaySeasonStartEpisodes.length;
            }
        }

        // Season Episode
        let seasonEpisode = (season > 1)
            ? this.episodeNumber - replaySeasonStartEpisodes[season - 1] + 1
            : this.episodeNumber;

        // Return both season and seasonEpisode number
        return [season, seasonEpisode];
    }

    // getDateString
    // Make global function with datetime parameter
    getDateString() {
        let months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        return months[this.airdate.getMonth()] + ' ' + this.airdate.getDate() +
            ', ' + this.airdate.getFullYear();
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
        let descriptionArr = [];
        // Main Segment
        // If only one game in main segment
        if (replayEpisode.mainSegmentGamesAdv.length == 1) {
            descriptionArr.push(replayEpisode.mainSegmentGamesAdv[0].title + ' is the featured game in the '
                + ((replayEpisode.episodeNumber < 1)
                ? this.numOrdinalSuffix(Math.floor(replayEpisode.episodeNumber * 100)) + ' unofficial'
                : this.numOrdinalSuffix(replayEpisode.episodeNumber))
                + ' episode of Replay.');
        }
        else { // Else more than one game in main segment
            let mainSegmentGamesTitleArray = [];
            replayEpisode.mainSegmentGamesAdv.forEach(function (item, index, arr) {
                mainSegmentGamesTitleArray.push(item.title);
            });
            descriptionArr.push('The '
                + ((replayEpisode.episodeNumber < 1)
                ? this.numOrdinalSuffix(Math.floor(replayEpisode.episodeNumber * 100)) + ' unofficial'
                : this.numOrdinalSuffix(replayEpisode.episodeNumber))
                + ' episode of Replay is '
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

    // Add list of URL links
    static addListOfLinks(linksList, parentNode, headlineString, urlPrepend) {
        // Variables
        let listElement, listItemElement, anchorElement, linkSource;
        // Add header for external links to episodeMoreInfo element
        parentNode.appendChild(ReplayEpisode.createElementAdv('h4', undefined, headlineString));
        // Create ul element and append as child to episodeMoreInfo element
        listElement = parentNode.appendChild(ReplayEpisode.createElementAdv('ul', 'link-list'));
        // Loop through each value of array of list values
        for (const linkObj of linksList) {
            // Create li element and append as child to ul element
            listItemElement = listElement.appendChild(document.createElement('li'));
            // Create i element and append as child to li list element
            // then create anchor element and append as child to i element
            anchorElement = listItemElement.appendChild(document.createElement('i'))
                .appendChild(ReplayEpisode.createElementAdv('a', undefined, linkObj.title));
            anchorElement.setAttribute('href',
                (urlPrepend ? urlPrepend + linkObj.href : linkObj.href)
            );
            anchorElement.setAttribute('target', '_blank');
            anchorElement.setAttribute('rel', 'noopener');
            // Add text listing source of link
            linkSource = '';
            // Find matching link source
            for (let i = 0; i < linkSourceOptions.length; i++) {
                if (linkObj.href.includes(linkSourceOptions[i][0])) {
                    linkSource = linkSourceOptions[i][1];
                    break;
                }
            }
            // If match was found, add to end of link, else don't include anything
            if (linkSource)
                listItemElement.appendChild(document.createTextNode(' on '
                    + linkSource));
        }
    }

    static addCommasToNumber(num) {
        // If typeof num is number, convert to string
        if (typeof num === 'number')
            num = num.toString();
        // If num is string and string contains number and more than 3 digits
        if (typeof num === 'string'
            && !isNaN(parseInt(num, 10))
            && num.length > 3
        ) {
            // Add comma after every 3rd index from end
            return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else // Else return the num as is
            return num;
    }
}