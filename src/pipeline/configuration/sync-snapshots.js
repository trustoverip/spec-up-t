/**
 * @file sync-snapshots.js
 * @description Copies the tracked snapshots/ directory (at the consuming repo's
 * root) into the output path's versions/ folder before the spec is rendered and
 * deployed. This ensures that snapshots committed to the main branch are always
 * included in the deployed specification, even after a completely fresh CI checkout
 * where docs/ does not yet exist.
 *
 * snapshots/ is the source of truth for frozen snapshots.
 * docs/versions/   is the derived, deployable copy (gitignored, rebuilt every render).
 *
 * Does nothing when snapshots/ does not exist — so repositories that have
 * never run `npm run freeze` are not affected.
 */

const fs = require('fs-extra');
const path = require('path');
const Logger = require('../../utils/logger.js');

/**
 * Copies all contents of snapshots/ into outputPath/versions/.
 * The destination is created if it does not already exist.
 * @param {string} outputPath - The output directory defined in specs.json (e.g. './docs').
 */
function syncSnapshots(outputPath) {
    const src = 'snapshots';
    const dest = path.join(outputPath, 'versions');

    if (!fs.existsSync(src)) {
        // No snapshots have been created yet — nothing to sync.
        return;
    }

    fs.copySync(src, dest);
    Logger.info(`Synced snapshots/ → ${dest}`);
}

module.exports = syncSnapshots;
