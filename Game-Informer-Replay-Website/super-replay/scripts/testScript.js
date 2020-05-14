"use strict";

const TEST_STR = "Hello World";

class TestClass {
    constructor(number = 0) {
        this._number = number;
    }
    get number() { return this._number; }
    testFunc() {
        console.log("Number is: ", this.number);
    }
}

var test = new TestClass();
console.log("TestClass instance number:", test.number);