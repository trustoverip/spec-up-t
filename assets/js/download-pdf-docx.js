/**
 * Adds download buttons for PDF and DOCX (when files exist next to the page).
 * Buttons are inserted at the start of .service-menu, left-to-right as: PDF, DOCX.
 * Idempotent: safe to call multiple times.
 */
(function () {
  "use strict";

  /** Small helpers */
  const qs = (sel) => document.querySelector(sel);
  const buttonExists = (cls) => !!qs(`.service-menu .${cls}`);
  const checkExists = (url) =>
    fetch(url, { method: "HEAD" })
      .then((r) => r.ok)
      .catch(() => false);

  const fileIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" class="me-1" viewBox="0 0 16 16">\
      <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4zm0 1h5v4h4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm7 4h-1V2l3 3h-2z"/>\
    </svg>';

  function createButton(href, title, cls) {
    const a = document.createElement("a");
    a.classList.add(cls, "btn", "d-block", "btn-sm", "btn-outline-secondary");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.href = href;
    a.title = title;
    a.setAttribute("aria-label", title);
    a.innerHTML = fileIconSvg;
    return a;
  }

  async function addButtons() {
    const container = qs(".service-menu");
    if (!container) return;

    const items = [
      { href: "./index.pdf", title: "Download this page as a PDF", cls: "button-pdf-download" },
      { href: "./index.docx", title: "Download this page as a DOCX", cls: "button-docx-download" },
    ];

    const exists = await Promise.all(items.map((i) => checkExists(i.href)));

    // Insert at the start keeping order as defined in items
    let anchor = container.firstElementChild;
    items.forEach((item, idx) => {
      if (!exists[idx]) return;
      if (buttonExists(item.cls)) return;
      const btn = createButton(item.href, item.title, item.cls);
      container.insertBefore(btn, anchor);
      anchor = btn;
    });
  }

  // Expose minimal global for backward compatibility shims
  window.SpecUpDownloads = { addButtons };

  // Auto-run on DOM ready (safe if called multiple times)
  document.addEventListener("DOMContentLoaded", addButtons, { once: false });

  // Signal readiness for shims that want to call in response
  try {
    document.dispatchEvent(new CustomEvent("specup-downloads-ready"));
  } catch (_) {
    // no-op: older browsers without CustomEvent constructor support
  }
})();
