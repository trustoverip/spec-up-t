/**
 * Unit tests for the escape handler module
 * Tests the three-phase escape mechanism for substitution tags
 */

const { 
  preProcessEscapes, 
  postProcessEscapes, 
  processWithEscapes,
  ESCAPED_PLACEHOLDER 
} = require('./escape-handler');

const { createMockProcessor } = require('./test-utils/escape-test-helpers');

describe('Escape Handler', () => {
  describe('preProcessEscapes', () => {
    it('should handle single backslash escape', () => {
      const input = 'Text \\[[def: example]] more text';
      const expected = `Text ${ESCAPED_PLACEHOLDER}def: example]] more text`;
      expect(preProcessEscapes(input)).toBe(expected);
    });

    it('should handle double backslash escape', () => {
      const input = 'Text \\\\[[def: example]] more text';
      const expected = `Text \\${ESCAPED_PLACEHOLDER}def: example]] more text`;
      expect(preProcessEscapes(input)).toBe(expected);
    });

    it('should handle multiple escapes in same text', () => {
      const input = 'First \\[[def: term1]] and \\[[xref: spec, term2]] text';
      const expected = `First ${ESCAPED_PLACEHOLDER}def: term1]] and ${ESCAPED_PLACEHOLDER}xref: spec, term2]] text`;
      expect(preProcessEscapes(input)).toBe(expected);
    });

    it('should handle mixed single and double escapes', () => {
      const input = 'Single \\[[def: term]] and double \\\\[[xref: spec, term]] text';
      const expected = `Single ${ESCAPED_PLACEHOLDER}def: term]] and double \\${ESCAPED_PLACEHOLDER}xref: spec, term]] text`;
      expect(preProcessEscapes(input)).toBe(expected);
    });

    it('should not affect normal tags without escapes', () => {
      const input = 'Normal [[def: term]] and [[xref: spec, term]] text';
      expect(preProcessEscapes(input)).toBe(input);
    });

    it('should handle empty or null input', () => {
      expect(preProcessEscapes('')).toBe('');
      expect(preProcessEscapes(null)).toBe(null);
      expect(preProcessEscapes(undefined)).toBe(undefined);
    });

    it('should handle non-string input', () => {
      expect(preProcessEscapes(123)).toBe(123);
      expect(preProcessEscapes({})).toEqual({});
    });
  });

  describe('postProcessEscapes', () => {
    it('should restore escaped placeholders to literal brackets', () => {
      const input = `Text ${ESCAPED_PLACEHOLDER}def: example]] more text`;
      const expected = 'Text [[def: example]] more text';
      expect(postProcessEscapes(input)).toBe(expected);
    });

    it('should handle multiple placeholders', () => {
      const input = `First ${ESCAPED_PLACEHOLDER}def: term1]] and ${ESCAPED_PLACEHOLDER}xref: spec, term2]] text`;
      const expected = 'First [[def: term1]] and [[xref: spec, term2]] text';
      expect(postProcessEscapes(input)).toBe(expected);
    });

    it('should handle empty or null input', () => {
      expect(postProcessEscapes('')).toBe('');
      expect(postProcessEscapes(null)).toBe(null);
      expect(postProcessEscapes(undefined)).toBe(undefined);
    });
  });

  describe('processWithEscapes', () => {
    const mockProcessor = createMockProcessor();

    it('should process normal tags while preserving escaped ones', () => {
      const input = 'Normal [[def: term]] and escaped \\[[def: literal]] text';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('Normal <span class="definition">term</span> and escaped [[def: literal]] text');
    });

    it('should handle double escapes correctly', () => {
      const input = 'Double escaped \\\\[[def: term]] should show backslash';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('Double escaped \\[[def: term]] should show backslash');
    });

    it('should handle mixed escaped and normal tags', () => {
      const input = 'Normal [[xref: spec, term]] escaped \\[[xref: spec, literal]] and \\[[def: another]]';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('Normal <a href="#spec">term</a> escaped [[xref: spec, literal]] and [[def: another]]');
    });

    it('should handle empty content', () => {
      const result = processWithEscapes('', mockProcessor);
      expect(result).toBe('');
    });

    it('should handle null and undefined input', () => {
      expect(processWithEscapes(null, mockProcessor)).toBe(null);
      expect(processWithEscapes(undefined, mockProcessor)).toBe(undefined);
    });

    it('should handle complex markdown content', () => {
      const input = `# Documentation
      
Here is a normal definition: [[def: authentication]]

But here we want to show the literal syntax: \\[[def: example]]

And here's an escaped xref: \\[[xref: spec-name, term-name]]

This should be processed: [[tref: external-spec, some-term]]`;
      
      const result = processWithEscapes(input, mockProcessor);
      
      expect(result).toContain('<span class="definition">authentication</span>');
      expect(result).toContain('[[def: example]]');
      expect(result).toContain('[[xref: spec-name, term-name]]');
      expect(result).toContain('<span class="tref">some-term</span>');
    });
  });

  describe('Edge cases', () => {
    const mockProcessor = createMockProcessor();

    it('should handle escaped tags at start of text', () => {
      const input = '\\[[def: term]] at start';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('[[def: term]] at start');
    });

    it('should handle escaped tags at end of text', () => {
      const input = 'at end \\[[def: term]]';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('at end [[def: term]]');
    });

    it('should handle multiple consecutive escapes', () => {
      const input = '\\[[def: one]]\\[[def: two]]\\[[def: three]]';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('[[def: one]][[def: two]][[def: three]]');
    });

    it('should handle malformed escapes gracefully', () => {
      const input = 'Text with \\[[ incomplete and \\[[complete: tag]]';
      const result = processWithEscapes(input, mockProcessor);
      expect(result).toBe('Text with [[ incomplete and [[complete: tag]]');
    });
  });
});
