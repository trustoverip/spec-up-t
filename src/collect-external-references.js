/**
 * @file Collects and processes external reference information for cross-specification linking.
 * 
 * This script fetches the latest commit hash of term files from GitHub repositories
 * configured in specs.json, then generates both JavaScript and JSON files containing
 * cross-reference (xref/tref) data for use in specifications.
 * 
 * Example of the output:
 * 
 * const allXTrefs = {
    "xtrefs": [
        {
        "externalSpec": "toip1",
        "term": "SSI",
        "repoUrl": "https://github.com/henkvancann/ctwg-main-glossary",
        "terms_dir": "spec/terms-definitions",
        "owner": "henkvancann",
        "repo": "ctwg-main-glossary",
        "site": null,
        "commitHash": "not found",
        "content": "This term was not found in the external repository.",
        "sourceFiles": ["governance.md"]
        },
        {
        "externalSpec": "vlei1",
        "term": "vlei-ecosystem-governance-framework",
        "repoUrl": "https://github.com/henkvancann/vlei-glossary",
        "terms_dir": "spec/terms-definitions",
        "owner": "henkvancann",
        "repo": "vlei-glossary",
        "avatarUrl": "https://avatars.githubusercontent.com/u/479356?v=4",
        "site": null,
        "commitHash": "5e36b16e58984eeaccae22116a2bf058ab01a0e9",
        "content": "[[def: vlei-ecosystem-governance-framework, vlei ecosystem governance framework]]\n\n~ The Verifiable LEI (vLEI) Ecosystem [[ref: governance-framework]] Information Trust Policies. It's a **document** that defines the … etc",
        "sourceFiles": ["vlei-terms.md", "ecosystem.md"]
        }
    ]
  };
 * 
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-09
 */

require('dotenv').config();
const { shouldProcessFile } = require('./utils/file-filter');
const path = require('path');
const fs = require('fs-extra');
const readlineSync = require('readline-sync');
const Logger = require('./utils/logger');

/**
 * Checks if a specific xtref is present in the markdown content
 * 
 * This function searches for external references in markdown that match the pattern:
 * [[xref:externalSpec,term]] or [[tref:externalSpec,term,alias]]
 * 
 * @param {Object} xtref - The xtref object to check for (must have externalSpec and term properties)
 * @param {string} markdownContent - The markdown content to search in
 * @returns {boolean} True if the xtref is found in the content
 */
function isXTrefInMarkdown(xtref, markdownContent) {
    // Escape special regex characters in externalSpec and term to prevent regex injection
    // This ensures that characters like ".", "*", "+", etc. are treated as literal characters
    const escapedSpec = xtref.externalSpec.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
    const escapedTerm = xtref.term.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
    
    // Build regex pattern to match both xref and tref formats:
    // - (?:x|t)ref: matches either "xref:" or "tref:"
    // - \\s* allows for optional whitespace
    // - (?:,\\s*[^\\]]+)? optionally matches an alias (third parameter)
    const regexTerm = new RegExp(`\\[\\[(?:x|t)ref:\\s*${escapedSpec},\\s*${escapedTerm}(?:,\\s*[^\\]]+)?\\]\\]`, 'g');
    return regexTerm.test(markdownContent);
}

/**
 * Checks if a specific xtref is present in any of the provided file contents
 * 
 * This is used during cleanup to determine if an existing xtref should be kept.
 * Instead of checking a single concatenated string, we check each file individually
 * to maintain filename tracking capabilities.
 * 
 * @param {Object} xtref - The xtref object to check for (must have externalSpec and term properties)
 * @param {Map} fileContents - Map of filename to file content (e.g., "term1.md" -> "markdown content")
 * @returns {boolean} True if the xtref is found in any file
 */
function isXTrefInAnyFile(xtref, fileContents) {
    // Iterate through all files and check if the xtref exists in any of them
    for (const [filename, content] of fileContents) {
        if (isXTrefInMarkdown(xtref, content)) {
            return true; // Found it, no need to check other files
        }
    }
    return false; // Not found in any file
}

