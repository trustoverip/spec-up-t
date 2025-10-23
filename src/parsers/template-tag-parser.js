/**
 * Template Tag Parser - Functional Style
 * 
 * This module provides pure functions for processing template-tag markdown extensions:
 * - [[def: term, alias]] - Term definitions with optional aliases
 * - [[ref: term]] - Internal term references
 * - [[xref: spec, term]] - External specification term references
 * - [[tref: spec, term, alias1, alias2, ...]] - External term references with multiple aliases
 * 
 * The functional approach reduces cognitive complexity and makes functions easier to test
 * as they are pure functions with clear inputs and outputs.
 */

const { findExternalSpecByKey } = require('../pipeline/references/external-references-service.js');
const { lookupXrefTerm } = require('../pipeline/rendering/render-utils.js');
const { whitespace, htmlComments, contentCleaning, externalReferences } = require('../utils/regex-patterns');
const Logger = require('../utils/logger.js');

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
 * @param {string} type - The type of construct (def, ref, iref, xref, tref)
 * @param {string} primary - The primary content/term
 * @returns {string} The rendered HTML for the construct
 */
function parseTemplateTag(config, globalState, token, type, primary) {
  if (!primary) return;

  const currentFile = extractCurrentFile(token, globalState);

  switch (type) {
    case 'def':
      return parseDef(globalState, token, primary, currentFile);
    case 'iref':
      return parseIref(globalState, primary);
    case 'xref':
      return parseXref(config, token);
    case 'tref':
      return parseTref(token);
    default:
      return parseRef(globalState, primary);
  }
}

/**
 * Processes [[def: term, alias1, alias2, ...]] constructs
 * Creates definition entries and generates HTML spans with proper IDs
 * Format: "Primary Alias (alias2, alias3, original-term)" similar to tref
 * @param {Object} globalState - Global state to store definitions
 * @param {Object} token - The markdown-it token
 * @param {string} primary - The primary term content
 * @param {string} currentFile - The source file containing this definition
 * @returns {string} HTML span elements with term IDs
 */
