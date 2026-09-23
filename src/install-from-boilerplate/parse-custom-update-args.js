/**
 * Parses flags for `spec-up-t custom-update`.
 * Flags follow the command: `spec-up-t custom-update --yes`.
 *
 * @param {string[]} args
 * @returns {{ yes: boolean, dryRun: boolean }}
 */
function parseCustomUpdateArgs(args) {
    const options = { yes: false, dryRun: false };

    for (const arg of args) {
        if (arg === '--yes' || arg === '-y') {
            options.yes = true;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        } else {
            throw new Error(`Unknown option: ${arg}`);
        }
    }

    return options;
}

module.exports = { parseCustomUpdateArgs };
