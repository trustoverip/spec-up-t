/**
 * Integration test for the escape mechanism
 * Tests the complete flow from markdown input to HTML output
 */

const fs = require('fs-extra');
const path = require('path');

describe('Escape Mechanism Integration', () => {
  const { processWithEscapes } = require('./escape-handler');
  const replacerRegex = /\[\[\s*([a-zA-Z0-9_-]{1,100}):?\s*([a-zA-Z0-9 _,-]{0,100})?\]\]/img;
  const replacerArgsRegex = /\s*,+\s*/g;

  const mockReplacers = [
    {
      test: 'def',
      transform: (originalMatch, type, ...args) => `<span class="definition" id="term:${args[0].toLowerCase()}">${args[0]}</span>`
    },
    {
      test: 'xref',
      transform: (originalMatch, type, ...args) => `<a class="xref" href="#${args[0]}:${args[1]}">${args[1]}</a>`
    },
    {
      test: 'tref',
      transform: (originalMatch, type, ...args) => `<span class="tref" data-spec="${args[0]}">${args[1]}</span>`
    }
  ];

  function mockApplyReplacers(doc) {
    return processWithEscapes(doc, content =>
      content.replace(replacerRegex, (match, type, args) => {
        const replacer = mockReplacers.find(r => type.trim().match(r.test));
        return replacer ? replacer.transform(match, type, ...(args ? args.trim().split(replacerArgsRegex) : [])) : match;
      })
    );
  }

  function checkContains(result, arr) {
    arr.forEach(str => expect(result).toContain(str));
  }
  function checkNotContains(result, arr) {
    arr.forEach(str => expect(result).not.toContain(str));
  }

  it('should process normal tags while preserving escaped ones', () => {
    const input = `# Test Document\n\nNormal definition: [[def: authentication]]\n\nEscaped definition: \\[[def: literal-example]]\n\nNormal xref: [[xref: spec-1, term-name]]\n\nEscaped xref: \\[[xref: spec-1, literal-term]]\n\nDouble escaped: \\\\[[def: shows-backslash]]\n\nMixed in paragraph: Normal [[def: works]] and escaped \\[[def: literal]] together.`;
    const result = mockApplyReplacers(input);
    checkContains(result, [
      '<span class="definition" id="term:authentication">authentication</span>',
      '<a class="xref" href="#spec-1:term-name">term-name</a>',
      '<span class="definition" id="term:works">works</span>',
      '[[def: literal-example]]',
      '[[xref: spec-1, literal-term]]',
      '[[def: literal]]',
      '\\[[def: shows-backslash]]'
    ]);
    checkNotContains(result, ['__SPEC_UP_ESCAPED_TAG__']);
  });

  it('should handle edge cases correctly', () => {
    const input = `Edge cases:\n\n1. Escaped at start: \\[[def: start-term]]\n2. Escaped at end: \\[[def: end-term]]\n3. Multiple consecutive: \\[[def: one]]\\[[def: two]]\\[[def: three]]\n4. Mixed types: \\[[def: term]] and [[xref: spec, other]] and \\[[tref: spec, transcluded]]`;
    const result = mockApplyReplacers(input);
    checkContains(result, [
      '[[def: start-term]]',
      '[[def: end-term]]',
      '[[def: one]][[def: two]][[def: three]]',
      '[[def: term]]',
      '[[tref: spec, transcluded]]',
      '<a class="xref" href="#spec:other">other</a>'
    ]);
    checkNotContains(result, ['__SPEC_UP_ESCAPED_TAG__']);
  });

  it('should handle malformed escape sequences gracefully', () => {
    const input = `Malformed cases:\n\n1. Incomplete escape: \\[[ without closing\n2. Normal after incomplete: [[def: normal-term]]\n3. Incomplete with partial: \\[[def: incomplete\n4. Multiple backslashes: \\\\\[[def: many-backslashes]]`;
    const result = mockApplyReplacers(input);
    checkContains(result, [
      '<span class="definition" id="term:normal-term">normal-term</span>',
      '[[ without closing',
      '[[def: incomplete'
    ]);
    checkNotContains(result, ['__SPEC_UP_ESCAPED_TAG__']);
  });

  it('should maintain performance with large documents', () => {
    let largeParts = [];
    for (let i = 0; i < 1000; i++) {
      largeParts.push(`Section ${i}: Normal [[def: term-${i}]] and escaped \\[[def: literal-${i}]] content.`);
    }
    const largeInput = largeParts.join('\n\n');
    const startTime = Date.now();
    const result = mockApplyReplacers(largeInput);
    const endTime = Date.now();
    checkContains(result, [
      '<span class="definition" id="term:term-0">term-0</span>',
      '<span class="definition" id="term:term-999">term-999</span>',
      '[[def: literal-0]]',
      '[[def: literal-999]]'
    ]);
    checkNotContains(result, ['__SPEC_UP_ESCAPED_TAG__']);
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
