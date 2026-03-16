/**
 * @file migrate-versions-to-spec-versions.js
 * @description One-time migration helper for repositories that were created under the
 * old "commit docs/" regime. Those repos store frozen snapshots inside docs/versions/.
 *
 * Starting with the issue270 changes, snapshots are stored in spec-versions/ (tracked,
 * at the repo root) instead of docs/versions/ (gitignored, ephemeral). This migration
 * copies any snapshots found in docs/versions/ into spec-versions/ so they are not
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
 * Migrates frozen snapshots from docs/versions/ to spec-versions/.
 * @param {string} outputPath - The output directory defined in specs.json (e.g. './docs').
 */
function migrateVersionsToSpecVersions(outputPath) {
    const src = path.join(outputPath, 'versions');
    const dest = 'spec-versions';

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

    // Copy each version directory that does not already exist in spec-versions/.
    versionDirs.forEach(dir => {
        const srcDir = path.join(src, dir);
        const destDir = path.join(dest, dir);

        if (!fs.existsSync(destDir)) {
            fs.copySync(srcDir, destDir);
            migratedCount++;
        }
    });

    // Always keep labels.json up to date in spec-versions/.
    const srcLabels = path.join(src, 'labels.json');
    const destLabels = path.join(dest, 'labels.json');

    if (fs.existsSync(srcLabels)) {
        if (!fs.existsSync(destLabels)) {
            // No labels.json in spec-versions/ yet — copy the whole file.
            fs.copySync(srcLabels, destLabels);
        } else {
            // Merge: preserve any entries already in spec-versions/labels.json
            // and add any entries from docs/versions/labels.json that are missing.
            const existing = fs.readJsonSync(destLabels);
            const legacy = fs.readJsonSync(srcLabels);
            const merged = { ...legacy, ...existing }; // spec-versions wins on conflict
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

module.exports = migrateVersionsToSpecVersions;
