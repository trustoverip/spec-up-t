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
    const cacheTTL = options.cacheTTL || 24 * 60 * 60 * 1000; // Default: 24 hours

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
 * Fetches the HTML content from GitHub for a given repository and extracts terms
 * @param {string} token - GitHub API Token
 * @param {string} term - The specific term to look for (or null to get all terms)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} termsDir - Directory containing term definitions
 * @param {object} options - Additional options
 * @returns {object|null} - Found term data or null if not found
 */
async function fetchTermsFromIndex(token, term, owner, repo, termsDir, options = {}) {
    try {
        // Generate cache key based on repo information
        const cacheKey = generateCacheKey(owner, repo);
        let cachedData = null;

        // Check cache first if caching is enabled
        if (options.cache !== false) {
            cachedData = getFromCache(cacheKey, options);
            // If we have cached data and a specific term is requested, try to find it
            if (cachedData && term) {
                const foundTerm = cachedData.terms.find(t => t.term.toLowerCase() === term.toLowerCase());
                if (foundTerm) {
                    console.log(`Found term '${term}' in cache`);
                    return {
                        term: foundTerm.term,
                        content: foundTerm.definition,
                        sha: cachedData.sha || 'unknown',
                        repository: {
                            owner: {
                                login: owner,
                                avatar_url: cachedData.avatarUrl || null
                            },
                            name: repo
                        }
                    };
                }
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

        // Store all terms in a JSON file with timestamp
        const timestamp = Date.now();
        const outputDir = path.join(CACHE_DIR, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Create output filename with timestamp
        const outputFileName = `${owner}-${repo}-terms-${timestamp}.json`;
        const outputFilePath = path.join(outputDir, outputFileName);
        
        // Create the result object
        const result = {
            timestamp,
            repository: `${owner}/${repo}`,
            terms,
            sha: specsJsonResponse.data.sha,
            avatarUrl: null
        };
        
        // Save all terms to file
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
        console.log(`✅ Saved ${terms.length} terms to ${outputFilePath}`);
        
        // Save to cache if enabled
        if (options.cache !== false) {
            saveToCache(cacheKey, result);
        }
        
        // If a specific term was requested, find it and return
        if (term) {
            const foundTerm = terms.find(t => t.term.toLowerCase() === term.toLowerCase());
            if (foundTerm) {
                return {
                    term: foundTerm.term,
                    content: foundTerm.definition,
                    sha: specsJsonResponse.data.sha,
                    repository: {
                        owner: {
                            login: owner,
                            avatar_url: null
                        },
                        name: repo
                    }
                };
            } else {
                console.log(`❌ Term "${term}" not found in extracted terms`);
                return null;
            }
        }
        
        // Return filename for reference
        return {
            outputFileName,
            totalTermsFound: terms.length
        };

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

module.exports = {
    fetchTermsFromIndex
};