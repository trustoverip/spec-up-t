/**
 * @file This file creates links to the terms definitions on GitHub via client side JS DOM manipulation.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @license MIT
 * @since 2024-06-09
 */

function editTermButtons() {
   // find the definition list that is the next sibling of #terms-definitions
   const termsDefinitions = document.querySelector('.terms-and-definitions-list');

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

   termsDefinitions.querySelectorAll('dt').forEach(term => {
      const url = term.querySelector('span').getAttribute('id');

      // cut “url” on the “:” and keep the second part
      const fileName = url.split(":")[1];

      // add edit and history buttons to term
      term.innerHTML += `<sup class="edit-term-button-sup"><a target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/ctwg-main-glossary/blob/main/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" class="edit-term-button">Edit</a></sup><sup class="history-term-button-sup"><a target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/ctwg-main-glossary/commits/main/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" class="history-term-button">History</a></sup>`;
   });
}

document.addEventListener("DOMContentLoaded", function () {
   editTermButtons();
});
