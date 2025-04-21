const fs = require('fs');
const path = require('path');
const { shouldProcessFile } = require('../utils/file-filter');

/**
 * Extracts the spec name and term from a tref tag at the beginning of a markdown file
 * @param {string} firstLine - The first line of a markdown file
 * @returns {Object|null} - Object containing repo and term, or null if not found
 */
function extractTrefInfo(firstLine) {
  if (!firstLine.includes('[[tref:')) {
    return null;
  }
  
  try {
    // Extract content between [[tref: and ]]
    const trefMatch = firstLine.match(/\[\[tref:([^\]]+)\]\]/);
    if (!trefMatch || !trefMatch[1]) {
      return null;
    }
    
    const trefContent = trefMatch[1].trim();
    
    // Split by the first comma
    const parts = trefContent.split(',');
    if (parts.length < 2) {
      return null;
    }
    
    // Extract repo and term
    const repo = parts[0].trim();
    const term = parts.slice(1).join(',').trim();
    
    return { repo, term };
  } catch (error) {
    console.error('Error extracting tref info:', error);
    return null;
  }
}

/**
 * Find all JSON cache files for repositories
 * @param {string} cacheDir - Directory containing the cached files
 * @returns {Array} - List of all JSON cache files
 */
function findAllCacheFiles(cacheDir) {
  if (!fs.existsSync(cacheDir)) {
    return [];
  }
  
  try {
    const files = fs.readdirSync(cacheDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(cacheDir, file));
    
    return files;
  } catch (error) {
    console.error(`Error finding cache files:`, error);
    return [];
  }
}

/**
 * Checks if a term exists in a repository JSON cache file
 * @param {string} filePath - Path to the cached repository file
 * @param {string} term - Term to search for
 * @returns {boolean} - Whether the term exists in the file
 */
function termExistsInRepo(filePath, term) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check if the file has a terms array
    if (!cacheData || !cacheData.terms || !Array.isArray(cacheData.terms)) {
      console.log(`Warning: Cache file ${filePath} has no terms array`);
      return false;
    }
    
    // Case-insensitive search for the term
    const termLower = term.toLowerCase();
    
    // Check each term in the terms array
    for (const termObj of cacheData.terms) {
      // First check the 'term' property if it exists
      if (termObj.term && termObj.term.toLowerCase() === termLower) {
        return true;
      }
      
      // If there's a definition property, check if the term appears in it
      if (termObj.definition) {
        // Look for patterns like [[def: term]] or similar
        const defMatch = termObj.definition.match(/\[\[def:\s*([^\],]+)/i);
        if (defMatch && defMatch[1] && defMatch[1].trim().toLowerCase() === termLower) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if term exists in file ${filePath}:`, error);
    return false;
  }
}

/**
 * Find which repo a cache file belongs to
 * @param {string} filePath - Path to the cache file
 * @param {Array} externalSpecs - List of external specs
 * @returns {string|null} - The external_spec identifier or null
 */
function findRepoForCacheFile(filePath, externalSpecs) {
  try {
    const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!cacheData || !cacheData.repository) {
      return null;
    }
    
    // Extract owner/repo from the repository field
    const repoPath = cacheData.repository;
    
    // Find matching external spec
    for (const spec of externalSpecs) {
      if (!spec.url) continue;
      
      // Extract owner/repo from the URL
      const match = spec.url.match(/github\.com\/([^\/]+\/[^\/]+)/i);
      if (match && match[1] && repoPath.includes(match[1])) {
        return spec.external_spec;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Checks for specified term in all available external repos
 * @param {string} cacheDir - Directory containing the cached repository files
 * @param {Array} externalSpecs - List of external specs from specs.json
 * @param {string} currentRepo - The repository being checked (to exclude it)
 * @param {string} term - Term to search for
 * @returns {Array} - List of repositories where the term was found
 */
function findTermInOtherRepos(cacheDir, externalSpecs, currentRepo, term) {
  const reposWithTerm = [];
  
  // Get all cache files
  const cacheFiles = findAllCacheFiles(cacheDir);
  
  for (const cacheFile of cacheFiles) {
    // Check which repo this cache file belongs to
    const repo = findRepoForCacheFile(cacheFile, externalSpecs);
    
    // Skip if we couldn't determine which repo this is or if it's the current repo
    if (!repo || repo === currentRepo) {
      continue;
    }
    
    // Check if the term exists in this repo
    if (termExistsInRepo(cacheFile, term)) {
      reposWithTerm.push(repo);
    }
  }
  
  return reposWithTerm;
}

/**
 * Find cache file for a specific external repo
 * @param {string} cacheDir - Cache directory
 * @param {Object} specConfig - External spec configuration
 * @returns {string|null} - Path to the cache file or null
 */
function findCacheFileForRepo(cacheDir, specConfig) {
  if (!fs.existsSync(cacheDir) || !specConfig || !specConfig.url) {
    return null;
  }
  
  try {
    // Extract owner and repo from URL
    const match = specConfig.url.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!match || !match[1] || !match[2]) {
      return null;
    }
    
    const owner = match[1];
    const repo = match[2];
    
    // Find all JSON files in the cache directory
    const files = fs.readdirSync(cacheDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        path: path.join(cacheDir, file),
        name: file
      }))
      // Sort by timestamp descending (assuming timestamp is at the beginning of filename)
      .sort((a, b) => {
        const timestampA = parseInt(a.name.split('-')[0] || '0', 10);
        const timestampB = parseInt(b.name.split('-')[0] || '0', 10);
        return timestampB - timestampA;
      });
    
    // Find the most recent cache file for this repo
    for (const file of files) {
      if (file.name.includes(owner) && file.name.includes(repo)) {
        return file.path;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding cache file for repo:`, error);
    return null;
  }
}

