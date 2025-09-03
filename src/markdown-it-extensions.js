'use strict';

const { ESCAPED_PLACEHOLDER } = require('./escape-handler');

/**
 * Configuration for custom template syntax [[example]] used throughout the markdown parsing
 * These constants define how template markers are identified and processed
 */
const levels = 2;                         // Number of bracket characters used for template markers
const openString = '['.repeat(levels);    // Opening delimiter for template markers, e.g., '[['
const closeString = ']'.repeat(levels);   // Closing delimiter for template markers, e.g., ']]'
// Regular expression to extract template type and arguments from content between delimiters
// Captures: 1st group = template type (e.g., "ref", "tref"), 2nd group = optional arguments
const contentRegex = /\s*([^\s\[\]:]+):?\s*([^\]\n]+)?/i;

module.exports = function (md, templates = {}) {

  // Add table renderer to apply Bootstrap classes to all tables by default
  const originalTableRender = md.renderer.rules.table_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Save the original table_close renderer
  const originalTableCloseRender = md.renderer.rules.table_close || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Override table_open to add both the classes and open a wrapper div
  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    // Add Bootstrap classes to the table element
    const token = tokens[idx];
    const classIndex = token.attrIndex('class');
    const tableClasses = 'table table-striped table-bordered table-hover';

    if (classIndex < 0) {
      token.attrPush(['class', tableClasses]);
    } else {
      // If a class attribute already exists, append our classes
      const existingClasses = token.attrs[classIndex][1];
      // Only add classes that aren't already present
      const classesToAdd = tableClasses
        .split(' ')
        .filter(cls => !existingClasses.includes(cls))
        .join(' ');

      if (classesToAdd) {
        token.attrs[classIndex][1] = existingClasses + ' ' + classesToAdd;
      }
    }

    // Add the responsive wrapper div before the table
    return '<div class="table-responsive-md">' + originalTableRender(tokens, idx, options, env, self);
  };

  // Override table_close to close the wrapper div
  md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    // Close the table and add the closing div
    return originalTableCloseRender(tokens, idx, options, env, self) + '</div>';
  };

  /**
   * Custom template syntax rule for markdown-it
   * Processes template markers like [[template-type:arg1,arg2]] in markdown content
   * and converts them to tokens that can be processed by template renderers
   */
  md.inline.ruler.after('emphasis', 'templates', function templates_ruler(state, silent) {
    // Get the current parsing position
    var start = state.pos;

    // Check if we're at an escaped placeholder - if so, skip processing
    if (state.src.slice(start, start + ESCAPED_PLACEHOLDER.length) === ESCAPED_PLACEHOLDER) {
      return false;
    }

    // Check if we're at a template opening marker
    let prefix = state.src.slice(start, start + levels);
    if (prefix !== openString) return false;
    // Find the matching closing marker
    var indexOfClosingBrace = state.src.indexOf(closeString, start);

    if (indexOfClosingBrace > 0) {
      // Extract the template content using regex
      let match = contentRegex.exec(state.src.slice(start + levels, indexOfClosingBrace));
      if (!match) return false;

      // Get template type and find a matching template handler
      let type = match[1];
      let template = templates.find(t => t.filter(type) && t);
      if (!template) return false;

      // Parse template arguments (comma-separated)
      let args = match[2] ? match[2].trim().split(/\s*,+\s*/) : [];
      // Create a template token to be processed during rendering
      let token = state.push('template', '', 0);
      token.content = match[0];
      token.info = { type, template, args };

      // If the template has a parse function, use it to preprocess the token
      if (template.parse) {
        token.content = template.parse(token, type, ...args) || token.content;
      }

      // Advance the parser position past the template
      state.pos = indexOfClosingBrace + levels;
      return true;
    }

    return false;
  });

  /**
   * Renderer for template tokens
   * Takes template tokens created during parsing and renders them using their associated template handler
   */
  md.renderer.rules.template = function (tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let template = token.info.template;
    if (template.render) {
      return template.render(token, token.info.type, ...token.info.args) || (openString + token.content + closeString);
    }
    return token.content;
  }

  /**
   * Regular expression to extract domains and path segments from URLs
   * Used to add path-related attributes to links for styling and behavior
   */
  let pathSegmentRegex = /(?:http[s]*:\/\/([^\/]*)|(?:\/([^\/?]*)))/g;

  /**
   * Custom link_open renderer that adds path attributes for styling and behavior
   * Extracts domain and path segments from href attributes and adds them as path-X attributes
   */
  md.renderer.rules.link_open = function (tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let attrs = token.attrs.reduce((str, attr) => {
      let name = attr[0];
      let value = attr[1];
      if (name === 'href') {
        let index = 0;
        value.replace(pathSegmentRegex, (m, domain, seg) => {
          str += `path-${index++}="${domain || seg}"`;
        });
      }
      return str += name + '="' + value + '" ';
    }, '');
    let anchor = `<a ${attrs}>`;
    // Special handling for auto-detected links (linkify)
    return token.markup === 'linkify' ? anchor + '<span>' : anchor;
  }

  md.renderer.rules.link_close = function (tokens, idx, options, env, renderer) {
    return tokens[idx].markup === 'linkify' ? '</span></a>' : '</a>';
  }

  // Add class to <dl> and the last <dd> in each series after a <dt>
  const originalRender = md.renderer.rules.dl_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Variable to keep track of whether the class has been added to the first <dl> after the target HTML
  let classAdded = false;

  /**
   * Helper function to locate a specific marker in the token stream
   * Used to identify the terminology section in the document
   * 
   * @param {Array} tokens - The token array to search through
   * @param {String} targetHtml - The HTML string to look for in token content
   * @return {Number} The index of the token containing targetHtml, or -1 if not found
   */
  function findTargetIndex(tokens, targetHtml) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].content && tokens[i].content.includes(targetHtml)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Helper function to identify and mark empty definition term elements
   * Empty dt elements cause rendering and styling issues, so we mark them for special handling
   * 
   * @param {Array} tokens - The token array to process
   * @param {Number} startIdx - The index in the token array to start processing from
   */
  function markEmptyDtElements(tokens, startIdx) {
    for (let i = startIdx; i < tokens.length; i++) {
      if (tokens[i].type === 'dl_close') {
        break; // Stop when we reach the end of this definition list
      }

      // An empty dt element is one where dt_open is immediately followed by dt_close
      // with no content in between
      if (tokens[i].type === 'dt_open' &&
        i + 1 < tokens.length &&
        tokens[i + 1].type === 'dt_close') {
        // Mark both opening and closing tokens so they can be skipped during rendering
        tokens[i].isEmpty = true;
        tokens[i + 1].isEmpty = true;
      }
    }
  }


  /**
   * Helper function to process definition description elements
   * Identifies and marks the last dd element in each dt/dd group for special styling
   * 
   * @param {Array} tokens - The token array to process
   * @param {Number} startIdx - The index in the token array to start processing from
   */
  function processLastDdElements(tokens, startIdx) {
    let lastDdIndex = -1; // Tracks the most recent dd_open token

  }

  /**
   * Helper function to check if a definition list contains spec references
   * Spec references have dt elements with id attributes starting with "ref:"
   *
   * @param {Array} tokens - The token array to search through
   * @param {Number} startIdx - The index to start searching from (after dl_open)
   * @return {Boolean} True if the dl contains spec references, false otherwise
   */
  function containsSpecReferences(tokens, startIdx) {
    for (let i = startIdx; i < tokens.length; i++) {
      if (tokens[i].type === 'dl_close') {
        break; // Stop when we reach the end of this definition list
      }
      if (isDtRef(tokens[i])) {
        return true;
      }
      if (isHtmlRef(tokens[i])) {
        return true;
      }
      if (isInlineRef(tokens[i])) {
        return true;
      }
    }
    return false;
  }

  function isDtRef(token) {
    if (token.type !== 'dt_open' || !token.attrs) return false;
    return token.attrs.some(attr => attr[0] === 'id' && attr[1].startsWith('ref:'));
  }

  function isHtmlRef(token) {
    if (token.type !== 'html_block' && token.type !== 'html_inline') return false;
    return token.content && token.content.includes('id="ref:');
  }

  function isInlineRef(token) {
    if (token.type !== 'inline') return false;
    return token.content && token.content.includes('id="ref:');
  }

  /**
   * Custom renderer for definition list opening tags
   * Handles special styling for terminology sections and processes definition terms and descriptions
   * This function was refactored to reduce cognitive complexity by extracting helper functions
   * 
   * IMPORTANT FIX: This function now checks if a <dl> already has a class attribute OR contains
   * spec references (dt elements with id="ref:...") before adding the 'terms-and-definitions-list' 
   * class. This prevents spec reference lists from being incorrectly classified as term definition lists.
   * 
   * @param {Array} tokens - The token array being processed
   * @param {Number} idx - The index of the current token
   * @param {Object} options - Rendering options
   * @param {Object} env - Environment variables
   * @param {Object} self - Reference to the renderer
   * @return {String} The rendered HTML output
   */
  md.renderer.rules.dl_open = function (tokens, idx, options, env, self) {
    const targetHtml = 'terminology-section-start';
    let targetIndex = findTargetIndex(tokens, targetHtml);

    // Check if the dl already has a class attribute (e.g., reference-list)
    const existingClassIndex = tokens[idx].attrIndex('class');
    const hasExistingClass = existingClassIndex >= 0;

    // Check if this dl contains spec references (dt elements with id="ref:...")
    const hasSpecReferences = containsSpecReferences(tokens, idx + 1);

    // Only add terms-and-definitions-list class if:
    // 1. It comes after the target HTML
    // 2. We haven't added the class yet
    // 3. The dl doesn't already have a class (to avoid overriding reference-list)
    // 4. The dl doesn't contain spec references
    if (targetIndex !== -1 && idx > targetIndex && !classAdded && !hasExistingClass && !hasSpecReferences) {
      tokens[idx].attrPush(['class', 'terms-and-definitions-list']);
      classAdded = true;
    }

    // First pass - mark empty dt elements
    markEmptyDtElements(tokens, idx + 1);

    // Second pass - process last dd elements
    processLastDdElements(tokens, idx + 1);

    return originalRender(tokens, idx, options, env, self);
  };

  /**
   * Helper function to determine if a definition term is transcluded from another source
   * Transcluded terms require special styling and handling
   * 
   * @param {Array} tokens - The token array to process
   * @param {Number} dtOpenIndex - The index of the dt_open token to check
   * @return {Boolean} True if the term is transcluded, false otherwise
   */
  function isTermTranscluded(tokens, dtOpenIndex) {
    for (let i = dtOpenIndex + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'dt_close') {
        break; // Only examine tokens within this definition term
      }

      // Look for inline content that contains template tokens of type 'tref'
      // These are transcluded term references
      if (tokens[i].type === 'inline' && tokens[i].children) {
        for (let child of tokens[i].children) {
          if (child.type === 'template' &&
            child.info &&
            child.info.type === 'tref') {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Checks if a definition term is a legitimate local term (created by [[def:]])
   * @param {Array} tokens - The token array to process
   * @param {Number} dtOpenIndex - The index of the dt_open token to check
   * @return {Boolean} True if the term is a local definition, false otherwise
   */
  function isLocalTerm(tokens, dtOpenIndex) {
    for (let i = dtOpenIndex + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'dt_close') {
        break; // Only examine tokens within this definition term
      }

      // Look for inline content that contains template tokens of type 'def'
      // These are local definition terms
      if (tokens[i].type === 'inline' && tokens[i].children) {
        for (let child of tokens[i].children) {
          if (child.type === 'template' &&
            child.info &&
            child.info.type === 'def') {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Override the rendering of dt elements to properly handle transcluded terms
  const originalDtRender = md.renderer.rules.dt_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  /**
   * Custom renderer for definition term opening tags
   * Handles special cases like empty terms and transcluded terms
   * 
   * @param {Array} tokens - The token array being processed
   * @param {Number} idx - The index of the current token
   * @param {Object} options - Rendering options
   * @param {Object} env - Environment variables
   * @param {Object} self - Reference to the renderer
   * @return {String} The rendered HTML output or empty string for skipped elements
   */
  md.renderer.rules.dt_open = function (tokens, idx, options, env, self) {
    // Skip rendering empty dt elements that were marked during preprocessing
    if (tokens[idx].isEmpty) {
      return '';
    }

    // Check if this dt is part of a transcluded term and add appropriate class
    if (isTermTranscluded(tokens, idx)) {
      const classIndex = tokens[idx].attrIndex('class');
      if (classIndex < 0) {
        tokens[idx].attrPush(['class', 'term-external']);
      } else {
        tokens[idx].attrs[classIndex][1] += ' term-external';
      }
    } else if (isLocalTerm(tokens, idx)) {
      // For local terms (defs), add the term-local class
      const classIndex = tokens[idx].attrIndex('class');
      if (classIndex < 0) {
        tokens[idx].attrPush(['class', 'term-local']);
      } else {
        tokens[idx].attrs[classIndex][1] += ' term-local';
      }
    }
    // If neither transcluded nor a local term, don't add any special classes

    return originalDtRender(tokens, idx, options, env, self);
  };

  // Similarly override dt_close to skip empty dts
  const originalDtCloseRender = md.renderer.rules.dt_close || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  /**
   * Custom renderer for definition term closing tags
   * Ensures empty terms are not rendered in the final output
   * 
   * @param {Array} tokens - The token array being processed
   * @param {Number} idx - The index of the current token
   * @param {Object} options - Rendering options
   * @param {Object} env - Environment variables
   * @param {Object} self - Reference to the renderer
   * @return {String} The rendered HTML output or empty string for skipped elements
   */
  md.renderer.rules.dt_close = function (tokens, idx, options, env, self) {
    // Skip rendering the closing </dt> tag for empty dt elements
    // This completes the fix for empty dt elements by ensuring neither
    // the opening nor closing tags are rendered
    if (tokens[idx].isEmpty) {
      return '';
    }
    return originalDtCloseRender(tokens, idx, options, env, self);
  };
};