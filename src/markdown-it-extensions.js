'use strict';

const levels = 2;
const openString = '['.repeat(levels);
const closeString = ']'.repeat(levels);
const contentRegex = /\s*([^\s\[\]:]+):?\s*([^\]\n]+)?/i;

module.exports = function (md, templates = {}) {

  md.inline.ruler.after('emphasis', 'templates', function templates_ruler(state, silent) {

    var start = state.pos;
    let prefix = state.src.slice(start, start + levels);
    if (prefix !== openString) return false;
    var indexOfClosingBrace = state.src.indexOf(closeString, start);

    if (indexOfClosingBrace > 0) {

      let match = contentRegex.exec(state.src.slice(start + levels, indexOfClosingBrace));
      if (!match) return false;

      let type = match[1];
      let template = templates.find(t => t.filter(type) && t);
      if (!template) return false;

      let args = match[2] ? match[2].trim().split(/\s*,+\s*/) : [];
      let token = state.push('template', '', 0);
      token.content = match[0];
      token.info = { type, template, args };
      if (template.parse) {
        token.content = template.parse(token, type, ...args) || token.content;
      }

      state.pos = indexOfClosingBrace + levels;
      return true;
    }

    return false;
  });

  md.renderer.rules.template = function (tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let template = token.info.template;
    if (template.render) {
      return template.render(token, token.info.type, ...token.info.args) || (openString + token.content + closeString);
    }
    return token.content;
  }

  let pathSegmentRegex = /(?:http[s]*:\/\/([^\/]*)|(?:\/([^\/?]*)))/g;
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

  md.renderer.rules.dl_open = function (tokens, idx, options, env, self) {

    const targetHtml = 'terminology-section-start-h7vc6omi2hr2880';
    let targetIndex = -1;

    // Find the index of the target HTML
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].content && tokens[i].content.includes(targetHtml)) {
        targetIndex = i;
        break;
      }
    }

    // Add class to the first <dl> only if it comes after the target HTML
    if (targetIndex !== -1 && idx > targetIndex && !classAdded) {
      tokens[idx].attrPush(['class', 'terms-and-definitions-list']);
      classAdded = true;

      /* Sort terms and definitions alphabetically
      Sort dt/dd pairs case-insensitively based on dt content

      1: Token-based Markdown Processing: Spec-Up-T uses a token-based approach to parse and render Markdown. When Markdown is processed, it's converted into a series of tokens that represent different elements (like dt_open, dt_content, dt_close, dd_open, dd_content, dd_close). We're not dealing with simple strings but with structured tokens.

      2: Preserving Relationships: When sorting terms, we need to ensure that each definition term (<dt>) stays connected to its corresponding definition description (<dd>). It's not as simple as sorting an array of strings - we're sorting complex structures.

      3: Implementation Details: The implementation includes:

      - Finding the terminology section in the document
      - Collecting term starts, ends, and their contents
      - Creating a sorted index based on case-insensitive comparisons
      - Rebuilding the token array in the correct order
      - Ensuring all relationships between terms and definitions are preserved
      - Handling special cases and edge conditions

      The complexity is unavoidable because:

      - We're working with the markdown-it rendering pipeline, not just manipulating DOM
      - The terms and definitions exist as tokens before they become HTML
      - We need to preserve all the token relationships while reordering
      - We're intercepting the rendering process to modify the token structure

      If we were just sorting DOM elements after the page rendered, it would be simpler. But by doing the sorting during the Markdown processing, we ensure the HTML output is correct from the beginning, which is more efficient and leads to better performance.
      */
      let dtStartIndices = [];
      let dtEndIndices = [];
      let dtContents = [];

      // First pass: collect all dt blocks and their contents
      for (let i = idx + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'dl_close') {
          break;
        }
        if (tokens[i].type === 'dt_open') {
          const startIdx = i;
          let content = '';

          // Find the end of this dt block and capture its content
          for (let j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === 'dt_close') {
              dtStartIndices.push(startIdx);
              dtEndIndices.push(j);
              dtContents.push(content.toLowerCase()); // Store lowercase for case-insensitive sorting
              break;
            }
            // Collect the content inside the dt (including spans with term IDs)
            if (tokens[j].content) {
              content += tokens[j].content;
            }
          }
        }
      }

      // Create indices sorted by case-insensitive term content
      const sortedIndices = dtContents.map((_, idx) => idx)
        .sort((a, b) => dtContents[a].localeCompare(dtContents[b]));

      // Reorder the tokens based on the sorted indices
      if (sortedIndices.length > 0) {
        // Create a new array of tokens
        const newTokens = tokens.slice(0, idx + 1); // Include dl_open

        // For each dt/dd pair in sorted order
        for (let i = 0; i < sortedIndices.length; i++) {
          const originalIndex = sortedIndices[i];
          const dtStart = dtStartIndices[originalIndex];
          const dtEnd = dtEndIndices[originalIndex];

          // Add dt tokens
          for (let j = dtStart; j <= dtEnd; j++) {
            newTokens.push(tokens[j]);
          }

          // Find and add dd tokens
          let ddFound = false;
          for (let j = dtEnd + 1; j < tokens.length; j++) {
            if (tokens[j].type === 'dt_open' || tokens[j].type === 'dl_close') {
              break;
            }
            if (tokens[j].type === 'dd_open') {
              ddFound = true;
            }
            if (ddFound) {
              newTokens.push(tokens[j]);
              if (tokens[j].type === 'dd_close') {
                break;
              }
            }
          }
        }

        // Add the closing dl token
        for (let i = idx + 1; i < tokens.length; i++) {
          if (tokens[i].type === 'dl_close') {
            newTokens.push(tokens[i]);
            break;
          }
        }

        // Replace the old tokens with the new sorted ones
        tokens.splice(idx, newTokens.length, ...newTokens);
      }
      // END Sort terms and definitions alphabetically
    }

    let lastDdIndex = -1;

    for (let i = idx + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'dl_close') {
        // Add class to the last <dd> before closing <dl>
        if (lastDdIndex !== -1) {
          const ddToken = tokens[lastDdIndex];
          const classIndex = ddToken.attrIndex('class');
          if (classIndex < 0) {
            ddToken.attrPush(['class', 'last-dd']);
          } else {
            ddToken.attrs[classIndex][1] += ' last-dd';
          }
        }
        break;
      }

      if (tokens[i].type === 'dt_open') {
        // Add class to the last <dd> before a new <dt>
        if (lastDdIndex !== -1) {
          const ddToken = tokens[lastDdIndex];
          const classIndex = ddToken.attrIndex('class');
          if (classIndex < 0) {
            ddToken.attrPush(['class', 'last-dd']);
          } else {
            ddToken.attrs[classIndex][1] += ' last-dd';
          }
          lastDdIndex = -1; // Reset for the next series
        }
      }

      if (tokens[i].type === 'dd_open') {
        lastDdIndex = i;
      }
    }

    return originalRender(tokens, idx, options, env, self);
  };
};