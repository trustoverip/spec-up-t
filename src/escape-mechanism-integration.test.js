/**
 * Integration test for the escape mechanism
 * Tests the complete flow from markdown input to HTML output
 */

const fs = require('fs-extra');
const path = require('path');

describe('Escape Mechanism Integration', () => {
  const { processWithEscapes } = require('./escape-handler');
  
  // Mock the main replacer regex and transform function similar to index.js
  // Use non-greedy match for tag content to avoid catastrophic backtracking
  const replacerRegex = /\[\[\s*([^\s\[\]:]+):?\s*([^\]\n]*?)?\]\]/img;
  // Use a stricter, non-greedy regex for argument splitting to avoid ReDoS
  const replacerArgsRegex = /\s*,+\s*/g;
  
  const mockReplacers = [
    {
      test: 'def',
      transform: function (originalMatch, type, ...args) {
        const primary = args[0];
        return `<span class="definition" id="term:${primary.toLowerCase()}">${primary}</span>`;
      }
    },
    {
      test: 'xref',
      transform: function (originalMatch, type, ...args) {
        const spec = args[0];
        const term = args[1];
        return `<a class="xref" href="#${spec}:${term}">${term}</a>`;
      }
    },
    {
      test: 'tref',
      transform: function (originalMatch, type, ...args) {
        const spec = args[0];
        const term = args[1];
        return `<span class="tref" data-spec="${spec}">${term}</span>`;
      }
    }
  ];

  function mockApplyReplacers(doc) {
    return processWithEscapes(doc, function(content) {
      return content.replace(replacerRegex, function (match, type, args) {
        let replacer = mockReplacers.find(r => type.trim().match(r.test));
        if (replacer) {
          let argsArray = args ? args.trim().split(replacerArgsRegex) : [];
          return replacer.transform(match, type, ...argsArray);
        }
        return match;
      });
    });
  }

  it('should process normal tags while preserving escaped ones', () => {
    const input = `# Test Document

Normal definition: [[def: authentication]]

Escaped definition: \\[[def: literal-example]]

Normal xref: [[xref: spec-1, term-name]]

Escaped xref: \\[[xref: spec-1, literal-term]]

Double escaped: \\\\[[def: shows-backslash]]

Mixed in paragraph: Normal [[def: works]] and escaped \\[[def: literal]] together.`;

    const result = mockApplyReplacers(input);

    // Check that normal tags were processed
    expect(result).toContain('<span class="definition" id="term:authentication">authentication</span>');
    expect(result).toContain('<a class="xref" href="#spec-1:term-name">term-name</a>');
    expect(result).toContain('<span class="definition" id="term:works">works</span>');

    // Check that escaped tags are literal
    expect(result).toContain('[[def: literal-example]]');
    expect(result).toContain('[[xref: spec-1, literal-term]]');
    expect(result).toContain('[[def: literal]]');

    // Check double escaped shows backslash
    expect(result).toContain('\\[[def: shows-backslash]]');

    // Ensure no remnants of placeholders
    expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
  });

  it('should handle edge cases correctly', () => {
    const input = `Edge cases:

1. Escaped at start: \\[[def: start-term]]
2. Escaped at end: \\[[def: end-term]]
3. Multiple consecutive: \\[[def: one]]\\[[def: two]]\\[[def: three]]
4. Mixed types: \\[[def: term]] and [[xref: spec, other]] and \\[[tref: spec, transcluded]]`;

    const result = mockApplyReplacers(input);

    // Check escaped ones are literal
    expect(result).toContain('[[def: start-term]]');
    expect(result).toContain('[[def: end-term]]');
    expect(result).toContain('[[def: one]][[def: two]][[def: three]]');
    expect(result).toContain('[[def: term]]');
    expect(result).toContain('[[tref: spec, transcluded]]');

    // Check normal one is processed
    expect(result).toContain('<a class="xref" href="#spec:other">other</a>');

    // Ensure no remnants of placeholders
    expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
  });

  it('should handle malformed escape sequences gracefully', () => {
    const input = `Malformed cases:

1. Incomplete escape: \\[[ without closing
2. Normal after incomplete: [[def: normal-term]]
3. Incomplete with partial: \\[[def: incomplete
4. Multiple backslashes: \\\\\\[[def: many-backslashes]]`;

    const result = mockApplyReplacers(input);

    // Check that normal processing still works
    expect(result).toContain('<span class="definition" id="term:normal-term">normal-term</span>');

    // Check that incomplete escapes don't break things
    expect(result).toContain('[[ without closing');
    expect(result).toContain('[[def: incomplete');

    // Ensure no remnants of placeholders
    expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
  });

  it('should maintain performance with large documents', () => {
    // Create a large document with mixed escaped and normal tags
    let largeParts = [];
    for (let i = 0; i < 1000; i++) {
      largeParts.push(`Section ${i}: Normal [[def: term-${i}]] and escaped \\[[def: literal-${i}]] content.`);
    }
    const largeInput = largeParts.join('\n\n');

    const startTime = Date.now();
    const result = mockApplyReplacers(largeInput);
    const endTime = Date.now();

    // Should complete within reasonable time (less than 1 second)
    expect(endTime - startTime).toBeLessThan(1000);

    // Verify some processing happened
    expect(result).toContain('<span class="definition" id="term:term-0">term-0</span>');
    expect(result).toContain('<span class="definition" id="term:term-999">term-999</span>');
    expect(result).toContain('[[def: literal-0]]');
    expect(result).toContain('[[def: literal-999]]');

    // Ensure no remnants of placeholders
    expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
  });
});