/**
 * Helper function to process an XTref string and return an object.
 * 
 * Takes a raw xtref string like "[[xref:spec-name,term-name,alias]]" and converts it
 * into a structured object with separate properties for each component.
 * 
 * Examples:
 * - "[[xref:keri-1,authentic-data]]" -> {externalSpec: "keri-1", term: "authentic-data"}
 * - "[[tref:vlei-1,legal-entity,LEI]]" -> {externalSpec: "vlei-1", term: "legal-entity", alias: "LEI"}
 * 
 * @param {string} xtref - The xtref string to process (includes the full [[...]] syntax)
 * @returns {Object} An object with externalSpec, term, and optional alias properties
 */
function processXTref(xtref) {
    // Remove the surrounding [[xref: or [[tref: and ]] parts, then split by commas
    const parts = xtref
        .replace(/\[\[(?:xref|tref):/, '') // Remove opening [[xref: or [[tref:
        .replace(/\]\]/, '')               // Remove closing ]]
        .trim()                            // Remove any extra whitespace
        .split(/,/);                       // Split into parts by comma
    
    // Build the basic object with required fields
    const xtrefObject = {
        externalSpec: parts[0].trim(),  // First part: external specification identifier
        term: parts[1].trim()           // Second part: the term being referenced
    };
    
    // Add alias if provided (third parameter) and not empty
    if (parts.length > 2 && parts[2].trim()) {
        xtrefObject.alias = parts[2].trim();
    }

    return xtrefObject;
}

/**
 * Adds new xtrefs found in markdown content to the existing collection
 * 
 * This is the core function that handles filename tracking for external references.
 * It intelligently manages whether to use a single `sourceFile` property or 
 * an array `sourceFiles` property based on how many files contain the same reference.
 * 
 * Filename tracking strategy:
 * 1. New xtref in one file -> add `sourceFile: "filename.md"`
 * 2. Same xtref found in another file -> convert to `sourceFiles: ["file1.md", "file2.md"]`
 * 3. Same xtref processed again from same file -> no duplicate filenames
 * 
 * @param {string} markdownContent - The content to search for XTrefs
 * @param {Object} allXTrefs - An object with an array property "xtrefs" to which new entries will be added
 * @param {string} [filename] - Optional filename where the xtref was found (for tracking purposes)
 * @returns {Object} The updated allXTrefs object
 */
function addNewXTrefsFromMarkdown(markdownContent, allXTrefs, filename = null) {
    // Regex to find all external references: [[xref:...]] or [[tref:...]]
    const regex = /\[\[(?:xref|tref):.*?\]\]/g;
    
    // First check if there are any matches to avoid unnecessary processing
    if (regex.test(markdownContent)) {
        // Extract all matching xref/tref patterns from the content
        const xtrefs = markdownContent.match(regex);
        
        // Process each found external reference
        xtrefs.forEach(xtref => {
            // Convert the raw string into a structured object
            const newXTrefObj = processXTref(xtref);
            
            // Check if this exact xtref already exists in our collection
            // We match on both externalSpec and term to identify duplicates
            const existingIndex = allXTrefs?.xtrefs?.findIndex(existingXTref =>
                existingXTref.term === newXTrefObj.term &&
                existingXTref.externalSpec === newXTrefObj.externalSpec);
            
            if (existingIndex === -1) {
                // Case 1: This is a completely new xtref
                if (filename) {
                    // Add filename tracking as a single file reference
                    newXTrefObj.sourceFile = filename;
                }
                allXTrefs.xtrefs.push(newXTrefObj);
                
            } else if (filename) {
                // Case 2: This xtref already exists, we need to handle filename tracking
                const existingXTref = allXTrefs.xtrefs[existingIndex];
                
                if (!existingXTref.sourceFiles && !existingXTref.sourceFile) {
                    // Case 2a: No file tracking yet (legacy data), start tracking with current file
                    existingXTref.sourceFile = filename;
                    
                } else if (existingXTref.sourceFile && existingXTref.sourceFile !== filename) {
                    // Case 2b: Single file tracked, but now found in a different file
                    // Convert from single sourceFile to sourceFiles array
                    existingXTref.sourceFiles = [existingXTref.sourceFile, filename];
                    delete existingXTref.sourceFile; // Remove old single-file property
                    
                } else if (existingXTref.sourceFiles && !existingXTref.sourceFiles.includes(filename)) {
                    // Case 2c: Multiple files already tracked, add this new file to the array
                    existingXTref.sourceFiles.push(filename);
                }
                // Case 2d: If filename already exists in sourceFile or sourceFiles, do nothing
                // This prevents duplicate entries when the same file is processed multiple times
            }
        });
    }
    return allXTrefs;
}

