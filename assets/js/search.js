/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2024-03-29
  Description: In–page search functionality. Styling in /assets/css/search.css
  
  Adds "instant search" or "dynamic search" (results while you type). This feature provides users with immediate feedback by displaying search results or suggestions as they input text, enhancing the user experience by making information discovery faster and more interactive. The search results are highlighted in the text. The page scrolls to the first result.

  SEARCH RESULT STYLES:

  Different styles for the search results can be configured in the "searchHighlightStyle" specConfig object in the specs.json file. The following styles are available:
  
  DIF,ToIP,BTC,KERI,SSI,GLEIF (case insensitive)

*/

function inPageSearch() {
   // Check if the terms and definitions list exists
   // If it doesn't exist, exit the function
   // This prevents errors when the script is run on pages without the terms and definitions list
   // and ensures that the script only runs when necessary
   const termsListElement = document.querySelector(".terms-and-definitions-list");
   const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

   if (dtElements.length === 0) {
      return;
   }


   /*****************/
   /* CONFIGURATION */

   const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");

   // Find the utility row (second row) created by alphabet index
   let utilityRow = terminologySectionUtilityContainer.querySelector('#utility-row .col-12');
   if (!utilityRow) {
       // If it doesn't exist yet, create the structure
       const row = document.createElement("div");
       row.className = "row";
       row.id = "utility-row";
       
       utilityRow = document.createElement("div");
       utilityRow.className = "col-12 d-flex flex-wrap justify-content-between align-items-center gap-2";
       
       row.appendChild(utilityRow);
       terminologySectionUtilityContainer.appendChild(row);
   }

   const matchesStyle = specConfig.searchHighlightStyle || 'ssi';
   const antiNameCollisions = 'search';
   const debounceTime = 600;
   const matches = 'matches';// What text to display after the number of matches
   const searchBarPlaceholder = '🔍';
   const searchableContent = document.querySelector('.terms-and-definitions-list');

   /* END CONFIGURATION */
   /*********************/

   // Styling of search matches. See styles in /assets/css/search.css
   const matchesStyleSelector = {
      dif: 'highlight-matches-DIF-search',
      toip: 'highlight-matches-ToIP-search',
      btc: 'highlight-matches-BTC-search',
      keri: 'highlight-matches-KERI-search',
      ssi: 'highlight-matches-SSI-search',
      gleif: 'highlight-matches-GLEIF-search'
   };


   /* Add DOM elements: search container with search bar, back and forth buttons, and results count */
   const searchContainer = document.createElement("div");
   searchContainer.setAttribute("id", `container-${antiNameCollisions}`);
   searchContainer.classList.add("input-group", "input-group-sm"); // Bootstrap 5.3 input group with small size
   searchContainer.setAttribute("role", "search"); // ARIA role for search container
   searchContainer.style.maxWidth = "300px"; // Limit width to keep it compact

   // Add an input element (for search)
   const searchInput = document.createElement("input");
   searchInput.setAttribute("type", "text");
   searchInput.setAttribute("id", antiNameCollisions);
   searchInput.classList.add("form-control");
   searchInput.setAttribute("placeholder", searchBarPlaceholder);
   searchInput.setAttribute("aria-label", "Search terms"); // ARIA label for screen readers
   searchInput.setAttribute("autocomplete", "off"); // Prevent browser autocomplete
   searchContainer.appendChild(searchInput);

   // Add a container for the navigation buttons and results
   const buttonGroup = document.createElement("div");
   buttonGroup.classList.add("input-group-text", "p-0"); // Bootstrap 5.3 button group styling

   // Add a back button
   const goToPreviousMatchButton = document.createElement("button");
   goToPreviousMatchButton.setAttribute("id", `one-match-backward-${antiNameCollisions}`);
   goToPreviousMatchButton.classList.add("btn", "btn-outline-secondary");
   goToPreviousMatchButton.setAttribute("type", "button"); // Specify button type
   goToPreviousMatchButton.setAttribute("disabled", "true"); // Bootstrap 5 uses "true" instead of "disabled"
   goToPreviousMatchButton.setAttribute("title", "Go to previous match (Left Arrow)");
   goToPreviousMatchButton.setAttribute("aria-label", "Go to previous match");
   goToPreviousMatchButton.innerHTML = '<span aria-hidden="true">▲</span>'; // Hide symbol from screen readers
   buttonGroup.appendChild(goToPreviousMatchButton);

   // Add a forward button
   const goToNextMatchButton = document.createElement("button");
   goToNextMatchButton.setAttribute("id", `one-match-forward-${antiNameCollisions}`);
   goToNextMatchButton.classList.add("btn", "btn-outline-secondary");
   goToNextMatchButton.setAttribute("type", "button");
   goToNextMatchButton.setAttribute("disabled", "true");
   goToNextMatchButton.setAttribute("title", "Go to next match (Right Arrow)");
   goToNextMatchButton.setAttribute("aria-label", "Go to next match");
   goToNextMatchButton.innerHTML = '<span aria-hidden="true">▼</span>';
   buttonGroup.appendChild(goToNextMatchButton);


   // Add number of matches with accessibility
   const totalMatchesSpan = document.createElement("span");
   totalMatchesSpan.setAttribute("id", `total-matches-${antiNameCollisions}`);
   totalMatchesSpan.classList.add("input-group-text"); // Bootstrap 5.3 styling
   totalMatchesSpan.innerHTML = `0 ${matches}`;
   totalMatchesSpan.setAttribute("aria-live", "polite"); // Announce changes to screen readers
   totalMatchesSpan.setAttribute("role", "status"); // Define as status region
   searchContainer.appendChild(totalMatchesSpan);

   // Add the button group to the container
   searchContainer.appendChild(buttonGroup);

   // Add search container to the utility row
   utilityRow.appendChild(searchContainer);

   /* END Add DOM elements */

   // Add an event listener to the input element
   searchInput.addEventListener("input", function () {
      const shouldScrollToFirstMatch = true; // Scroll to first match when user is actively searching
      debouncedSearchAndHighlight(searchInput.value, shouldScrollToFirstMatch);
   });

   // The search will run when the user clicks the collapse button, so the search results are updated when the terms are collapsed or expanded. If the definitions are collapsed, the search results in the definitions will be removed.
   document.addEventListener('click', event => {
      if (event.target.classList.contains('collapse-all-defs-button')) {
         const shouldScrollToFirstMatch = true; // Scroll when updating after collapse/expand
         debouncedSearchAndHighlight(searchInput.value, shouldScrollToFirstMatch);
      }
   });

   const matchesClassName = "highlight-matches-" + antiNameCollisions;
   const matchesStyleSelectorClassName = matchesStyleSelector[matchesStyle.toLowerCase()];


   let totalMatches = 0;
   let activeMatchIndex = -1;

   function scrollToElementCenter(element) {
      // First, bring the element into view
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      // Calculate the necessary adjustment to center the element
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middleDiff = (window.innerHeight - elementRect.height) / 2;
      const scrollTo = absoluteElementTop - middleDiff;

      // Apply the adjustment
      window.scrollTo({ top: scrollTo, behavior: "smooth" });
   }

   function debounce(func, wait) {
      let timeout;
      return function executedFunction() {
         const context = this;
         const args = arguments;
         clearTimeout(timeout);
         timeout = setTimeout(() => func.apply(context, args), wait);
      };
   }

   function removeAllSpans() {
      let spans = document.querySelectorAll('span.' + matchesClassName);
      spans.forEach(span => {
         const childNodes = Array.from(span.childNodes);

         // Removes child elements (there are currently no child element b.t.w.)
         childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
               span.removeChild(node);
            }
         });

         if (span.classList.contains(matchesClassName)) {
            span.outerHTML = span.innerHTML;
         }
      });
   }

   function handleBackAndForthButtonsDisabledState() {
      // Backward button
      if (activeMatchIndex <= 0) {
         document.getElementById("one-match-backward-" + antiNameCollisions).setAttribute("disabled", "disabled");
      } else {
         document.getElementById("one-match-backward-" + antiNameCollisions).removeAttribute("disabled");
      }

      // Forward button
      if (activeMatchIndex >= totalMatches - 1) {
         document.getElementById("one-match-forward-" + antiNameCollisions).setAttribute("disabled", "disabled");
      } else {
         document.getElementById("one-match-forward-" + antiNameCollisions).removeAttribute("disabled");
      }
   }

   function setTotalMatches() {
      totalMatchesSpan.innerHTML = `${totalMatches} ${matches}`;
   }

   // Debounce search input to improve performance. This creates a function that will only execute
   // after the user has stopped typing for the specified debounceTime.
   // The function takes two parameters:
   // - searchString: The text to search for
   // - scrollToFirstMatch: Whether to automatically scroll to the first match after highlighting
   const debouncedSearchAndHighlight = debounce(search, debounceTime);

   goToPreviousMatchButton.addEventListener("click", function () {
      activeMatchIndex--;

      const extraHighlightedMatch = document.querySelector("#" + antiNameCollisions + "-" + activeMatchIndex);
      if (extraHighlightedMatch) {
         scrollToElementCenter(extraHighlightedMatch);
      }
      extraHighlightedMatch.classList.add("active");

      // Works in tandem with “transition” in CSS
      setTimeout(() => {
         extraHighlightedMatch.classList.remove("active");
      }, 3000);

      handleBackAndForthButtonsDisabledState();
   });
   goToNextMatchButton.addEventListener("click", function () {
      activeMatchIndex++;

      const extraHighlightedMatch = document.querySelector("#" + antiNameCollisions + "-" + activeMatchIndex);
      if (extraHighlightedMatch) {
         scrollToElementCenter(extraHighlightedMatch);
      }

      extraHighlightedMatch.classList.add("active");

      // Works in tandem with “transition” in CSS
      setTimeout(() => {
         extraHighlightedMatch.classList.remove("active");
      }, 3000);

      handleBackAndForthButtonsDisabledState();
   });

   // key bindings
   document.addEventListener('keyup', (event) => {
      switch (event.key) {
         case "ArrowRight":
            goToNextMatchButton.click(); // Simulate a click on button
            break;

         case "ArrowLeft":
            goToPreviousMatchButton.click(); // Simulate a click on button
            break;
      }
   });

   // Runs after every search input (debounced)
   /**
    * Performs search and highlighting of matches in the document
    * @param {string} searchString - The text to search for
    * @param {boolean} scrollToFirstMatch - Whether to automatically scroll to the first match after highlighting
    */
   function search(searchString, scrollToFirstMatch) {
      // Start clean
      removeAllSpans();
      totalMatches = 0;
      activeMatchIndex = -1;

      // Remove outer quotes if present
      if (searchString.length >= 2) {
         if (
            (searchString.startsWith('"') && searchString.endsWith('"')) ||
            (searchString.startsWith("'") && searchString.endsWith("'"))
         ) {
            searchString = searchString.substring(1, searchString.length - 1);
         }
      }

      // If the search string is empty, return
      if (searchString === '') {
         setTotalMatches();
         return;
      }

      let uniqueId = 0;

      // Highlight the text that matches the search string (case-insensitive) with a span element
      function markAndCountMatches(node) {
         const nodeText = node.nodeValue;
         const regex = new RegExp(searchString, 'gi');
         let match;
         let lastIndex = 0;
         let fragments = document.createDocumentFragment();

         while ((match = regex.exec(nodeText)) !== null) {
            // Text before match
            fragments.appendChild(document.createTextNode(nodeText.substring(lastIndex, match.index)));

            // Highlighted text
            const highlightSpan = document.createElement('span');
            highlightSpan.textContent = match[0];
            highlightSpan.classList.add(matchesClassName);
            highlightSpan.classList.add(matchesStyleSelectorClassName);
            highlightSpan.setAttribute("id", antiNameCollisions + "-" + uniqueId);
            fragments.appendChild(highlightSpan);

            // uniqueId starts at 0, so totalMatches is the number of uniqueId's + 1
            totalMatches = uniqueId + 1;

            uniqueId++;

            lastIndex = match.index + match[0].length;
         }

         // Remaining text
         fragments.appendChild(document.createTextNode(nodeText.substring(lastIndex)));
         return fragments;
      }

      // Recursive function that searches all nodes in the DOM tree and highlights the text that matches the search string (case-insensitive) with a span element
      function searchNodes(node) {
         /* 
            Helper function to check if any ancestor has the 'hidden' class. Why the 'hidden' class? Because we don't want to highlight text that is hidden, and 'hidden' is the class that is used in the JS that collapses and expands the terms and definitions in the specs. The class is applied to the <dd>'s 
         */
         function hasHiddenAncestor(node) {
            while (node) {
                  if (node?.classList?.contains('hidden')) {
                    return true;
                  }
               node = node.parentNode;
            }
            return false;
         }

         if (node.nodeType === 3 && !hasHiddenAncestor(node)) { // Node.TEXT_NODE
            const fragments = markAndCountMatches(node);
            if (fragments.childNodes.length > 1) {
               // Replace the text node with the fragments if there were matches
               node.parentNode.replaceChild(fragments, node);
            }
         } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
            Array.from(node.childNodes).forEach(searchNodes);
         }
      }

      searchNodes(searchableContent);

      // Update the total matches counter
      setTotalMatches();

      // Disable the back and forth buttons if there are no matches
      handleBackAndForthButtonsDisabledState();

      // Update the active match index
      activeMatchIndex = -1;

      // Scroll to the first match
      // Using querySelector instead of querySelectorAll because we only want to select the first element
      if (scrollToFirstMatch) {
         let firstHighlight = document.querySelector('.' + matchesStyleSelectorClassName);
         if (firstHighlight !== null) {
            scrollToElementCenter(firstHighlight);
      }
   
}
   }
}

document.addEventListener("DOMContentLoaded", function () {
   inPageSearch();
});
