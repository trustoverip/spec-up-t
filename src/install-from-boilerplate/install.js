const copyBoilerplate = require('./copy-boilerplate');
const { configScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const { templates } = require('./config-templates');

// Resolve template from SPEC_UP_T_TEMPLATE environment variable.
// If not set or set to 'default', uses the original boilerplate (backward compatible).
const envTemplateId = process.env.SPEC_UP_T_TEMPLATE;
let selectedTemplate = null;

if (envTemplateId && envTemplateId !== 'default') {
    selectedTemplate = templates.find(t => t.id === envTemplateId) || null;
}

copyBoilerplate(selectedTemplate);
addScriptsKeys(configScriptsKeys);

require('./postinstall-message');