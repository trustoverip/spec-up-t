/**
 * @fileoverview Inserts transcluded external references (trefs) into the document.
 *
 * This script enhances an HTML document by adding definitions and meta information
 * for terms marked with `<span class="transcluded-xref-term">` inside `<dt>` elements
 * within a `<dl>` structure. It matches these terms against an external data source,
 * renders the corresponding content and meta information from markdown to HTML,
 * and inserts them as `<dd>` elements following each matching `<dt>`. The script
 * executes automatically when the DOM is fully loaded via a `DOMContentLoaded` event listener.
 *
 * ### Dependencies
 * - **`allXTrefs`**: A global object containing the external references to be transcluded.
 * - **`md`**: A markdown renderer object with a `render` method to convert markdown to HTML.
 *
 * ### Data Structure
 * The `allXTrefs` object must have the following structure:
 * ```javascript
 * {
 *   xtrefs: [
 *     {
 *       term: string,          // The term to match against the <span> text content
 *       content: string,       // Markdown content for the definition
 *       owner: string,         // Owner of the source repository
 *       repo: string,          // Repository name
 *       repoUrl: string,       // URL to the repository
 *       commitHash: string,    // Commit hash of the source
 *       avatarUrl: string      // URL to the owner's avatar
 *     },
 *     // Additional reference objects...
 *   ]
 * }
 * ```
 *
 * ### Behavior
 * The script:
 * 1. Identifies all `<dt>` elements containing `<span class="transcluded-xref-term">`.
 * 2. Extracts the text content of each `<span>`.
 * 3. Searches for a matching `term` in `allXTrefs.xtrefs`.
 * 4. If a match is found, creates:
 *    - A `<dd>` element with the rendered `content` (markdown to HTML).
 *    - A `<dd>` element with meta information (e.g., owner, repo, commit hash) also rendered from markdown.
 * 5. Inserts these `<dd>` elements after the corresponding `<dt>`.
 *
 * ### DOM Modifications
 * The script modifies the DOM by appending new `<dd>` elements after each matching `<dt>`.
 *
 * @requires {Object} allXTrefs - The external data source containing the references.
 * @requires {Object} md - A markdown renderer with a `render` method (e.g., marked.js or similar).
 *
 * @example
 * // Define dependencies in a <script> tag before this script:
 * window.allXTrefs = {
 *   xtrefs: [
 *     {
 *       term: "example",
 *       content: "This is an **example** definition.",
 *       owner: "user",
 *       repo: "glossary",
 *       repoUrl: "https://github.com/user/glossary",
 *       commitHash: "abc123",
 *       avatarUrl: "https://github.com/user.png"
 *     }
 *   ]
 * };
 * window.md = { render: function(markdown) { return "<p>" + markdown + "</p>"; } };
 *
 * // HTML example:
 * // <dl>
 * //   <dt><span class="transcluded-xref-term">example</span></dt>
 * // </dl>
 * // After script execution:
 * // <dl>
 * //   <dt><span class="transcluded-xref-term">example</span></dt>
 * //   <dd> … table with meta info … </dd>
 * //   <dd><p>This is an <strong>example</strong> definition.</p></dd>
 * // </dl>
 */

function insertTrefs(allXTrefs) { // Pass allXTrefs as a parameter
   function addClassToTranscludedTerms() {
      // Find all spans with class 'transcluded-xref-term'
      const spans = document.querySelectorAll('span.transcluded-xref-term');

      spans.forEach(span => {
         // Find the closest <dt> ancestor
         const dt = span.closest('dt');
         if (dt) {
            // Add class 'transcluded-xref-term' to the <dt>
            dt.classList.add('transcluded-xref-term');

            // Get the next sibling elements until the next <dt> or </dl>
            let sibling = dt.nextElementSibling;
            while (sibling && sibling.tagName !== 'DT' && sibling.tagName !== 'DL') {
               if (sibling.tagName === 'DD') {
                  // Ensure the dd element has the transcluded-xref-term class
                  sibling.classList.add('transcluded-xref-term');
               }
               sibling = sibling.nextElementSibling;
            }
         }
      });
   }

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
         
         // Create meta info <dd> with available data or placeholders
         const ddMetaInfo = document.createElement('dd');
         ddMetaInfo.classList.add('transcluded-xref-term', 'meta-info-content-wrapper', 'collapsed');
         
         // Create definition <dd>
         const ddTrefDef = document.createElement('dd');
         ddTrefDef.classList.add('transcluded-xref-term', 'transcluded-xref-term-embedded');
         
         if (xref) {
            // Use data from xref
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
            ddMetaInfo.innerHTML = md.render(metaInfo);
            
            // Clean up markdown content
            let content = xref.content
               .replace(/\[\[def:[^\]]*?\]\]/g, '') // Remove [[def: ...]] patterns regardless of trailing chars
               .split('\n')
               .map(line => line.replace(/^\s*~\s*/, '')) // Remove leading ~ and spaces
               .join('\n')
               .replace(/\[\[ref:/g, '') // Remove [[ref: ...]]
               .replace(/\]\]/g, '');
               
            ddTrefDef.innerHTML = md.render(content);
         } else {
            // Use placeholder data
            const metaInfo = `
| Property | Value |
| -------- | ----- |
| Owner | Unknown |
| Repo | Unknown |
| Commit hash | not found |
            `;
            ddMetaInfo.innerHTML = md.render(metaInfo);
            ddTrefDef.innerHTML = '<p>This term was not found in the external repository.</p>';
         }
         
         // Insert both elements
         if (dt) {
            const parent = dt.parentNode;
            parent.insertBefore(ddMetaInfo, dt.nextSibling); // Meta info first
            parent.insertBefore(ddTrefDef, ddMetaInfo.nextSibling); // Definition second
         }

         addClassToTranscludedTerms();
      });
   }

   if (allXTrefs && allXTrefs.xtrefs) {
      processTerms(allXTrefs);
   } else {
      console.error('allXTrefs is undefined or missing xtrefs property');
   }
}

document.addEventListener('DOMContentLoaded', () => {
   // Assuming allXTrefs is available globally or fetched elsewhere
   insertTrefs(allXTrefs); // Adjust based on how allXTrefs is provided
});