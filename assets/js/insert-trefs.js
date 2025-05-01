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
    * Processes all terms found in the document and inserts their corresponding content
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

         allTerms.push({
            element: termElement,
            textContent: textContent
         });
      });

      // Then process all terms in a consistent order (from the JS file order)
      allTerms.forEach(termData => {
         const termElement = termData.element;
         const textContent = termData.textContent;

         // Find the first matching xref to avoid duplicates
         const xref = xtrefsData.xtrefs.find(x => x.term === textContent);

         // Skip if we've already added content for this term (check for existing dd elements)
         const dt = termElement.closest('dt');
         if (dt) {
            const nextElement = dt.nextElementSibling;
            if (nextElement && nextElement.classList.contains('transcluded-xref-term') &&
               nextElement.classList.contains('meta-info-content-wrapper')) {
               return; // Already processed
            }
         }

         if (xref) {
            const parent = dt.parentNode;

            // Create and insert meta info element
            const metaInfoEl = document.createElement('dd');
            metaInfoEl.classList.add('transcluded-xref-term', 'meta-info-content-wrapper', 'collapsed');

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
            parent.insertBefore(metaInfoEl, dt.nextSibling);

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

            // If there are dd elements in the rendered content, insert them directly
            const ddElements = tempDiv.querySelectorAll('dd');
            if (ddElements.length > 0) {
               // Insert each dd element in the correct order
               let insertPosition = metaInfoEl; // Start inserting after the meta info element
               
               // Convert NodeList to Array and insert in original order
               Array.from(ddElements).forEach(dd => {
                  // Clone the node to avoid removing it from tempDiv during insertion
                  const clonedDD = dd.cloneNode(true);
                  // Add necessary classes
                  clonedDD.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
                  // Insert after the previous element
                  parent.insertBefore(clonedDD, insertPosition.nextSibling);
                  // Update insertion position to be after this newly inserted element
                  insertPosition = clonedDD;
               });
            } else {
               // No dd elements found, create one to hold the content
               const contentEl = document.createElement('dd');
               contentEl.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
               contentEl.innerHTML = tempDiv.innerHTML;
               parent.insertBefore(contentEl, metaInfoEl.nextSibling);
            }
         } else {
            // Handle case where xref is not found
            const parent = dt.parentNode;

            // Create and insert meta info for not found case
            const metaInfoEl = document.createElement('dd');
            metaInfoEl.classList.add('transcluded-xref-term', 'meta-info-content-wrapper', 'collapsed');
            const metaInfo = `
| Property | Value |
| -------- | ----- |
| Owner | Unknown |
| Repo | Unknown |
| Commit hash | not found |
            `;
            metaInfoEl.innerHTML = md.render(metaInfo);
            parent.insertBefore(metaInfoEl, dt.nextSibling);

            // Create and insert not found message
            const notFoundEl = document.createElement('dd');
            notFoundEl.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
            notFoundEl.innerHTML = '<p>This term was not found in the external repository.</p>';
            parent.insertBefore(notFoundEl, metaInfoEl.nextSibling);
         }
      });
   }

   if (allXTrefs && allXTrefs.xtrefs) {
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