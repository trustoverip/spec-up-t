/**
 * @file migrate-versions-to-snapshots.js
 * @description One-time migration helper for repositories that were created under the
 * old "commit docs/" regime. Those repos store frozen snapshots inside docs/versions/.
 *
 * Starting with the issue270 changes, snapshots are stored in snapshots/ (tracked,
 * at the repo root) instead of docs/versions/ (gitignored, ephemeral). This migration
 * copies any snapshots found in docs/versions/ into snapshots/ so they are not
 * lost when the user eventually removes docs/ from git tracking.
 *
 * - Safe to run more than once: already-migrated versions are not overwritten.
 * - Does nothing when docs/versions/ does not exist (new repos or repos that never froze).
 * - Does not delete docs/versions/ — git history is preserved; the user decides when
 *   to run `git rm -r --cached docs/`.
 */

const fs = require('fs-extra');
const path = require('path');
const Logger = require('../utils/logger');

/**
 * Migrates frozen snapshots from docs/versions/ to snapshots/.
 * @param {string} outputPath - The output directory defined in specs.json (e.g. './docs').
 */
function migrateVersionsToSnapshots(outputPath) {
    const src = path.join(outputPath, 'versions');
    const dest = 'snapshots';

    if (!fs.existsSync(src)) {
        // No old snapshots to migrate — nothing to do.
        return;
    }

    // Check whether there are any version subdirectories (v1, v2, …) to migrate.
    // We skip labels.json and index.html — those are regenerated automatically.
    const versionDirs = fs.readdirSync(src).filter(entry =>
        fs.statSync(path.join(src, entry)).isDirectory()
    );

    if (versionDirs.length === 0) {
        return;
    }

    fs.ensureDirSync(dest);

    let migratedCount = 0;

    // Copy each version directory that does not already exist in snapshots/.
    versionDirs.forEach(dir => {
        const srcDir = path.join(src, dir);
        const destDir = path.join(dest, dir);

        if (!fs.existsSync(destDir)) {
            fs.copySync(srcDir, destDir);
            migratedCount++;
        }
    });

    // Always keep labels.json up to date in snapshots/.
    const srcLabels = path.join(src, 'labels.json');
    const destLabels = path.join(dest, 'labels.json');

    if (fs.existsSync(srcLabels)) {
        if (!fs.existsSync(destLabels)) {
            // No labels.json in snapshots/ yet — copy the whole file.
            fs.copySync(srcLabels, destLabels);
        } else {
            // Merge: preserve any entries already in snapshots/labels.json
            // and add any entries from docs/versions/labels.json that are missing.
            const existing = fs.readJsonSync(destLabels);
            const legacy = fs.readJsonSync(srcLabels);
            const merged = { ...legacy, ...existing }; // snapshots wins on conflict
            fs.writeJsonSync(destLabels, merged, { spaces: 2 });
        }
    }

    if (migratedCount > 0) {
        Logger.success(
            `Migrated ${migratedCount} snapshot(s) from ${src} to ${dest}/. ` +
            `You can now safely run: git rm -r --cached ${outputPath}`
        );
    }
}

module.exports = migrateVersionsToSnapshots;
