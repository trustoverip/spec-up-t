/**
 * @jest-environment jsdom
 */

/**
 * insert-trefs.js is a browser script that uses function declarations without
 * exports. We load it via vm.runInThisContext so the declarations land on
 * the global / window object, exactly as they would in a browser.
 */

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

// Read the source once; it is re-executed per test via indirect eval.
const subjectCode = fs.readFileSync(
  path.resolve(__dirname, 'insert-trefs.js'),
  'utf8'
);

// Polyfill requestAnimationFrame with a plain setTimeout so we can flush it
// with a simple Promise tick in tests.
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

/**
 * Flush the requestAnimationFrame queue (runs pending 0 ms timers).
 * @returns {Promise<void>}
 */
function waitForRaf() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Evaluate the source in the jsdom global scope using an indirect eval call.
 * Indirect eval (calling eval as a value, not as a direct call) runs the code
 * in the global scope instead of the local function scope, so top-level
 * function declarations become properties of window/global – exactly as they
 * would be when the browser loads the script.
 *
 * vm.runInThisContext would run in Node's native context where document/window
 * are not available; indirect eval stays inside the jsdom sandbox.
 */
function loadSubject() {
  // eslint-disable-next-line no-eval
  (0, eval)(subjectCode);
}

describe('insert-trefs.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Use html:true so that <dd> blocks in xref.content survive md.render()
    // unchanged and can be queried with querySelectorAll('dd').
    globalThis.md = new MarkdownIt({ html: true });
    loadSubject();
  });

  // ─── insertTrefs() ─────────────────────────────────────────────────────────

  describe('insertTrefs()', () => {
    it('inserts a meta-info wrapper and an embedded definition when the xref is found', async () => {
      document.body.innerHTML = `
        <dl class="terms-and-definitions-list">
          <dt><span class="term-external" data-original-term="test-term">test-term</span></dt>
        </dl>
      `;

      globalThis.insertTrefs({
        xtrefs: [
          {
            term: 'test-term',
            ghPageUrl: 'https://example.github.io/test-spec/',
            owner: 'example-owner',
            repo: 'test-spec',
            repoUrl: 'https://github.com/example/test-spec',
            avatarUrl: 'https://example.com/avatar.png',
            commitHash: 'abc123',
            content: '<dd><p>Test definition content.</p></dd>'
          }
        ]
      });
      await waitForRaf();

      const metaInfo = document.querySelector('dd.term-external.meta-info-content-wrapper');
      const definition = document.querySelector('dd.term-external-embedded');

      expect(metaInfo).not.toBeNull();
      expect(definition).not.toBeNull();
      expect(definition.textContent).toContain('Test definition content.');
    });

    it('inserts a meta-info wrapper and a not-found message when no matching xref exists', async () => {
      document.body.innerHTML = `
        <dl class="terms-and-definitions-list">
          <dt><span class="term-external" data-original-term="missing-term">missing-term</span></dt>
        </dl>
      `;

      globalThis.insertTrefs({ xtrefs: [] });
      await waitForRaf();

      const metaInfo = document.querySelector('dd.term-external.meta-info-content-wrapper');
      const notFound = document.querySelector('dd:not(.meta-info-content-wrapper)');

      expect(metaInfo).not.toBeNull();
      expect(notFound).not.toBeNull();
      expect(notFound.textContent).toContain('This term was not found in the external repository.');
    });

    it('skips a term whose dt is already followed by a meta-info wrapper', async () => {
      document.body.innerHTML = `
        <dl class="terms-and-definitions-list">
          <dt><span class="term-external" data-original-term="test-term">test-term</span></dt>
          <dd class="term-external meta-info-content-wrapper">already processed</dd>
        </dl>
      `;

      globalThis.insertTrefs({ xtrefs: [{ term: 'test-term', content: '<dd>New definition</dd>' }] });
      await waitForRaf();

      // Should remain exactly 1 – no second wrapper was inserted.
      expect(document.querySelectorAll('dd.meta-info-content-wrapper')).toHaveLength(1);
    });

    it('dispatches a trefs-inserted event after the RAF callback fires', async () => {
      document.body.innerHTML = `
        <dl class="terms-and-definitions-list">
          <dt><span class="term-external" data-original-term="term-a">term-a</span></dt>
        </dl>
      `;

      const listener = jest.fn();
      document.addEventListener('trefs-inserted', listener);

      globalThis.insertTrefs({ xtrefs: [] });
      await waitForRaf();

      expect(listener).toHaveBeenCalledTimes(1);
      document.removeEventListener('trefs-inserted', listener);
    });

    it('includes the count of processed terms in the trefs-inserted event detail', async () => {
      document.body.innerHTML = `
        <dl class="terms-and-definitions-list">
          <dt><span class="term-external" data-original-term="term-a">term-a</span></dt>
          <dt><span class="term-external" data-original-term="term-b">term-b</span></dt>
        </dl>
      `;

      let detail;
      document.addEventListener('trefs-inserted', (e) => { detail = e.detail; }, { once: true });

      globalThis.insertTrefs({ xtrefs: [] });
      await waitForRaf();

      expect(detail.count).toBe(2);
    });
  });

  // ─── initializeOnTrefsInserted() ───────────────────────────────────────────

  describe('initializeOnTrefsInserted()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('calls the callback when the trefs-inserted event fires', () => {
      const callback = jest.fn();
      globalThis.initializeOnTrefsInserted(callback);
      document.dispatchEvent(new CustomEvent('trefs-inserted', { detail: { count: 1 } }));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not invoke the callback more than once on repeated events', () => {
      const callback = jest.fn();
      globalThis.initializeOnTrefsInserted(callback);
      document.dispatchEvent(new CustomEvent('trefs-inserted', { detail: { count: 1 } }));
      document.dispatchEvent(new CustomEvent('trefs-inserted', { detail: { count: 1 } }));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('falls back and calls the callback after 1 second if the event never fires', () => {
      const callback = jest.fn();
      globalThis.initializeOnTrefsInserted(callback);

      jest.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not trigger the fallback if the event already fired', () => {
      const callback = jest.fn();
      globalThis.initializeOnTrefsInserted(callback);
      document.dispatchEvent(new CustomEvent('trefs-inserted', { detail: { count: 1 } }));

      jest.advanceTimersByTime(1000);

      // Still only the single call from the event – fallback must not add a second.
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
