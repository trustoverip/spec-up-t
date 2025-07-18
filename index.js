const { initialize } = require('./src/init');

module.exports = async function (options = {}) {
  try {
    await initialize();

    const fs = require('fs-extra');
    const path = require('path');
    const gulp = require('gulp');

    const {
      fetchExternalSpecs,
      validateReferences,
      findExternalSpecByKey
    } = require('./src/references.js');

    const { runJsonKeyValidatorSync } = require('./src/json-key-validator.js');
    runJsonKeyValidatorSync();

    const { createTermIndex } = require('./src/create-term-index.js');
    createTermIndex();

    const { processWithEscapes } = require('./src/escape-handler.js');

    const { insertTermIndex } = require('./src/insert-term-index.js');
    insertTermIndex();

    const findPkgDir = require('find-pkg-dir');
    const modulePath = findPkgDir(__dirname);
    let config = fs.readJsonSync('./.cache/specs-generated.json');

    const createExternalSpecsList = require('./src/create-external-specs-list.js');

    const externalSpecsList = createExternalSpecsList(config);

    const createVersionsIndex = require('./src/create-versions-index.js');
    createVersionsIndex(config.specs[0].output_path);

    const { fixMarkdownFiles } = require('./src/fix-markdown-files.js');
    const { processEscapedTags, restoreEscapedTags } = require('./src/escape-mechanism.js');
    const { sortDefinitionTermsInHtml, fixDefinitionListStructure } = require('./src/html-dom-processor.js');

    let template = fs.readFileSync(path.join(modulePath, 'templates/template.html'), 'utf8');
    let assets = fs.readJsonSync(modulePath + '/config/asset-map.json');
    let externalReferences;
    let references = [];
    let definitions = [];
    let toc;
    let specGroups = {};
    let noticeTitles = {};

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
    const specCorpus = fs.readJsonSync(modulePath + '/assets/compiled/refs.json');
    const containers = require('markdown-it-container');

    /* 
    `const md` is assigned an instance of the markdown-it parser configured with various plugins and extensions. This instance (md) is intended to be used later to parse and render Markdown strings.
    
    The md function (which is an instance of the markdown-it parser) takes a Markdown string as its primary argument. It is called elsewhere as follows: `md.render(doc)`
    */
    const md = require('markdown-it')({
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

              const term = token.info.args[1].replace(spaceRegex, '-').toLowerCase();
              return `<a class="x-term-reference term-reference" data-local-href="#term:${token.info.args[0]}:${term}"
              href="${url}#term:${term}">${token.info.args[1]}</a>`;
            }
            else if (type === 'tref') {
              // Support tref with optional alias: [[tref: spec, term, alias]]
              const termName = token.info.args[1];
              const alias = token.info.args[2]; // Optional alias
              
              // Create IDs for both the original term and the alias to enable referencing by either
              const termId = `term:${termName.replace(spaceRegex, '-').toLowerCase()}`;
              const aliasId = alias ? `term:${alias.replace(spaceRegex, '-').toLowerCase()}` : '';
              
              // Always display the original term name, but create additional ID for alias if provided
              if (aliasId && alias !== termName) {
                return `<span class="transcluded-xref-term" id="${termId}"><span id="${aliasId}">${termName}</span></span>`;
              } else {
                return `<span class="transcluded-xref-term" id="${termId}">${termName}</span>`;
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
            else return renderRefGroup(type);
          }
        }
      ])
      .use(require('markdown-it-attrs'))
      .use(require('markdown-it-chart').default)
      .use(require('markdown-it-deflist'))
      .use(require('markdown-it-references'))
      .use(require('markdown-it-icons').default, 'font-awesome')
      .use(require('markdown-it-ins'))
      .use(require('markdown-it-mark'))
      .use(require('markdown-it-textual-uml'))
      .use(require('markdown-it-sub'))
      .use(require('markdown-it-sup'))
      .use(require('markdown-it-task-lists'))
      .use(require('markdown-it-multimd-table'), {
        multiline: true,
        rowspan: true,
        headerless: true
      })
      .use(containers, 'notice', {
        validate: function (params) {
          let matches = params.match(/(\w+)\s?(.*)?/);
          return matches && noticeTypes[matches[1]];
        },
        render: function (tokens, idx) {
          let matches = tokens[idx].info.match(/(\w+)\s?(.*)?/);
          if (matches && tokens[idx].nesting === 1) {
            let id;
            let type = matches[1];
            if (matches[2]) {
              id = matches[2].trim().replace(/\s+/g, '-').toLowerCase();
              if (noticeTitles[id]) id += '-' + noticeTitles[id]++;
              else noticeTitles[id] = 1;
            }
            else id = type + '-' + noticeTypes[type]++;
            return `<div id="${id}" class="notice ${type}"><a class="notice-link" href="#${id}">${type.toUpperCase()}</a>`;
          }
          else return '</div>\n';
        }
      })
      .use(require('markdown-it-prism'))
      .use(require('markdown-it-toc-and-anchor').default, {
        tocClassName: 'toc',
        tocFirstLevel: 2,
        tocLastLevel: 4,
        tocCallback: (_md, _tokens, html) => toc = html,
        anchorLinkSymbol: '#', // was: §
        anchorClassName: 'toc-anchor d-print-none'
      })
      .use(require('@traptitech/markdown-it-katex'))

    const katexRules = ['math_block', 'math_inline'];
    const replacerRegex = /\[\[\s*([^\s[\]:]+):?\s*([^\]\n]+)?\]\]/img;
    const replacerArgsRegex = /\s*,+\s*/;
    const replacers = [
      {
        test: 'insert',
        transform: function (originalMatch, type, path) {
          if (!path) return '';
          return fs.readFileSync(path, 'utf8');
        }
      },

      /**
       * Custom replacer for tref tags that converts them directly to HTML definition term elements.
       * 
       * This is a critical part of our solution for fixing transcluded terms in definition lists.
       * When a [[tref:spec,term]] or [[tref:spec,term,alias]] tag is found in the markdown, 
       * this replacer transforms it into a proper <dt> element with the appropriate structure 
       * before the markdown parser processes it.
       * 
       * By directly generating the HTML structure (instead of letting the markdown-it parser
       * handle it later), we prevent the issue where transcluded terms break the definition list.
       * 
       * @param {string} originalMatch - The original [[tref:spec,term]] or [[tref:spec,term,alias]] tag found in the markdown
       * @param {string} type - The tag type ('tref')
       * @param {string} spec - The specification identifier (e.g., 'wot-1')
       * @param {string} term - The term to transclude (e.g., 'DAR')
       * @param {string} alias - Optional alias for the term (e.g., 'nti')
       * @returns {string} - HTML representation of the term as a dt element
       */
      {
        test: 'tref',
        transform: function (originalMatch, type, spec, term, alias) {
          // Always display the original term name, not the alias
          const displayName = term;
          const termId = `term:${term.replace(/\s+/g, '-').toLowerCase()}`;
          const aliasId = alias ? `term:${alias.replace(/\s+/g, '-').toLowerCase()}` : '';
          
          // Create HTML with both IDs if alias is provided
          if (alias && alias !== term) {
            return `<dt class="transcluded-xref-term"><span class="transcluded-xref-term" id="${termId}"><span id="${aliasId}">${displayName}</span></span></dt>`;
          } else {
            return `<dt class="transcluded-xref-term"><span class="transcluded-xref-term" id="${termId}">${displayName}</span></dt>`;
          }
        }
      }
    ];

    // Synchronously process markdown files
    fixMarkdownFiles(path.join(config.specs[0].spec_directory, config.specs[0].spec_terms_directory));

    function createScriptElementWithXTrefDataForEmbeddingInHtml() {
      // Test if xtrefs-data.js exists, else make it an empty string
      const inputPath = path.join('.cache', 'xtrefs-data.js');

      let xtrefsData = '';
      if (fs.existsSync(inputPath)) {
        xtrefsData = '<script>' + fs.readFileSync(inputPath, 'utf8') + '</script>';
      }

      return xtrefsData;
    }

    const xtrefsData = createScriptElementWithXTrefDataForEmbeddingInHtml();

    /**
     * Processes custom tag patterns in markdown content and applies transformation functions.
     * 
     * This function scans the document for special tag patterns like [[tref:spec,term]]
     * and replaces them with the appropriate HTML using the matching replacer.
     * 
     * For tref tags, this is where the magic happens - we intercept them before
     * the markdown parser even sees them, and convert them directly to HTML structure
     * that will integrate properly with definition lists.
     * 
     * @param {string} doc - The markdown document to process
     * @returns {string} - The processed document with tags replaced by their HTML equivalents
     */
    function applyReplacers(doc) {
      // Use the escape handler for three-phase processing
      return processWithEscapes(doc, function(content) {
        return content.replace(replacerRegex, function (match, type, args) {
          let replacer = replacers.find(r => type.trim().match(r.test));
          if (replacer) {
            let argsArray = args ? args.trim().split(replacerArgsRegex) : [];
            return replacer.transform(match, type, ...argsArray);
          }
          return match;
        });
      });
    }

    function normalizePath(path) {
      return path.trim().replace(/\/$/g, '') + '/';
    }

    function renderRefGroup(type) {
      let group = specGroups[type];
      if (!group) return '';

      /*
        The key advantage of localeCompare over simple comparison operators (<, >) is that it:

        - Properly handles language-specific sorting rules (via locale settings)
        - Correctly compares strings containing special characters or accents
        - Can be configured to be case-insensitive
      */
      let html = Object.keys(group).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((html, name) => {
        let ref = group[name];
        return html += `
        <dt id="ref:${name}">${name}</dt>
        <dd>
          <cite><a href="${ref.href}">${ref.title}</a></cite>. 
          ${ref.authors.join('; ')}; ${ref.rawDate}. <span class="reference-status">Status: ${ref.status}</span>.
        </dd>
      `;
      }, '<dl class="reference-list">');
      return `\n${html}\n</dl>\n`;
    }

    function findKatexDist() {
      const relpath = "node_modules/katex/dist";
      const paths = [
        path.join(process.cwd(), relpath),
        path.join(__dirname, relpath),
      ];
      for (const abspath of paths) {
        if (fs.existsSync(abspath)) {
          return abspath
        }
      }
      throw Error("katex distribution could not be located");
    }

    async function render(spec, assets) {
      try {
        noticeTitles = {};
        specGroups = {};
        console.log('ℹ️ Rendering: ' + spec.title);

        function interpolate(template, variables) {
          return template.replace(/\${(.*?)}/g, (match, p1) => variables[p1.trim()]);
        }

        // Add current date in 'DD Month YYYY' format for template injection
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const currentDate = `${day} ${month} ${year}`;

        const docs = await Promise.all(
          (spec.markdown_paths || ['spec.md']).map(_path =>
            fs.readFile(spec.spec_directory + _path, 'utf8')
          )
        );

        const features = (({ source, logo }) => ({ source, logo }))(spec);
        if (spec.external_specs && !externalReferences) {
          externalReferences = await fetchExternalSpecs(spec);
        }

        // Find the index of the terms-and-definitions-intro.md file
        const termsIndex = (spec.markdown_paths || ['spec.md']).indexOf('terms-and-definitions-intro.md');
        if (termsIndex !== -1) {
          // Append the HTML string to the content of terms-and-definitions-intro.md. This string is used to create a div that is used to insert an alphabet index, and a div that is used as the starting point of the terminology index. The newlines are essential for the correct rendering of the markdown.
          docs[termsIndex] += '\n\n<div id="terminology-section-start"></div>\n\n';
        }

        let doc = docs.join("\n");

        // Handles backslash escape mechanism for substitution tags
        // Phase 1: Pre-processing - Handle escaped tags
        doc = processEscapedTags(doc);

        // Handles backslash escape mechanism for substitution tags
        // Phase 2: Tag Processing - Apply normal substitution logic
        doc = applyReplacers(doc);

        md[spec.katex ? "enable" : "disable"](katexRules);

        // `render` is the rendered HTML
        let renderedHtml = md.render(doc);

        // Apply the fix for broken definition list structures
        renderedHtml = fixDefinitionListStructure(renderedHtml);

        // Sort definition terms case-insensitively before final rendering
        renderedHtml = sortDefinitionTermsInHtml(renderedHtml);

        // Handles backslash escape mechanism for substitution tags
        // Phase 3: Post-processing - Restore escaped sequences as literals
        renderedHtml = restoreEscapedTags(renderedHtml);

        // Process external references to ensure they are inserted as raw HTML, not as JSON string
        const externalReferencesHtml = Array.isArray(externalReferences) 
          ? externalReferences.join('') 
          : (externalReferences || '');

        const templateInterpolated = interpolate(template, {
          title: spec.title,
          description: spec.description,
          author: spec.author,
          toc: toc,
          render: renderedHtml,
          assetsHead: assets.head,
          assetsBody: assets.body,
          assetsSvg: assets.svg,
          features: Object.keys(features).join(' '),
          externalReferences: externalReferencesHtml,
          xtrefsData: xtrefsData,
          specLogo: spec.logo,
          specFavicon: spec.favicon,
          specLogoLink: spec.logo_link,
          spec: JSON.stringify(spec),
          externalSpecsList: externalSpecsList,
          currentDate: currentDate
        });

        const outputPath = path.join(spec.destination, 'index.html');
        console.log('ℹ️ Attempting to write to:', outputPath);

        // Use promisified version instead of callback
        await fs.promises.writeFile(outputPath, templateInterpolated, 'utf8');
        console.log(`✅ Successfully wrote ${outputPath}`);

        validateReferences(references, definitions, renderedHtml);
        references = [];
        definitions = [];
      } catch (e) {
        console.error("❌ Render error: " + e.message);
        throw e;
      }
    }

    try {
      config.specs.forEach(spec => {
        spec.spec_directory = normalizePath(spec.spec_directory);
        spec.destination = normalizePath(spec.output_path || spec.spec_directory);

        if (!fs.existsSync(spec.destination)) {
          try {
            fs.mkdirSync(spec.destination, { recursive: true });
            console.log(`✅ Created directory: ${spec.destination}`);
          } catch (error) {
            console.error(`❌ Failed to create directory ${spec.destination}: ${error.message}`);
            throw error;
          }
        } else {
          console.log(`ℹ️ Directory already exists: ${spec.destination}`);
        }

        try {
          fs.ensureDirSync(spec.destination);
          console.log(`✅ Ensured directory is ready: ${spec.destination}`);
        } catch (error) {
          console.error(`❌ Failed to ensure directory ${spec.destination}: ${error.message}`);
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
        render(spec, assetTags)
          .then(() => {
            console.log('ℹ️ Render completed for:', spec.destination);
            if (options.nowatch) {
              console.log('ℹ️ Exiting with nowatch');
              process.exit(0);
            }
          })
          .catch((e) => {
            console.error('❌ Render failed:', e.message);
            process.exit(1);
          });

        if (!options.nowatch) {
          gulp.watch(
            [spec.spec_directory + '**/*', '!' + path.join(spec.destination, 'index.html')],
            render.bind(null, spec, assetTags)
          );
        }

      });
    } catch (error) {
      console.error(`Error during initialization or module execution: ${error.message}`);
      throw error; // Re-throw to let the caller handle the error
    }
  } catch (error) {
    console.error(`Error during initialization: ${error.message}`);
    throw error; // Re-throw to let the caller handle the error
  }
};
