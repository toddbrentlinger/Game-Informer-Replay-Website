"use strict";

//import { GameInformerArticle } from "./gameInformerArticle.js";
import { YouTubeVideo } from "./youtubeVideo.js";
import { createElement } from "../../scripts/utility.js";

/* NOTES:
 * - Extend Episode class with ReplayEpisode and SuperReplayEpisode
 * ReplayEpisode:
 * - number, title, mainSegmentGames, middleSegment, middleSegmentContent,
 *   secondSegment, secondSegmentGames
 * SuperReplayEpisode:
 * - title
 */

/** Episode representing a single episode of any Game Informer video series.
 * @author Todd Brentlinger
 */
export class Episode {
    /** @param {JSON} episodeDict */
    constructor(episodeDict) {
        this._episodeJSON = episodeDict;

        // ---------- YouTube Video ----------
        this.youtubeVideo = ('youtubeVideo' in this._episodeJSON)
            ? new YouTubeVideo(this._episodeJSON.youtubeVideo)
            : undefined;

        // ---------- Description ----------
        // Check two sources for details and use YouTube description as last resort
        if (typeof this._episodeJSON.description !== undefined && this._episodeJSON.description !== undefined)
            this.description = this._episodeJSON.description;
        else if (typeof this._episodeJSON.details.description !== undefined && this._episodeJSON.details.description !== undefined)
            this.description = this._episodeJSON.details.description;
        else if (this.youtubeVideo)
            this.description = this.youtubeVideo.description;
        else
            this.description = undefined;

        // ---------- Airdate ----------
        this.airdate = Episode.convertStringToDate(this._episodeJSON.airdate || this._episodeJSON.youtubeVideo.airdate);

    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------
    
    /* NOTES:
     * - Assign arrays and dicts in constructor since they are NOT
     * copied with assignment like Number and String objects.
     */

    get runtime() { return this._episodeJSON.runtime || this.youtubeVideo.runtime; }
    get host() { return this._episodeJSON.host; }
    get featuring() { return this._episodeJSON.featuring; }
    get externalLinks() { return this._episodeJSON.externalLinks; }
    get headlines() { return this._episodeJSON.headlines; }

    /* NOTES:
     * - Utility function? Utility.convertDateToString(this.airdate)
     * - Change to static?
     */
    get airdateString() {
        // If airdate property is a string, NOT a Date object, return the string
        if (typeof this.airdate == "string")
            return this.airdate;

        const months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        return months[this.airdate.getMonth()] + ' ' + this.airdate.getDate() +
            ', ' + this.airdate.getFullYear();
    }

    /* NOTES:
     * - Utility function? Utility.runtimeInSeconds(this.runtime)
     * - Change to static?
     */
    get runtimeInSeconds() {
        const timeArr = this.runtime.split(':');
        timeArr.forEach(function (digit, index, arr) {
            arr[index] = parseInt(digit, 10);
        });

        return timeArr[timeArr.length - 1]
            + (timeArr.length > 1 ? timeArr[timeArr.length - 2] * 60 : 0)
            + (timeArr.length > 2 ? timeArr[timeArr.length - 3] * 3600 : 0);
    }

    // ------------------------------------
    // ---------- Static Methods ----------
    // ------------------------------------

    /**
     * Add list to HTML element from array of String objects.
     * @param {Element} parentNode
     * @param {Array[String]} contentArr
     */
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
                    listElement.appendChild(createElement('li', undefined, arrayValueText));
            } else // Else create p element and append as child to more info element
                parentNode.appendChild(createElement('p', undefined, content));
        }
    }

    /**
     * Converts date string object to Date object
     * @param  {String} dateString The date string
     * @return {Date|String} The Date object if date string can be converted, else returns parameter String object unchanged
     */
    static convertStringToDate(dateString) {
        // If air date does not exist, return undefined
        if (!dateString || dateString.length == 0)
            return;
        // Air date does exist
        if (dateString.includes("/")) {
            const dateArr = dateString.split("/"); // [Month, Day, Year]
            const newDateStr = (dateArr[2] < 50 ? `20${dateArr[2]}` : `19${dateArr[2]}`) + `-${dateArr[0]}-${dateArr[1]}`;
            return new Date(newDateStr);
            /*
            let newDateString = ((dateString[2] < 50) ? "20" : "") +
                dateString[2];
            newDateString += "-" + dateString[0] + "-" +
                dateString[1];
            return new Date(newDateString);
            */
        }
        else if (dateString.includes(","))
            return new Date(dateString);
        else
            return;
    }

    /**
     * Add commas to number
     * @param {Number|String} num Number to add commas to as Number or String object
     * @return {String} Number as string with commas if needed
     */
    static addCommasToNumber(num) {
        // If typeof num is number, convert to string
        if (typeof num === 'number')
            num = num.toString();
        // If num is string and string contains number and more than 3 digits
        if (typeof num === 'string'
            && !isNaN(parseInt(num, 10))
            && num.length > 3) {
            // Add comma after every 3rd index from end
            return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else // Else return the num as is
            return num;
    }

    /**
     * Converts array of string values into a single string formatted in proper English.
     * ex. "list00, list01, list02, and list03"
     *     "list00 and list01"
     * @param {any} stringArr Array of String values
     */
    static convertListArrayToEnglishString(stringArr) {
        // Check if argument is array
        if (!Array.isArray(stringArr))
            return;

        let tempStr = "", arrLength = stringArr.length;
        stringArr.forEach((strValue, index) => {
            tempStr += strValue;
            // If array length is more than 1 and index is NOT the last element
            // If array length is 2, only add " and "
            // Else: If index is second to last element, add ", and " Else add ", "
            if (arrLength > 1 && index != arrLength - 1) {
                tempStr += (arrLength == 2) ? " and "
                    : (index == arrLength - 2) ? ", and " : ", ";
            }
        });

        return tempStr;
    }

    /**
     * 
     * @param {Array[]} linksList
     * @param {Element} parentNode
     * @param {String} headlineString
     * @param {String} urlPrepend
     */
    static addListOfLinks(linksList, parentNode, headlineString, urlPrepend) {
        // Variables
        const linkSourceOptions = [
            ['gameinformer', 'Game Informer'],
            ['youtube', 'YouTube'],
            ['fandom', 'Fandom'],
            ['wikipedia', 'Wikipedia'],
            ['gamespot', 'GameSpot'],
            ['steampowered', 'Steam']
        ];
        let listElement, listItemElement, anchorElement, linkSource;
        // Add header for external links to episodeMoreInfo element
        parentNode.appendChild(createElement('h4', undefined, headlineString));
        // Create ul element and append as child to episodeMoreInfo element
        listElement = parentNode.appendChild(createElement('ul', 'link-list'));
        // Loop through each value of array of list values
        for (const linkObj of linksList) {
            // Create li element and append as child to ul element
            listItemElement = listElement.appendChild(document.createElement('li'));
            // Create i element and append as child to li list element
            // then create anchor element and append as child to i element
            anchorElement = listItemElement.appendChild(document.createElement('i'))
                .appendChild(createElement('a', undefined, linkObj.title));
            anchorElement.setAttribute('href',
                (urlPrepend ? urlPrepend + linkObj.href : linkObj.href)
            );
            anchorElement.setAttribute('target', '_blank');
            anchorElement.setAttribute('rel', 'noopener');
            // Add text listing source of link
            linkSource = "";
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

    /**
     * Tests if variable exists and has a value that is NOT undefined
     * @deprecated
     * @param {any} variable
     * @return {Boolean} Return True if variable exists and has a value that is NOT undefined, else False
     */
    static doesVarExistAndValueNotUndefined(variable) {
        return (typeof variable !== undefined) && (variable !== undefined);
    }

    /**
     * Gets first argument that exists and has a value that is NOT undefined
     * @deprecated
     * @param {...any} args
     * @return {any} Returns first argument that exists and has a value that is NOT undefined
     */
    static returnFirstDefinedValue(...args) {
        args.forEach(argument => {
            if (Episode.doesVarExistAndValueNotUndefined(argument))
                return argument;
        });
    }
}