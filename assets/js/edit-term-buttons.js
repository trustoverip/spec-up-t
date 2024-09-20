/**
 * @file This file creates links to the terms definitions on GitHub via client side JS DOM manipulation.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @license MIT
 * @since 2024-06-09
 */

function editTermButtons() {
   // Function to find the deepest <span>
   // Spec-Up is generating nested spans. The deepest span is the main term, and that is what we need.
   function findDeepestSpan(element) {
      let currentElement = element;
      // While there is a <span> child, keep going deeper
      while (currentElement.querySelector('span[id^="term:"]')) {
         currentElement = currentElement.querySelector('span[id^="term:"]');
      }
      return currentElement;
   }

   // Remove "./" or "/" from the beginning of a string and "/" at the end of the string
   function cleanPath(path) {
      // Remove "./" or "/" from the beginning of the string
      if (path.startsWith("./")) {
         path = path.substring(2);
      } else if (path.startsWith("/")) {
         path = path.substring(1);
      }

      // Remove "/" at the end of the string if it exists
      if (path.endsWith("/")) {
         path = path.slice(0, -1);
      }

      return path;
   }

   // Example usage with the string from the file

   const cleanedSpecDir = cleanPath(specConfig.spec_directory);
   
   // Find all definition terms that have spans with the id of "term:...". These are the definitions we are looking for.
   document.querySelectorAll('dt:has(> span[id^="term:"])').forEach(item => {
      const term = findDeepestSpan(item);
      const url = term.getAttribute('id');

      // cut “url” on the “:” and keep the second part
      const fileName = url.split(":")[1];

      // add edit and history buttons to term
      term.innerHTML += `<a title="Link to the term file in the Github repo in a new tab" target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/${specConfig.source.repo}/blob/main/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" class="edit-term-button btn">🖊️</a><a title="Link to a GitHub page that shows a history of the edits in a new tab" target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/${specConfig.source.repo}/commits/main/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" class="history-term-button btn">📅</a>`;
   });
}

document.addEventListener("DOMContentLoaded", function () {
   editTermButtons();
});
