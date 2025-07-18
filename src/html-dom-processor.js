'use strict';

const { JSDOM } = require('jsdom');

/**
 * Sorts definition terms in HTML alphabetically (case-insensitive)
 * 
 * @param {string} html - The HTML content to process
 * @returns {string} - The HTML with sorted definition terms
 */
function sortDefinitionTermsInHtml(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the terms and definitions list
  const dlElement = document.querySelector('.terms-and-definitions-list');
  if (!dlElement) return html; // If not found, return the original HTML

  // Collect all dt/dd pairs
  const pairs = [];
  let currentDt = null;
  let currentDds = [];

  // Process each child of the dl element
  Array.from(dlElement.children).forEach(child => {
    if (child.tagName === 'DT') {
      // If we already have a dt, save the current pair
      if (currentDt) {
        pairs.push({
          dt: currentDt,
          dds: [...currentDds],
          text: currentDt.textContent.trim().toLowerCase() // Use lowercase for sorting
        });
        currentDds = []; // Reset dds for the next dt
      }
      currentDt = child;
    } else if (child.tagName === 'DD' && currentDt) {
      currentDds.push(child);
    }
  });

  // Add the last pair if exists
  if (currentDt) {
    pairs.push({
      dt: currentDt,
      dds: [...currentDds],
      text: currentDt.textContent.trim().toLowerCase()
    });
  }

  // Sort pairs case-insensitively
  pairs.sort((a, b) => a.text.localeCompare(b.text));

  // Clear the dl element
  while (dlElement.firstChild) {
    dlElement.removeChild(dlElement.firstChild);
  }

  // Re-append elements in sorted order
  pairs.forEach(pair => {
    dlElement.appendChild(pair.dt);
    pair.dds.forEach(dd => {
      dlElement.appendChild(dd);
    });
  });

  // Return the modified HTML
  return dom.serialize();
}

/**
 * Fixes broken definition list (dl) structures in the HTML output.
 * Specifically, it addresses the issue where transcluded terms (tref tags) break
 * out of the definition list, creating separate lists instead of a continuous one.
 * 
 * The strategy:
 * 1. Find all definition lists (dl elements) in the document
 * 2. Use the dl with class 'terms-and-definitions-list' as the main/target list
 * 3. Process each subsequent node after the this main dl:
 *    - If another dl is found, merge all its children into the main dl
 *    - If a standalone dt is found, move it into the main dl
 *    - Remove any empty paragraphs that might be breaking the list continuity
 * 
 * This ensures all terms appear in one continuous definition list,
 * regardless of how they were originally rendered in the markdown.
 * 
 * @param {string} html - The HTML content to fix
 * @returns {string} - The fixed HTML content with merged definition lists
 */
function fixDefinitionListStructure(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find all dl elements first
  const allDls = Array.from(document.querySelectorAll('dl'));

  // Then filter to find the one with the terms-and-definitions-list class
  const dlElements = allDls.filter(dl => {
    return dl?.classList?.contains('terms-and-definitions-list');
  });

  // Find any transcluded term dt elements anywhere in the document
  const transcludedTerms = document.querySelectorAll('dt.transcluded-xref-term');

  let mainDl = null;

  // If we have an existing dl with the terms-and-definitions-list class, use it
  if (dlElements.length > 0) {
    mainDl = dlElements[0]; // Use the first one
  }
  // If we have transcluded terms but no main dl, we need to create one
  else if (transcludedTerms.length > 0) {
    // Create a new dl element with the right class
    mainDl = document.createElement('dl');
    mainDl.className = 'terms-and-definitions-list';

    // Look for the marker
    const marker = document.getElementById('terminology-section-start');

    if (marker) {
      // Insert the new dl right after the marker
      if (marker.nextSibling) {
        marker.parentNode.insertBefore(mainDl, marker.nextSibling);
      } else {
        marker.parentNode.appendChild(mainDl);
      }
    } else {
      // Fallback to the original approach if marker isn't found
      const firstTerm = transcludedTerms[0];
      const insertPoint = firstTerm.parentNode;
      insertPoint.parentNode.insertBefore(mainDl, insertPoint);
    }
  }

  // Safety check - if we still don't have a mainDl, exit early to avoid null reference errors
  if (!mainDl) {
    return html; // Return the original HTML without modifications
  }

  // Now process all transcluded terms and other dt elements
  transcludedTerms.forEach(dt => {
    // Check if this dt is not already inside our main dl
    if (dt.parentElement !== mainDl) {
      // Move it into the main dl
      const dtClone = dt.cloneNode(true);
      mainDl.appendChild(dtClone);
      dt.parentNode.removeChild(dt);
    }
  });

  // First special case - handle transcluded-xref-term dt that comes BEFORE the main dl
  const transcludedTermsBeforeMainDl = document.querySelectorAll('dt.transcluded-xref-term');

  // Special handling for transcluded terms that appear BEFORE the main dl
  transcludedTermsBeforeMainDl.forEach(dt => {
    // Check if this dt is not already inside our main list
    if (dt.parentElement !== mainDl) {
      // This is a dt outside our main list - move it into the main dl
      const dtClone = dt.cloneNode(true);
      mainDl.appendChild(dtClone);
      dt.parentNode.removeChild(dt);
    }
  });

  // Remove any empty dt elements that may exist
  const emptyDts = mainDl.querySelectorAll('dt:empty');
  emptyDts.forEach(emptyDt => {
    emptyDt.parentNode.removeChild(emptyDt);
  });

  // Process all subsequent content after the main dl
  let currentNode = mainDl.nextSibling;

  // Process all subsequent content
  while (currentNode) {
    // Save the next node before potentially modifying the DOM
    const nextNode = currentNode.nextSibling;

    // Handle different node types
    if (currentNode.nodeType === 1) { // 1 = Element node
      if (currentNode.tagName === 'DL') {
        // Check if this is a reference list (contains dt elements with id="ref:...")
        const hasRefIds = currentNode.innerHTML.includes('id="ref:') || 
                          currentNode.classList.contains('reference-list');
        
        if (!hasRefIds) {
          // Only move non-reference definition lists - move all its children to the main dl
          while (currentNode.firstChild) {
            mainDl.appendChild(currentNode.firstChild);
          }
          // Remove the now-empty dl element
          currentNode.parentNode.removeChild(currentNode);
        }
        // If it's a reference list, leave it alone
      }
      else if (currentNode.tagName === 'DT') {
        // Check if this dt has a ref: id (spec reference)
        const hasRefId = currentNode.id?.startsWith('ref:');
        
        if (!hasRefId) {
          // Only move non-reference standalone dt elements into the main dl
          const dtClone = currentNode.cloneNode(true);
          mainDl.appendChild(dtClone);
          currentNode.parentNode.removeChild(currentNode);
        }
        // If it's a spec reference dt, leave it alone
      }
      else if (currentNode.tagName === 'P' &&
        (!currentNode.textContent || currentNode.textContent.trim() === '')) {
        // Remove empty paragraphs - these break the list structure
        currentNode.parentNode.removeChild(currentNode);
      }
    }

    // Move to the next node we saved earlier
    currentNode = nextNode;
  }

  // Return the fixed HTML
  return dom.serialize();
}

module.exports = {
  sortDefinitionTermsInHtml,
  fixDefinitionListStructure
};
