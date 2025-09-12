(function () {
  'use strict';

  /* Tooltips */
  let tipMap = new WeakMap();

  delegateEvent('pointerover', '.term-reference, .spec-reference', (e, anchor) => {
    const id = anchor.getAttribute('data-local-href') || anchor.getAttribute('href') || '';
    let term = document.getElementById(id.replace('#', ''));

    // Handle both DOM-based terms (tref, local def) and xref terms from allXTrefs data
    let tip = {
      allowHTML: true,
      inlinePositioning: true
    };

    // Check for early return to avoid duplicate tooltips
    if (tipMap.has(anchor)) return;

    if (term) {
      // Traditional DOM-based tooltip (for tref and local definitions)
      let container = term.closest('dt, td:first-child');
      if (!container) return;

      switch (container.tagName) {
        case 'DT':
          tip.content = container.nextElementSibling.textContent;
          break;
        case 'TD':
          let table = container.closest('table');
          let tds = Array.from(container.closest('tr').children);
          tds.shift();
          if (table) {
            let headings = Array.from(table.querySelectorAll('thead th'));
            headings.shift();
            if (headings.length) {
              tip.content = `
              <header>${container.textContent}</header>
              <table>
                ${headings.map((th, i) => {
                return `<tr><td>${th.textContent}:</td><td>${tds[i] ? tds[i].textContent : ''}</td></tr>`
              }).join('')}
              </table>`;
            }
          }
          break;
      }
    } else {
      // Handle xref terms from allXTrefs data (when no DOM element found)
      const href = anchor.getAttribute('data-local-href') || '';
      const match = href.match(/#term:([^:]+):(.+)/);
      if (match) {
        const [, externalSpec, termName] = match;

        if (typeof allXTrefs !== 'undefined' && allXTrefs.xtrefs && allXTrefs.xtrefs.length > 0) {
          // Look for term with case-insensitive matching to handle case inconsistencies
          const foundTerm = allXTrefs.xtrefs.find(xtref =>
            xtref.externalSpec === externalSpec &&
            xtref.term.toLowerCase() === termName.toLowerCase()
          );

          if (foundTerm && foundTerm.content) {
            // Strip HTML tags for clean text tooltip
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = foundTerm.content;
            tip.content = tempDiv.textContent || tempDiv.innerText || '';
          }
        }
      }
    }

    if (tip.content) {
      tipMap.set(anchor, tippy(anchor, tip))
    };
  }, { passive: true });

})();