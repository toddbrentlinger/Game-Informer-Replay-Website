"use strict";

import { SuperReplay } from "./superReplay.js";
/** SuperReplayComponent representing a React component for SuperReplay object.
 * @author Todd Brentlinger
 */
export class SuperReplayComponent {
    constructor(superReplayObj) {
        // Check that provided argument is instance of SuperReplay object
        if (!(superReplayObj instanceof SuperReplay)) throw "Argument NOT instance of SuperReplay class."

        this._superReplayObj = superReplayObj;
    }
}