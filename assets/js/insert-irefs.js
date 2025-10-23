/**
 * @fileoverview Handles the insertion of inline reference copies (irefs) into HTML documentation.
 * This script processes [[iref: term]] placeholders and replaces them with copies of existing
 * term definitions from the terms-and-definitions-list. The copied terms maintain their
 * original structure including all <dd> elements.
 * 
 * The iref functionality allows you to display a term definition inline wherever you need it,
 * without creating a link. It creates a DOM copy of the term's <dt> and <dd> elements.
 */

/**
 * Inserts inline reference copies (irefs) into the document.
 * This function finds all iref placeholders and replaces them with copies of the
 * corresponding term definitions from the terms-and-definitions-list.
 * 
 * @returns {void}
 */
function insertIrefs() {
    /**
     * Processes all iref placeholders found in the document.
     * Collects DOM changes before applying them in batch to improve performance.
     * 
     * @returns {void} - Dispatches an 'irefs-inserted' event when complete
     */
    function processIrefPlaceholders() {
        /**
         * Find all iref placeholder elements in the document
         * @type {NodeListOf<Element>}
         */
        const placeholders = document.querySelectorAll('span.iref-placeholder');

        if (placeholders.length === 0) {
            // No placeholders found, dispatch event and return
            document.dispatchEvent(new CustomEvent('irefs-inserted', {
                detail: { count: 0 }
            }));
            return;
        }

        /**
         * Prepare all DOM changes before applying them
         * Each item contains the placeholder and the fragment to replace it with
         * @type {Array<{placeholder: Element, fragment: DocumentFragment}>}
         */
        const domChanges = [];

        placeholders.forEach((placeholder) => {
            // Extract the term ID from the placeholder's data attribute
            const termId = placeholder.dataset.irefTerm;
            const originalTerm = placeholder.dataset.irefOriginal;

            if (!termId) {
                console.warn('iref placeholder missing data-iref-term attribute', placeholder);
                return;
            }

            // Find the term in the terms-and-definitions-list by its ID
            // The term ID is in the format "term:term-name"
            const termElement = document.querySelector(
                `dl.terms-and-definitions-list dt span#term\\:${termId.replace(/:/g, '\\:')}`
            );

            if (!termElement) {
                console.warn(`iref: term "${originalTerm}" (id: ${termId}) not found in terms-and-definitions-list`);

                // Create a "not found" message element
                const notFoundEl = document.createElement('div');
                notFoundEl.className = 'iref-not-found';
                notFoundEl.innerHTML = `<p class="text-warning"><em>[[iref: ${originalTerm}]] - Term not found in definitions list</em></p>`;

                const fragment = document.createDocumentFragment();
                fragment.appendChild(notFoundEl);

                domChanges.push({
                    placeholder: placeholder,
                    fragment: fragment
                });
                return;
            }

            // Find the <dt> element containing this term
            const dtElement = termElement.closest('dt');
            if (!dtElement) {
                console.warn(`iref: could not find <dt> element for term "${originalTerm}"`);
                return;
            }

            // Create a DocumentFragment to hold the copied elements
            const fragment = document.createDocumentFragment();

            // Create a wrapper div for the iref content
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'iref-content';

            // Create a definition list to hold the copied term
            const dl = document.createElement('dl');
            dl.className = 'iref-definition-list';

            // Clone the <dt> element
            const clonedDt = dtElement.cloneNode(true);
            clonedDt.classList.add('iref-term');
            clonedDt.classList.add('term-reference');


            // Remove the § anchor element from the cloned dt
            const tocAnchor = clonedDt.querySelector('a.toc-anchor');
            if (tocAnchor) {
                tocAnchor.remove();
            }

            // Remove all id attributes from the cloned dt to prevent duplicate IDs
            // This is crucial so the link points to the ORIGINAL, not the clone
            const elementsWithIds = clonedDt.querySelectorAll('[id]');
            elementsWithIds.forEach(element => {
                element.removeAttribute('id');
            });

            // Make the entire dt a link to the original term
            // Find the term ID from the original dt element (not the clone)
            const termIdSpan = dtElement.querySelector('[id^="term:"]');
            if (termIdSpan) {
                const termIdAttr = termIdSpan.getAttribute('id');

                // Wrap the cloned dt content in a link
                const link = document.createElement('a');
                link.href = `#${termIdAttr}`;
                link.className = 'iref-link-to-original';
                link.title = `Go to original definition of ${originalTerm}`;

                // Move all child nodes of clonedDt into the link
                while (clonedDt.firstChild) {
                    link.appendChild(clonedDt.firstChild);
                }

                // Add the link back to the clonedDt
                clonedDt.appendChild(link);
            }

            dl.appendChild(clonedDt);

            // Find and clone all associated <dd> elements
            // Walk through siblings until we hit another <dt> or run out of elements
            let nextElement = dtElement.nextElementSibling;

            while (nextElement && nextElement.tagName.toLowerCase() === 'dd') {
                const clonedDd = nextElement.cloneNode(true);
                clonedDd.classList.add('iref-definition');
                dl.appendChild(clonedDd);
                nextElement = nextElement.nextElementSibling;
            }

            // Add the definition list to the wrapper
            wrapperDiv.appendChild(dl);

            // Add the wrapper to the fragment
            fragment.appendChild(wrapperDiv);

            // Store this change for batch processing
            domChanges.push({
                placeholder: placeholder,
                fragment: fragment
            });
        });

        /**
         * Perform all DOM replacements in a single batch using requestAnimationFrame
         * to optimize browser rendering and prevent layout thrashing
         */
        requestAnimationFrame(() => {
            domChanges.forEach(change => {
                const { placeholder, fragment } = change;

                // Replace the placeholder with the fragment
                placeholder.parentNode.replaceChild(fragment, placeholder);
            });

            /**
             * Dispatch a custom event when all DOM modifications are complete
             * This allows other scripts to know when iref processing is done
             * @fires irefs-inserted
             */
            document.dispatchEvent(new CustomEvent('irefs-inserted', {
                detail: { count: domChanges.length }
            }));

            console.log(`Inserted ${domChanges.length} inline reference(s)`);
        });
    }

    processIrefPlaceholders();
}

/**
 * Initialize the inline references when the DOM is fully loaded.
 * For external terms (trefs), we need to wait until insert-trefs.js has populated them.
 * This event listener ensures that the DOM is ready before attempting to process irefs.
 * @listens DOMContentLoaded
 * @listens trefs-inserted
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if there are any external terms that need to be populated first
    const hasExternalTerms = document.querySelectorAll('span.iref-placeholder').length > 0 &&
        document.querySelectorAll('dl.terms-and-definitions-list dt.term-external').length > 0;

    if (hasExternalTerms) {
        // Wait for trefs to be inserted first (they populate external term definitions)
        document.addEventListener('trefs-inserted', () => {
            insertIrefs();
        }, { once: true }); // Use once: true to automatically remove listener after firing
    } else {
        // No external terms, can insert irefs immediately
        insertIrefs();
    }
});
