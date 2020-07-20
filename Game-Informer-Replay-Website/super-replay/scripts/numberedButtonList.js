"use strict";

import { createElement } from "../../scripts/utility.js";

export class NumberedButtonList {
    // ---------------------------------
    // ---------- Constructor ----------
    // ---------------------------------
    /**
     * 
     * @param {Number} maxNumberedButtons
     * @param {Element} numberedButtonContainer
     */
    constructor(maxNumberedButtons = 1, numberedButtonContainer) {
        this.currentSelectedButton = 1;
        this.maxNumberedButtons = maxNumberedButtons;
        this.numberedButtonContainer = numberedButtonContainer;
    }

    // ---------------------------------------
    // ---------- Methods/Functions ----------
    // ---------------------------------------
    /**
     * @param {Number} buttonValue
     * @param {String} buttonStr
     * @param {Boolean} scrollToTop
     */
    createNumberedButton(buttonValue, buttonStr, scrollToTop = false) {
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
            this.setPageNumber(buttonValue, scrollToTop);
        }.bind(this), false);
        // Return button
        return tempNode;
    }

    updatePageNumber(positionStr, scrollToTop = false) {
        // Variables
        const pageNumberContainer = document.getElementById(`page-number-container${(positionStr) ? '-' + positionStr : ''}`);
        const pageNumberList = pageNumberContainer.querySelector('.page-number-list');
        const maxButtonsMidCeil = Math.ceil(this.maxDisplayedButtons / 2);

        // Hide page container if total pages is less than 2
        pageNumberContainer.style.display = (this.totalPages < 2) ? 'none' : null;

        // Remove all page number buttons
        pageNumberContainer.querySelectorAll('.page-number-list .custom-button')
            .forEach(node => node.remove());

        // Disable 'PREV' if current page is equal to 1
        pageNumberContainer.querySelector('button[value="prev"]')
            .disabled = (this.currentPageDisplayed === 1);

        // Disable 'FIRST' if totalPages is less than or equal to maxDisplayedButtons
        // OR current page is near beginning of list
        pageNumberContainer.querySelector('button[value="first"]')
            .disabled = (this.totalPages <= this.maxDisplayedButtons
                || this.currentPageDisplayed <= maxButtonsMidCeil
            );

        // Page number list
        let start, end;
        // If totalPages is more than maxDisplayedButtons
        if (this.totalPages > this.maxDisplayedButtons) {
            if (this.currentPageDisplayed > this.totalPages - maxButtonsMidCeil) {
                // Show last maxDisplayedButtons
                start = this.totalPages - this.maxDisplayedButtons + 1;
                end = this.totalPages;
            } else if (this.currentPageDisplayed > maxButtonsMidCeil) {
                // Show buttons with currentPageDisplayed in middle
                start = this.currentPageDisplayed - maxButtonsMidCeil + 1;
                end = this.currentPageDisplayed + maxButtonsMidCeil - 1;
            } else {
                // Show first maxDisplayedButtons
                start = 1;
                end = this.maxDisplayedButtons;
            }
        } else { // Else totalPages is less than or equal to maxDisplayedButtons
            // Add buttons ranging from 1 to totalPages
            start = 1;
            end = this.totalPages;
        }
        for (let i = start; i <= end; i++)
            pageNumberList.appendChild(this.createNumberedButton(i, i, scrollToTop));

        // Disable 'LAST' if totalPages is less than or equal to maxDisplayedButtons
        // OR current page is near end of list
        pageNumberContainer.querySelector('button[value="last"]')
            .disabled = (this.totalPages <= this.maxDisplayedButtons
                || this.currentPageDisplayed >= this.totalPages - maxButtonsMidCeil + 1
            );

        // Disable 'NEXT' if current page is equal to last page (totalPages)
        pageNumberContainer.querySelector('button[value="next"]')
            .disabled = (this.currentPageDisplayed === this.totalPages);
    }

    /**
     * 
     * @param {Number|String} input
     * @param {Boolean} scrollToTop
     */
    setPageNumber(input, scrollToTop = false) {
        const prevPage = this.currentPageDisplayed;
        if (typeof input === 'number')
            this.currentPageDisplayed = input;
        else if (typeof input === 'string') {
            // If input is 'next', increase page by 1
            if (input == 'next') this.currentPageDisplayed++;
            // Else If input is 'prev', decrease page by 1
            else if (input == 'prev') this.currentPageDisplayed--;
            // Else If input is 'first', set page to 1
            else if (input == 'first') this.currentPageDisplayed = 1;
            // Else If input is 'last', set page to totalPages
            else if (input == 'last') this.currentPageDisplayed = this.totalPages;
            // Else If string is a number, assign number to page
            else if (!isNaN(parseInt(input, 10)))
                this.currentPageDisplayed = parseInt(input, 10);
        }
        // If currentPageDisplayed has changed value
        if (prevPage != this.currentPageDisplayed) {
            // Update displayed episodes
            this.updateDisplayedSuperReplays();
            // Scroll to top
            if (scrollToTop)
                document.getElementById('top-page').scrollIntoView({ behavior: "smooth" });
        }
    }
}