/**
 * Template Tag Parser - Functional Style
 * 
 * This module provides pure functions for processing template-tag markdown extensions:
 * - [[def: term, alias]] - Term definitions with optional aliases
 * - [[ref: term]] - Internal term references
 * - [[xref: spec, term]] - External specification term references
 * - [[tref: spec, term, alias]] - External term references with optional aliases
 * 
 * The functional approach reduces cognitive complexity and makes functions easier to test
 * as they are pure functions with clear inputs and outputs.
 */

const { findExternalSpecByKey } = require('../pipeline/references/external-references-service.js');
const { lookupXrefTerm } = require('../pipeline/rendering/render-utils.js');
const { whitespace, htmlComments, contentCleaning, externalReferences } = require('../utils/regex-patterns');

/**
 * Extracts the current file from token content for source tracking
 * @param {Object} token - The markdown-it token
 * @param {Object} globalState - Global state containing fallback currentFile
 * @returns {string} The source file name
 */
function extractCurrentFile(token, globalState) {
  const content = token.map ? token.map[0] : '';
  const fileMatch = content && content.match && content.match(htmlComments.fileTracker);
  return fileMatch ? fileMatch[1] : globalState.currentFile || 'unknown';
}

/**
 * Main parsing entry point for template-tag constructs
 * @param {Object} config - Configuration object containing specs and settings
 * @param {Object} globalState - Global state object containing definitions, references, etc.
 * @param {Object} token - The markdown-it token being processed
 * @param {string} type - The type of construct (def, ref, xref, tref)
 * @param {string} primary - The primary content/term
 * @returns {string} The rendered HTML for the construct
 */
function parseTemplateTag(config, globalState, token, type, primary) {
  if (!primary) return;
  
  const currentFile = extractCurrentFile(token, globalState);
  
  switch (type) {
    case 'def':
      return parseDef(globalState, token, primary, currentFile);
    case 'xref':
      return parseXref(config, token);
    case 'tref':
      return parseTref(token);
    default:
      return parseRef(globalState, primary);
  }
}

/**
 * Processes [[def: term, alias]] constructs
 * Creates definition entries and generates HTML spans with proper IDs
 * @param {Object} globalState - Global state to store definitions
 * @param {Object} token - The markdown-it token
 * @param {string} primary - The primary term content
 * @param {string} currentFile - The source file containing this definition
 * @returns {string} HTML span elements with term IDs
 */
function parseDef(globalState, token, primary, currentFile) {
  // Store definition in global state for validation and cross-referencing
  globalState.definitions.push({ 
    term: token.info.args[0], 
    alias: token.info.args[1], 
    source: currentFile 
  });
  
  // Generate HTML spans for each term/alias combination
  // This creates anchor points that can be referenced by links
  return token.info.args.reduce((acc, syn) => {
    const termId = `term:${syn.replace(whitespace.oneOrMore, '-').toLowerCase()}`;
    return `<span id="${termId}">${acc}</span>`;
  }, primary);
}

/**
 * Processes [[xref: spec, term]] constructs
 * Creates links to external specification terms with tooltips
 * @param {Object} config - Configuration containing external specs
 * @param {Object} token - The markdown-it token
 * @returns {string} HTML anchor element linking to external term
 */
function parseXref(config, token) {
  const externalSpec = findExternalSpecByKey(config, token.info.args[0]);
  const url = externalSpec?.gh_page || '#';
  const termName = token.info.args[1];
  const term = termName.replace(whitespace.oneOrMore, '-').toLowerCase();
  const xrefTerm = lookupXrefTerm(token.info.args[0], term);
  
  // Build link attributes with both local and external href capabilities
  let linkAttributes = `class="x-term-reference term-reference" data-local-href="#term:${token.info.args[0]}:${term}" href="${url}#term:${term}"`;
  
  // Add tooltip content if term definition is available
  if (xrefTerm && xrefTerm.content) {
    const cleanContent = xrefTerm.content.replace(contentCleaning.quotes, '&quot;').replace(contentCleaning.newlines, ' ');
    linkAttributes += ` title="External term definition" data-term-content="${cleanContent}"`;
  }
  
  return `<a ${linkAttributes}>${termName}</a>`;
}

/**
 * Processes [[tref: spec, term, alias]] constructs
 * Creates external term references with optional display aliases
 * @param {Object} token - The markdown-it token
 * @returns {string} HTML span element for external term reference
 */
function parseTref(token) {
  const termName = token.info.args[1];
  const alias = token.info.args[2];
  const publishedTermName = alias ? alias : termName;
  const termId = `term:${termName.replace(whitespace.oneOrMore, '-').toLowerCase()}`;
  const aliasId = alias ? `term:${alias.replace(whitespace.oneOrMore, '-').toLowerCase()}` : '';
  
  // Handle cases where alias differs from the original term name
  if (aliasId && alias !== termName) {
    return `<span data-original-term="${termName}" class="term-external" id="${termId}"><span title="Externally defined as ${termName}" id="${aliasId}">${publishedTermName}</span></span>`;
  } else {
    return `<span title="Externally also defined as ${termName}" data-original-term="${termName}" class="term-external" id="${termId}">${publishedTermName}</span>`;
  }
}

/**
 * Processes [[ref: term]] constructs
 * Creates internal links to locally defined terms
 * @param {Object} globalState - Global state to track references
 * @param {string} primary - The term to reference
 * @returns {string} HTML anchor element linking to local term
 */
function parseRef(globalState, primary) {
  // Track this reference for validation purposes
  globalState.references.push(primary);
  
  // Create internal link to the term definition
  const termId = primary.replace(whitespace.oneOrMore, '-').toLowerCase();
  return `<a class="term-reference" href="#term:${termId}">${primary}</a>`;
}

/**
 * Parses an `[[xref:...]]` or `[[tref:...]]` string into a structured object.
 * This function was moved from xtref-utils.js to consolidate parsing logic
 * and prevent cross-module object mutation.
 *
 * @param {string} xtref - Raw reference markup including brackets and prefix.
 * @returns {{ externalSpec: string, term: string, referenceType: string, alias?: string }}
 */
function processXTref(xtref) {
  const referenceTypeMatch = xtref.match(externalReferences.referenceType);
  const referenceType = referenceTypeMatch ? referenceTypeMatch[1] : 'unknown';

  const parts = xtref
    .replace(externalReferences.openingTag, '')
    .replace(externalReferences.closingTag, '')
    .trim()
    .split(externalReferences.argsSeparator);

  const xtrefObject = {
    externalSpec: parts[0].trim(),
    term: parts[1].trim(),
    referenceType
  };

  // Collect all aliases from parts after the term (index 1), trim and filter empties
  xtrefObject.aliases = parts.slice(2).map(p => p.trim()).filter(Boolean);

  return xtrefObject;
}

/**
 * Creates a template-tag parser function with bound configuration and global state.
 * This provides a clean interface similar to the class-based approach but with functional benefits.
 * @param {Object} config - Configuration object
 * @param {Object} globalState - Global state object
 * @returns {Function} A parser function that can be called with (token, type, primary)
 */
function createTemplateTagParser(config, globalState) {
  return (token, type, primary) => parseTemplateTag(config, globalState, token, type, primary);
}

module.exports = {
  createTemplateTagParser,
  // Export individual functions for testing purposes
  parseDef,
  parseXref,
  parseTref,
  parseRef,
  parseTemplateTag,
  processXTref
};