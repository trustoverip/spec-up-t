/**
 * @jest-environment jsdom
 */
/**
 * @fileoverview Unit tests for highlight-heading-plus-sibling-nodes.js
 * Covers all exported functions to satisfy SonarQube coverage requirements.
 */
const {
  highlightHeadingSection,
  getHeadingLevel,
  collectHeadingSiblings,
  wrapNodesWithHighlight,
  removeExistingHighlights,
  initializeAnchorHighlighting
} = require('./highlight-heading-plus-sibling-nodes');

describe('highlight-heading-plus-sibling-nodes', () => {
  let container;

  beforeEach(() => {
    // Set up a DOM structure for testing
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.innerHTML = `
      <h2 id="h2-1">Heading 2</h2>
      <p id="p1">Paragraph 1</p>
      <ul id="ul1"><li>Item</li></ul>
      <h3 id="h3-1">Heading 3</h3>
      <p id="p2">Paragraph 2</p>
      <h2 id="h2-2">Heading 2b</h2>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getHeadingLevel', () => {
    it('returns correct level for h2-h6', () => {
      expect(getHeadingLevel(document.getElementById('h2-1'))).toBe(2);
      expect(getHeadingLevel(document.getElementById('h3-1'))).toBe(3);
    });
    it('returns null for h1 or non-heading', () => {
      const h1 = document.createElement('h1');
      expect(getHeadingLevel(h1)).toBeNull();
      expect(getHeadingLevel(document.getElementById('p1'))).toBeNull();
    });
  });

  describe('collectHeadingSiblings', () => {
    it('collects heading and following siblings until next heading of same or higher level', () => {
      const h2 = document.getElementById('h2-1');
      const siblings = collectHeadingSiblings(h2, 2);
      expect(siblings.map(n => n.id)).toEqual(['h2-1', 'p1', 'ul1', 'h3-1', 'p2']);
    });
    it('stops at next heading of same or higher level', () => {
      const h3 = document.getElementById('h3-1');
      const siblings = collectHeadingSiblings(h3, 3);
      expect(siblings.map(n => n.id)).toEqual(['h3-1', 'p2']);
    });
  });

  describe('wrapNodesWithHighlight', () => {
    it('wraps nodes in a div.highlight2', () => {
      const nodes = [document.getElementById('h2-1'), document.getElementById('p1')];
      const wrapper = wrapNodesWithHighlight(nodes);
      expect(wrapper).not.toBeNull();
      expect(wrapper.className).toBe('highlight2');
      expect(wrapper.contains(nodes[0])).toBe(true);
      expect(wrapper.contains(nodes[1])).toBe(true);
    });
    it('returns null if nodes is empty', () => {
      expect(wrapNodesWithHighlight([])).toBeNull();
    });
  });

  describe('removeExistingHighlights', () => {
    it('removes all .highlight2 wrappers and restores children', () => {
      const nodes = [document.getElementById('h2-1'), document.getElementById('p1')];
      wrapNodesWithHighlight(nodes);
      expect(document.querySelectorAll('.highlight2').length).toBe(1);
      const removed = removeExistingHighlights();
      expect(removed).toBe(1);
      expect(document.querySelectorAll('.highlight2').length).toBe(0);
      // Children are restored to parent
      expect(container.contains(nodes[0])).toBe(true);
      expect(container.contains(nodes[1])).toBe(true);
    });
  });

  describe('highlightHeadingSection', () => {
    it('highlights section for valid anchor', () => {
      expect(highlightHeadingSection('#h2-1')).toBe(true);
      const highlight = document.querySelector('.highlight2');
      expect(highlight).not.toBeNull();
      expect(highlight.contains(document.getElementById('h2-1'))).toBe(true);
    });
    it('returns false for invalid anchor', () => {
      expect(highlightHeadingSection('#does-not-exist')).toBe(false);
      expect(highlightHeadingSection('not-a-hash')).toBe(false);
      expect(highlightHeadingSection('#')).toBe(false);
    });
    it('returns false for non-heading element', () => {
      expect(highlightHeadingSection('#p1')).toBe(false);
    });
  });

  describe('initializeAnchorHighlighting', () => {
    it('sets up event listeners and highlights on hash', () => {
      window.location.hash = '#h2-1';
      // Remove highlights if any
      removeExistingHighlights();
      initializeAnchorHighlighting();
      // Simulate hashchange
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(document.querySelector('.highlight2')).not.toBeNull();
    });
  });
});
