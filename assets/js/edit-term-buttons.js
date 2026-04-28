/**
 * @file This file creates links to the terms definitions on GitHub via client side JS DOM manipulation.
 * Repository information (account, repo name, branch) is obtained from the meta tag 
 * 'spec-up-t:github-repo-info' using the getGithubRepoInfo() function.
 * @author Kor Dwarshuis
 * @version 0.0.2
 * @license MIT
 * @since 2024-06-09
 */

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

// Simple path join utility for client-side JS (normalizes separators, handles leading/trailing /)
function pathJoin(...segments) {
   // Filter out empty segments and join with '/'
   return segments.filter(segment => segment).join('/').replace(/\/+/g, '/');
}

function editTermButtons() {
   // Get GitHub repo info from meta tag
   const repoInfo = getGithubRepoInfo();

   // Early return if no repo info available
   if (!repoInfo) {
      console.warn('GitHub repository information not available, edit buttons will not be added');
      return;
   }

   document.querySelectorAll('dt.term-local').forEach(item => {
      const term = findDeepestSpan(item);
      const url = term.getAttribute('id');

      const localFileName = url.split(":")[1];
      const pathLocalTerms = pathJoin(specConfig.spec_directory, specConfig.spec_terms_directory, localFileName + '.md');

      // add edit and history buttons to term
      term.innerHTML += `<span class="edit-term-buttons">
         <a title="Link to the term file in the Github repo in a new tab" target="_blank" rel="noopener" 
            href="https://github.com/${repoInfo.username}/${repoInfo.repo}/blob/${repoInfo.branch}/${pathLocalTerms}" 
            class="p-1 edit-term-button btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
               <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
         </a>
         <a title="Link to a GitHub page that shows a history of the edits in a new tab" target="_blank" rel="noopener" 
            href="https://github.com/${repoInfo.username}/${repoInfo.repo}/commits/${repoInfo.branch}/${pathLocalTerms}" 
            class="p-1 history-term-button btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
               <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
               <path fill-rule="evenodd" d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
               <circle cx="8" cy="8" r="0.3"/>
            </svg>
         </a>
      </span>`;
   });

   // Process external terms (trefs)
   // External terms are those referenced from external specs via [[tref: spec, term]]
   // The pencil button should point to the LOCAL markdown file where the tref is written
   document.querySelectorAll('dt.term-external').forEach(item => {
      const term = findDeepestSpan(item);
      const url = term.getAttribute('id');

      // Find the term in data-original-term attribute
      // This attribute contains the original term name from the tref
      const originalTerm = term.dataset.originalTerm || url.split(":")[2];

      // Lookup this term in the embedded allXTrefs object
      // Match by term name - could match multiple specs
      const matchingXtrefs = (allXTrefs?.xtrefs || []).filter(xref => xref.term === originalTerm);

      if (matchingXtrefs.length > 0) {
         // Create edit and history buttons for each matching xtref
         // Multiple buttons may appear if the term is referenced in multiple files
         const buttonsHtml = matchingXtrefs.map(xtref => {
            // Find sourceFiles with type "tref" - these are the local files that reference this external term
            const trefFiles = xtref.sourceFiles?.filter(sf => sf.type === 'tref') || [];

            if (trefFiles.length === 0) return '';

            // Create buttons for each local tref file that references this external term
            return trefFiles.map(sf => {
               // Build path to the local markdown file where the tref is written
               const filePath = pathJoin(specConfig.spec_directory, specConfig.spec_terms_directory, sf.file);
               const editUrl = `https://github.com/${repoInfo.username}/${repoInfo.repo}/blob/${repoInfo.branch}/${filePath}`;
               const historyUrl = `https://github.com/${repoInfo.username}/${repoInfo.repo}/commits/${repoInfo.branch}/${filePath}`;

               return `
                  <a title="Link to the term file in the Github repo in a new tab" target="_blank" rel="noopener" 
                     href="${editUrl}" 
                     class="p-1 edit-term-button btn">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">
                        <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                     </svg>
                  </a>
                  <a title="Link to a GitHub page that shows a history of the edits in a new tab" target="_blank" rel="noopener" 
                     href="${historyUrl}" 
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
      }
   });
}

document.addEventListener("DOMContentLoaded", function () {
   editTermButtons();
});
