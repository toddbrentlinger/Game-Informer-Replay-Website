"use strict";

import { createElement } from "../../scripts/utility.js";

export class NumberedButtonList {
    // Changes depending on screen width
    // If some browsers do NOT support class static properties, will have to
    // use instance property and change each instance when screen width
    // changes.
    static maxDisplayedButtons = 7;

    // ---------------------------------
    // ---------- Constructor ----------
    // ---------------------------------
    /**
     * @param {Element} numberedButtonContainer
     * @param {Number} totalNumberedButtons
     */
    constructor(buttonContainerElement, totalNumberedButtons = 1, eventListenerFunction) {
        this.currentSelectedButton = 1;
        this.buttonContainerElement = buttonContainerElement;
        this.totalNumberedButtons = totalNumberedButtons;
        this.eventListenerFunction = eventListenerFunction;

        // Set up PREV, FIRST, LAST, NEXT buttons
        this.buttonContainerElement.querySelectorAll('button')
            .forEach(function (node) {
                node.addEventListener("click", function () {
                    const buttonValue = node.getAttribute('value');
                    this.setCurrentSelectedButton(buttonValue);
                    this.eventListenerFunction(this.currentSelectedButton);
                }.bind(this), false);
            }, this);

        // Set up numbered buttons
        this.updateButtonContainerElement();
    }

    // ---------------------------------------
    // ---------- Methods/Functions ----------
    // ---------------------------------------
    /**
     * @param {Number} buttonValue
     * @param {String} buttonStr
     */
    createNumberedButton(buttonValue, buttonStr) {
        // Variables
        let tempNode;
        // If buttonStr is undefined, assign same value as buttonValue
        if (typeof buttonStr === 'undefined')
            buttonStr = buttonValue;
        // Create button
        tempNode = (buttonValue == this.currentSelectedButton)
            ? createElement('button', 'active custom-button', buttonStr)
            : createElement('button', 'custom-button', buttonStr);
        tempNode.setAttribute('type', 'button');
        tempNode.setAttribute('value', buttonValue);
        tempNode.addEventListener("click", function () {
            this.setCurrentSelectedButton(buttonValue);
            this.eventListenerFunction(buttonValue);
        }.bind(this), false);
        // Return button
        return tempNode;
    }

    /**
     * */
    updateButtonContainerElement() {
        // Variables
        const pageNumberList = this.buttonContainerElement.querySelector('.page-number-list');
        const maxButtonsMidCeil = Math.ceil(NumberedButtonList.maxDisplayedButtons / 2);

        // Hide page container if total pages is less than 2
        this.buttonContainerElement.style.display = (this.totalNumberedButtons < 2) ? 'none' : null;

        // Remove all page number buttons
        this.buttonContainerElement.querySelectorAll('.page-number-list .custom-button')
            .forEach(node => node.remove());

        // Disable 'PREV' if current page is equal to 1
        this.buttonContainerElement.querySelector('button[value="prev"]')
            .disabled = (this.currentSelectedButton === 1);

        // Disable 'FIRST' if totalNumberedButtons is less than or equal to maxDisplayedButtons
        // OR current page is near beginning of list
        this.buttonContainerElement.querySelector('button[value="first"]')
            .disabled = (this.totalNumberedButtons <= NumberedButtonList.maxDisplayedButtons
            || this.currentSelectedButton <= maxButtonsMidCeil
            );

        // Page number list
        let start, end;
        // If totalNumberedButtons is more than maxDisplayedButtons
        if (this.totalNumberedButtons > NumberedButtonList.maxDisplayedButtons) {
            if (this.currentSelectedButton > this.totalNumberedButtons - maxButtonsMidCeil) {
                // Show last maxDisplayedButtons
                start = this.totalNumberedButtons - NumberedButtonList.maxDisplayedButtons + 1;
                end = this.totalNumberedButtons;
            } else if (this.currentSelectedButton > maxButtonsMidCeil) {
                // Show buttons with currentSelectedButton in middle
                start = this.currentSelectedButton - maxButtonsMidCeil + 1;
                end = this.currentSelectedButton + maxButtonsMidCeil - 1;
            } else {
                // Show first maxDisplayedButtons
                start = 1;
                end = NumberedButtonList.maxDisplayedButtons;
            }
        } else { // Else totalNumberedButtons is less than or equal to maxDisplayedButtons
            // Add buttons ranging from 1 to totalNumberedButtons
            start = 1;
            end = this.totalNumberedButtons;
        }
        for (let i = start; i <= end; i++)
            pageNumberList.appendChild(this.createNumberedButton(i, i));

        // Disable 'LAST' if totalNumberedButtons is less than or equal to maxDisplayedButtons
        // OR current page is near end of list
        this.buttonContainerElement.querySelector('button[value="last"]')
            .disabled = (this.totalNumberedButtons <= NumberedButtonList.maxDisplayedButtons
            || this.currentSelectedButton >= this.totalNumberedButtons - maxButtonsMidCeil + 1
            );

        // Disable 'NEXT' if current page is equal to last page (totalNumberedButtons)
        this.buttonContainerElement.querySelector('button[value="next"]')
            .disabled = (this.currentSelectedButton === this.totalNumberedButtons);
    }

    /**
     * 
     * @param {Number|String} input
     */
    setCurrentSelectedButton(input) {
        const prevPage = this.currentSelectedButton;
        if (typeof input === 'number')
            this.currentSelectedButton = input;
        else if (typeof input === 'string') {
            // If input is 'next', increase page by 1
            if (input == 'next') this.currentSelectedButton++;
            // Else If input is 'prev', decrease page by 1
            else if (input == 'prev') this.currentSelectedButton--;
            // Else If input is 'first', set page to 1
            else if (input == 'first') this.currentSelectedButton = 1;
            // Else If input is 'last', set page to totalNumberedButtons
            else if (input == 'last') this.currentSelectedButton = this.totalNumberedButtons;
            // Else If string is a number, assign number to page
            else if (!isNaN(parseInt(input, 10)))
                this.currentSelectedButton = parseInt(input, 10);
        }

        // If currentSelectedButton has changed value
        if (prevPage != this.currentSelectedButton) {
            this.updateButtonContainerElement();
        }
    }
}