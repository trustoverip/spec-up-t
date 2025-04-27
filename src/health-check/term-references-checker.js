const fs = require('fs');
const path = require('path');

/**
 * Extracts the spec name from a tref tag at the beginning of a markdown file
 * @param {string} firstLine - The first line of a markdown file
 * @returns {string|null} - The extracted spec name or null if not found
 */
function extractSpecNameFromTref(firstLine) {
  if (!firstLine.includes('[[tref:')) {
    return null;
  }
  
  try {
    // Extract content between [[tref: and the next comma
    const match = firstLine.match(/\[\[tref:([^,]+)/);
    if (match && match[1]) {
      // Trim whitespace
      return match[1].trim();
    }
  } catch (error) {
    console.error('Error extracting spec name from tref:', error);
  }
  
  return null;
}

/**
 * Check if all markdown files in spec terms directories have valid tref references
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} - Array of check results
 */
async function checkTermReferences(projectRoot) {
  const results = [];
  
  try {
    const specsPath = path.join(projectRoot, 'specs.json');
    
    // Check if specs.json exists
    if (!fs.existsSync(specsPath)) {
      return [{
        name: 'Find specs.json file',
        success: false,
        details: 'specs.json file not found in project root'
      }];
    }
    
    // Read specs.json
    const specsContent = fs.readFileSync(specsPath, 'utf8');
    const specs = JSON.parse(specsContent);
    
    // Find all external specs
    const externalSpecs = [];
    let allSpecDirectories = [];
    
    if (specs.specs && Array.isArray(specs.specs)) {
      // Collect all external specs
      specs.specs.forEach(spec => {
        if (spec.external_specs && Array.isArray(spec.external_specs)) {
          spec.external_specs.forEach(extSpec => {
            if (extSpec.external_spec) {
              externalSpecs.push(extSpec.external_spec);
            }
          });
        }
        
        // Collect term directories
        if (spec.spec_directory && spec.spec_terms_directory) {
          const termsDir = path.join(
            projectRoot, 
            spec.spec_directory, 
            spec.spec_terms_directory
          );
          allSpecDirectories.push(termsDir);
        }
      });
    }
    
    if (externalSpecs.length === 0) {
      results.push({
        name: 'Find external specs',
        success: false,
        details: 'No external_spec entries found in specs.json'
      });
    } else {
      results.push({
        name: 'Find external specs',
        success: true,
        details: `Found ${externalSpecs.length} external specs: ${externalSpecs.join(', ')}`
      });
    }
    
    if (allSpecDirectories.length === 0) {
      results.push({
        name: 'Find spec terms directories',
        success: false,
        details: 'No spec_directory/spec_terms_directory entries found in specs.json'
      });
      return results;
    }
    
    results.push({
      name: 'Find spec terms directories',
      success: true,
      details: `Found ${allSpecDirectories.length} spec terms directories`
    });
    
    // Process all markdown files in all terms directories
    for (const termsDir of allSpecDirectories) {
      if (!fs.existsSync(termsDir)) {
        results.push({
          name: `Check terms directory: ${termsDir}`,
          success: false,
          details: `Terms directory does not exist: ${termsDir}`
        });
        continue;
      }
      
      // Find all markdown files in the terms directory
      const markdownFiles = fs.readdirSync(termsDir)
        .filter(file => path.extname(file) === '.md')
        .map(file => path.join(termsDir, file));
      
      if (markdownFiles.length === 0) {
        results.push({
          name: `Find markdown files in <code>${termsDir}</code>`,
          success: false,
          details: `No markdown files found in terms directory: ${termsDir}`
        });
        continue;
      }
      
      results.push({
        name: `Find markdown files in <code>${termsDir}</code>`,
        success: true,
        details: `Found ${markdownFiles.length} markdown files`
      });
      
      // Check each markdown file
      for (const mdFile of markdownFiles) {
        try {
          const content = fs.readFileSync(mdFile, 'utf8');
          const firstLine = content.split('\n')[0];
          
          if (!firstLine.includes('[[tref:')) {
            // Skip this file as it doesn't contain a tref tag in the first line
            continue;
          }
          
          const specName = extractSpecNameFromTref(firstLine);
          if (!specName) {
            results.push({
              name: `Check tref in ${path.basename(mdFile)}`,
              success: false,
              details: `Could not extract spec name from tref tag in first line: "${firstLine}"`
            });
            continue;
          }
          
          const isValid = externalSpecs.includes(specName);
          results.push({
            name: `Check tref spec "${specName}" in <code>${path.basename(mdFile)}</code>`,
            success: isValid,
            details: isValid
              ? `Valid external spec reference: ${specName}`
              : `Invalid external spec reference: "${specName}" is not defined in external_specs`
          });
        } catch (error) {
          results.push({
            name: `Check file ${path.basename(mdFile)}`,
            success: false,
            details: `Error reading or processing file: ${error.message}`
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking term references:', error);
    return [{
      name: 'Term references check',
      success: false,
      details: `Error: ${error.message}`
    }];
  }
}

module.exports = {
  checkTermReferences
};