/**
 * Extends xtref objects with additional information like repository URL and directory information
 * 
 * This function takes the basic xtref objects (which only have externalSpec, term, and optionally alias)
 * and enriches them with repository metadata from the specs.json configuration.
 * 
 * The function adds properties like:
 * - repoUrl: GitHub repository URL where the external spec is hosted
 * - terms_dir: Directory within the repo where term definitions are stored
 * - owner: GitHub username/organization that owns the repository
 * - repo: Repository name
 * - site: Website URL if the spec has a published site
 * - avatarUrl: GitHub avatar URL for the repository owner
 * - ghPageUrl: GitHub Pages URL if available
 * 
 * @param {Object} config - The configuration object from specs.json
 * @param {Array} xtrefs - Array of xtref objects to extend with additional metadata
 */
function extendXTrefs(config, xtrefs) {
    // Check for outdated specs.json format and warn user
    if (config.specs[0].external_specs_repos) {
        Logger.warn("PLEASE NOTE: Your specs.json file is outdated (not your fault, we changed something). Use this one: https://github.com/trustoverip/spec-up-t/blob/master/src/install-from-boilerplate/boilerplate/specs.json");
        return;
    }

    // Build lookup maps for O(1) performance instead of nested loops O(n×m×k)
    // This is much faster when dealing with many external references
    const repoLookup = new Map();  // Maps externalSpec -> repository info
    const siteLookup = new Map();  // Maps externalSpec -> site URL
    
    // Populate the lookup maps from configuration
    config.specs.forEach(spec => {
        spec.external_specs.forEach(repo => {
            if (repo.external_spec) {
                // Store complete repository information for fast lookup
                repoLookup.set(repo.external_spec, repo);
            }
        });
        
        // Handle site URLs (sites are stored as objects with externalSpec as key)
        spec?.external_specs?.forEach(externalSpec => {
            if (typeof externalSpec === 'object' && externalSpec !== null) {
                const keys = Object.keys(externalSpec);
                if (keys.length > 0) {
                    const key = keys[0];
                    siteLookup.set(key, externalSpec[key]);
                }
            }
        });
    });

    // Now process each xtref and enrich it with metadata using fast O(1) lookups
    xtrefs.forEach(xtref => {
        // Initialize all fields to null first (defensive programming)
        xtref.repoUrl = null;
        xtref.terms_dir = null;
        xtref.owner = null;
        xtref.repo = null;
        xtref.site = null;
        
        // Fast lookup for repository data using the externalSpec as key
        const repo = repoLookup.get(xtref.externalSpec);
        if (repo) {
            // Extract repository information from the config
            xtref.repoUrl = repo.url;
            xtref.terms_dir = repo.terms_dir;
            
            // Parse GitHub URL to extract owner and repo name
            if (xtref.repoUrl) {
                const urlParts = new URL(xtref.repoUrl).pathname.split('/');
                xtref.owner = urlParts[1];    // e.g., "henkvancann" from /henkvancann/keri-glossary
                xtref.repo = urlParts[2];     // e.g., "keri-glossary" from /henkvancann/keri-glossary
            }
            
            // Add additional metadata if available
            xtref.avatarUrl = repo.avatar_url;
            xtref.ghPageUrl = repo.gh_page;
        }
        
        // Fast lookup for site URL
        const site = siteLookup.get(xtref.externalSpec);
        if (site) {
            xtref.site = site;
        }
    });
}

