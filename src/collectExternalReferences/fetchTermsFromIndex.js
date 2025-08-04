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
const { addPath, getPath, getAllPaths } = require('../../config/paths');

// Directory to store fetched data files
const CACHE_DIR = getPath('githubcache');



/**
 * Fetches the latest commit hash for a specific file in a repository
 * @param {string} token - GitHub API Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to the file in the repository
 * @param {object} headers - Request headers
 * @returns {string|null} - Latest commit hash or null if error
 */
async function getFileCommitHash(token, owner, repo, filePath, headers) {
    try {
        // Normalize the file path to ensure it doesn't have leading slash
        const normalizedPath = filePath.replace(/^\//, '');
        
        // Construct API URL to get commits for the specific file
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${normalizedPath}&per_page=1`;
        console.log(`Fetching latest commit for file: ${commitsUrl}`);
        
        const response = await axios.get(commitsUrl, { headers });
        
        if (response.status !== 200 || !response.data || response.data.length === 0) {
            console.log(`❌ Could not find commit information for ${filePath}`);
            return null;
        }
        
        // Return the SHA of the latest commit
        return response.data[0].sha;
    } catch (error) {
        console.error(`❌ Error fetching commit hash: ${error.message}`);
        return null;
    }
}

/**
 * Fetches all terms and definitions from a repository's GitHub Pages index.html
 * @param {string} token - GitHub API Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name 
 * @param {object} options - Additional options including ghPageUrl
 * @returns {object|null} - Object containing all terms or null if error
 */
async function fetchAllTermsFromIndex(token, owner, repo, options = {}) {
    try {
        // Configure headers for GitHub API
        const headers = {};
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        // Use GitHub Pages URL if provided in options, otherwise fallback to raw repository
        let indexHtmlUrl;
        let commitHash = null;

        if (options.ghPageUrl) {
            // Fetch from GitHub Pages (deployed HTML)
            indexHtmlUrl = options.ghPageUrl.endsWith('/') ? 
                `${options.ghPageUrl}index.html` : 
                `${options.ghPageUrl}/index.html`;
            console.log(`Fetching index.html from GitHub Pages: ${indexHtmlUrl}`);
            
            // For GitHub Pages, we'll try to get the commit hash from the main branch
            try {
                const mainBranchUrl = `https://api.github.com/repos/${owner}/${repo}/branches/main`;
                const branchResponse = await axios.get(mainBranchUrl, { headers });
                if (branchResponse.status === 200) {
                    commitHash = branchResponse.data.commit.sha;
                    console.log(`✅ Got commit hash from main branch: ${commitHash}`);
                }
            } catch (error) {
                console.log(`⚠️ Could not get commit hash from main branch: ${error.message}`);
            }
        } else {
            // Fallback to raw repository method
            console.log(`⚠️ No GitHub Pages URL provided, falling back to repository method`);
            
            // Get the specs.json content from the repository to find the output_path
            const specsJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/specs.json`;
            console.log(`Fetching specs.json from: ${specsJsonUrl}`);

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
            
            // Create the path to the index.html file
            const indexHtmlPath = `${normalizedOutputPath}/index.html`;
            
            // Fetch the index.html content with properly constructed URL
            indexHtmlUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${indexHtmlPath}`;
            console.log(`Fetching index.html from raw repository: ${indexHtmlUrl}`);

            // Get the commit hash for the index.html file
            commitHash = await getFileCommitHash(token, owner, repo, indexHtmlPath, headers);
            if (!commitHash) {
                console.log(`⚠️ Could not get commit hash for index.html, continuing without it`);
            }
        }

        // Fetch the index.html content
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
            terms,
            sha: commitHash, // Use the commit hash of the index.html file
            avatarUrl: null,
            outputFileName
        };
        
        // Save all terms to file
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
        console.log(`✅ Saved ${terms.length} terms to ${outputFilePath}`);
        
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