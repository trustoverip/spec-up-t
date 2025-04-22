/**
 * @file fetchTermsFromIndex.js
 * @description Fetches terms and definitions from external repository's index.html
 * @author Generated with assistance from GitHub Copilot
 * @version 1.0.0
 * @since 2025-04-15
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axios = require('axios');
const { addPath, getPath, getAllPaths } = require('../config/paths');
const crypto = require('crypto');

// Directory to store cached files
const CACHE_DIR = getPath('githubcache');

/**
 * Generates a cache key based on repository information
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {string} - Cache key
 */
function generateCacheKey(owner, repo) {
    const input = `${owner}-${repo}-index`;
    return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Checks if a cached version exists and is valid
 * @param {string} cacheKey - Cache key
 * @param {object} options - Options object
 * @param {number} options.cacheTTL - Time-to-live for cache in milliseconds (default: 24 hours)
 * @returns {object|null} - Cached data or null if not found or expired
 */
function getFromCache(cacheKey, options = {}) {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    // const cacheTTL = options.cacheTTL || 24 * 60 * 60 * 1000; // Default: 24 hours
    const cacheTTL = 0;

    if (!fs.existsSync(cachePath)) {
        return null;
    }

    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const cacheTime = new Date(cacheData.timestamp).getTime();
    const currentTime = new Date().getTime();

    // Check if cache is expired
    if (currentTime - cacheTime > cacheTTL) {
        console.log(`Cache expired for key: ${cacheKey}`);
        return null;
    }

    console.log(`Using cached data for key: ${cacheKey}`);
    return cacheData;
}

/**
 * Saves data to cache
 * @param {string} cacheKey - Cache key
 * @param {object} data - Data to cache
 */
function saveToCache(cacheKey, data) {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const cacheData = {
        timestamp: new Date().toISOString(),
        ...data
    };
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    console.log(`Saved to cache: ${cacheKey}`);
}

/**
 * Fetches the latest commit information for a specific file in a repository
 * @param {string} token - GitHub API Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to the file within the repository
 * @param {object} headers - HTTP headers for API requests
 * @returns {string|null} - Commit hash of the file or null if error
 */
async function fetchFileCommitInfo(token, owner, repo, filePath, headers) {
    try {
        // Construct the GitHub API URL to get commits for the specific file
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&per_page=1`;
        console.log(`Fetching commit info for file: ${filePath}`);
        
        const commitsResponse = await axios.get(commitsUrl, { headers });
        
        if (commitsResponse.status !== 200 || !commitsResponse.data.length) {
            console.log(`❌ Could not find commit info for file: ${filePath}`);
            return null;
        }
        
        // Return the SHA of the most recent commit for this file
        return commitsResponse.data[0].sha;
        
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                console.log(`❌ File not found: ${filePath}`);
            } else if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000);
                console.error(`❌ GitHub API rate limit exceeded. Try again after ${resetTime.toLocaleString()}`);
            } else {
                console.error(`❌ Error fetching commit info: ${error.response.status} ${error.response.statusText}`);
            }
        } else {
            console.error(`❌ Error fetching commit info: ${error.message}`);
        }
        return null;
    }
}

/**
 * Maps terms to their source files in the repository
 * @param {string} token - GitHub API Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} termsDir - Directory containing term definitions
 * @param {array} terms - List of terms
 * @param {object} headers - HTTP headers for API requests
 * @returns {object} - Mapping of terms to source files and commit hashes
 */
async function mapTermsToSourceFiles(token, owner, repo, termsDir, terms, headers) {
    // Initialize the mapping object
    const termSourceMap = {};
    
    try {
        // Log the terms we're looking for to make debugging easier
        console.log(`Looking for ${terms.length} terms in ${termsDir}`);
        
        // Check if termsDir is a full path or just the directory name
        // If it's just a directory name, try with 'spec/' prefix as that's common in many repos
        let attemptedPaths = [termsDir];
        if (!termsDir.includes('/')) {
            attemptedPaths.push(`spec/${termsDir}`);
        }
        
        let filesResponse = null;
        let successPath = null;
        
        // Try each path until we find one that works
        for (const pathToTry of attemptedPaths) {
            try {
                console.log(`Attempting to access terms at: ${pathToTry}`);
                const termsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathToTry}`;
                const response = await axios.get(termsApiUrl, { headers });
                
                if (response.status === 200) {
                    console.log(`✅ Successfully found terms directory at: ${pathToTry}`);
                    filesResponse = response;
                    successPath = pathToTry;
                    break;
                }
            } catch (error) {
                console.log(`❌ Could not access ${pathToTry}: ${error.message}`);
            }
        }
        
        // If all paths failed, check the repository root as a last resort
        if (!filesResponse) {
            console.log(`❌ Could not find terms directory at any of these paths: ${attemptedPaths.join(', ')}`);
            console.log(`Checking repository root to find potential terms locations...`);
            
            try {
                const rootResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
                console.log(`Repository root contains: ${rootResponse.data.map(item => item.name).join(', ')}`);
                
                // Check if spec directory exists
                const specDir = rootResponse.data.find(item => item.name === 'spec' && item.type === 'dir');
                if (specDir) {
                    console.log(`Found 'spec' directory. Checking its contents...`);
                    const specContents = await axios.get(specDir.url, { headers });
                    console.log(`'spec' directory contains: ${specContents.data.map(item => item.name).join(', ')}`);
                    
                    // If we find the terms directory inside spec, use that
                    const termsInSpec = specContents.data.find(item => 
                        item.name === termsDir || item.name === termsDir.replace('spec/', ''));
                    
                    if (termsInSpec) {
                        console.log(`✅ Found terms directory at: spec/${termsInSpec.name}`);
                        filesResponse = await axios.get(termsInSpec.url, { headers });
                        successPath = `spec/${termsInSpec.name}`;
                    }
                }
            } catch (rootError) {
                console.log(`Could not check repository root: ${rootError.message}`);
            }
        }
        
        if (!filesResponse) {
            console.log(`❌ Could not locate the terms directory. Please check your specs.json configuration.`);
            return termSourceMap;
        }
        
        // Filter to only include markdown files
        const markdownFiles = filesResponse.data.filter(file => 
            file.type === 'file' && file.name.endsWith('.md'));
        
        console.log(`Found ${markdownFiles.length} markdown files in terms directory`);
        console.log(`File names: ${markdownFiles.map(file => file.name).join(', ')}`);
        
        // CUSTOM CHECK for our specific term
        const specificTerm = terms.find(t => t.term === 'authentic-chained-data-container');
        if (specificTerm) {
            console.log(`👀 Looking specifically for term: ${specificTerm.term}`);
            // Expected filename variations
            const expectedFilenames = [
                'authentic-chained-data-container.md',
                'authenticchaineddatacontainer.md',
                'ACDC.md',
                'acdc.md'
            ];
            
            for (const expectedName of expectedFilenames) {
                console.log(`Checking if ${expectedName} exists in the directory...`);
                const matchFile = markdownFiles.find(file => file.name.toLowerCase() === expectedName.toLowerCase());
                if (matchFile) {
                    console.log(`🎯 Found potential match for ${specificTerm.term}: ${matchFile.name}`);
                    
                    // Directly get content for this file to check it
                    try {
                        const fileContent = await axios.get(matchFile.download_url, { headers });
                        console.log(`Downloaded content for ${matchFile.name}, size: ${fileContent.data.length} chars`);
                        
                        // Get sample of content for debugging
                        const contentSample = fileContent.data.substring(0, 200);
                        console.log(`Content sample: ${contentSample}`);
                        
                        // Try to directly set this file for our term
                        const commitHash = await fetchFileCommitInfo(token, owner, repo, matchFile.path, headers);
                        termSourceMap[specificTerm.term] = {
                            sourceFile: matchFile.path,
                            commitHash: commitHash || "manually-matched"
                        };
                        console.log(`✅ Manually matched term "${specificTerm.term}" to file ${matchFile.path} with commit ${commitHash}`);
                    } catch (fileError) {
                        console.log(`Error fetching content for ${matchFile.name}: ${fileError.message}`);
                    }
                }
            }
        }
        
        // For each file, check its content to see which terms it contains
        for (const file of markdownFiles) {
            console.log(`Checking file: ${file.name}`);
            
            // Check if filename matches any term (common convention for term files)
            const filenameWithoutExt = file.name.replace(/\.md$/, '');
            console.log(`Filename without extension: ${filenameWithoutExt}`);
            
            // Normalize filename for comparison by converting hyphens to spaces
            const normalizedFilename = filenameWithoutExt.replace(/-/g, ' ').toLowerCase();
            
            // Find terms that might be defined in this file based on filename
            const potentialTerms = terms.filter(term => 
                term.term.toLowerCase() === normalizedFilename);
            
            if (potentialTerms.length > 0) {
                console.log(`Potential term match by filename: ${potentialTerms.map(t => t.term).join(', ')}`);
            }
            
            // Get the file content
            const fileContentResponse = await axios.get(file.download_url, { headers });
            
            if (fileContentResponse.status !== 200) {
                console.log(`❌ Could not fetch content of ${file.name}`);
                continue;
            }
            
            const fileContent = fileContentResponse.data;
            console.log(`File content length: ${fileContent.length} characters`);
            
            // Check which terms are defined in this file
            for (const term of terms) {
                // Try multiple patterns to find term definitions
                let isMatch = false;
                
                // 1. Simple check for term definition pattern: [[def: term-name
                const defPattern = new RegExp(`\\[\\[def:\\s*${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[,\\s\\]]`, 'i');
                if (defPattern.test(fileContent)) {
                    isMatch = true;
                    console.log(`✅ Found term "${term.term}" in file ${file.path} using [[def: pattern`);
                }
                
                // 2. Check for filename match (if not already matched)
                if (!isMatch && term.term.toLowerCase() === normalizedFilename) {
                    isMatch = true;
                    console.log(`✅ Found term "${term.term}" by filename match: ${file.name}`);
                }
                
                // 3. Check for markdown heading pattern: # Term Name
                if (!isMatch) {
                    const headingPattern = new RegExp(`#\\s+${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*$`, 'im');
                    if (headingPattern.test(fileContent)) {
                        isMatch = true;
                        console.log(`✅ Found term "${term.term}" in file ${file.path} using heading pattern`);
                    }
                }
                
                // 4. Check if term appears anywhere in content with some emphasis
                if (!isMatch) {
                    // Look for term in bold, italics, or other emphasis
                    const emphasisPatterns = [
                        new RegExp(`\\*\\*${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\*\\*`, 'i'), // Bold
                        new RegExp(`\\*${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\*`, 'i'),      // Italic
                        new RegExp(`__${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}__`, 'i'),        // Bold
                        new RegExp(`_${term.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}_`, 'i')           // Italic
                    ];
                    
                    for (const pattern of emphasisPatterns) {
                        if (pattern.test(fileContent)) {
                            isMatch = true;
                            console.log(`✅ Found term "${term.term}" in file ${file.path} using emphasis pattern`);
                            break;
                        }
                    }
                }
                
                if (isMatch) {
                    // Get the commit info for this file
                    const commitHash = await fetchFileCommitInfo(token, owner, repo, file.path, headers);
                    
                    // Store the mapping
                    termSourceMap[term.term] = {
                        sourceFile: file.path,
                        commitHash: commitHash || "unknown"
                    };
                    
                    console.log(`✅ Mapped term "${term.term}" to file ${file.path} with commit ${commitHash}`);
                    break; // Assuming each term is defined in only one file
                }
            }
        }
        
        return termSourceMap;
        
    } catch (error) {
        console.error(`❌ Error mapping terms to source files: ${error.message}`);
        return termSourceMap;
    }
}