/**
 * Processes the main functionality after initial validation checks
 * 
 * @param {Object} config - The configuration object from specs.json
 * @param {string} GITHUB_API_TOKEN - The GitHub API token
 */
function processExternalReferences(config, GITHUB_API_TOKEN) {
    const { processXTrefsData } = require('./collectExternalReferences/processXTrefsData.js');
    const { doesUrlExist } = require('./utils/doesUrlExist.js');
    const externalSpecsRepos = config.specs[0].external_specs;

    // Check if the URLs for the external specs repositories are valid, and prompt the user to abort if they are not.
    externalSpecsRepos.forEach(repo => {
        doesUrlExist(repo.url).then(exists => {
            if (!exists) {
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
            }
        }).catch(error => {
            Logger.error('Error checking URL existence:', error);
        });
    });

    // Collect all directories that contain files with a term and definition
    // This maps over the specs in the config file and constructs paths to directories
    // where the term definition files are located.
    const specTermsDirectories = config.specs.map(spec => 
        path.join(spec.spec_directory, spec.spec_terms_directory)
    );

    // Ensure that the 'output' directory exists, creating it if necessary.
    const outputDir = '.cache';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Ensure that the 'xtrefs-history' in outputDir exists, creating it if necessary.
    const xtrefsHistoryDir = path.join(outputDir, 'xtrefs-history');
    if (!fs.existsSync(xtrefsHistoryDir)) {
        fs.mkdirSync(xtrefsHistoryDir);
    }

    // Define paths for various output files, including JSON and JS files.
    const outputPathJSON = path.join(outputDir, 'xtrefs-data.json');
    const outputPathJS = path.join(outputDir, 'xtrefs-data.js');
    const outputPathJSTimeStamped = path.join(xtrefsHistoryDir, `xtrefs-data-${Date.now()}.js`);

    // Initialize an object to store all xtrefs.
    let allXTrefs = { xtrefs: [] };

    // If the output JSON file exists, load its data.
    if (fs.existsSync(outputPathJSON)) {
        const existingXTrefs = fs.readJsonSync(outputPathJSON);
        if (existingXTrefs?.xtrefs) {
            allXTrefs = existingXTrefs;
        }
    }

    // Collect all markdown content and track file information
    // We need both: concatenated content (for backward compatibility) and individual file tracking (for new features)
    let allMarkdownContent = '';
    const fileContents = new Map(); // filename -> content mapping for efficient lookup

    // Read all main repo Markdown files from a list of directories and store both concatenated content and individual files.
    // This dual approach allows us to:
    // 1. Maintain backward compatibility with existing filtering logic
    // 2. Enable new filename tracking capabilities
    specTermsDirectories.forEach(specDirectory => {
        fs.readdirSync(specDirectory).forEach(file => {
            if (shouldProcessFile(file)) {
                const filePath = path.join(specDirectory, file);
                const markdown = fs.readFileSync(filePath, 'utf8');
                
                // Add to concatenated content (legacy approach)
                allMarkdownContent += markdown;
                
                // Store individual file content with filename as key (new approach)
                // This enables us to track which specific files contain each external reference
                fileContents.set(file, markdown);
            }
        });
    });

    // Remove existing entries if not found in any file
    // This cleanup step ensures we don't keep references to external terms that are no longer used
    // We use the new isXTrefInAnyFile function which checks individual files instead of concatenated content
    allXTrefs.xtrefs = allXTrefs.xtrefs.filter(existingXTref => {
        return isXTrefInAnyFile(existingXTref, fileContents);
    });

    // Process each file individually to track source files
    // This is the key change: instead of processing all content as one big string,
    // we process each file separately so we can track which files contain which references
    fileContents.forEach((content, filename) => {
        addNewXTrefsFromMarkdown(content, allXTrefs, filename);
    });

    // Example at this point - showing the filename tracking in action:
    // allXTrefs.xtrefs: [
    //     { 
    //         externalSpec: 'kmg-1', 
    //         term: 'authentic-chained-data-container',
    //         sourceFile: 'security.md'  // Single file reference
    //     },
    //     { 
    //         externalSpec: 'vlei-1', 
    //         term: 'legal-entity-identifier',
    //         sourceFiles: ['governance.md', 'identity.md']  // Multiple file references
    //     }
    // ]
    //
    // Data structure explanation:
    // - sourceFile: Used when an external reference is found in only one file
    // - sourceFiles: Used when the same external reference is found in multiple files
    // - The system automatically converts from sourceFile to sourceFiles when needed

    // Extend each xref with additional data and fetch commit information from GitHub.
    extendXTrefs(config, allXTrefs.xtrefs);

    // Example at this point - after extending with repository metadata:
    // allXTrefs.xtrefs: [
    //     {
    //         externalSpec: 'kmg-1',
    //         term: 'authentic-chained-data-container',
    //         sourceFile: 'security.md',                                           // Filename tracking (NEW)
    //         repoUrl: 'https://github.com/henkvancann/keri-main-glossary',        // Repository URL
    //         terms_dir: 'spec/terms-definitions',                                 // Directory containing terms
    //         owner: 'henkvancann',                                                // GitHub owner
    //         repo: 'keri-main-glossary',                                          // Repository name
    //         avatarUrl: 'https://avatars.githubusercontent.com/u/479356?v=4',     // Owner's avatar
    //         site: null                                                           // Published site URL (if any)
    //     }
    // ]
    //
    // The next step (processXTrefsData) will add:
    // - commitHash: Latest commit hash for the term file
    // - content: Actual term definition content from the external repository
    
    processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped);
}

