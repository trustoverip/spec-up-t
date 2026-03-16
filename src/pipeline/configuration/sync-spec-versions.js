/**
 * @file sync-spec-versions.js
 * @description Copies the tracked spec-versions/ directory (at the consuming repo's
 * root) into the output path's versions/ folder before the spec is rendered and
 * deployed. This ensures that snapshots committed to the main branch are always
 * included in the deployed specification, even after a completely fresh CI checkout
 * where docs/ does not yet exist.
 *
 * spec-versions/ is the source of truth for frozen snapshots.
 * docs/versions/   is the derived, deployable copy (gitignored, rebuilt every render).
 *
 * Does nothing when spec-versions/ does not exist — so repositories that have
 * never run `npm run freeze` are not affected.
 */

const fs = require('fs-extra');
const path = require('path');
const Logger = require('../../utils/logger.js');

/**
 * Copies all contents of spec-versions/ into outputPath/versions/.
 * The destination is created if it does not already exist.
 * @param {string} outputPath - The output directory defined in specs.json (e.g. './docs').
 */
function syncSpecVersions(outputPath) {
    const src = 'spec-versions';
    const dest = path.join(outputPath, 'versions');

    if (!fs.existsSync(src)) {
        // No snapshots have been created yet — nothing to sync.
        return;
    }

    fs.copySync(src, dest);
    Logger.info(`Synced spec-versions/ → ${dest}`);
}

module.exports = syncSpecVersions;
