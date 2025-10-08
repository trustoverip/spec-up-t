/**
 * Template Tag Parser HTML Output Tests
 *
 * These tests verify that the HTML output contains all required CSS classes
 * and structural elements that are essential for proper rendering and styling.
 * 
 * These tests were added after discovering that shallow `.toContain()` assertions
 * were insufficient to catch missing CSS classes that broke functionality.
 */

const {
  parseDef,
  parseRef,
  parseXref,
  parseTref
} = require('./template-tag-parser');

describe('Template Tag Parser - HTML Output Validation', () => {
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

    global.definitions = mockGlobal.definitions;
    global.references = mockGlobal.references;
    global.specGroups = mockGlobal.specGroups;
    global.noticeTitles = mockGlobal.noticeTitles;
  });

  describe('parseDef - HTML structure validation', () => {
    // Test: Does def output contain the required CSS class for styling?
    test('should include term-original-term class when def has aliases', () => {
      const mockToken = {
        info: { args: ['test-term', 'alias1'] }
      };

      const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

      // Critical: This class is required for CSS styling
      expect(result).toContain('term-original-term');
      expect(result).toContain('term-local-original-term');
    });

    test('should include term-original-term class when def has no aliases', () => {
      const mockToken = {
        info: { args: ['test-term'] }
      };

      const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

      // Even without aliases, the original term should have proper class
      expect(result).toContain('term-original-term');
      expect(result).toContain('term-local-original-term');
    });

    test('should include term-local-parenthetical-terms class for multiple aliases', () => {
      const mockToken = {
        info: { args: ['test-term', 'alias1', 'alias2', 'alias3'] }
      };

      const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

      expect(result).toContain('term-local-parenthetical-terms');
    });

    test('should display primary alias first, then other aliases, then original term', () => {
      const mockToken = {
        info: { args: ['original-term', 'primary-alias', 'second-alias'] }
      };

      const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

      // Primary alias should appear first (not in parentheses) in the innermost span
      expect(result).toMatch(/>primary-alias <span class='term-local-parenthetical-terms'>/);
      
      // Second alias should appear in parentheses
      expect(result).toContain('second-alias');
      
      // Original term should appear last in parentheses with proper class
      expect(result).toContain('<span class=\'term-local-original-term term-original-term\' title=\'original term\'>original-term</span>');
    });

    test('should have nested span structure with all IDs', () => {
      const mockToken = {
        info: { args: ['term1', 'alias1', 'alias2'] }
      };

      const result = parseDef(mockGlobal, mockToken, 'Test Term', 'test.md');

      // Check all IDs are present
      expect(result).toContain('id="term:term1"');
      expect(result).toContain('id="term:alias1"');
      expect(result).toContain('id="term:alias2"');
      
      // Check nested structure (outer span has last alias ID)
      expect(result).toMatch(/^<span id="term:alias2">/);
    });
  });

  describe('parseTref - HTML structure validation', () => {
    // Test: Does tref output contain the required CSS classes for styling?
    test('should include term-external-original-term and term-original-term classes when tref has aliases', () => {
      const mockToken = {
        info: { args: ['external-spec', 'test-term', 'alias1'] }
      };

      const result = parseTref(mockToken);

      // Critical: These classes are required for CSS styling
      expect(result).toContain('term-original-term');
      expect(result).toContain('term-external-original-term');
    });

    test('should include term-original-term class when tref has no aliases', () => {
      const mockToken = {
        info: { args: ['external-spec', 'test-term'] }
      };

      const result = parseTref(mockToken);

      // Even without aliases, the original term should have proper class
      expect(result).toContain('term-original-term');
      expect(result).toContain('term-external-original-term');
    });

    test('should include term-external-parenthetical-terms class for multiple aliases', () => {
      const mockToken = {
        info: { args: ['external-spec', 'test-term', 'alias1', 'alias2', 'alias3'] }
      };

      const result = parseTref(mockToken);

      expect(result).toContain('term-external-parenthetical-terms');
    });

    test('should include term-external class on outer span', () => {
      const mockToken = {
        info: { args: ['external-spec', 'test-term', 'alias1'] }
      };

      const result = parseTref(mockToken);

      expect(result).toContain('class="term-external"');
    });

    test('should display primary alias first, then other aliases, then original term', () => {
      const mockToken = {
        info: { args: ['spec', 'original-term', 'primary-alias', 'second-alias'] }
      };

      const result = parseTref(mockToken);

      // Primary alias should appear first (not in parentheses)
      expect(result).toContain('>primary-alias <span');
      
      // Second alias should appear in parentheses
      expect(result).toContain('second-alias');
      
      // Original term should appear last in parentheses with proper class
      expect(result).toContain('<span class=\'term-external-original-term term-original-term\' title=\'original term\'>original-term</span>');
    });

    test('should have data-original-term attribute', () => {
      const mockToken = {
        info: { args: ['spec', 'test-term', 'alias1'] }
      };

      const result = parseTref(mockToken);

      expect(result).toContain('data-original-term="test-term"');
    });

    test('should have proper title attribute on inner span when alias exists', () => {
      const mockToken = {
        info: { args: ['spec', 'test-term', 'alias1'] }
      };

      const result = parseTref(mockToken);

      expect(result).toContain('title="Externally defined as test-term"');
    });
  });

  describe('parseXref - HTML structure validation', () => {
    test('should include x-term-reference and term-reference classes', () => {
      const mockToken = {
        info: { args: ['test-spec', 'test-term'] }
      };

      const result = parseXref(mockConfig, mockToken);

      expect(result).toContain('class="x-term-reference term-reference"');
    });

    test('should display primary alias instead of term when alias provided', () => {
      const mockToken = {
        info: { args: ['test-spec', 'test-term', 'my-alias'] }
      };

      const result = parseXref(mockConfig, mockToken);

      // Should show alias, not the term
      expect(result).toContain('>my-alias</a>');
      expect(result).not.toContain('>test-term</a>');
    });

    test('should display term when no alias provided', () => {
      const mockToken = {
        info: { args: ['test-spec', 'test-term'] }
      };

      const result = parseXref(mockConfig, mockToken);

      expect(result).toContain('>test-term</a>');
    });

    test('should have both data-local-href and href attributes', () => {
      const mockToken = {
        info: { args: ['test-spec', 'test-term'] }
      };

      const result = parseXref(mockConfig, mockToken);

      expect(result).toContain('data-local-href="#term:test-spec:test-term"');
      expect(result).toContain('href="https://example.com/spec#term:test-term"');
    });
  });

  describe('parseRef - HTML structure validation', () => {
    test('should include term-reference class', () => {
      const result = parseRef(mockGlobal, 'test-term');

      expect(result).toContain('class="term-reference"');
    });

    test('should create proper href with term: prefix', () => {
      const result = parseRef(mockGlobal, 'test-term');

      expect(result).toContain('href="#term:test-term"');
    });

    test('should display the term as link text', () => {
      const result = parseRef(mockGlobal, 'my-test-term');

      expect(result).toContain('>my-test-term</a>');
    });
  });

  describe('Regression tests - ensure critical classes are never removed', () => {
    // These tests protect against the specific bug that was fixed
    test('def: term-original-term class must always be present', () => {
      const withAlias = { info: { args: ['term', 'alias'] } };
      const withoutAlias = { info: { args: ['term'] } };

      expect(parseDef(mockGlobal, withAlias, 'Test', 'test.md')).toContain('term-original-term');
      expect(parseDef(mockGlobal, withoutAlias, 'Test', 'test.md')).toContain('term-original-term');
    });

    test('def: term-local-original-term class must always be present', () => {
      const withAlias = { info: { args: ['term', 'alias'] } };
      const withoutAlias = { info: { args: ['term'] } };

      expect(parseDef(mockGlobal, withAlias, 'Test', 'test.md')).toContain('term-local-original-term');
      expect(parseDef(mockGlobal, withoutAlias, 'Test', 'test.md')).toContain('term-local-original-term');
    });

    test('tref: term-original-term class must always be present', () => {
      const withAlias = { info: { args: ['spec', 'term', 'alias'] } };
      const withoutAlias = { info: { args: ['spec', 'term'] } };

      expect(parseTref(withAlias)).toContain('term-original-term');
      expect(parseTref(withoutAlias)).toContain('term-original-term');
    });

    test('tref: term-external-original-term class must always be present', () => {
      const withAlias = { info: { args: ['spec', 'term', 'alias'] } };
      const withoutAlias = { info: { args: ['spec', 'term'] } };

      expect(parseTref(withAlias)).toContain('term-external-original-term');
      expect(parseTref(withoutAlias)).toContain('term-external-original-term');
    });

    test('tref: term-external class must always be present on outer span', () => {
      const withAlias = { info: { args: ['spec', 'term', 'alias'] } };
      const withoutAlias = { info: { args: ['spec', 'term'] } };

      expect(parseTref(withAlias)).toContain('class="term-external"');
      expect(parseTref(withoutAlias)).toContain('class="term-external"');
    });
  });
});
