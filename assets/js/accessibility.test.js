/**
 * @jest-environment jsdom
 */

const fs = require('node:fs');
const path = require('node:path');

function loadScript(relativePath) {
  const source = fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
  // Indirect eval so function declarations attach to the jsdom global.
  // eslint-disable-next-line no-eval
  (0, eval)(source);
}

describe('accessibility helpers and generated UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    globalThis.specConfig = { anchor_symbol: '§' };
    loadScript('utils.js');
  });

  describe('getFocusableElements / handleFocusTrap', () => {
    it('returns enabled interactive controls and skips disabled or hidden ones', () => {
      document.body.innerHTML = `
        <div id="dialog">
          <button type="button" id="first">First</button>
          <button type="button" disabled id="disabled">Disabled</button>
          <a href="#content" id="link">Link</a>
          <button type="button" hidden id="hidden">Hidden</button>
        </div>
      `;

      const focusable = getFocusableElements(document.getElementById('dialog'));
      expect(focusable.map((el) => el.id)).toEqual(['first', 'link']);
    });

    it('cycles focus from the last control back to the first on Tab', () => {
      document.body.innerHTML = `
        <div id="dialog">
          <button type="button" id="first">First</button>
          <button type="button" id="last">Last</button>
        </div>
      `;
      const dialog = document.getElementById('dialog');
      const last = document.getElementById('last');
      last.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      Object.defineProperty(event, 'shiftKey', { value: false });
      handleFocusTrap(event, dialog);

      expect(document.activeElement.id).toBe('first');
    });
  });

  describe('showModal', () => {
    beforeEach(() => {
      loadScript('modal.js');
    });

    it('exposes dialog semantics, labels the close button, and uses the heading as the accessible name', () => {
      showModal('<h2>Token required</h2><p>Enter a token.</p>');

      const dialog = document.querySelector('.spec-up-t-modal');
      const closeButton = document.querySelector('.spec-up-t-modal-close');
      const heading = dialog.querySelector('h2');

      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
      expect(closeButton.getAttribute('aria-label')).toBe('Close dialog');
      expect(closeButton.getAttribute('type')).toBe('button');
    });

    it('closes on Escape and restores focus', () => {
      const opener = document.createElement('button');
      opener.id = 'opener';
      opener.textContent = 'Open';
      document.body.appendChild(opener);
      opener.focus();

      showModal('<h2>Dialog</h2>');
      expect(document.querySelector('.spec-up-t-modal')).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

      expect(document.querySelector('.spec-up-t-modal')).toBeNull();
      expect(document.activeElement).toBe(opener);
    });
  });

  describe('backToTop', () => {
    it('gives the control an accessible name', () => {
      loadScript('backToTop.js');
      backToTop();

      const button = document.getElementById('back-to-top-a1zncgtqfpzsig8');
      expect(button.getAttribute('aria-label')).toBe('Back to top');
      expect(button.getAttribute('href')).toBe('#content');
    });
  });

  describe('addAnchorsToTerms', () => {
    it('labels permalinks with the term name', () => {
      document.body.innerHTML = `
        <dl>
          <dt><span id="term:example">example</span></dt>
        </dl>
      `;
      loadScript('addAnchorsToTerms.js');
      addAnchorsToTerms();

      const anchor = document.querySelector('a.toc-anchor');
      expect(anchor.getAttribute('href')).toBe('#term:example');
      expect(anchor.getAttribute('aria-label')).toBe('Permalink to example');
    });
  });

  describe('collapseDefinitions', () => {
    it('does not reuse a duplicate id and exposes an accessible name', () => {
      document.body.innerHTML = `
        <article id="content">
          <dl class="terms-and-definitions-list">
            <dt><span id="term:alpha">alpha</span></dt>
            <dd>First definition</dd>
            <dt><span id="term:beta">beta</span></dt>
            <dd>Second definition</dd>
          </dl>
        </article>
      `;
      loadScript('definition-button-container-utils.js');
      loadScript('collapse-definitions.js');
      collapseDefinitions();

      const buttons = document.querySelectorAll('.collapse-all-defs-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].id).toBe('');
      expect(buttons[1].id).toBe('');
      expect(buttons[0].getAttribute('aria-label')).toBe('Hide all definitions');
      expect(document.querySelectorAll('#toggleButton')).toHaveLength(0);
    });
  });
});
