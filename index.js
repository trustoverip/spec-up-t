const { initialize } = require('./src/init');
const Logger = require('./src/utils/logger');

module.exports = async function (options = {}) {
  try {
    const { initializeConfig } = require('./src/config-init');
    let toc = '';
    global.toc = '';
    const setToc = (html) => { toc = html || ''; global.toc = toc; };
    let {
      config,
      externalSpecsList,
      template,
      assets,
      externalReferences,
      references,
      definitions,
      specGroups,
      noticeTitles
    } = await initializeConfig(options);

    const fs = require('fs-extra');
    const path = require('path');
    const gulp = require('gulp');

    const {
      fetchExternalSpecs,
      validateReferences,
      findExternalSpecByKey,
      mergeXrefTermsIntoAllXTrefs
    } = require('./src/references.js');

    const { processWithEscapes } = require('./src/escape-handler.js');
    const { processEscapedTags, restoreEscapedTags } = require('./src/escape-mechanism.js');
    const { sortDefinitionTermsInHtml, fixDefinitionListStructure } = require('./src/html-dom-processor.js');
    const { getGithubRepoInfo } = require('./src/utils/git-info.js');

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
    const findPkgDir = require('find-pkg-dir');
    const modulePath = findPkgDir(__dirname);
    const specCorpus = fs.readJsonSync(modulePath + '/assets/compiled/refs.json');
    const containers = require('markdown-it-container');
    const { configurePlugins } = require('./src/markdown-it/plugins');
    const {
      katexRules,
      replacerRegex,
      replacerArgsRegex,
      replacers,
      createScriptElementWithXTrefDataForEmbeddingInHtml,
      lookupXrefTerm,
      applyReplacers,
      normalizePath,
      renderRefGroup,
      findKatexDist
    } = require('./src/render-utils');

    /* 
    `const md` is assigned an instance of the markdown-it parser configured with various plugins and extensions. This instance (md) is intended to be used later to parse and render Markdown strings.
    
    The md function (which is an instance of the markdown-it parser) takes a Markdown string as its primary argument. It is called elsewhere as follows: `md.render(doc)`
    */
    let md = require('markdown-it')({
      html: true,
      linkify: true,
      typographer: true
    })
      /*
        Configures a Markdown-it plugin by passing it an array of extension objects, each responsible for handling specific custom syntax in Markdown documents.
      */
      .use(require('./src/markdown-it-extensions.js'), [
        /*
          The first extension (= the first configuration object = the first element of the array) focuses on terminology-related constructs, using a filter to match types against a regular expression (terminologyRegex).
        */
        {
          filter: type => type.match(terminologyRegex),
          parse(token, type, primary) {
            if (!primary) return;
            if (type === 'def') {
              definitions.push(token.info.args);
              return token.info.args.reduce((acc, syn) => {
                return `<span id="term:${syn.replace(spaceRegex, '-').toLowerCase()}">${acc}</span>`;
              }, primary);
            }
            else if (type === 'xref') {
              // Get the URL for the external specification reference, or default to '#' if not found
              const externalSpec = findExternalSpecByKey(config, token.info.args[0]);
              const url = externalSpec?.gh_page || '#';
              
              const termName = token.info.args[1];
              const term = termName.replace(spaceRegex, '-').toLowerCase();
              
              // Look up the term content from allXTrefs data
              const xrefTerm = lookupXrefTerm(token.info.args[0], term);
              
              // Create link with optional tooltip data from allXTrefs
              let linkAttributes = `class="x-term-reference term-reference" data-local-href="#term:${token.info.args[0]}:${term}" href="${url}#term:${term}"`;
              
              if (xrefTerm && xrefTerm.content) {
                // Add tooltip data if term content is available
                const cleanContent = xrefTerm.content.replace(/"/g, '&quot;').replace(/\n/g, ' ');
                linkAttributes += ` title="External term definition" data-term-content="${cleanContent}"`;
              }
              
              return `<a ${linkAttributes}>${termName}</a>`;
            }
            else if (type === 'tref') {
              // Support tref with optional alias: [[tref: spec, term, alias]]
              const termName = token.info.args[1];
              const alias = token.info.args[2]; // Optional alias
              const publishedTermName = alias ? alias : termName;

              // Create IDs for both the original term and the alias to enable referencing by either
              const termId = `term:${termName.replace(spaceRegex, '-').toLowerCase()}`;
              const aliasId = alias ? `term:${alias.replace(spaceRegex, '-').toLowerCase()}` : '';
              
              // Return the term structure similar to def, so it can be processed by markdown-it's definition list parser
              if (aliasId && alias !== termName) {
                return `<span data-original-term="${termName}" class="term-external" id="${termId}"><span title="Externally defined as ${termName}" id="${aliasId}">${publishedTermName}</span></span>`;
              } else {
                return `<span title="Externally also defined as ${termName}" data-original-term="${termName}" class="term-external" id="${termId}">${publishedTermName}</span>`;
              }
            }
            else {
              references.push(primary);
              return `<a class="term-reference" href="#term:${primary.replace(spaceRegex, '-').toLowerCase()}">${primary}</a>`;
            }
          }
        },
        /*        
          The second extension is designed for handling specification references.
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
                let group = specGroups[type] = specGroups[type] || {};
                token.info.spec = group[_name] = spec;
              }
            }
          },
          render(token, type, name) {
            if (name) {
              let spec = token.info.spec;
              if (spec) return `[<a class="spec-reference" href="#ref:${spec._name}">${spec._name}</a>]`;
            }
            else return renderRefGroup(type, specGroups);
          }
        }
      ])
    ;

    md = configurePlugins(md, config, containers, noticeTypes, noticeTitles, setToc);

    const xtrefsData = createScriptElementWithXTrefDataForEmbeddingInHtml();

    const { render } = require('./src/renderer');

    try {
      config.specs.forEach(spec => {
        spec.spec_directory = normalizePath(spec.spec_directory);
        spec.destination = normalizePath(spec.output_path || spec.spec_directory);

        if (!fs.existsSync(spec.destination)) {
          try {
            fs.mkdirSync(spec.destination, { recursive: true });
            Logger.success(`Created directory: ${spec.destination}`);
          } catch (error) {
            Logger.error(`Failed to create directory ${spec.destination}: ${error.message}`);
            throw error;
          }
        } else {
          Logger.info(`Directory already exists: ${spec.destination}`);
        }

        try {
          fs.ensureDirSync(spec.destination);
          Logger.success(`Ensured directory is ready: ${spec.destination}`);
        } catch (error) {
          Logger.error(`Failed to ensure directory ${spec.destination}: ${error.message}`);
          throw error;
        }

        let assetTags = {
          svg: fs.readFileSync(modulePath + '/assets/icons.svg', 'utf8') || ''
        };

        let customAssets = (spec.assets || []).reduce((assets, asset) => {
          let ext = asset.path.split('.').pop();
          if (ext === 'css') {
            assets.css += `<link href="${asset.path}" rel="stylesheet"/>`;
          }
          if (ext === 'js') {
            assets.js[asset.inject || 'body'] += `<script src="${asset.path}" ${asset.module ? 'type="module"' : ''} ></script>`;
          }
          return assets;
        }, {
          css: '',
          js: { head: '', body: '' }
        });

        if (options.dev) {
          assetTags.head = assets.head.css.map(_path => `<link href="${_path}" rel="stylesheet"/>`).join('') +
            customAssets.css +
            assets.head.js.map(_path => `<script src="${_path}"></script>`).join('') +
            customAssets.js.head;
          assetTags.body = assets.body.js.map(_path => `<script src="${_path}" data-manual></script>`).join('') +
            customAssets.js.body;
        }
        else {
          assetTags.head = `
          <style>${fs.readFileSync(modulePath + '/assets/compiled/head.css', 'utf8')}</style>
          ${customAssets.css}
          <script>${fs.readFileSync(modulePath + '/assets/compiled/head.js', 'utf8')}</script>
          ${customAssets.js.head}
        `;
          assetTags.body = `<script>${fs.readFileSync(modulePath + '/assets/compiled/body.js', 'utf8')}</script>
          ${customAssets.js.body}`;
        }

        if (spec.katex) {
          const katexDist = findKatexDist();
          assetTags.body += `<script>/* katex */${fs.readFileSync(path.join(katexDist, 'katex.min.js'),
            'utf8')}</script>`;
          assetTags.body += `<style>/* katex */${fs.readFileSync(path.join(katexDist, 'katex.min.css'),
            'utf8')}</style>`;

          fs.copySync(path.join(katexDist, 'fonts'), path.join(spec.destination, 'fonts'));
        }

        // Run render and wait for it
        render(spec, assetTags, { externalReferences, references, definitions, specGroups, noticeTitles }, config, template, assets, Logger, md, externalSpecsList)
          .then(() => {
            Logger.info('Render completed for:', spec.destination);
            if (options.nowatch) {
              Logger.info('Exiting with nowatch');
              process.exit(0);
            }
          })
          .catch((e) => {
            Logger.error('Render failed:', e.message);
            process.exit(1);
          });

        if (!options.nowatch) {
          gulp.watch(
            [spec.spec_directory + '**/*', '!' + path.join(spec.destination, 'index.html')],
            render.bind(null, spec, assetTags, { externalReferences, references, definitions, specGroups, noticeTitles }, config, template, assets, Logger, md, externalSpecsList)
          );
        }

      });
    } catch (error) {
      Logger.error(`Error during initialization or module execution: ${error.message}`);
      throw error; // Re-throw to let the caller handle the error
    }
  } catch (error) {
    Logger.error(`Error during initialization: ${error.message}`);
    throw error; // Re-throw to let the caller handle the error
  }
};
