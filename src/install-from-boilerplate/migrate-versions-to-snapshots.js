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
 * Extracts snapshot labels from a hand-edited docs/versions/index.html.
 * Parses every anchor whose href points to a version directory (e.g. "v1/")
 * and maps the directory name to the visible link text.
 *
 * Example input:  <a href="v1/">KERI Release 1.0</a>
 * Example output: { "v1": "KERI Release 1.0" }
 *
 * The "Latest version" link (href="../") is intentionally ignored.
 *
 * @param {string} indexHtmlPath - Absolute path to docs/versions/index.html.
 * @returns {Object} Map of version directory names to label strings.
 */
function extractLabelsFromIndexHtml(indexHtmlPath) {
    const labels = {};
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    // Match: href="v1/" or href="v1" (with or without trailing slash)
    const linkPattern = /href="(v\d+)\/?">([^<]+)<\/a>/g;
    let match = linkPattern.exec(html);
    while (match !== null) {
        const dirName = match[1];
        const linkText = match[2].trim();
        labels[dirName] = linkText;
        match = linkPattern.exec(html);
    }
    return labels;
}

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
    // Priority order (highest wins):
    //   1. Labels already in snapshots/labels.json (from previous migrations or freezes)
    //   2. Labels extracted from hand-edited docs/versions/index.html
    //   3. Labels from docs/versions/labels.json (auto-generated source)
    const srcLabels = path.join(src, 'labels.json');
    const srcIndexHtml = path.join(src, 'index.html');
    const destLabels = path.join(dest, 'labels.json');

    // Start from labels.json if it exists
    const legacyLabels = fs.existsSync(srcLabels) ? fs.readJsonSync(srcLabels) : {};

    // Overlay with labels parsed from index.html — these may be hand-edited
    const htmlLabels = fs.existsSync(srcIndexHtml)
        ? extractLabelsFromIndexHtml(srcIndexHtml)
        : {};

    // Existing snapshots/labels.json wins on any conflict
    const existingDestLabels = fs.existsSync(destLabels) ? fs.readJsonSync(destLabels) : {};

    const merged = { ...legacyLabels, ...htmlLabels, ...existingDestLabels };

    if (Object.keys(merged).length > 0) {
        fs.writeJsonSync(destLabels, merged, { spaces: 2 });
    }

    if (migratedCount > 0) {
        Logger.action(
            `Migrated ${migratedCount} snapshot(s) from ${src} to ${dest}/.`,
            {
                hint: `git rm -r --cached ${outputPath}`,
                context: 'Remove old docs from git tracking'
            }
        );
        Logger.action(
            'Configure GitHub Pages deployment',
            {
                hint: 'Update your repository settings to deploy from gh-pages branch',
                steps: [
                    'Go to your repository on GitHub',
                    'Click Settings',
                    'In the left sidebar, click Pages',
                    'Under Build and deployment, set Source to Deploy from a branch',
                    'Select the gh-pages branch and / (root) folder',
                    'Click Save'
                ],
                context: 'Enable GitHub Pages to serve your snapshots from the gh-pages branch'
            }
        );
    }
}

module.exports = migrateVersionsToSnapshots;