/**
 * Fetches all terms and definitions from a repository's index.html
 * @param {string} token - GitHub API Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name 
 * @param {object} options - Additional options
 * @returns {object|null} - Object containing all terms or null if error
 */
async function fetchAllTermsFromIndex(token, owner, repo, options = {}) {
    try {
        // Generate cache key based on repo information
        const cacheKey = generateCacheKey(owner, repo);
        let cachedData = null;

        // Check cache first if caching is enabled
        if (options.cache !== false) {
            cachedData = getFromCache(cacheKey, options);
            if (cachedData) {
                return cachedData;
            }
        }

        // Get the specs.json content from the repository to find the output_path
        const specsJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/specs.json`;
        console.log(`Fetching specs.json from: ${specsJsonUrl}`);

        // Configure headers for GitHub API
        const headers = {};
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        // Fetch specs.json content
        const specsJsonResponse = await axios.get(specsJsonUrl, { headers });
        if (specsJsonResponse.status !== 200) {
            console.log(`❌ Could not find specs.json in repository ${owner}/${repo}`);
            return null;
        }

        // Decode specs.json content from base64
        const specsJsonContent = Buffer.from(specsJsonResponse.data.content, 'base64').toString('utf8');
        const specsJson = JSON.parse(specsJsonContent);
        
        // Get the output_path from specs.json
        const outputPath = specsJson.specs[0].output_path;
        if (!outputPath) {
            console.log(`❌ No output_path found in specs.json for repository ${owner}/${repo}`);
            return null;
        }

        // Fix: Properly normalize the output path to ensure it doesn't have leading "./" or trailing "/"
        const normalizedOutputPath = outputPath.replace(/^\.\//, '').replace(/\/$/, '');
        
        // Fetch the index.html content with properly constructed URL
        const indexHtmlUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${normalizedOutputPath}/index.html`;
        console.log(`Fetching index.html from: ${indexHtmlUrl}`);
        
        const indexHtmlResponse = await axios.get(indexHtmlUrl, { headers });
        if (indexHtmlResponse.status !== 200) {
            console.log(`❌ Could not find index.html at ${indexHtmlUrl}`);
            return null;
        }

        const htmlContent = indexHtmlResponse.data;
        
        // Parse HTML using JSDOM
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        
        // Find all term definition lists with class "terms-and-definitions-list"
        const termDlList = document.querySelector('dl.terms-and-definitions-list');
        if (!termDlList) {
            console.log(`❌ No terms-and-definitions-list found in ${indexHtmlUrl}`);
            return null;
        }

        // Extract all terms and definitions
        const terms = [];
        let dtElements = termDlList.querySelectorAll('dt');
        
        dtElements.forEach(dt => {
            // Find the term span that starts with id="term:
            const termSpan = dt.querySelector('span[id^="term:"]');
            if (!termSpan) return;

            // Get the term text (all text content, excluding nested spans)
            let termText = '';
            for (let node of termSpan.childNodes) {
                if (node.nodeType === dom.window.Node.TEXT_NODE) {
                    termText += node.textContent.trim();
                }
            }
            
            // If no text found, try to get the full text content
            if (!termText) {
                termText = termSpan.textContent.trim();
            }
            
            // Skip empty terms
            if (!termText) return;
            
            // Find all corresponding definition elements
            let dds = [];
            let nextElement = dt.nextElementSibling;
            
            // Collect all consecutive <dd> elements until we reach another <dt>
            while (nextElement && nextElement.tagName.toLowerCase() === 'dd') {
                dds.push(nextElement.outerHTML);
                nextElement = nextElement.nextElementSibling;
            }
            
            terms.push({
                term: termText,
                definition: dds.join('\n')
            });
        });

        // Get the terms directory from specs.json
        const termsDir = specsJson.specs[0].spec_terms_directory; 
        
        // Map terms to their source files and get commit information
        const termSourcesMap = await mapTermsToSourceFiles(token, owner, repo, termsDir, terms, headers);

        // Store all terms in a JSON file with timestamp
        const timestamp = Date.now();
        const outputDir = path.join(CACHE_DIR);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Create output filename with timestamp
        const outputFileName = `${timestamp}-${owner}-${repo}-terms.json`;
        const outputFilePath = path.join(outputDir, outputFileName);
        
        // Create the result object
        const result = {
            timestamp,
            repository: `${owner}/${repo}`,
            terms: terms.map(term => ({
                ...term,
                sourceFile: termSourcesMap[term.term]?.sourceFile || null,
                fileCommitHash: termSourcesMap[term.term]?.commitHash || null
            })),
            sha: specsJsonResponse.data.sha, // Keep the specs.json sha for backward compatibility
            avatarUrl: null,
            outputFileName
        };
        
        // Save all terms to file
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
        console.log(`✅ Saved ${terms.length} terms to ${outputFilePath}`);
        
        // Save to cache if enabled
        if (options.cache !== false) {
            saveToCache(cacheKey, result);
        }
        
        return result;

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                console.log(`❌ Resource not found: ${error.config.url}`);
            } else if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000);
                console.error(`❌ GitHub API rate limit exceeded. Try again after ${resetTime.toLocaleString()}`);
            } else {
                console.error(`❌ Error fetching data: ${error.response.status} ${error.response.statusText}`);
            }
        } else {
            console.error(`❌ Error fetching term: ${error.message}`);
        }
        return null;
    }
}

