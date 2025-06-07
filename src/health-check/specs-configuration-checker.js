const fs = require('fs');
const path = require('path');

/**
 * Field descriptions for specs.json keys
 */
const fieldDescriptions = {
    'title': 'Specification title',
    'description': 'Specification description',
    'author': 'Specification author',
    'source': 'Source repository information',
    'spec_directory': 'Directory containing specification content',
    'spec_terms_directory': 'Directory containing term definitions',
    'output_path': 'Output directory for generated files',
    'markdown_paths': 'List of markdown files to include in the specification',
    'logo': 'Logo URL',
    'logo_link': 'Link to the logo',
    'favicon': 'Favicon URL',
    'external_specs': 'External specifications',
    'katex': 'KaTeX math rendering configuration'
};

/**
 * Fields that can remain at their default values without being flagged
 */
const allowDefaultValueFields = [
    'spec_directory',
    'spec_terms_directory',
    'output_path',
    'katex',
    'logo',
    'logo_link',
    'favicon'
];

/**
 * Fields that should fail if they're not modified from default values
 */
const mustChangeFields = [
    'title',
    'description',
    'author',
    'source'
];

/**
 * Known optional fields
 */
const knownOptionalFields = [
    'logo',
    'external_specs',
    'logo_link',
    'favicon',
    'katex',
    'spec_directory',
    'spec_terms_directory',
    'output_path',
    'markdown_paths'
];

/**
 * Deprecated fields that should not be flagged as unexpected
 */
const deprecatedFields = [];

/**
 * Check if the files needed for configuration check exist
 * @param {string} projectSpecsPath - Path to project specs.json
 * @param {string} defaultSpecsPath - Path to default specs.json
 * @returns {Array|null} - Check results or null if files exist
 */
function checkFilesExist(projectSpecsPath, defaultSpecsPath) {
    if (!fs.existsSync(projectSpecsPath)) {
        return [{
            name: 'Find specs.json file',
            success: false,
            details: 'specs.json file not found in project root'
        }];
    }

    if (!fs.existsSync(defaultSpecsPath)) {
        return [{
            name: 'Find default specs.json template',
            success: false,
            details: 'Default specs.json template not found'
        }];
    }

    return null;
}

/**
 * Get all valid field names (required + optional + deprecated). Creates a comprehensive list of all field names that should not be flagged as "unexpected"
 * @param {Array} defaultSpecKeys - Keys from default specs
 * @returns {Array} - All valid field names
 */
function getAllValidFields(defaultSpecKeys) {
    // Get all field names from descriptions (these are the canonical field names)
    const canonicalFields = Object.keys(fieldDescriptions);
    
    // Combine with known optional fields and deprecated fields
    const allValidFields = [
        ...canonicalFields,
        ...knownOptionalFields,
        ...deprecatedFields,
        ...defaultSpecKeys
    ];
    
    // Remove duplicates
    return [...new Set(allValidFields)];
}

/**
 * Categorize fields into required and optional
 * @param {Array} defaultSpecKeys - Keys from default specs
 * @returns {Object} - Object containing required and optional fields
 */
function categorizeFields(defaultSpecKeys) {
    const requiredFields = defaultSpecKeys
        .filter(key => !knownOptionalFields.includes(key))
        .map(key => ({
            key,
            description: fieldDescriptions[key] || `${key.replace(/_/g, ' ')} field`,
            allowDefaultValue: allowDefaultValueFields.includes(key),
            mustChange: mustChangeFields.includes(key)
        }));

    const optionalFields = defaultSpecKeys
        .filter(key => knownOptionalFields.includes(key))
        .map(key => ({
            key,
            description: fieldDescriptions[key] || `${key.replace(/_/g, ' ')} field`,
            allowDefaultValue: allowDefaultValueFields.includes(key)
        }));

    return { requiredFields, optionalFields };
}

/**
 * Process field validation results. Orchestrates the validation of all fields in the specs.json
 * @param {Object} projectSpecs - Project specs object  
 * @param {Object} defaultSpecs - Default specs object
 * @param {Array} defaultSpecKeys - Keys from default specs
 * @returns {Array} - Array of check results
 */
