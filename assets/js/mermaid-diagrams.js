(function () {
  'use strict';

  /* Mermaid Diagrams */

  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral'
  });

  function labelMermaidDiagrams() {
    document.querySelectorAll('.mermaid svg, svg[id^="mermaid-"]').forEach((svg) => {
      svg.setAttribute('role', 'img');
      svg.setAttribute('focusable', 'false');
      if (!svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby')) {
        svg.setAttribute('aria-label', 'Diagram');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    labelMermaidDiagrams();
    globalThis.setTimeout(labelMermaidDiagrams, 1000);
  });

})();