function parseDef(globalState, token, primary, currentFile) {
  const termName = token.info.args[0];
  const aliases = token.info.args.slice(1).filter(Boolean); // Get all aliases after the term

  // Store definition in global state for validation and cross-referencing
  globalState.definitions.push({
    term: termName,
    alias: aliases[0] || null, // First alias, or null if no aliases
    source: currentFile
  });

  // Determine the primary display term (first alias if available, otherwise original term)
  const primaryDisplayTerm = aliases.length > 0 ? aliases[0] : termName;

  // Build the display text format: "Primary (alias1, alias2, original-term)"
  let displayText = primaryDisplayTerm;

  if (aliases.length > 0) {
    // Collect all additional terms to show in parentheses
    const parentheticalContent = [];

    // Add remaining aliases (after the first one used as primary)
    if (aliases.length > 1) {
      parentheticalContent.push(...aliases.slice(1));
    }

    // Always add the original term if there are aliases, with special styling
    // This ensures consistent behavior regardless of whether alias1 equals the term
    // The original term should always be visible in the parenthetical list
    parentheticalContent.push(`<span class='term-local-original-term term-original-term' title='original term'>${termName}</span>`);

    // Append parenthetical terms if any exist
    if (parentheticalContent.length > 0) {
      displayText += ` <span class='term-local-parenthetical-terms'>(${parentheticalContent.join(', ')})</span>`;
    }
  } else {
    // No aliases: wrap the term name itself as the original term
    displayText = `<span class='term-local-original-term term-original-term' title='original term'>${termName}</span>`;
  }

  // Generate HTML spans for each term/alias combination
  // This creates anchor points that can be referenced by links
  // IDs stay intact - we create an ID for the original term and each alias
  return token.info.args.reduce((acc, syn) => {
    // Generate a unique term ID by normalizing the synonym: replace whitespace with hyphens and convert to lowercase. The ID is used for fragment identifier (hash) in the URL, which in turn can be used for an anchor in a web page.
    const termId = `term:${syn.replace(whitespace.oneOrMore, '-').toLowerCase()}`;
    return `<span id="${termId}">${acc}</span>`;
  }, displayText);
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
 * Processes [[iref: term]] constructs
 * Creates a placeholder that will be replaced client-side with a copy of the term definition
 * This allows inline copying of existing term definitions from the terms-and-definitions-list
 * @param {Object} globalState - Global state to track inline references
 * @param {string} primary - The term to inline copy
 * @returns {string} HTML placeholder element that will be replaced by client-side script
 */
function parseIref(globalState, primary) {
  // Track this inline reference for validation purposes
  globalState.references.push(primary);

  // Create a placeholder span with data attribute containing the term to copy
  // The client-side script (insert-irefs.js) will find this and replace it with
  // a copy of the actual <dt> and <dd> elements from the terms-and-definitions-list
  const termId = primary.replace(whitespace.oneOrMore, '-').toLowerCase();
  return `<span class="iref-placeholder" data-iref-term="${termId}" data-iref-original="${primary}"></span>`;
}

/**
 * Processes [[xref: spec, term, alias, ...]] constructs
 * Creates links to external specification terms with tooltips
 * Uses primaryDisplayTerm concept: shows first alias if available, otherwise shows the term itself
 * @param {Object} config - Configuration containing external specs
 * @param {Object} token - The markdown-it token
 * @returns {string} HTML anchor element linking to external term or error span if unresolved
 */
function parseXref(config, token) {
  const externalSpec = findExternalSpecByKey(config, token.info.args[0]);
  
  // If external spec cannot be found, return error indicator
  if (!externalSpec) {
    return `<span class="no-xref-found-message" title="External spec '${token.info.args[0]}' not found in configuration">xref cannot be resolved</span>`;
  }

  const termName = token.info.args[1];
  const aliases = token.info.args.slice(2).filter(Boolean); // Get all aliases after the term
  const term = termName.replace(whitespace.oneOrMore, '-').toLowerCase();
  const xrefTerm = lookupXrefTerm(token.info.args[0], term);

  // Determine the primary display term (first alias if available, otherwise original term)
  const primaryDisplayTerm = aliases.length > 0 ? aliases[0] : termName;

  // Build the href attribute using the external spec's gh_page
  const href = `${externalSpec.gh_page}#term:${term}`;

  // Build link attributes with both local and external href capabilities
  let linkAttributes = `class="x-term-reference term-reference" data-local-href="#term:${token.info.args[0]}:${term}" href="${href}"`;

  // Add tooltip content if term definition is available
  if (xrefTerm && xrefTerm.content) {
    const cleanContent = xrefTerm.content.replace(contentCleaning.quotes, '&quot;').replace(contentCleaning.newlines, ' ');
    linkAttributes += ` title="External term definition" data-term-content="${cleanContent}"`;
  }

  return `<a ${linkAttributes}>${primaryDisplayTerm}</a>`;
}

/**
 * Processes [[tref: spec, term, alias, ...]] constructs
 * Creates external term references with multiple aliases displayed in a readable format
 * Format: "Primary Alias (alias1, alias2, original-term)"
 * @param {Object} token - The markdown-it token
 * @returns {string} HTML span element for external term reference
 */
function parseTref(token) {
  const termName = token.info.args[1];
  const aliases = token.info.args.slice(2).filter(Boolean); // Get all aliases after the term

  // Determine the primary display term (first alias if available, otherwise original term)
  const primaryDisplayTerm = aliases.length > 0 ? aliases[0] : termName;

  // Build the display text format: "Primary (alias1, alias2, original-term)"
  let displayText = primaryDisplayTerm;

  if (aliases.length > 0) {
    // Collect all additional terms to show in parentheses
    const parentheticalContent = [];

    // Add remaining aliases (after the first one used as primary)
    if (aliases.length > 1) {
      parentheticalContent.push(...aliases.slice(1));
    }

    // Always add the original term if there are aliases, with special styling
    // This ensures consistent behavior regardless of whether alias1 equals the term
    // The original term should always be visible in the parenthetical list
    parentheticalContent.push(`<span class='term-external-original-term term-original-term' title='original term'>${termName}</span>`);

    // Append parenthetical terms if any exist
    if (parentheticalContent.length > 0) {
      displayText += ` <span class='term-external-parenthetical-terms'>(${parentheticalContent.join(', ')})</span>`;
    }
  } else {
    // No aliases: wrap the term name itself as the original term
    displayText = `<span class='term-external-original-term term-original-term' title='original term'>${termName}</span>`;
  }

  // Generate HTML spans for each term/alias combination, similar to parseDef
  // This creates anchor points that can be referenced by [[ref: ...]] links
  // token.info.args for tref is [externalSpec, term, alias1, alias2, ...]
  // We need to create IDs for the term and all aliases (skip the externalSpec at index 0)
  const termsAndAliases = [termName, ...aliases];

  return termsAndAliases.reduce((acc, syn, index) => {
    // Generate a unique term ID by normalizing the synonym: replace whitespace with hyphens and convert to lowercase
    const termId = `term:${syn.replace(whitespace.oneOrMore, '-').toLowerCase()}`;
    // Add title attribute to the innermost span (first in the array, which wraps the display text directly)
    // This provides a tooltip showing which external term this alias refers to
    const titleAttr = index === 0 && aliases.length > 0 ? ` title="Externally defined as ${termName}"` : '';
    // Add class and data attributes only to the outermost span (last one created)
    const outerAttrs = index === termsAndAliases.length - 1 ? ` data-original-term="${termName}" class="term-external"` : '';
    return `<span id="${termId}"${outerAttrs}${titleAttr}>${acc}</span>`;
  }, displayText);
}

/**
 * Parses an `[[xref:...]]` or `[[tref:...]]` string into a structured object.
 * This function was moved from xtref-utils.js to consolidate parsing logic
 * and prevent cross-module object mutation.
 *
 * @param {string} xtref - Raw reference markup including brackets and prefix.
 * @returns {{ externalSpec: string, term: string, referenceType: string, firstAlias?: string, aliases: string[] }}
 */
function processXTrefObject(xtref) {
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
  const allAliases = parts.slice(2).map(p => p.trim()).filter(Boolean);

  // Initialize both tref and xref alias arrays
  xtrefObject.trefAliases = [];
  xtrefObject.xrefAliases = [];

  // Store aliases in the appropriate array based on reference type
  if (referenceType === 'tref') {
    xtrefObject.trefAliases = allAliases;
    // Store the first tref alias separately as it has special meaning
    if (allAliases.length > 0) {
      xtrefObject.firstTrefAlias = allAliases[0];
    }
  } else if (referenceType === 'xref') {
    xtrefObject.xrefAliases = allAliases;
    // Store the first xref alias separately as it has special meaning
    if (allAliases.length > 0) {
      xtrefObject.firstXrefAlias = allAliases[0];
    }
    
    // Log error if xref has more than one alias
    // xref should only have 0 or 1 alias, unlike tref which supports multiple aliases
    if (allAliases.length > 1) {
      const extraAliases = allAliases.slice(1).join(', ');
      Logger.error(`Invalid xref syntax: [[xref: ${xtrefObject.externalSpec}, ${xtrefObject.term}, ${allAliases.join(', ')}]] has ${allAliases.length} aliases. Only the first alias "${allAliases[0]}" will be used. Extra aliases ignored: ${extraAliases}.`);
    }
  }

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
  parseIref,
  parseXref,
  parseTref,
  parseRef,
  parseTemplateTag,
  processXTrefObject
};