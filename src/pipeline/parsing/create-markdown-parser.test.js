/**
 * Markdown Parser Integration Tests - Functional Style
 *
 * These tests verify that the markdown parser integration works correctly
 * and maintains backward compatibility while providing better testability.
 */

const {
  createMarkdownParser
} = require('./create-markdown-parser.js');

// Tests for integrating the functional parser system with markdown processing
describe('Markdown Parser Integration', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      specs: [{
        external_specs: [{
          external_spec: 'test-spec',
          gh_page: 'https://example.com/spec'
        }]
      }]
    };

    // Initialize global state required by the template tag parser
    global.definitions = [];
    global.references = [];
    global.specGroups = {};
    global.noticeTitles = {};
    global.currentFile = 'test.md';
  });

  // Test: Can the system create a markdown parser using the functional approach?
  test('should create parser with functional system', () => {
    const mockSetToc = jest.fn();
    const parser = createMarkdownParser(mockConfig, mockSetToc);

    expect(parser).toBeDefined();
    expect(parser.render).toBeDefined();
  });

  // Test: Does the refactored system maintain compatibility with existing markdown processing?
  test('should maintain backward compatibility', () => {
    const mockSetToc = jest.fn();
    const parser = createMarkdownParser(mockConfig, mockSetToc);

    // Test basic markdown rendering still works
    const basicMarkdown = '# Test Heading\n\nSome content.';
    const result = parser.render(basicMarkdown);

    expect(result).toContain('<h1');
    expect(result).toContain('Test Heading');
    expect(result).toContain('<p>Some content.</p>');
  });

  // Test: W3C heading hierarchy - no h5 injected by the parser for spec without terms section.
  // Background: The template previously used <h5> for sidebar/offcanvas UI labels. These were
  // changed to <p> elements to prevent W3C "heading skips level" violations when spec content
  // uses h3 headings. This test verifies the parser itself does not introduce unexpected h5.
  test('should not introduce h5 in rendered output when spec has no terms section', () => {
    const mockSetToc = jest.fn();
    const parser = createMarkdownParser(mockConfig, mockSetToc);

    const markdown = '## Section\n\n### Subsection\n\nSome content without terms.';
    const result = parser.render(markdown);

    expect(result).toContain('<h2');
    expect(result).toContain('<h3');
    // The parser must not inject h5 elements - only user-authored ##### headings would produce h5
    expect(result).not.toContain('<h5');
  });

  // Test: W3C heading hierarchy - no h5 injected by the parser for spec with terms section.
  // The terms section uses <dl>/<dt>/<dd> elements, not heading elements. This test verifies
  // that adding the terminology section marker and definitions does not introduce h5.
  test('should not introduce h5 in rendered output when spec has terms section', () => {
    const mockSetToc = jest.fn();
    const parser = createMarkdownParser(mockConfig, mockSetToc);

    // The terminology-section-start marker is injected by the build pipeline before rendering.
    // Simulating it here by including it in the markdown directly.
    const markdown = [
      '## Terms and Definitions',
      '',
      '<div id="terminology-section-start"></div>',
      '',
      '[[def: myterm, myalias]]',
      '~ This is a term definition.',
      ''
    ].join('\n');

    const result = parser.render(markdown);

    // The terms section uses definition list elements, not headings
    expect(result).toContain('<dl');
    expect(result).toContain('<dt');
    // The parser must not inject h5 elements into the terms section
    expect(result).not.toContain('<h5');
  });
});