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

  // // Override the default `dd_open` renderer
  // md.renderer.rules.dd_open = (tokens, idx, options, env, self) => {
  //   // Get the next token (the content inside the <dd>)
  //   const contentToken = tokens[idx + 1];
    
  //   if (contentToken.tag === 'p') {
  //     return '<dd>';
  //   }

  //   if (contentToken.tag === 'table') {
  //     return '<dd class="contains-table">';
  //   }

  //   // Default behavior
  //   return '';
  // };

  // // Override the default `dd_close` renderer
  // md.renderer.rules.dd_close = (tokens, idx, options, env, self) => {
  //   // Get the previous token (the content inside the <dd>)
  //   const contentToken = tokens[idx - 1];

  //   if (contentToken.tag === 'p') {
  //     return '</dd>';
  //   }

  //   // Default behavior
  //   return '';
  // };
};