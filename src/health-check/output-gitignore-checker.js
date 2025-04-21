const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Checks if a path is gitignored
 * @param {string} projectRoot - Root directory of the project
 * @param {string} targetPath - Path to check (relative to project root)
 * @returns {boolean} - Whether the path is gitignored
 */
function isPathGitIgnored(projectRoot, targetPath) {
  try {
    // Use git check-ignore to determine if the path is ignored
    // If command exits with status 0, path is ignored
    // If command exits with status 1, path is not ignored
    execSync(`git -C "${projectRoot}" check-ignore -q "${targetPath}"`, { stdio: 'ignore' });
    return true; // Path is ignored (command exited with status 0)
  } catch (error) {
    return false; // Path is not ignored (command exited with non-zero status)
  }
}

/**
 * Check if the output directory is being ignored by Git
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} - Array of check results
 */
async function checkOutputDirGitIgnore(projectRoot) {
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
    
    // Read specs.json to get the output path
    const specsContent = fs.readFileSync(specsPath, 'utf8');
    const specs = JSON.parse(specsContent);
    
    // Get the output_path value
    const outputPath = specs.specs?.[0]?.output_path;
    
    if (!outputPath) {
      results.push({
        name: 'Find output_path field',
        success: false,
        details: 'output_path field not found in specs.json'
      });
      return results;
    }
    
    results.push({
      name: 'Find output_path field',
      success: true,
      details: `output_path field found: "${outputPath}"`
    });
    
    // Normalize the path to handle different formats (./, /, etc.)
    const normalizedPath = outputPath.replace(/^\.\/|^\//, '');
    
    // Check if the path exists
    const fullPath = path.join(projectRoot, normalizedPath);
    const outputPathExists = fs.existsSync(fullPath);
    
    if (!outputPathExists) {
      results.push({
        name: 'Output directory existence',
        status: 'warning',
        success: true, // Still considered a "success" for backward compatibility
        details: `Output directory "${outputPath}" does not exist yet. This is OK if you haven't rendered the specs yet.`
      });
    } else {
      results.push({
        name: 'Output directory existence',
        success: true,
        details: `Output directory "${outputPath}" exists`
      });
    }
    
    // Check if .gitignore exists
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      results.push({
        name: 'Find .gitignore file',
        status: 'warning',
        success: true, // Still considered a "success" for backward compatibility
        details: '.gitignore file not found in project root. Consider adding one for better version control.'
      });
      
      // If no .gitignore, we can assume the output path is not ignored
      results.push({
        name: 'Check if output directory is gitignored',
        success: true,
        details: 'No .gitignore file found, so output directory is not being ignored'
      });
      
      return results;
    }
    
    results.push({
      name: 'Find .gitignore file',
      success: true,
      details: '.gitignore file found'
    });
    
    // Read .gitignore content
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const lines = gitignoreContent.split('\n');
    
    // Extract the directory name from the path
    const dirName = path.basename(normalizedPath);
    
    // IMPROVED: First directly check .gitignore for patterns that would ignore the output directory
    const dirIgnorePatterns = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Directly check for common patterns that would ignore the output directory
      if (
        trimmedLine === normalizedPath || 
        trimmedLine === `/${normalizedPath}` || 
        trimmedLine === `./${normalizedPath}` ||
        trimmedLine === `${normalizedPath}/` ||
        trimmedLine === `/${normalizedPath}/` ||
        trimmedLine === `./${normalizedPath}/` ||
        // Check for just the directory name (e.g., "docs")
        trimmedLine === dirName ||
        trimmedLine === `/${dirName}` ||
        trimmedLine === `./${dirName}` ||
        trimmedLine === `${dirName}/` ||
        trimmedLine === `/${dirName}/` ||
        trimmedLine === `./${dirName}/` ||
        // Check for wildcards covering all directories
        trimmedLine === '*/' ||
        // Check for wildcards that might match our path using regex
        (trimmedLine.includes('*') && new RegExp('^' + trimmedLine.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$').test(normalizedPath))
      ) {
        dirIgnorePatterns.push(trimmedLine);
      }
    }
    
    // If we found patterns that would ignore the output directory, report them regardless of git check-ignore
    if (dirIgnorePatterns.length > 0) {
      results.push({
        name: 'Check if output directory is gitignored',
        success: false,
        details: `Found patterns in .gitignore that would ignore the output directory: ${dirIgnorePatterns.join(', ')}. Remove these entries to ensure generated content is tracked.`
      });
    } else {
      // Fall back to using git check-ignore for verification
      const isIgnored = isPathGitIgnored(projectRoot, normalizedPath);
      
      results.push({
        name: 'Check if output directory is gitignored',
        success: !isIgnored,
        details: isIgnored 
          ? `Output directory "${outputPath}" is being ignored by Git. This could be due to a complex pattern in .gitignore. Remove any entries that might affect this directory.`
          : `Output directory "${outputPath}" is not being ignored by Git, which is good.`
      });
    }
    
    // Check for HTML file ignoring patterns
    const htmlIgnorePatterns = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue;
      }
      
      if (
        trimmedLine === 'index.html' || 
        trimmedLine === '*.html' || 
        trimmedLine === '/index.html' || 
        trimmedLine === '**/index.html' ||
        trimmedLine === '**/*.html'
      ) {
        htmlIgnorePatterns.push(trimmedLine);
      }
    }
    
    // If we found HTML patterns in .gitignore, flag them regardless of git check-ignore result
    if (htmlIgnorePatterns.length > 0) {
      results.push({
        name: 'Check if index.html files are gitignored',
        success: false,
        details: `Found patterns in .gitignore that would ignore HTML files: ${htmlIgnorePatterns.join(', ')}. This is problematic as they're crucial output files.`
      });
    } else {
      // Only use git check-ignore as a fallback if we didn't find explicit HTML patterns
      const indexHtmlPath = path.join(normalizedPath, 'index.html');
      const isIndexHtmlIgnored = isPathGitIgnored(projectRoot, indexHtmlPath);
      
      results.push({
        name: 'Check if index.html files are gitignored',
        success: !isIndexHtmlIgnored,
        details: isIndexHtmlIgnored 
          ? `index.html files in the output directory would be ignored by Git. This is problematic as they're crucial output files.`
          : `index.html files in the output directory are properly tracked by Git.`
      });
      
      // If index.html is ignored but we couldn't find an explicit pattern, look for more complex patterns
      if (isIndexHtmlIgnored && htmlIgnorePatterns.length === 0) {
        // Look for more complex patterns that might be ignoring index.html files
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            continue;
          }
          
          // Check for wildcards and patterns that might match index.html
          if (trimmedLine.includes('*') || trimmedLine.includes('.html')) {
            htmlIgnorePatterns.push(trimmedLine);
          }
        }
        
        if (htmlIgnorePatterns.length > 0) {
          results.push({
            name: 'Found complex .gitignore entries potentially affecting HTML files',
            status: 'warning',
            success: true, // Still considered a "success" for backward compatibility
            details: `The following entries in .gitignore might cause HTML files to be ignored: ${htmlIgnorePatterns.join(', ')}. Consider reviewing these patterns.`
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking output directory gitignore status:', error);
    return [{
      name: 'Output directory gitignore check',
      success: false,
      details: `Error: ${error.message}`
    }];
  }
}

module.exports = {
  checkOutputDirGitIgnore
};