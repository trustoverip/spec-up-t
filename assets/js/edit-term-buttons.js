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

   const cleanedSpecDir = cleanPath(specConfig.spec_directory);

   // Get GitHub repository information from the meta tag
   const githubRepoInfo = getGithubRepoInfo();
   if (!githubRepoInfo) {
      console.warn('GitHub repository information not available. Edit term buttons will not be created.');
      return;
   }

   document.querySelectorAll('dt.term-external').forEach(item => {
      const term = findDeepestSpan(item);
      const url = term.getAttribute('id');

      // Get the original term name
      const originalTerm = term.dataset.originalTerm || url.split(":")[1];

      // Find matching xtrefs
      const matchingXtrefs = (window.allXTrefs?.xtrefs || []).filter(xref => xref.term === originalTerm);

      if (matchingXtrefs.length > 0) {
         // Create edit and history buttons for each matching xtref
         const buttonsHtml = matchingXtrefs.map(xref => {
            // Find sourceFiles with type "tref"
            const trefFiles = xref.sourceFiles?.filter(sf => sf.type === 'tref') || [];
            
            if (trefFiles.length === 0) return '';

            return trefFiles.map(sf => {
               const fileName = sf.file;
               return `
                  <a title="Link to the term file '${fileName}' in the Github repo in a new tab" target="_blank" rel="noopener" 
                     href="https://github.com/${githubRepoInfo.username}/${githubRepoInfo.repo}/blob/${githubRepoInfo.branch}/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" 
                     class="p-1 edit-term-button btn">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
                        <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                     </svg>
                  </a>
                  <a title="Link to a GitHub page that shows a history of the edits in '${fileName}' in a new tab" target="_blank" rel="noopener" 
                     href="https://github.com/${githubRepoInfo.username}/${githubRepoInfo.repo}/commits/${githubRepoInfo.branch}/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" 
                     class="p-1 history-term-button btn">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
                        <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                        <path fill-rule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                        <circle cx="8" cy="8" r="0.3"/>
                     </svg>
                  </a>
               `;
            }).join('');
         }).join('');

         if (buttonsHtml) {
            term.innerHTML += `<span class="edit-term-buttons">${buttonsHtml}</span>`;
         }
      } else {
         // Fallback to original logic if no xtrefs found
         const fileName = url.split(":")[1];
         term.innerHTML += `<span class="edit-term-buttons">
            <a title="Link to the term file in the Github repo in a new tab" target="_blank" rel="noopener" 
               href="https://github.com/${githubRepoInfo.username}/${githubRepoInfo.repo}/blob/${githubRepoInfo.branch}/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" 
               class="p-1 edit-term-button btn">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
                  <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
               </svg>
            </a>
            <a title="Link to a GitHub page that shows a history of the edits in a new tab" target="_blank" rel="noopener" 
               href="https://github.com/${githubRepoInfo.username}/${githubRepoInfo.repo}/commits/${githubRepoInfo.branch}/${cleanedSpecDir}/${specConfig.spec_terms_directory}/${fileName}.md" 
               class="p-1 history-term-button btn">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
                  <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                  <path fill-rule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                  <circle cx="8" cy="8" r="0.3"/>
               </svg>
            </a>
         </span>`;
      }
   });
}

document.addEventListener("DOMContentLoaded", function () {
   editTermButtons();
});
