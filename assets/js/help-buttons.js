/**
 * Creates and inserts help buttons into the DOM.
 * 
 * This function creates a help button element and inserts it after each element
 * with the class 'collapse-all-defs-button' within the '#content' element. The
 * help button links to the documentation website and opens in a new tab.
 * 
 * @function helpButtons
 * @memberof module:help-buttons
 * 
 * @example
 * // Automatically called when the DOM content is loaded
 * document.addEventListener('DOMContentLoaded', helpButtons);
 */

function helpButtons() {
   // Create the help button DOM element
   const newElement = document.createElement('a');
   newElement.textContent = '?';
   newElement.classList.add('help-button', 'btn');
   newElement.title = 'Click to see the explanation of the buttons at the documentation website, in a new tab.';
   newElement.target = '_blank';
   newElement.rel = 'noopener noreferrer';
   newElement.href = 'https://trustoverip.github.io/spec-up-t-website/docs/general/specification#explanation-buttons';

   function addElementAfterLastChild(newElement) {
      const elements = document.querySelectorAll('#content dl dt');

      elements.forEach((element) => {
         element.appendChild(newElement.cloneNode(true));
      });
   }

   addElementAfterLastChild(newElement);
}

document.addEventListener('DOMContentLoaded', helpButtons);