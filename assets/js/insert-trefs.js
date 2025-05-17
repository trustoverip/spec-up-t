/**
 * @fileoverview Handles the insertion of transcluded external references (xrefs) into HTML documentation.
 * This script processes terms marked with a specific class and adds their definitions from external sources.
 */

/**
 * Inserts transcluded external references into the document.
 * @param {Object} allXTrefs - The object containing all external references data
 * @param {Array} allXTrefs.xtrefs - Array of external reference objects, each containing term definitions
 */
function insertTrefs(allXTrefs) { // Pass allXTrefs as a parameter
   /**
    * Processes all terms found in the document and collects DOM changes
    * before applying them in batch to improve performance.
    * 
    * @param {Object} xtrefsData - The object containing xtrefs data
    * @param {Array} xtrefsData.xtrefs - Array of external reference objects
    */
   function processTerms(xtrefsData) {
      // First collect all terms to ensure consistent processing order
      const allTerms = [];
      document.querySelectorAll('dt span.transcluded-xref-term').forEach(termElement => {
         const textContent = Array.from(termElement.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');

         // Find the dt element once outside the loop
         const dt = termElement.closest('dt');

         // Skip if the term has already been processed
         if (dt) {
            const nextElement = dt.nextElementSibling;
            if (nextElement?.classList.contains('transcluded-xref-term') &&
               nextElement.classList.contains('meta-info-content-wrapper')) {
               return; // Already processed
            }
         }

         // Only add terms that haven't been processed yet
         allTerms.push({
            element: termElement,
            textContent: textContent,
            dt: dt,
            parent: dt?.parentNode
         });
      });

      // Prepare all DOM changes first before making any insertions
      const domChanges = allTerms.map(termData => {
         const { textContent, dt, parent } = termData;

         if (!dt || !parent) {
            return null; // Skip invalid entries
         }

         // Find the first matching xref to avoid duplicates
         const xref = xtrefsData.xtrefs.find(x => x.term === textContent);

         // Create a DocumentFragment to hold all new elements for this term
         const fragment = document.createDocumentFragment();

         // Create meta info element
         const metaInfoEl = document.createElement('dd');
         metaInfoEl.classList.add('transcluded-xref-term', 'meta-info-content-wrapper', 'collapsed');

         if (xref) {
            // Generate meta info content
            const avatar = xref.avatarUrl ? `![avatar](${xref.avatarUrl})` : '';
            const owner = xref.owner || 'Unknown';
            const repo = xref.repo && xref.repoUrl ? `[${xref.repo}](${xref.repoUrl})` : 'Unknown';
            const commitHash = xref.commitHash || 'Unknown';

            const metaInfo = `
| Property | Value |
| -------- | ----- |
| Owner | ${avatar} ${owner} |
| Repo | ${repo} |
| Commit hash | ${commitHash} |
            `;
            metaInfoEl.innerHTML = md.render(metaInfo);
            fragment.appendChild(metaInfoEl);

            // Clean up markdown content
            let content = xref.content
               .replace(/\[\[def:[^\]]*?\]\]/g, '') // Remove [[def: ...]] patterns regardless of trailing chars
               .split('\n')
               .map(line => line.replace(/^\s*~\s*/, '')) // Remove leading ~ and spaces
               .join('\n')
               .replace(/\[\[ref:/g, '') // Remove [[ref: ...]]
               .replace(/\]\]/g, '');

            // Parse the rendered HTML to check for dd elements
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = md.render(content);

            // If there are dd elements in the rendered content, prepare them for insertion
            const ddElements = tempDiv.querySelectorAll('dd');
            if (ddElements.length > 0) {
               // Add all dd elements to the fragment in original order
               Array.from(ddElements).forEach(dd => {
                  // Clone the node to avoid removing it from tempDiv during insertion
                  const clonedDD = dd.cloneNode(true);
                  // Add necessary classes
                  clonedDD.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
                  // Add to fragment
                  fragment.appendChild(clonedDD);
               });
            } else {
               // No dd elements found, create one to hold the content
               const contentEl = document.createElement('dd');
               contentEl.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
               contentEl.innerHTML = tempDiv.innerHTML;
               fragment.appendChild(contentEl);
            }
         } else {
            // Handle case where xref is not found
            metaInfoEl.innerHTML = md.render(`
| Property | Value |
| -------- | ----- |
| Owner | Unknown |
| Repo | Unknown |
| Commit hash | not found |
            `);
            fragment.appendChild(metaInfoEl);

            // Create not found message
            const notFoundEl = document.createElement('dd');
            notFoundEl.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded', 'last-dd');
            notFoundEl.innerHTML = '<p>This term was not found in the external repository.</p>';
            fragment.appendChild(notFoundEl);
         }

         // Return all necessary information for DOM insertion
         return {
            dt: dt,
            parent: parent,
            fragment: fragment
         };
      }).filter(Boolean); // Remove null entries

      // Perform all DOM insertions in a single batch
      requestAnimationFrame(() => {
         domChanges.forEach(change => {
            const { dt, parent, fragment } = change;
            parent.insertBefore(fragment, dt.nextSibling);
         });
      });
   }

   if (allXTrefs?.xtrefs) {
      processTerms(allXTrefs);
   } else {
      console.error('allXTrefs is undefined or missing xtrefs property');
   }
}

/**
 * Initialize the transcluded references when the DOM is fully loaded.
 * Checks for the global allXTrefs object and calls insertTrefs if available.
 */
document.addEventListener('DOMContentLoaded', () => {
   // Check if allXTrefs is defined in the global scope
   if (typeof allXTrefs !== 'undefined') {
      insertTrefs(allXTrefs);
   } else {
      console.warn('allXTrefs is not available in the global scope. Transcluded references will not be inserted.');
   }
});