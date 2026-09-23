/**
 * @file is-legacy-eval-require.js
 * @description Detects the pre-2.1.0 custom-update entry:
 *   node -e "require('spec-up-t/src/install-from-boilerplate/custom-update.js')"
 *
 * On Node 22 that path has require.main == null. Some Node versions use an
 * eval wrapper whose filename is "[eval]". 2.1.0 does not run the update
 * from either of those. Callers that load this file as a real module (the
 * CLI, Jest) are not legacy entries.
 *
 * Kept as its own module so the detection can be tested without running
 * an upgrade.
 */

/**
 * @param {NodeModule|null|undefined} requireMain - The value of require.main
 *   at load time.
 * @returns {boolean}
 */
function isLegacyEvalRequire(requireMain) {
    if (requireMain == null) {
        return true;
    }

    const filename = requireMain.filename || '';
    return filename === '[eval]'
        || filename.endsWith('/[eval]')
        || filename.endsWith('\\[eval]');
}

module.exports = isLegacyEvalRequire;
