#!/usr/bin/env node

/**
 * @file cli.js
 * @description spec-up-t command-line entry. Published as the `spec-up-t` bin
 * so consuming repos can run `npx spec-up-t@latest custom-update` without
 * depending on their (possibly stale) package.json script.
 *
 * This file must stay: it is the public CLI. Invoke it with
 * `npx spec-up-t <command>` or `spec-up-t <command>` from a consumer's
 * node_modules/.bin after install.
 */

const customUpdate = require('./install-from-boilerplate/custom-update');
const { parseCustomUpdateArgs } = require('./install-from-boilerplate/parse-custom-update-args');
const Logger = require('./utils/logger');

const HELP = `Usage: spec-up-t <command>

Commands:
  custom-update   Upgrade this Spec-Up-T repo in place (scripts, files, deps)

custom-update prints a plan, then asks before it writes.
  --dry-run       Print the plan and do not write
  --yes, -y       Apply the plan without asking (GitHub Actions; menu.yml)

From 1.x, or if npm run custom-update does nothing (old node -e script):
  npx spec-up-t@latest custom-update

You do not have to install 2.0.0 first.

After that, on this machine:
  npm run custom-update

When a ToIP repo should take an update is a working-group decision.
See the website page "When to run custom-update".

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
        let options;
        try {
            options = parseCustomUpdateArgs(argv.slice(3));
        } catch (error) {
            process.stderr.write(`${error.message}\n\n${HELP}`);
            process.exitCode = 1;
            return;
        }
        await customUpdate(options);
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
