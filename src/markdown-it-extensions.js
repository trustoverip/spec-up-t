'use strict';

const levels = 2;
const openString = '['.repeat(levels);
const closeString = ']'.repeat(levels);
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
    return '<div class="table-responsive">' + originalTableRender(tokens, idx, options, env, self);
  };

  // Override table_close to close the wrapper div
  md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    // Close the table and add the closing div
    return originalTableCloseRender(tokens, idx, options, env, self) + '</div>';
  };

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
    }

    let lastDdIndex = -1;
    let currentDtIndex = -1; // Track current dt to detect empty dt elements

    // First pass - check for and mark empty dt elements
    // This scan identifies definition terms that have no content (empty dt elements)
    // which is one of the root causes of the issues we're fixing
    for (let i = idx + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'dl_close') {
        break;
      }
      
      if (tokens[i].type === 'dt_open') {
        currentDtIndex = i;
        // Check if this is an empty dt (no content between dt_open and dt_close)
        // An empty dt is when a dt_close token immediately follows a dt_open token
        if (i + 1 < tokens.length && tokens[i + 1].type === 'dt_close') {
          // Mark this dt pair for handling by adding an isEmpty property
          // This property will be used later to skip rendering these empty elements
          tokens[i].isEmpty = true;
          tokens[i + 1].isEmpty = true;
        }
      }
    }

    // Second pass - add classes and handle last-dd
    // Now that we've identified empty dt elements, we can process the tokens
    // while skipping the empty ones
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
        // Skip empty dt elements - this is where we use the isEmpty flag
        // to avoid processing empty definition terms
        if (tokens[i].isEmpty) {
          continue; // Skip to the next iteration without processing this empty dt
        }
        
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
  
  // Override the rendering of dt elements to properly handle transcluded terms
  const originalDtRender = md.renderer.rules.dt_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.dt_open = function (tokens, idx, options, env, self) {
    // Skip rendering empty dt elements - this is the first critical fix
    // When a dt has been marked as empty, we return an empty string
    // instead of rendering the <dt> tag. This effectively removes empty dt tags
    // from the output HTML.
    if (tokens[idx].isEmpty) {
      return '';
    }
    
    // Check if this dt is part of a transcluded term by looking at the next inline token
    // This is part of the second fix, to properly handle transcluded terms
    let isTranscluded = false;
    for (let i = idx + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'dt_close') {
        break;
      }
      // Look for child tokens that are template tokens with type 'tref'
      // These represent transcluded terms from external sources
      if (tokens[i].type === 'inline' && 
          tokens[i].children && 
          tokens[i].children.some(child => 
            child.type === 'template' && 
            child.info && 
            child.info.type === 'tref')) {
        isTranscluded = true;
        break;
      }
    }
    
    // Add a class for transcluded terms to ensure proper styling
    // This helps maintain consistent styling for transcluded terms
    if (isTranscluded) {
      const classIndex = tokens[idx].attrIndex('class');
      if (classIndex < 0) {
        tokens[idx].attrPush(['class', 'transcluded-xref-term']);
      } else {
        tokens[idx].attrs[classIndex][1] += ' transcluded-xref-term';
      }
    }
    
    return originalDtRender(tokens, idx, options, env, self);
  };
  
  // Similarly override dt_close to skip empty dts
  const originalDtCloseRender = md.renderer.rules.dt_close || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
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