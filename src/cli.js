#!/usr/bin/env node

/**
 * @file cli.js
 * @description spec-up-t command-line entry. Published as the `spec-up-t` bin
 * so consuming repos can run `npx spec-up-t@2 custom-update` without depending
 * on their (possibly stale) package.json script.
 *
 * This file must stay: it is the public CLI. Invoke it with
 * `npx spec-up-t <command>` or `spec-up-t <command>` from a consumer's
 * node_modules/.bin after install.
 */

const customUpdate = require('./install-from-boilerplate/custom-update');
const Logger = require('./utils/logger');

const HELP = `Usage: spec-up-t <command>

Commands:
  custom-update   Upgrade this Spec-Up-T repo in place (scripts, files, deps)

1.x → 2.x:
  npx spec-up-t@2 custom-update

On 2.x (after the first successful update):
  npm run custom-update

`;

/**
 * Parses argv and runs the requested command.
 * @param {string[]} argv - process.argv
 */
async function main(argv) {
    const command = argv[2];

    if (command === '--help' || command === '-h') {
        process.stdout.write(HELP);
        return;
    }

    if (!command) {
        process.stderr.write(HELP);
        process.exitCode = 1;
        return;
    }

    if (command === 'custom-update') {
        await customUpdate();
        return;
    }

    process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
    process.exitCode = 1;
}

if (require.main === module) {
    main(process.argv).catch((error) => {
        Logger.error('spec-up-t failed:', error);
        process.exitCode = 1;
    });
}

module.exports = { main, HELP };
