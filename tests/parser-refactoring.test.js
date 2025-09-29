/**
 * Parser Integration Tests - Functional Style
 * 
 * These tests verify that the refactored functional parser system works correctly
 * and maintains backward compatibility while providing better testability.
 */

const {
  createTemplateTagParser,
  createSpecParser, 
  createMarkdownParser 
} = require('../src/pipeline/parsing/create-markdown-parser.js');

// Import functions directly from their modules since they're not exported through index
const {
  parseDefinition,
  parseReference
} = require('../src/parsers/template-tag-parser');

const {
  parseSpecReference,
  renderIndividualSpec,
  hasSpec
} = require('../src/parsers/spec-parser');

describe('Functional Parser Integration Tests', () => {
  let mockConfig, mockGlobal, mockSpecCorpus;

  beforeEach(() => {
    mockConfig = {
      specs: [{
        external_specs: [{
          external_spec: 'test-spec',
          gh_page: 'https://example.com/spec'
        }]
      }]
    };

    mockGlobal = {
      definitions: [],
      references: [],
      specGroups: {},
      noticeTitles: {},
      currentFile: 'test.md'
    };

    mockSpecCorpus = {
      'RFC-2119': {
        title: 'Key words for use in RFCs',
        href: 'https://tools.ietf.org/html/rfc2119'
      }
    };

    // Set up global state
    global.definitions = mockGlobal.definitions;
    global.references = mockGlobal.references;
    global.specGroups = mockGlobal.specGroups;
    global.noticeTitles = mockGlobal.noticeTitles;
  });

  describe('Template Tag Parsing Functions', () => {
    test('should parse definition correctly', () => {
      const mockToken = {
        info: { args: ['test-term', 'alias'] }
      };

      const result = parseDefinition(mockGlobal, mockToken, 'Test Term', 'test.md');

      expect(result).toContain('id="term:test-term"');
      expect(result).toContain('id="term:alias"');
      expect(mockGlobal.definitions).toHaveLength(1);
      expect(mockGlobal.definitions[0]).toEqual({
        term: 'test-term',
        alias: 'alias',
        source: 'test.md'
      });
    });

    test('should parse reference correctly', () => {
      const result = parseReference(mockGlobal, 'test-term');

      expect(result).toContain('href="#term:test-term"');
      expect(result).toContain('class="term-reference"');
      expect(mockGlobal.references).toContain('test-term');
    });

    test('createTemplateTagParser should return a working function', () => {
      const templateTagParser = createTemplateTagParser(mockConfig, mockGlobal);
      
      expect(typeof templateTagParser).toBe('function');
      
      const mockToken = {
        info: { args: ['test-term'] }
      };
      
      const result = templateTagParser(mockToken, 'def', 'Test Term');
      expect(result).toContain('id="term:test-term"');
    });
  });

  describe('Specification Parsing Functions', () => {
    test('should parse spec reference correctly', () => {
      const mockToken = { info: {} };

      parseSpecReference(mockSpecCorpus, mockGlobal, mockToken, 'spec', 'RFC-2119');

      expect(mockGlobal.specGroups.spec).toBeDefined();
      expect(mockGlobal.specGroups.spec['RFC-2119']).toBeDefined();
      expect(mockToken.info.spec).toBeDefined();
    });

    test('should render individual spec correctly', () => {
      const mockToken = {
        info: {
          spec: {
            _name: 'RFC-2119',
            title: 'Key words for use in RFCs'
          }
        }
      };

      const result = renderIndividualSpec(mockToken);

      expect(result).toContain('class="spec-reference"');
      expect(result).toContain('href="#ref:RFC-2119"');
      expect(result).toContain('RFC-2119');
    });

    test('should check if spec exists', () => {
      expect(hasSpec(mockSpecCorpus, 'RFC-2119')).toBe(true);
      expect(hasSpec(mockSpecCorpus, 'nonexistent-spec')).toBe(false);
    });

    test('createSpecParser should return a working parser object', () => {
      const specParser = createSpecParser(mockSpecCorpus, mockGlobal);
      
      expect(typeof specParser.parseSpecReference).toBe('function');
      expect(typeof specParser.renderSpecReference).toBe('function');
      expect(typeof specParser.hasSpec).toBe('function');
      
      expect(specParser.hasSpec('RFC-2119')).toBe(true);
    });
  });

  describe('Markdown Parser Integration', () => {
    test('should create parser with functional system', () => {
      const mockSetToc = jest.fn();
      const parser = createMarkdownParser(mockConfig, mockSetToc);

      expect(parser).toBeDefined();
      expect(parser.render).toBeDefined();
    });

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
  });

  describe('Functional Benefits', () => {
    test('functions should be pure and testable', () => {
      // Test that pure functions work independently
      const testGlobal = { definitions: [], references: [] };
      const testToken = { info: { args: ['pure-test'] } };
      
      const result = parseDefinition(testGlobal, testToken, 'Pure Test', 'test.md');
      
      expect(result).toContain('id="term:pure-test"');
      expect(testGlobal.definitions).toHaveLength(1);
      expect(mockGlobal.definitions).toHaveLength(0); // Original should be unchanged
    });

    test('functions should compose well', () => {
      // Test that functions can be used in different combinations
      const templateTagParser = createTemplateTagParser(mockConfig, mockGlobal);
      const specParser = createSpecParser(mockSpecCorpus, mockGlobal);
      
      // Both should be independent functions
      expect(typeof templateTagParser).toBe('function');
      expect(typeof specParser).toBe('object');
      expect(typeof specParser.parseSpecReference).toBe('function');
    });

    test('individual functions should be importable', () => {
      // Test that individual functions can be imported and used
      expect(typeof parseDefinition).toBe('function');
      expect(typeof parseReference).toBe('function');
      expect(typeof hasSpec).toBe('function');
    });
  });
});