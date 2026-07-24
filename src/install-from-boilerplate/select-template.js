const readline = require('node:readline');
const { templates } = require('./config-templates');
const Logger = require('../utils/logger');

/**
 * Prompts the user to select a content template interactively.
 * If the SPEC_UP_T_TEMPLATE environment variable is set, uses that value
 * without prompting (for non-interactive use, e.g., GitHubUi or CI).
 *
 * @returns {Promise<Object>} The selected template object from config-templates.js
 */
function selectTemplate() {
    // Check environment variable first (non-interactive use)
    const envTemplate = process.env.SPEC_UP_T_TEMPLATE;
    if (envTemplate) {
        const found = templates.find(t => t.id === envTemplate);
        if (found) {
            Logger.info(`Using content template from environment: ${found.name}`);
            return Promise.resolve(found);
        }
        Logger.warn(`Unknown template "${envTemplate}", falling back to default`);
        return Promise.resolve(templates[0]);
    }

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n📄 Available content templates:\n');
        for (const [i, t] of templates.entries()) {
            console.log(`  [${i}] ${t.name}`);
            console.log(`      ${t.description}\n`);
        }

        rl.question('Select a content template (number) [0]: ', (answer) => {
            rl.close();
            const index = Number.parseInt(answer, 10);
            if (!Number.isNaN(index) && index >= 0 && index < templates.length) {
                Logger.info(`Selected template: ${templates[index].name}`);
                resolve(templates[index]);
            } else {
                Logger.info('Using default template');
                resolve(templates[0]);
            }
        });
    });
}

module.exports = { selectTemplate, templates };
