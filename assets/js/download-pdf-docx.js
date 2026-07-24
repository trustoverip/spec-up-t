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

  // PDF icon with recognizable red color
  const pdfIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="me-1">\
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#e74c3c"/>\
      <path d="M14 2v6h6" fill="none" stroke="#c0392b" stroke-width="1.5"/>\
      <text x="12" y="17" font-size="6" font-weight="bold" text-anchor="middle" fill="white">PDF</text>\
    </svg>';

  // DOCX/Word icon with recognizable blue color
  const docxIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="me-1">\
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#2b579a"/>\
      <path d="M14 2v6h6" fill="none" stroke="#1e4378" stroke-width="1.5"/>\
      <text x="12" y="17" font-size="5" font-weight="bold" text-anchor="middle" fill="white">DOCX</text>\
    </svg>';

  function createButton(href, title, cls, icon, label) {
    const a = document.createElement("a");
    a.classList.add(cls, "btn", "btn-sm");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.href = href;
    a.title = title;
    a.setAttribute("aria-label", title);
    a.innerHTML = icon + '<span class="button-label visually-hidden">' + label + '</span>';
    return a;
  }

  async function addButtons() {
    const container = qs(".service-menu");
    if (!container) return;

    const items = [
      { href: "./index.pdf", title: "Download this page as a PDF", cls: "button-pdf-download", icon: pdfIconSvg, label: "PDF" },
      { href: "./index.docx", title: "Download this page as a DOCX", cls: "button-docx-download", icon: docxIconSvg, label: "DOCX" },
    ];

    const exists = await Promise.all(items.map((i) => checkExists(i.href)));

    // Insert at the start keeping order as defined in items
    let anchor = container.firstElementChild;
    items.forEach((item, idx) => {
      if (!exists[idx]) return;
      if (buttonExists(item.cls)) return;
      const btn = createButton(item.href, item.title, item.cls, item.icon, item.label);
      container.insertBefore(btn, anchor);
      anchor = btn;
    });
  }

  // Expose minimal global for backward compatibility shims
  globalThis.SpecUpDownloads = { addButtons };

  // Auto-run on DOM ready (safe if called multiple times)
  document.addEventListener("DOMContentLoaded", addButtons, { once: false });

  // Signal readiness for shims that want to call in response
  try {
    document.dispatchEvent(new CustomEvent("specup-downloads-ready"));
  } catch (_) {
    // no-op: older browsers without CustomEvent constructor support
  }
})();
