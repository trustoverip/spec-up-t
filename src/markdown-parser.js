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
const { createTerminologyParser, createSpecParser } = require('./parsers');
const { renderRefGroup } = require('./render-utils');
const { whitespace, templateTags } = require('./utils/regex-patterns');

// Constants used in markdown parsing
const noticeTypes = {
  note: 1,
  issue: 1,
  example: 1,
  warning: 1,
  todo: 1
};
// Domain-specific regex patterns for markdown parsing (now centralized)
const specNameRegex = templateTags.specName;
const terminologyRegex = templateTags.terminology;

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
  // Create parser functions with bound dependencies - cleaner than classes
  const terminologyParser = createTerminologyParser(config, global);
  const specParser = createSpecParser(specCorpus, global);

  let md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })
    .use(require('./markdown-it-extensions.js'), [
      /*
        The first extension focuses on terminology-related constructs.
        All complex logic is now delegated to pure functions.
      */
      {
        filter: type => type.match(terminologyRegex),
        parse: (token, type, primary) => terminologyParser(token, type, primary)
      },
      /*
        The second extension handles specification references.
        All complex logic is now delegated to pure functions.
      */
      {
        filter: type => type.match(specNameRegex),
        parse: (token, type, name) => specParser.parseSpecReference(token, type, name),
        render: (token, type, name) => specParser.renderSpecReference(token, type, name)
      }
    ]);

  md = configurePlugins(md, config, containers, noticeTypes, global.noticeTitles, setToc);

  return md;
}

module.exports = { 
  createMarkdownParser, 
  noticeTypes, 
  spaceRegex: whitespace.oneOrMore, 
  specNameRegex, 
  terminologyRegex, 
  specCorpus, 
  definitions, 
  references, 
  specGroups, 
  noticeTitles,
  // Export parsers for direct access if needed
  createTerminologyParser,
  createSpecParser
};