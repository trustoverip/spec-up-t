'use strict';

const { ESCAPED_PLACEHOLDER } = require('../escape-handler');

/**
 * Markdown-it Template Syntax Module
 * 
 * This module adds support for custom template syntax like [[ref:spec,term]] in markdown.
 * It handles the parsing and rendering of these special constructs.
 * 
 * Template syntax format: [[type:arg1,arg2,arg3]]
 * Examples:
 * - [[def:term,alias]] - Define a term with an alias
 * - [[tref:external-spec,term]] - Reference a term from external specification
 * - [[xref:spec,term]] - Cross-reference to another specification
 * 
 * The module works in two phases:
 * 1. PARSING: Scans markdown text for [[...]] patterns and creates template tokens
 * 2. RENDERING: Converts template tokens to final HTML using template handlers
 */

/**
 * Configuration constants for template syntax
 * These define the delimiters and parsing rules for template markers
 */
const levels = 2;                         // Number of bracket characters (e.g., 2 = [[]])
const openString = '['.repeat(levels);    // Opening delimiter: '[['
const closeString = ']'.repeat(levels);   // Closing delimiter: ']]'

// Regular expression to extract template components from [[type:args]] syntax
// Group 1: template type (e.g., 'ref', 'tref', 'def')
// Group 2: arguments (everything after the colon, comma-separated)
const contentRegex = /\s*([^\s\[\]:]+):?\s*([^\]\n]+)?/i;

/**
 * Applies template syntax support to a markdown-it instance
 * 
 * @param {Object} md - The markdown-it instance to enhance
 * @param {Array} templates - Array of template handler objects
 * 
 * Each template handler should have:
 * - filter(type): function that returns true if this handler processes the given type
 * - parse(token, type, ...args): optional preprocessing function
 * - render(token, type, ...args): function that returns HTML string
 */
function applyTemplateSyntax(md, templates = []) {
  
  /**
   * Custom inline parsing rule for template syntax
   * 
   * This rule is added to markdown-it's inline ruler (which processes inline elements)
   * and runs after the 'emphasis' rule to handle our [[template]] syntax.
   * 
   * @param {Object} state - Parser state object containing source text and position
   * @param {Boolean} silent - If true, don't modify state (used for validation)
   * @returns {Boolean} true if template was found and processed, false otherwise
   */
  function templates_ruler(state, silent) {
    // Get current position in the source text
    var start = state.pos;

    // Skip processing if we're at an escaped placeholder (handled by escape mechanism)
    if (state.src.slice(start, start + ESCAPED_PLACEHOLDER.length) === ESCAPED_PLACEHOLDER) {
      return false;
    }

    // Check if we're at the start of a template marker [[
    let prefix = state.src.slice(start, start + levels);
    if (prefix !== openString) {
      return false; // Not a template, let other rules handle it
    }
    
    // Find the matching closing marker ]]
    var indexOfClosingBrace = state.src.indexOf(closeString, start);
    
    if (indexOfClosingBrace > 0) {
      // Extract the content between [[ and ]]
      let templateContent = state.src.slice(start + levels, indexOfClosingBrace);
      
      // Parse the template content using regex
      let match = contentRegex.exec(templateContent);
      if (!match) {
        return false; // Invalid template syntax
      }

      // Extract template type and arguments
      let type = match[1];
      let template = templates.find(t => t.filter(type) && t);
      
      if (!template) {
        return false; // No handler found for this template type
      }

      // Parse arguments (comma-separated list)
      let args = match[2] ? match[2].trim().split(/\s*,+\s*/) : [];
      
      // Create a new template token in the token stream
      // This token will be processed later during rendering
      let token = state.push('template', '', 0);
      token.content = match[0]; // Store original matched content
      token.info = { type, template, args }; // Store parsed information

      // If the template has a parse function, call it for preprocessing
      // This allows templates to modify their content during parsing
      if (template.parse) {
        token.content = template.parse(token, type, ...args) || token.content;
      }

      // Move parser position past the template
      state.pos = indexOfClosingBrace + levels;
      return true; // Template successfully processed
    }

    return false; // No closing marker found
  }

  // Register the template parsing rule with markdown-it
  // It runs after 'emphasis' to ensure proper precedence
  md.inline.ruler.after('emphasis', 'templates', templates_ruler);

  /**
   * Renderer for template tokens
   * 
   * This function is called during the rendering phase to convert
   * template tokens into their final HTML representation.
   * 
   * @param {Array} tokens - Array of all tokens being rendered
   * @param {Number} idx - Index of current template token
   * @param {Object} options - Markdown-it options
   * @param {Object} env - Environment/context object
   * @param {Object} renderer - The renderer instance
   * @returns {String} HTML string for this template
   */
  md.renderer.rules.template = function (tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let template = token.info.template;
    
    // Call the template's render function if it exists
    if (template.render) {
      let result = template.render(token, token.info.type, ...token.info.args);
      // Return the rendered result, or fall back to original syntax if render fails
      return result || (openString + token.content + closeString);
    }
    
    // No render function - return the content as-is
    return token.content;
  };
}

module.exports = applyTemplateSyntax;