function processFieldValidation(projectSpecs, defaultSpecs, defaultSpecKeys) {
    const results = [];
    const { requiredFields, optionalFields } = categorizeFields(defaultSpecKeys);
    const missingRequiredKeys = [];
    
    // Check required fields
    for (const field of requiredFields) {
        const result = evaluateRequiredField(field, projectSpecs, defaultSpecs);
        if (!result.success && result.details.includes('missing')) {
            missingRequiredKeys.push(field.key);
        }
        results.push(result);
    }
    
    // Check optional fields
    for (const field of optionalFields) {
        results.push(evaluateOptionalField(field, projectSpecs, defaultSpecs));
    }
    
    return { results, missingRequiredKeys };
}

/**
 * Check for unexpected fields in project specs
 * @param {Object} projectSpecs - Project specs object
 * @param {Array} defaultSpecKeys - Keys from default specs
 * @returns {Array} - Array of unexpected field names
 */
function findUnexpectedFields(projectSpecs, defaultSpecKeys) {
    const projectKeys = Object.keys(projectSpecs.specs?.[0] || {});
    const allValidFields = getAllValidFields(defaultSpecKeys);
    
    return projectKeys.filter(key => !allValidFields.includes(key));
}

/**
 * Check if a field value has been configured
 * @param {any} projectValue - Value from project specs
 * @param {any} defaultValue - Value from default specs
 * @returns {boolean} - True if configured
 */
function isFieldConfigured(projectValue, defaultValue) {
    if (typeof projectValue === 'object') {
        return JSON.stringify(projectValue) !== JSON.stringify(defaultValue);
    }
    return projectValue !== defaultValue;
}

/**
 * Evaluate a required field and generate result
 * @param {Object} field - Field definition
 * @param {Object} projectSpecs - Project specs object
 * @param {Object} defaultSpecs - Default specs object
 * @returns {Object} - Check result
 */
function evaluateRequiredField(field, projectSpecs, defaultSpecs) {
    const hasField = projectSpecs.specs?.[0]?.hasOwnProperty(field.key);
    
    if (!hasField) {
        return {
            name: `${field.description} configuration`,
            success: false,
            details: `Required "${field.key}" key is missing in specs.json`
        };
    }

    const projectValue = projectSpecs.specs[0][field.key];
    const defaultValue = defaultSpecs.specs?.[0]?.[field.key];
    let configured = isFieldConfigured(projectValue, defaultValue);
    
    // For fields that can keep their default values, mark as configured
    if (field.allowDefaultValue) {
        configured = true;
    }

    let status;
    let success = true;
    
    if (!configured) {
        if (field.mustChange) {
            status = undefined; // No status means it shows as failure
            success = false;
        } else {
            status = 'warning';
        }
    }

    let details = '';
    if (configured) {
        details = (projectValue === defaultValue && field.allowDefaultValue)
            ? `Default value for ${field.description} is acceptable`
            : `${field.description} has been changed from default`;
    } else {
        details = `${field.description} is still set to default value${['title', 'author'].includes(field.key) ? `: \"${defaultValue}\"` : ''}`;
    }

    return {
        name: `${field.description} configuration`,
        status,
        success,
        details
    };
}

/**
 * Evaluate an optional field and generate result
 * @param {Object} field - Field definition
 * @param {Object} projectSpecs - Project specs object
 * @param {Object} defaultSpecs - Default specs object
 * @returns {Object} - Check result
 */
function evaluateOptionalField(field, projectSpecs, defaultSpecs) {
    const hasField = projectSpecs.specs?.[0]?.hasOwnProperty(field.key);
    
    if (!hasField) {
        return {
            name: `${field.description} configuration`,
            success: true,
            details: `Optional "${field.key}" key is not present (this is not required)`
        };
    }

    const projectValue = projectSpecs.specs[0][field.key];
    const defaultValue = defaultSpecs.specs?.[0]?.[field.key];
    let configured = isFieldConfigured(projectValue, defaultValue);
    
    if (field.allowDefaultValue) {
        configured = true;
    }

    let details = '';
    if (configured) {
        details = (projectValue === defaultValue && field.allowDefaultValue)
            ? `Default value for ${field.description} is acceptable`
            : `${field.description} has been changed from default`;
    } else {
        details = `${field.description} is still set to default value`;
    }

    return {
        name: `${field.description} configuration`,
        status: configured ? undefined : 'warning',
        success: true, // Always true for optional fields
        details
    };
}

