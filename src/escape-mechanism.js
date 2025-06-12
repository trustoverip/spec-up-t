/**
 * Escape Mechanism Module for Spec-Up Substitution Tags
 * 
 * This module provides functions to handle backslash escape sequences for substitution tags,
 * allowing users to display tag syntax literally in their documentation.
 * 
 * The escape mechanism works in three phases:
 * 1. Pre-processing: Convert escaped sequences to temporary placeholders
 * 2. Tag processing: Normal substitution logic (handled elsewhere)
 * 3. Post-processing: Restore escaped sequences as literals
 * 
 * @version 1.0.0
 */

/**
 * Handles backslash escape mechanism for substitution tags
 * 
 * Use backslash escape sequences to allow literal [[ tags in markdown
 * 
 * Phase 1: Pre-processing - Convert escaped sequences to temporary placeholders
 * 
 * @param {string} doc - The markdown document to process
 * @returns {string} - Document with escaped sequences converted to placeholders
 */
function processEscapedTags(doc) {
  // Handle \\[[ pattern: should become \[[ and allow normal processing
  // Replace \\[[ with \_PRESERVE_BACKSLASH_[[
  doc = doc.replace(/\\\\(\[\[)/g, '__SPEC_UP_PRESERVE_BACKSLASH__$1');
  
  // Handle \[[ pattern: should be escaped to literal [[
  // Replace \[[ with placeholder
  doc = doc.replace(/\\(\[\[)/g, '__SPEC_UP_ESCAPED_TAG__');
  
  // Restore the preserved backslashes (convert back to \[[)
  doc = doc.replace(/__SPEC_UP_PRESERVE_BACKSLASH__(\[\[)/g, '\\$1');
  
  return doc;
}

/**
 * Handles backslash escape mechanism for substitution tags
 * 
 * Use backslash escape sequences to allow literal [[ tags in markdown
 * 
 * Phase 3: Post-processing - Restore escaped sequences as literals
 * Converts placeholders back to literal [[ characters
 * 
 * @param {string} renderedHtml - The rendered HTML to process
 * @returns {string} - HTML with placeholders restored to literal [[ tags
 */
function restoreEscapedTags(renderedHtml) {
  // Replace placeholders with literal [[ 
  return renderedHtml.replace(/__SPEC_UP_ESCAPED_TAG__/g, '[[');
}

module.exports = {
  processEscapedTags,
  restoreEscapedTags
};
