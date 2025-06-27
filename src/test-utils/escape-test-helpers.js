/**
 * Shared test utilities for escape mechanism testing
 * Centralizes common functionality to reduce duplication
 */

/**
 * Creates a mock substitution processor that simulates actual tag processing
 * @returns {Function} Mock processor function
 */
function createMockProcessor() {
  return (content) => {
    return content
      .replace(/\[\[def:\s*([a-zA-Z0-9 _-]{1,100})\]\]/g, '<span class="definition">$1</span>')
      .replace(/\[\[xref:\s*([a-zA-Z0-9 _-]{1,100}),\s*([a-zA-Z0-9 _-]{1,100})\]\]/g, (m, p1, p2) => `<a href="#${p1}">${p2}</a>`)
      .replace(/\[\[tref:\s*([a-zA-Z0-9 _-]{1,100}),\s*([a-zA-Z0-9 _-]{1,100})\]\]/g, '<span class="tref">$2</span>');
  };
}

/**
 * Creates mock replacers for integration testing
 * @returns {Array} Array of mock replacer objects
 */
function createMockReplacers() {
  return [
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
}

/**
 * Test helper to check multiple strings are contained in result
 * @param {string} result - The result to check
 * @param {Array<string>} expectedStrings - Array of strings that should be present
 */
function expectContainsAll(result, expectedStrings) {
  expectedStrings.forEach(str => expect(result).toContain(str));
}

/**
 * Test helper to check multiple strings are NOT contained in result
 * @param {string} result - The result to check
 * @param {Array<string>} unexpectedStrings - Array of strings that should NOT be present
 */
function expectNotContainsAny(result, unexpectedStrings) {
  unexpectedStrings.forEach(str => expect(result).not.toContain(str));
}

module.exports = {
  createMockProcessor,
  createMockReplacers,
  expectContainsAll,
  expectNotContainsAny
};