/**
 * Generate summary results for the configuration check
 * @param {Array} results - Existing check results
 * @param {Array} missingRequiredKeys - List of missing required keys
 * @param {Array} unexpectedKeys - List of unexpected keys
 * @returns {Array} - Additional summary results
 */
function generateSummaryResults(results, missingRequiredKeys, unexpectedKeys) {
    const summaryResults = [];
    
    // Add a summary of missing required fields
    if (missingRequiredKeys.length > 0) {
        summaryResults.push({
            name: 'Required fields check',
            success: false,
            details: `Missing required fields: ${missingRequiredKeys.join(', ')}`
        });
    } else {
        summaryResults.push({
            name: 'Required fields check',
            success: true,
            details: 'All required fields are present'
        });
    }

    // Check for unexpected fields
    if (unexpectedKeys.length > 0) {
        summaryResults.push({
            name: 'Unexpected fields check',
            success: false,
            details: `Found unexpected fields that might be typos: ${unexpectedKeys.join(', ')}`
        });
    }

    // Overall configuration status
    const fieldResults = results.filter(r =>
        r.name.includes('configuration') &&
        !r.name.includes('Overall')
    );

    const configuredItemsCount = fieldResults.filter(r => r.success).length;
    const totalItems = fieldResults.length;
    const configurationPercentage = Math.round((configuredItemsCount / totalItems) * 100);

    summaryResults.push({
        name: 'Overall configuration status',
        success: configurationPercentage > 50 && missingRequiredKeys.length === 0,
        details: `${configurationPercentage}% of specs.json has been configured (${configuredItemsCount}/${totalItems} items)`
    });

    return summaryResults;
}

/**
 * Check if specs.json has been configured from default
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} - Array of check results
 */
async function checkSpecsJsonConfiguration(projectRoot) {
    try {
        // Path to the project's specs.json
        const projectSpecsPath = path.join(projectRoot, 'specs.json');

        // Path to the default boilerplate specs.json
        const defaultSpecsPath = path.join(
            __dirname,
            '..',
            'install-from-boilerplate',
            'boilerplate',
            'specs.json'
        );

        // Check if required files exist
        const fileCheckResults = checkFilesExist(projectSpecsPath, defaultSpecsPath);
        if (fileCheckResults) {
            return fileCheckResults;
        }

        // Read both files
        const projectSpecs = JSON.parse(fs.readFileSync(projectSpecsPath, 'utf8'));
        const defaultSpecs = JSON.parse(fs.readFileSync(defaultSpecsPath, 'utf8'));

        const results = [{
            name: 'specs.json exists',
            success: true,
            details: 'Project specs.json file found'
        }];

        // Get default spec keys for field categorization
        const defaultSpecKeys = Object.keys(defaultSpecs.specs?.[0] || {});
        
        // Process field validation using helper function
        const { results: fieldResults, missingRequiredKeys } = processFieldValidation(
            projectSpecs, 
            defaultSpecs, 
            defaultSpecKeys
        );
        results.push(...fieldResults);

        // Check for unexpected fields using helper function
        const unexpectedKeys = findUnexpectedFields(projectSpecs, defaultSpecKeys);

        // Add summary results
        const summaryResults = generateSummaryResults(results, missingRequiredKeys, unexpectedKeys);
        results.push(...summaryResults);

        return results;

    } catch (error) {
        console.error('Error checking specs.json configuration:', error);
        return [{
            name: 'specs.json configuration check',
            success: false,
            details: `Error: ${error.message}`
        }];
    }
}

module.exports = {
    checkSpecsJsonConfiguration
};