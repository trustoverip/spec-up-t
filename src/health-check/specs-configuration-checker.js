const fs = require('fs');
const path = require('path');

/**
 * Check if specs.json has been configured from default
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} - Array of check results
 */
async function checkSpecsJsonConfiguration(projectRoot) {
    const results = [];

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

        // Check if project specs.json exists
        if (!fs.existsSync(projectSpecsPath)) {
            return [{
                name: 'Find specs.json file',
                success: false,
                details: 'specs.json file not found in project root'
            }];
        }

        // Check if default specs.json exists
        if (!fs.existsSync(defaultSpecsPath)) {
            return [{
                name: 'Find default specs.json template',
                success: false,
                details: 'Default specs.json template not found'
            }];
        }

        // Read both files
        const projectSpecs = JSON.parse(fs.readFileSync(projectSpecsPath, 'utf8'));
        const defaultSpecs = JSON.parse(fs.readFileSync(defaultSpecsPath, 'utf8'));

        // Compare key parts to see if the file has been configured
        results.push({
            name: 'specs.json exists',
            success: true,
            details: 'Project specs.json file found'
        });

        // Dynamically extract field definitions from the default specs.json
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
            // Add more descriptions as needed, or create a more sophisticated lookup
        };

        // Define required and optional fields based on the default specs.json
        const defaultSpecKeys = Object.keys(defaultSpecs.specs?.[0] || {});

        // Known optional fields - this could be pulled from documentation if available
        const knownOptionalFields = ['logo', 'external_specs', 'logo_link', 'favicon', 'katex'];

        // Fields that can remain at their default values without being flagged
        const allowDefaultValueFields = [
            'spec_directory',
            'spec_terms_directory',
            'output_path',
            'katex',
            'logo',
            'logo_link',
            'favicon'
            // Add any other fields that should be allowed to have default values
            // Add any new field here that should be allowed to have default values
        ];

        // Fields that should fail if they're not modified from default values
        const mustChangeFields = [
            'title',
            'description',
            'author',
            'source'
        ];

        // Consider all keys in the template as required unless explicitly marked as optional
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

        // Check each required field exists
        const missingRequiredKeys = [];

        for (const field of requiredFields) {
            const hasField = projectSpecs.specs?.[0]?.hasOwnProperty(field.key);

            if (!hasField) {
                missingRequiredKeys.push(field.key);

                results.push({
                    name: `${field.description} configuration`,
                    success: false,
                    details: `Required "${field.key}" key is missing in specs.json`
                });
            } else {
                // Field exists, check if it's configured
                const projectValue = projectSpecs.specs[0][field.key];
                const defaultValue = defaultSpecs.specs?.[0]?.[field.key];
                let isConfigured = false;

                if (typeof projectValue === 'object') {
                    isConfigured = JSON.stringify(projectValue) !== JSON.stringify(defaultValue);
                } else {
                    isConfigured = projectValue !== defaultValue;
                }

                // For fields that can keep their default values, we'll mark them as configured
                if (field.allowDefaultValue) {
                    isConfigured = true;
                }

                // Determine if we should show warning or fail for unconfigured fields
                let status = undefined;
                let success = true;
                
                if (!isConfigured) {
                    if (field.mustChange) {
                        // Must-change fields should fail if not configured
                        status = undefined; // No status means it shows as failure
                        success = false;
                    } else {
                        // Other fields should show a warning
                        status = 'warning';
                        success = true; // Still technically passes with a warning
                    }
                }

                results.push({
                    name: `${field.description} configuration`,
                    status: status,
                    success: success,
                    details: isConfigured
                        ? (projectValue === defaultValue && field.allowDefaultValue
                            ? `Default value for ${field.description} is acceptable`
                            : `${field.description} has been changed from default`)
                        : `${field.description} is still set to default value${field.key === 'title' || field.key === 'author' ? `: "${defaultValue}"` : ''}`
                });
            }
        }

        // Check optional fields
        for (const field of optionalFields) {
            const hasField = projectSpecs.specs?.[0]?.hasOwnProperty(field.key);

            if (hasField) {
                const projectValue = projectSpecs.specs[0][field.key];
                const defaultValue = defaultSpecs.specs?.[0]?.[field.key];
                let isConfigured = false;

                if (typeof projectValue === 'object') {
                    isConfigured = JSON.stringify(projectValue) !== JSON.stringify(defaultValue);
                } else {
                    isConfigured = projectValue !== defaultValue;
                }

                // For optional fields that can keep their default values, we'll mark them as configured
                if (field.allowDefaultValue) {
                    isConfigured = true;
                }

                results.push({
                    name: `${field.description} configuration`,
                    status: isConfigured ? undefined : 'warning',
                    success: isConfigured || !isConfigured, // Always true for backward compatibility when using warning
                    details: isConfigured
                        ? (projectValue === defaultValue && field.allowDefaultValue
                            ? `Default value for ${field.description} is acceptable`
                            : `${field.description} has been changed from default`)
                        : `${field.description} is still set to default value`
                });
            } else {
                results.push({
                    name: `${field.description} configuration`,
                    success: true,
                    details: `Optional "${field.key}" key is not present (this is not required)`
                });
            }
        }

        // Add a summary of missing required fields
        if (missingRequiredKeys.length > 0) {
            results.push({
                name: 'Required fields check',
                success: false,
                details: `Missing required fields: ${missingRequiredKeys.join(', ')}`
            });
        } else {
            results.push({
                name: 'Required fields check',
                success: true,
                details: 'All required fields are present'
            });
        }

        // Check if any fields exist that aren't in the standard template (could be typos)
        const allStandardKeys = [...requiredFields, ...optionalFields].map(f => f.key);
        const unexpectedKeys = Object.keys(projectSpecs.specs?.[0] || {})
            .filter(key => !allStandardKeys.includes(key));

        if (unexpectedKeys.length > 0) {
            results.push({
                name: 'Unexpected fields check',
                success: false,
                details: `Found unexpected fields that might be typos: ${unexpectedKeys.join(', ')}`
            });
        }

        // Overall configuration status
        // Count all fields that are present and configured
        const fieldResults = results.filter(r =>
            r.name.includes('configuration') &&
            !r.name.includes('Overall')
        );

        const configuredItemsCount = fieldResults.filter(r => r.success).length;
        const totalItems = fieldResults.length;
        const configurationPercentage = Math.round((configuredItemsCount / totalItems) * 100);

        results.push({
            name: 'Overall configuration status',
            success: configurationPercentage > 50 && missingRequiredKeys.length === 0,
            details: `${configurationPercentage}% of specs.json has been configured (${configuredItemsCount}/${totalItems} items)`
        });

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