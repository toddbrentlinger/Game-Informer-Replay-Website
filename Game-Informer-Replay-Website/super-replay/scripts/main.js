"use strict";

import { SuperReplay } from "./superReplay.js";

console.log("main.js has started");

init();

//var test = new TestClass();
//console.log("TestClass instance number:", test.number);

function init() {
    let requestURL = "data/gameInformerSuperReplayFandomWikiData.json";
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);

    request.responseType = 'json';
    request.send();

    request.onload = function () {
        window.superReplaysJSON = request.response;
        setUpSuperReplaysFromJSON();
    }
}

function setUpSuperReplaysFromJSON() {
    window.superReplays = [];
    window.superReplaysJSON.forEach(superReplayDict =>
        window.superReplays.push(new SuperReplay(superReplayDict))
    );
}