/**
 * Check if terms referenced via tref tags exist in the corresponding external repos
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} - Array of check results
 */
async function checkTrefTerms(projectRoot) {
  const results = [];
  
  try {
    // Path to the project's specs.json
    const specsPath = path.join(projectRoot, 'specs.json');
    
    // Check if specs.json exists
    if (!fs.existsSync(specsPath)) {
      return [{
        name: 'Find specs.json file',
        success: false,
        details: 'specs.json file not found in project root'
      }];
    }
    
    results.push({
      name: 'Find specs.json file',
      success: true,
      details: 'specs.json file found'
    });
    
    // Read specs.json to get the spec directory
    const specsContent = fs.readFileSync(specsPath, 'utf8');
    const specs = JSON.parse(specsContent);
    
    // Get the external specs
    if (!specs.specs || !Array.isArray(specs.specs)) {
      results.push({
        name: 'Find specs configuration',
        success: false,
        details: 'specs array not found in specs.json'
      });
      return results;
    }
    
    // Collect all external specs and spec directories
    const externalSpecs = [];
    const specDirs = [];
    
    specs.specs.forEach(spec => {
      if (spec.external_specs && Array.isArray(spec.external_specs)) {
        externalSpecs.push(...spec.external_specs);
      }
      
      if (spec.spec_directory && spec.spec_terms_directory) {
        const termsDir = path.join(
          projectRoot, 
          spec.spec_directory, 
          spec.spec_terms_directory
        );
        specDirs.push(termsDir);
      }
    });
    
    if (externalSpecs.length === 0) {
      results.push({
        name: 'Find external specs',
        success: false,
        details: 'No external specs found in specs.json'
      });
      return results;
    }
    
    results.push({
      name: 'Find external specs',
      success: true,
      details: `Found ${externalSpecs.length} external specs`
    });
    
    if (specDirs.length === 0) {
      results.push({
        name: 'Find spec terms directories',
        success: false,
        details: 'No spec terms directories found'
      });
      return results;
    }
    
    results.push({
      name: 'Find spec terms directories', 
      success: true,
      details: `Found ${specDirs.length} spec terms directories`
    });
    
    // Path to the GitHub cache directory
    const githubCacheDir = path.join(projectRoot, 'output', 'github-cache');
    
    if (!fs.existsSync(githubCacheDir)) {
      results.push({
        name: 'Find GitHub cache directory',
        success: false,
        details: 'GitHub cache directory not found at output/github-cache. Terms in external repos cannot be verified.'
      });
      return results;
    }
    
    results.push({
      name: 'Find GitHub cache directory',
      success: true,
      details: 'GitHub cache directory found'
    });
    
    // Find and check all markdown files in all spec directories
    let totalFiles = 0;
    let filesWithTref = 0;
    let validTerms = 0;
    let invalidTerms = 0;
    let termsFoundInOtherRepos = 0;
    
    for (const specDir of specDirs) {
      if (!fs.existsSync(specDir)) {
        continue;
      }
      
      // Get all markdown files
      const allFiles = fs.readdirSync(specDir);
      const markdownFiles = allFiles.filter(file => shouldProcessFile(file));
      
      totalFiles += markdownFiles.length;
      
      for (const file of markdownFiles) {
        const filePath = path.join(specDir, file);
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          const firstLine = lines[0];
          
          if (!firstLine.includes('[[tref:')) {
            continue;
          }
          
          filesWithTref++;
          
          // Extract repo and term information
          const trefInfo = extractTrefInfo(firstLine);
          if (!trefInfo) {
            results.push({
              name: `Parse tref in ${file}`,
              success: false,
              details: `Could not parse tref information from first line: "${firstLine}"`
            });
            continue;
          }
          
          const { repo, term } = trefInfo;
          
          // Check if the referenced repo exists in external_specs
          const specConfig = externalSpecs.find(spec => spec.external_spec === repo);
          if (!specConfig) {
            results.push({
              name: `Check repo reference in ${file}`,
              success: false,
              details: `Referenced repo "${repo}" is not defined in external_specs`
            });
            continue;
          }
          
          // Find the cache file for this repo
          const cacheFile = findCacheFileForRepo(githubCacheDir, specConfig);
          
          if (!cacheFile) {
            results.push({
              name: `Find cache for repo "${repo}" referenced in ${file}`,
              success: false,
              details: `No cache file found for repo "${repo}". Unable to verify if term "${term}" exists.`
            });
            continue;
          }
          
          // Check if the term exists in the repo
          const termExists = termExistsInRepo(cacheFile, term);
          
          if (termExists) {
            validTerms++;
            results.push({
              name: `Term "${term}" in repo "${repo}" (${file})`,
              success: true,
              details: `Term "${term}" found in repo "${repo}"`
            });
          } else {
            // Check if the term exists in other repos
            const otherRepos = findTermInOtherRepos(githubCacheDir, externalSpecs, repo, term);
            
            if (otherRepos.length > 0) {
              // Change: Show as warning (partial success) instead of failure
              termsFoundInOtherRepos++;
              results.push({
                name: `Term "${term}" in repo "${repo}" (${file})`,
                success: 'partial', // Use 'partial' to indicate a warning
                details: `Warning: Term <code>${term}</code> NOT found in repo ${repo} but found in these repos: <code>${otherRepos.join(', ')}</code>. Consider updating the reference.`
              });
            } else {
              invalidTerms++;
              results.push({
                name: `Term "${term}" in repo "${repo}" (${file})`,
                success: false,
                details: `Term <code>${term}</code> NOT found in repo <code>${repo}</code> and not found in any other external repos`
              });
            }
          }
        } catch (error) {
          results.push({
            name: `Process file ${file}`,
            success: false,
            details: `Error processing file: ${error.message}`
          });
        }
      }
    }
    
    // Add summary results - modified to include terms found in other repos
    results.push({
      name: 'Term reference validation summary',
      success: invalidTerms === 0,
      details: `Processed ${totalFiles} files, found ${filesWithTref} with tref tags. ${validTerms} terms found correctly, ${termsFoundInOtherRepos} terms found in alternative repos (warnings), ${invalidTerms} terms missing.`
    });
    
    return results;
  } catch (error) {
    console.error('Error checking tref terms:', error);
    return [{
      name: 'Term reference validation check',
      success: false,
      details: `Error: ${error.message}`
    }];
  }
}

module.exports = {
  checkTrefTerms
};