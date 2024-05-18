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
   /*****************/
   /* CONFIGURATION */

   const domInjectAfter = document.getElementById("logo");// Inject the search bar after this element
   const matchesStyle = specConfig.searchHighlightStyle || 'ssi';
   const searchId = 'search-h7vc6omi2hr2880';
   const debounceTime = 600;
   const matches = 'results';// What text to display after the number of matches
   const searchBarPlaceholder = 'Search';
   const searchableContent = document.querySelector('main article');

   /* END CONFIGURATION */
   /*********************/

   // Styling of search matches. See styles in /assets/css/search.css
   const matchesStyleSelector = {
      dif: 'highlight-matches-DIF-h7vc6omi2hr2880',
      toip: 'highlight-matches-ToIP-h7vc6omi2hr2880',
      btc: 'highlight-matches-BTC-h7vc6omi2hr2880',
      keri: 'highlight-matches-KERI-h7vc6omi2hr2880',
      ssi: 'highlight-matches-SSI-h7vc6omi2hr2880',
      gleif: 'highlight-matches-GLEIF-h7vc6omi2hr2880'
   };


   /* Add DOM elements: search container with search bar, back and forth buttons, and results count */

   // Add an input element (for search)
   let search = document.createElement("input");
   search.setAttribute("type", "text");
   search.setAttribute("id", searchId);
   search.setAttribute("placeholder", searchBarPlaceholder);
   domInjectAfter.after(search);

   // Add a container for the back and forth buttons
   const backAndForthButtonsContainer = document.createElement("div");
   backAndForthButtonsContainer.setAttribute("id", "back-and-forth-buttons-container");

   // Add a back button to the container for the back and forth buttons
   const oneMatchBackward = document.createElement('button');
   oneMatchBackward.setAttribute("id", "one-match-backward");
   oneMatchBackward.setAttribute("disabled", "disabled");
   oneMatchBackward.textContent = "▲";
   backAndForthButtonsContainer.appendChild(oneMatchBackward);

   // Add a forward button to the container for the back and forth buttons
   const oneMatchForward = document.createElement('button');
   oneMatchForward.setAttribute("id", "one-match-forward");
   oneMatchForward.setAttribute("disabled", "disabled");
   oneMatchForward.textContent = "▼";
   backAndForthButtonsContainer.appendChild(oneMatchForward);

   // Add the container for the back and forth buttons
   search.after(backAndForthButtonsContainer);

   // Add number of matches
   const totalMatchesSpan = document.createElement("span");
   totalMatchesSpan.setAttribute("id", "total-matches");
   totalMatchesSpan.innerHTML = `0 ${matches}`;
   backAndForthButtonsContainer.after(totalMatchesSpan);

   // Add an event listener to the input element
   search.addEventListener("input", function () {
      debouncedSearchAndHighlight(search.value);
   });
   /* END Add DOM elements */


   const matchesClassName = "highlight-matches";
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
         document.getElementById("one-match-backward").setAttribute("disabled", "disabled");
      } else {
         document.getElementById("one-match-backward").removeAttribute("disabled");
      }

      // Forward button
      if (activeMatchIndex >= totalMatches - 1) {
         document.getElementById("one-match-forward").setAttribute("disabled", "disabled");
      } else {
         document.getElementById("one-match-forward").removeAttribute("disabled");
      }
   }


   // Debounce search input. Prepare the debounced function outside the event listener
   const debouncedSearchAndHighlight = debounce(searchAndHighlight, debounceTime);




   oneMatchBackward.addEventListener("click", function () {
      activeMatchIndex--;

      const extraHighlightedMatch = document.querySelector("#" + searchId + "-" + activeMatchIndex);
      if (extraHighlightedMatch) {
         scrollToElementCenter(extraHighlightedMatch);
      }
      extraHighlightedMatch.classList.add("active");
      setTimeout(() => {
         extraHighlightedMatch.classList.remove("active");
      }, 600);

      handleBackAndForthButtonsDisabledState();
   });
   oneMatchForward.addEventListener("click", function () {
      activeMatchIndex++;

      const extraHighlightedMatch = document.querySelector("#" + searchId + "-" + activeMatchIndex);
      if (extraHighlightedMatch) {
         scrollToElementCenter(extraHighlightedMatch);
      }

      extraHighlightedMatch.classList.add("active");
      setTimeout(() => {
         extraHighlightedMatch.classList.remove("active");
      }, 1000);

      handleBackAndForthButtonsDisabledState();
   });

   // Runs after every search input (debounced)
   function searchAndHighlight(searchString) {
      // Start clean
      removeAllSpans();

      // If the search string is empty, set total matches to zero and return
      if (searchString === '') {
         totalMatchesSpan.innerHTML = `0 ${matches}`;
         return
      };

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
            highlightSpan.setAttribute("id", searchId + "-" + uniqueId);
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
         if (node.nodeType === 3) { // Node.TEXT_NODE
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

      // Scroll to the first match
      // Using querySelector instead of querySelectorAll because we only want to select the first element
      let firstHighlight = document.querySelector('.' + matchesStyleSelectorClassName);
      if (firstHighlight !== null) {
         scrollToElementCenter(firstHighlight);
      }

      // Update the total matches counter
      totalMatchesSpan.innerHTML = `${totalMatches} ${matches}`;

      // Disable the back and forth buttons if there are no matches
      handleBackAndForthButtonsDisabledState();

      // Update the active match index
      activeMatchIndex = -1;
   }
}

document.addEventListener("DOMContentLoaded", function () {
   inPageSearch();
});
