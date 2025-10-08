/**
 * Template Tag Parser Tests - Functional Style
 *
 * These tests verify that the template tag parsing functions work correctly
 * and maintain backward compatibility while providing better testability.
 */

const {
  createTemplateTagParser
} = require('../pipeline/parsing/create-markdown-parser.js');

// Import functions directly from their modules since they're not exported through index
const {
  parseDef,
  parseRef
} = require('./template-tag-parser');

// Tests for verifying the template tag parsing functions work correctly
describe('Template Tag Parsing Functions', () => {
  let mockConfig, mockGlobal;

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

    // Set up global state
    global.definitions = mockGlobal.definitions;
    global.references = mockGlobal.references;
    global.specGroups = mockGlobal.specGroups;
    global.noticeTitles = mockGlobal.noticeTitles;
  });

  // Test: Can the system parse definition markup into proper HTML?
  test('should parse definition correctly', () => {
    const mockToken = {
      info: { args: ['test-term', 'alias'] }
    };

    const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

    expect(result).toContain('id="term:test-term"');
    expect(result).toContain('id="term:alias"');
    expect(mockGlobal.definitions).toHaveLength(1);
    expect(mockGlobal.definitions[0]).toEqual({
      term: 'test-term',
      alias: 'alias',
      source: 'test.md'
    });
  });

  // Test: Does the parser handle the case when alias1 equals the term?
  // Issue #194: When alias1 is the same as the term, the term should still appear in parentheses
  test('should include term in parentheses even when alias1 equals term', () => {
    const mockToken = {
      info: { args: ['action', 'action', 'actions', 'act', 'acts'] }
    };

    const result = parseDef(mockGlobal, mockToken, 'Action', 'test.md');

    // Should show: action (actions, act, acts, action)
    // The term "action" should appear both as primary and in parenthetical list
    expect(result).toContain('action');
    expect(result).toContain('actions');
    expect(result).toContain('act');
    expect(result).toContain('acts');
    
    // The original term should be in the parenthetical content with special styling
    expect(result).toContain('term-local-original-term');
    expect(result).toContain('term-local-parenthetical-terms');
    
    // Verify all term IDs are present
    expect(result).toContain('id="term:action"');
    expect(result).toContain('id="term:actions"');
    expect(result).toContain('id="term:act"');
    expect(result).toContain('id="term:acts"');
  });

  // Test: Can the system parse reference markup into proper links?
  test('should parse reference correctly', () => {
    const result = parseRef(mockGlobal, 'test-term');

    expect(result).toContain('href="#term:test-term"');
    expect(result).toContain('class="term-reference"');
    expect(mockGlobal.references).toContain('test-term');
  });

  // Test: Does the parser factory create functional parsers?
  test('createTemplateTagParser should return a working function', () => {
    const templateTagParser = createTemplateTagParser(mockConfig, mockGlobal);

    expect(typeof templateTagParser).toBe('function');

    const mockToken = {
      info: { args: ['test-term'] }
    };

    const result = templateTagParser(mockToken, 'def', 'Test Term');
    expect(result).toContain('id="term:test-term"');
  });

  // Test: Are the functions pure and independently testable?
  test('functions should be pure and testable', () => {
    // Test that pure functions work independently
    const testGlobal = { definitions: [], references: [] };
    const testToken = { info: { args: ['pure-test'] } };

    const result = parseDef(testGlobal, testToken, 'Pure Test', 'test.md');

    expect(result).toContain('id="term:pure-test"');
    expect(testGlobal.definitions).toHaveLength(1);
    expect(mockGlobal.definitions).toHaveLength(0); // Original should be unchanged
  });

  // Test: Can individual functions be imported and used separately?
  test('individual functions should be importable', () => {
    // Test that individual functions can be imported and used
    expect(typeof parseDef).toBe('function');
    expect(typeof parseRef).toBe('function');
  });
});