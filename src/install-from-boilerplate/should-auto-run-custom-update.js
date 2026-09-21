/**
 * @file should-auto-run-custom-update.js
 * @description Decides whether custom-update.js should execute as a side effect
 * of being loaded. Kept as its own module so the 2.0.0 bridge can be tested
 * without touching a consuming repo.
 *
 * Auto-run is required for existing package.json scripts:
 *   node -e "require('spec-up-t/src/install-from-boilerplate/custom-update.js')"
 * On Node 22 that path has require.main == null. Running the file as a script
 * has require.main === module.
 *
 * Do not auto-run when another real module loaded this file (the CLI, Jest).
 * Those callers invoke the exported function themselves.
 */

/**
 * @param {NodeModule|null|undefined} requireMain - The value of require.main
 *   at load time.
 * @param {NodeModule} thisModule - The custom-update module (module).
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @returns {boolean}
 */
function shouldAutoRunCustomUpdate(requireMain, thisModule, env = process.env) {
    if (env.SPEC_UP_T_SKIP_CUSTOM_UPDATE === 'true') {
        return false;
    }

    if (requireMain === thisModule) {
        return true;
    }

    // node -e "require('...custom-update.js')" on Node 22.
    if (requireMain == null) {
        return true;
    }

    const filename = requireMain.filename || '';
    return filename === '[eval]'
        || filename.endsWith('/[eval]')
        || filename.endsWith('\\[eval]');
}

module.exports = shouldAutoRunCustomUpdate;
