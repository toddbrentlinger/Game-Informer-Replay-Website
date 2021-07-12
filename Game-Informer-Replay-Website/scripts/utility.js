"use strict";

/**
 * Tests if an object is empty (has no keys).
 * @param {Object} obj
 */
export function isEmptyObject(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/**
 * Shuffle the order of an array.
 * @param {Array} arr
 */
export function shuffleArray(arr) {

    for (let i = arr.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i 
        let j = Math.floor(Math.random() * (i + 1));

        // Swap arr[i] with the element at random index
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

/**
* Create an HTML element with specified tag, class, and inner text.
* @param {String} elementTag
* @param {String} elementClass
* @param {String} elementInnerHTML
* 
* @return {Element}
*/
export function createElement(elementTag, elementClass, elementInnerHTML) {
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

/**
 * 
 * @param {String} nameStr
 * @param {String} valueStr
 * @param {String} labelStr
 */
export function createFieldsetLabel(nameStr, valueStr, labelStr) {
    // Variables
    let labelElement;
    let inputElement;

    // If labelStr is undefined, assign same value as valueStr
    if (typeof labelStr === "undefined")
        labelStr = valueStr;

    // Create input element
    inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'checkbox');
    inputElement.setAttribute('name', nameStr);
    inputElement.setAttribute('value', valueStr);
    //inputElement.defaultChecked = true;
    // Append input element to label
    labelElement = createElement('label', undefined, labelStr);
    labelElement.appendChild(inputElement);
    // Append span element for checkmark
    labelElement.appendChild(createElement('span', 'checkmark'));
    // Return label element to append to the fieldset
    return labelElement;
}

/**
 * Populates image element with specified parameters.
 * @param {Element} imgElement Reference to img element that is changed in-place
 * @param {Object} thumbnailObj Each property is different image with it's own url, width, height
 */
export function populateImageElement(imgElement, thumbnailObj) {
    let temp = thumbnailObj.hasOwnProperty('standard')
        ? thumbnailObj.standard
        : thumbnailObj.default;
    imgElement.setAttribute('width', temp.width);
    imgElement.setAttribute('height', temp.height);
    imgElement.setAttribute('src', temp.url);
    imgElement.setAttribute('sizes', '50vw');
    // Source Set (srcset)
    temp = ""
    Object.keys(thumbnailObj).forEach((key, index, arr) => {
        temp += `${thumbnailObj[key].url} ${thumbnailObj[key].width}w`;
        if (index < arr.length - 1)
            temp += ", ";
    });
    imgElement.setAttribute('srcset', temp);
}