/**
 * @file Orchestrates external reference collection and enrichment within the pipeline.
 *
 * This module coordinates three stages:
 * 1. Scan local markdown for `[[xref:...]]` / `[[tref:...]]` references.
 * 2. Enrich references with metadata derived from `specs.json`.
 * 3. Persist the combined dataset for downstream consumers.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const readlineSync = require('readline-sync');

const Logger = require('../../utils/logger');
const { shouldProcessFile } = require('../../utils/file-filter');
const { getCurrentBranch } = require('../../utils/git-info');
const { addNewXTrefsFromMarkdown, isXTrefInAnyFile } = require('./xtref-utils');

/**
 * Augments reference records with repository metadata pulled from `specs.json`.
 *
 * @param {object} config - Parsed specs configuration.
 * @param {Array<object>} xtrefs - Reference entries collected from markdown.
 */
function extendXTrefs(config, xtrefs) {
    if (config.specs[0].external_specs_repos) {
        Logger.warn('Your specs.json file uses an outdated structure. Update it using: https://github.com/trustoverip/spec-up-t/blob/master/src/install-from-boilerplate/boilerplate/specs.json');
        return;
    }

    const repoLookup = new Map();
    const siteLookup = new Map();

    config.specs.forEach(spec => {
        spec.external_specs.forEach(repo => {
            if (repo.external_spec) {
                repoLookup.set(repo.external_spec, repo);
            }
        });

        spec.external_specs
            .filter(externalSpec => typeof externalSpec === 'object' && externalSpec !== null)
            .forEach(externalSpec => {
                const key = Object.keys(externalSpec)[0];
                siteLookup.set(key, externalSpec[key]);
            });
    });

    xtrefs.forEach(xtref => {
        xtref.repoUrl = null;
        xtref.terms_dir = null;
        xtref.owner = null;
        xtref.repo = null;
        xtref.site = null;
        xtref.branch = null;

        const repo = repoLookup.get(xtref.externalSpec);
        if (repo) {
            xtref.repoUrl = repo.url;
            xtref.terms_dir = repo.terms_dir;

            if (xtref.repoUrl) {
                const urlParts = new URL(xtref.repoUrl).pathname.split('/');
                xtref.owner = urlParts[1];
                xtref.repo = urlParts[2];
            }

            xtref.avatarUrl = repo.avatar_url;
            xtref.ghPageUrl = repo.gh_page;
        }

        const site = siteLookup.get(xtref.externalSpec);
        if (site) {
            xtref.site = site;
        }

        try {
            xtref.branch = getCurrentBranch();
        } catch (error) {
            Logger.warn(`Could not get current branch for xtref ${xtref.externalSpec}:${xtref.term}: ${error.message}`);
            xtref.branch = 'main';
        }
    });
}

/**
 * Executes the full collection pipeline once pre-flight checks pass.
 *
 * @param {object} config - Parsed specs configuration.
 * @param {string} GITHUB_API_TOKEN - GitHub PAT used for API calls.
 */
function processExternalReferences(config, GITHUB_API_TOKEN) {
    const { processXTrefsData } = require('../../collectExternalReferences/processXTrefsData');
    const { doesUrlExist } = require('../../utils/does-url-exist');

    const externalSpecsRepos = config.specs[0].external_specs;

    externalSpecsRepos.forEach(repo => {
        doesUrlExist(repo.url)
            .then(exists => {
                if (exists) {
                    return;
                }

                const userInput = readlineSync.question(
`❌ This external reference is not a valid URL:

   Repository: ${repo.url},
   
   Terms directory: ${repo.terms_dir}

   Please fix the external references in the specs.json file that you will find at the root of your project.

   Do you want to stop? (yes/no): `);

                if (userInput.toLowerCase() === 'yes' || userInput.toLowerCase() === 'y') {
                    Logger.info('Stopping...');
                    process.exit(1);
                }
            })
            .catch(error => {
                Logger.error('Error checking URL existence:', error);
            });
    });

    const specTermsDirectories = config.specs.map(spec =>
        path.join(spec.spec_directory, spec.spec_terms_directory)
    );

    const outputDir = '.cache';
    const xtrefsHistoryDir = path.join(outputDir, 'xtrefs-history');
    const outputPathJSON = path.join(outputDir, 'xtrefs-data.json');
    const outputPathJS = path.join(outputDir, 'xtrefs-data.js');
    const outputPathJSTimeStamped = path.join(xtrefsHistoryDir, `xtrefs-data-${Date.now()}.js`);

    fs.ensureDirSync(outputDir);
    fs.ensureDirSync(xtrefsHistoryDir);

    let allXTrefs = { xtrefs: [] };
    if (fs.existsSync(outputPathJSON)) {
        const existingXTrefs = fs.readJsonSync(outputPathJSON);
        if (existingXTrefs?.xtrefs) {
            allXTrefs = existingXTrefs;
        }
    }

    const fileContents = new Map();

    specTermsDirectories.forEach(specDirectory => {
        fs.readdirSync(specDirectory).forEach(file => {
            if (!shouldProcessFile(file)) {
                return;
            }

            const filePath = path.join(specDirectory, file);
            const markdown = fs.readFileSync(filePath, 'utf8');
            fileContents.set(file, markdown);
        });
    });

    allXTrefs.xtrefs = allXTrefs.xtrefs.filter(existingXTref =>
        isXTrefInAnyFile(existingXTref, fileContents)
    );

    fileContents.forEach((content, filename) => {
        addNewXTrefsFromMarkdown(content, allXTrefs, filename);
    });

    extendXTrefs(config, allXTrefs.xtrefs);
    processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped);
}

/**
 * Public entry point for the external reference collection stage.
 *
 * @param {{ pat?: string }} options - Optional overrides (GitHub PAT).
 */
function collectExternalReferences(options = {}) {
    const config = fs.readJsonSync('specs.json');
    const externalSpecsRepos = config.specs[0].external_specs;
    const GITHUB_API_TOKEN = options.pat || process.env.GITHUB_API_TOKEN;

    if (!GITHUB_API_TOKEN) {
        Logger.warn('No GitHub Personal Access Token (PAT) found. Running without authentication (may hit rate limits).');
        Logger.info('For better performance, set up a PAT: https://blockchainbird.github.io/spec-up-t-website/docs/getting-started/github-token\n');
    }

    if (externalSpecsRepos.length === 0) {
        const explanationNoExternalReferences =
`❌ No external references were found in the specs.json file.

   There is no point in continuing without external references, so we stop here.

   Please add external references to the specs.json file that you will find at the root of your project.

`;
        Logger.info(explanationNoExternalReferences);
        const userInput = readlineSync.question('Press any key');

        if (userInput.trim() !== '') {
            Logger.info('Stopping...');
        }
        return;
    }

    processExternalReferences(config, GITHUB_API_TOKEN);
}

module.exports = {
    collectExternalReferences,
    extendXTrefs,
    processExternalReferences
};
