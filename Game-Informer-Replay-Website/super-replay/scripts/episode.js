"use strict";

//import { GameInformerArticle } from "./gameInformerArticle.js";
import { YouTubeVideo } from "./youtubeVideo.js";

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
        if ('youtubeVideo' in this._episodeJSON)
            this.youtubeVideo = new YouTubeVideo(this._episodeJSON.youtubeVideo);
        else
            this.youtubeVideo = undefined

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
        this.airdate = Episode.convertStringToDate(this._episodeJSON.airdate);

    }

    // -----------------------------
    // ---------- Getters ----------
    // -----------------------------
    
    /* NOTES:
     * - Assign arrays and dicts in constructor since they are NOT
     * copied with assignment like Number and String objects.
     */

    get runtime() { return this._episodeJSON.runtime; }
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
     * Converts date string object to Date object
     * @param  {String} dateString The date string
     * @return {Date|String} The Date object if date string can be converted, else returns parameter String object unchanged
     */
    static convertStringToDate(dateString) {
        // If air date does not exist, assign empty string
        if (!dateString || dateString.length == 0)
            this.airdate = '';
        else { // Else air date does exist
            if (dateString.includes('/')) {
                let newDateString = ((dateString[2] < 50) ? '20' : '') +
                    dateString[2];
                newDateString += '-' + dateString[0] + '-' +
                    dateString[1];
                return new Date(newDateString);
            }
            else if (dateString.includes(','))
                return new Date(dateString);
            else
                return dateString;
        }
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
            && num.length > 3
        ) {
            // Add comma after every 3rd index from end
            return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else // Else return the num as is
            return num;
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