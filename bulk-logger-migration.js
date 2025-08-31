#!/usr/bin/env node

/**
 * Bulk Console Logger Migration Script
 * This script updates all remaining console.log/warn/error statements to use the new Logger utility
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
    // Console.log patterns
    {
        pattern: /console\.log\(`✅([^`]+)`\)/g,
        replacement: "Logger.success($1)"
    },
    {
        pattern: /console\.log\('✅([^']+)'\)/g,
        replacement: "Logger.success('$1')"
    },
    {
        pattern: /console\.log\(`❌([^`]+)`\)/g,
        replacement: "Logger.error($1)"
    },
    {
        pattern: /console\.log\('❌([^']+)'\)/g,
        replacement: "Logger.error('$1')"
    },
    {
        pattern: /console\.log\(`⚠️([^`]+)`\)/g,
        replacement: "Logger.warn($1)"
    },
    {
        pattern: /console\.log\('⚠️([^']+)'\)/g,
        replacement: "Logger.warn('$1')"
    },
    {
        pattern: /console\.log\(`ℹ️([^`]+)`\)/g,
        replacement: "Logger.info($1)"
    },
    {
        pattern: /console\.log\('ℹ️([^']+)'\)/g,
        replacement: "Logger.info('$1')"
    },
    
    // Console.error patterns
    {
        pattern: /console\.error\(`❌([^`]+)`\)/g,
        replacement: "Logger.error($1)"
    },
    {
        pattern: /console\.error\('❌([^']+)'\)/g,
        replacement: "Logger.error('$1')"
    },
    {
        pattern: /console\.error\(/g,
        replacement: "Logger.error("
    },
    
    // Console.warn patterns
    {
        pattern: /console\.warn\(`⚠️([^`]+)`\)/g,
        replacement: "Logger.warn($1)"
    },
    {
        pattern: /console\.warn\('⚠️([^']+)'\)/g,
        replacement: "Logger.warn('$1')"
    },
    {
        pattern: /console\.warn\(/g,
        replacement: "Logger.warn("
    }
];

// Files to process (exclude assets/js since they're client-side)
const sourceFiles = [
    'src/**/*.js',
    '!src/utils/logger.js',
    '!demo-logger.js',
    '!assets/**',
    '!node_modules/**'
];

function addLoggerImport(filePath, content) {
    // Check if Logger is already imported
    if (content.includes("require('./utils/logger')") || content.includes("require('../utils/logger')")) {
        return content;
    }
    
    // Check if file uses Logger methods
    if (content.includes('Logger.')) {
        // Calculate relative path to logger
        const relativePath = path.relative(path.dirname(filePath), 'src/utils/logger');
        const loggerPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
        
        // Find the last require statement
        const requireLines = content.match(/^const .* = require\(.*\);?$/gm);
        if (requireLines && requireLines.length > 0) {
            const lastRequire = requireLines[requireLines.length - 1];
            const newRequire = `const Logger = require('${loggerPath}');`;
            content = content.replace(lastRequire, lastRequire + '\n' + newRequire);
        } else {
            // Add at the top after any comments
            const lines = content.split('\n');
            let insertIndex = 0;
            
            // Skip initial comments and empty lines
            while (insertIndex < lines.length && 
                   (lines[insertIndex].trim() === '' || 
                    lines[insertIndex].trim().startsWith('//') ||
                    lines[insertIndex].trim().startsWith('/*') ||
                    lines[insertIndex].trim().startsWith('*'))) {
                insertIndex++;
            }
            
            lines.splice(insertIndex, 0, `const Logger = require('${loggerPath}');`, '');
            content = lines.join('\n');
        }
    }
    
    return content;
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Apply replacements
        for (const replacement of replacements) {
            const originalContent = content;
            content = content.replace(replacement.pattern, replacement.replacement);
            if (content !== originalContent) {
                modified = true;
            }
        }
        
        // Add Logger import if needed
        if (modified) {
            content = addLoggerImport(filePath, content);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Main execution
console.log('Starting bulk console logger migration...\n');

// Find all matching files
let allFiles = [];
for (const pattern of sourceFiles) {
    if (pattern.startsWith('!')) {
        // Exclude pattern - remove matching files from allFiles
        const excludePattern = pattern.substring(1);
        const excludeFiles = glob.sync(excludePattern);
        allFiles = allFiles.filter(file => !excludeFiles.includes(file));
    } else {
        const matchingFiles = glob.sync(pattern);
        allFiles = [...new Set([...allFiles, ...matchingFiles])];
    }
}

console.log(`Found ${allFiles.length} files to process:`);
allFiles.forEach(file => console.log(`  - ${file}`));
console.log('');

// Process each file
allFiles.forEach(processFile);

console.log('\nBulk migration completed!');
console.log('Manual review recommended for complex cases.');
