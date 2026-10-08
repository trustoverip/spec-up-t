const fs = require('node:fs').promises;
const Logger = require('../utils/logger');

/**
 * Reads the content of a file or returns an empty string if the file does not exist.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} - The content of the file or an empty string.
 */
async function readFileOrCreateEmpty(filePath) {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return '';
        }
        throw error;
    }
}

/**
 * Pattern on a .gitignore line, ignoring a trailing inline comment.
 * @param {string} line
 * @returns {string}
 */
function patternOf(line) {
    return line.trim().split('#')[0].trim();
}

// Patterns that match `.env.example`. Git uses the last matching rule, so
// `!.env.example` has to come after every one of these.
const ENV_EXAMPLE_OVERRIDES = new Set(['.env.*', '.env*']);
const ENV_EXAMPLE_EXCEPTION = '!.env.example';

/**
 * Describes the .gitignore rewrite updateGitignore would write.
 * @param {string} content
 * @param {{ filesToAdd?: string[], filesToRemove?: string[] }} entries
 * @returns {{ content: string, add: string[], remove: string[], move: string[] }}
 */
function diffGitignore(content, entries = {}) {
    const filesToAdd = entries.filesToAdd || [];
    const filesToRemove = new Set(entries.filesToRemove || []);
    const lines = content.split('\n').filter((line) => line.trim() !== '');
    const add = [];
    const remove = [];

    // rebuild the file without the bad patterns, and remember which ones were removed.
    const kept = [];
    for (const line of lines) {
        const pattern = patternOf(line);
        if (filesToRemove.has(pattern)) {
            if (!remove.includes(pattern)) {
                remove.push(pattern);
            }
            continue;
        }
        kept.push(line);
    }

    for (const file of filesToAdd) {
        const pattern = file.trim();
        const alreadyPresent = kept.some((line) => patternOf(line) === pattern);
        if (!alreadyPresent) {
            kept.push(pattern);
            add.push(pattern);
        }
    }

    const move = [];
    const exceptionIndex = kept.findIndex((line) => patternOf(line) === ENV_EXAMPLE_EXCEPTION);
    if (exceptionIndex !== -1) {
        const overridden = kept.slice(exceptionIndex + 1).some((line) => (
            ENV_EXAMPLE_OVERRIDES.has(patternOf(line))
        ));
        if (overridden) {
            const [exceptionLine] = kept.splice(exceptionIndex, 1);
            kept.push(exceptionLine);
            move.push(ENV_EXAMPLE_EXCEPTION);
        }
    }

    const updated = `${kept.join('\n')}${kept.length ? '\n' : ''}`;
    return { content: updated, add, remove, move };
}

/**
 * Updates the .gitignore file with the specified files.
 * @param {string} gitignorePath - The path to the .gitignore file.
 * @param {string[]} filesToAdd - The list of files to add to .gitignore.
 * @param {string[]} [filesToRemove] - Patterns to drop. A bare `.env*` overrides `!.env.example`.
 */
async function updateGitignore(gitignorePath, filesToAdd, filesToRemove = []) {
    try {
        const gitignoreContent = await readFileOrCreateEmpty(gitignorePath);
        const { content } = diffGitignore(gitignoreContent, { filesToAdd, filesToRemove });

        await fs.writeFile(gitignorePath, content, 'utf8');

        Logger.success('Updated .gitignore file');
    } catch (error) {
        Logger.error('Error updating .gitignore:', error.message);
    }
}

module.exports = { updateGitignore, diffGitignore };