function fetchCommitHashes() {

   let tipMap = new WeakMap();

   // Check if allXTrefs is undefined or does not exist
   if (typeof allXTrefs === 'undefined' || allXTrefs === null) {
      console.log('allXTrefs is not defined or does not exist. We will continue without it.');
      return;
   }

   // get all elements with class “x-term-reference”
   const elements = document.querySelectorAll('.x-term-reference');

   elements.forEach((element) => {
      // Get the value of the data-local-href attribute
      const href = element.getAttribute('data-local-href');

      // split href on “:” and create array
      const splitHref = href.split(':');

      // allXTrefs is an object that is available in the global scope
      allXTrefs.xtrefs.forEach((match) => {

         //TODO: remove toLowerCase() or not?
         if (match.externalSpec === splitHref[1] && match.term.toLowerCase() === splitHref[2].toLowerCase()) {

            // If no commit hash is found, display a message and return
            if (!match.commitHash) {
               /**
                * Error message element shown when no cross-reference is found
                * Displayed directly after the term reference element
                */
               const noXTrefFoundMessage = document.createElement('span');
               noXTrefFoundMessage.classList.add('no-xref-found-message');
               noXTrefFoundMessage.innerHTML = 'No xref found.';
               element.parentNode.insertBefore(noXTrefFoundMessage, element.nextSibling);
               return
            };

            // Tooltip functionality
            delegateEvent('pointerover', '.x-term-reference', (e, anchor) => {
               // Get the matching term from your data
               const href = anchor.getAttribute('data-local-href');
               const splitHref = href.split(':');

               // Find matching term in allXTrefs
               const match = allXTrefs.xtrefs.find(m =>
                  m.externalSpec === splitHref[1] &&
                  m.term.toLowerCase() === splitHref[2].toLowerCase());

               if (!match || tipMap.has(anchor)) return;

               // Create tooltip with content
               let tip = {
                  // content: md.render(match.content.replace(/\[\[def: ([^\]]+)\]\]/g, '')),
                  // content: `<dl>` +  md.render(match.content.replace(/\[\[def: ([^\]]+)\]\]/g, '')) + `</dl>`,
                  content: match.content.replace(/\[\[def: ([^\]]+)\]\]/g, ''),
                  allowHTML: true,
                  inlinePositioning: true
               };

               if (tip.content) tipMap.set(anchor, tippy(anchor, tip));
            }, { passive: true });
         }
      });
   });
}

document.addEventListener("DOMContentLoaded", function () {
   fetchCommitHashes();
});