/**
 * Fetches a specific term from repository's index.html
 * This is a wrapper that uses fetchAllTermsFromIndex for efficiency
 * @param {string} token - GitHub API Token
 * @param {string} term - The specific term to look for
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} termsDir - Directory containing term definitions (not used in this implementation)
 * @param {object} options - Additional options
 * @returns {object|null} - Found term data or null if not found
 */
async function fetchTermsFromIndex(token, term, owner, repo, termsDir, options = {}) {
    // First get all terms from the repository (which is cached)
    const allTermsData = await fetchAllTermsFromIndex(token, owner, repo, options);
    
    if (!allTermsData || !allTermsData.terms) {
        return null;
    }
    
    // Find the specific term
    const foundTerm = allTermsData.terms.find(t => t.term.toLowerCase() === term.toLowerCase());
    
    if (foundTerm) {
        console.log(`Found term '${term}' in repository ${owner}/${repo}`);
        return {
            term: foundTerm.term,
            content: foundTerm.definition,
            sha: allTermsData.sha,
            fileCommitHash: foundTerm.fileCommitHash, // Include the specific file's commit hash
            sourceFile: foundTerm.sourceFile, // Include the source file path
            repository: {
                owner: {
                    login: owner,
                    avatar_url: allTermsData.avatarUrl
                },
                name: repo
            }
        };
    } else {
        console.log(`❌ Term "${term}" not found in repository ${owner}/${repo}`);
        return null;
    }
}

module.exports = {
    fetchTermsFromIndex,
    fetchAllTermsFromIndex  // Export the function to fetch all terms as well
};