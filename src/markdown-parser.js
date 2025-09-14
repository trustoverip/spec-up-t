/**
 * Configures and exports a fully set up markdown-it instance.
 * This module integrates custom extensions, plugins, and related constants.
 * It centralizes markdown parsing setup to reduce complexity in index.js.
 */

const MarkdownIt = require('markdown-it');
const containers = require('markdown-it-container');
const path = require('path');
const fs = require('fs-extra');
const findPkgDir = require('find-pkg-dir');

const { configurePlugins } = require('./markdown-it/plugins');
const { findExternalSpecByKey } = require('./references');
const { lookupXrefTerm, renderRefGroup } = require('./render-utils');

// Constants used in markdown parsing
const noticeTypes = {
  note: 1,
  issue: 1,
  example: 1,
  warning: 1,
  todo: 1
};
const spaceRegex = /\s+/g;
const specNameRegex = /^spec$|^spec-*\w+$/i;
const terminologyRegex = /^def$|^ref$|^xref|^tref$/i;

// Load spec corpus
const modulePath = findPkgDir(__dirname);
const specCorpus = fs.readJsonSync(path.join(modulePath, 'assets/compiled/refs.json'));

// Global variables (shared across renders)
let definitions = global.definitions;
let references = global.references;
let specGroups = global.specGroups;
let noticeTitles = global.noticeTitles;

/**
 * Creates and configures a markdown-it instance with extensions and plugins.
 * @param {Object} config - Configuration object (e.g., for anchor symbol).
 * @param {Function} setToc - Function to set the table of contents HTML.
 * @returns {Object} The configured markdown-it instance.
 */
function createMarkdownParser(config, setToc) {
  let md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })
    .use(require('./markdown-it-extensions.js'), [
      /*
        The first extension focuses on terminology-related constructs.
      */
      {
        filter: type => type.match(terminologyRegex),
        parse(token, type, primary) {
          if (!primary) return;
          if (type === 'def') {
            global.definitions.push(token.info.args);
            return token.info.args.reduce((acc, syn) => {
              return `<span id="term:${syn.replace(spaceRegex, '-').toLowerCase()}">${acc}</span>`;
            }, primary);
          }
          else if (type === 'xref') {
            const externalSpec = findExternalSpecByKey(config, token.info.args[0]);
            const url = externalSpec?.gh_page || '#';
            const termName = token.info.args[1];
            const term = termName.replace(spaceRegex, '-').toLowerCase();
            const xrefTerm = lookupXrefTerm(token.info.args[0], term);
            let linkAttributes = `class="x-term-reference term-reference" data-local-href="#term:${token.info.args[0]}:${term}" href="${url}#term:${term}"`;
            if (xrefTerm && xrefTerm.content) {
              const cleanContent = xrefTerm.content.replace(/"/g, '&quot;').replace(/\n/g, ' ');
              linkAttributes += ` title="External term definition" data-term-content="${cleanContent}"`;
            }
            return `<a ${linkAttributes}>${termName}</a>`;
          }
          else if (type === 'tref') {
            const termName = token.info.args[1];
            const alias = token.info.args[2];
            const publishedTermName = alias ? alias : termName;
            const termId = `term:${termName.replace(spaceRegex, '-').toLowerCase()}`;
            const aliasId = alias ? `term:${alias.replace(spaceRegex, '-').toLowerCase()}` : '';
            if (aliasId && alias !== termName) {
              return `<span data-original-term="${termName}" class="term-external" id="${termId}"><span title="Externally defined as ${termName}" id="${aliasId}">${publishedTermName}</span></span>`;
            } else {
              return `<span title="Externally also defined as ${termName}" data-original-term="${termName}" class="term-external" id="${termId}">${publishedTermName}</span>`;
            }
          }
          else {
            global.references.push(primary);
            return `<a class="term-reference" href="#term:${primary.replace(spaceRegex, '-').toLowerCase()}">${primary}</a>`;
          }
        }
      },
      /*
        The second extension handles specification references.
      */
      {
        filter: type => type.match(specNameRegex),
        parse(token, type, name) {
          if (name) {
            let _name = name.replace(spaceRegex, '-').toUpperCase();
            let spec = specCorpus[_name] ||
              specCorpus[_name.toLowerCase()] ||
              specCorpus[name.toLowerCase()] ||
              specCorpus[name];
            if (spec) {
              spec._name = _name;
              let group = global.specGroups[type] = global.specGroups[type] || {};
              token.info.spec = group[_name] = spec;
            }
          }
        },
        render(token, type, name) {
          if (name) {
            let spec = token.info.spec;
            if (spec) return `[<a class="spec-reference" href="#ref:${spec._name}">${spec._name}</a>]`;
          }
          else return renderRefGroup(type, global.specGroups);
        }
      }
    ]);

  md = configurePlugins(md, config, containers, noticeTypes, global.noticeTitles, setToc);

  return md;
}

module.exports = { createMarkdownParser, noticeTypes, spaceRegex, specNameRegex, terminologyRegex, specCorpus, definitions, references, specGroups, noticeTitles };