/**
 * Collects external references from markdown files and processes them into usable data files.
 * 
 * @function collectExternalReferences
 * @param {Object} options - Configuration options
 * @param {string} [options.pat] - GitHub Personal Access Token (overrides environment variable)
 * @returns {void}
 * 
 * @description
 * This function performs several key operations:
 * 1. Optionally uses GitHub PAT for better API performance and higher rate limits
 * 2. Checks validity of repository URLs
 * 3. Extracts xref/tref patterns from markdown content
 * 4. Extends references with repository metadata
 * 5. Processes references to fetch commit information
 * 6. Generates output files in both JS and JSON formats
 * 
 * Note: The function will run without a GitHub token but may encounter rate limits.
 * For better performance, provide a GitHub Personal Access Token via environment
 * variable or the options parameter.
 * 
 * @example
 * // Basic usage
 * collectExternalReferences();
 * 
 * // With explicit PAT
 * collectExternalReferences({ pat: 'github_pat_xxxxxxxxxxxx' });
 */
function collectExternalReferences(options = {}) {
    const config = fs.readJsonSync('specs.json');
    const externalSpecsRepos = config.specs[0].external_specs;
    const GITHUB_API_TOKEN = options.pat || process.env.GITHUB_API_TOKEN;

    const explanationNoExternalReferences =
`❌ No external references were found in the specs.json file.

   There is no point in continuing without external references, so we stop here.

   Please add external references to the specs.json file that you will find at the root of your project.

`;
    
    // First do some checks
    // Show informational message if no token is available
    if (!GITHUB_API_TOKEN) {
        Logger.warn('No GitHub Personal Access Token (PAT) found. Running without authentication (may hit rate limits).');
        Logger.info('For better performance, set up a PAT: https://blockchainbird.github.io/spec-up-t-website/docs/getting-started/github-token\n');
    }

    if (externalSpecsRepos.length === 0) {
        // Check if the URLs for the external specs repositories are valid, and prompt the user to abort if they are not.
        Logger.info(explanationNoExternalReferences);
        const userInput = readlineSync.question('Press any key');

        // React to user pressing any key
        if (userInput.trim() !== '') {
            Logger.info('Stopping...');
            return;
        }
    } else {
        processExternalReferences(config, GITHUB_API_TOKEN);
    }
}

module.exports = {
    collectExternalReferences,
    isXTrefInMarkdown,
    isXTrefInAnyFile,
    addNewXTrefsFromMarkdown,
    processXTref
};
