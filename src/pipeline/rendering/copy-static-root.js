/**
 * Copies files from `<spec_directory>/static-root/` to the docs output directory.
 *
 * Purpose: some deployment targets (GitHub Pages, Netlify, etc.) require files
 * to live at the repository/docs root — typical examples are `CNAME`,
 * `robots.txt`, and `_config.yml`. Because `docs/` is gitignored (it is
 * rebuilt on every render), these files cannot live there directly. Instead,
 * place them in `spec/static-root/`. This module bridges the gap by copying
 * every *file* in that directory to `docs/` after each render.
 *
 * Only top-level files are copied; sub-directories are intentionally ignored
 * to keep the semantics simple. The README.md that ships with the boilerplate
 * explains this and is skipped so it does not pollute the output directory.
 */

const fs = require('fs-extra');
const path = require('path');
const Logger = require('../../utils/logger');

const STATIC_ROOT_DIR_NAME = 'static-root';
const SKIP_FILES = ['README.md'];

/**
 * Copies top-level files from `<specDirectory>/static-root/` into `destination`.
 *
 * @param {string} specDirectory - Absolute or relative path to the spec source directory.
 * @param {string} destination   - Absolute or relative path to the docs output directory.
 */
function copyStaticRoot(specDirectory, destination) {
  const staticRootDir = path.join(specDirectory, STATIC_ROOT_DIR_NAME);

  if (!fs.existsSync(staticRootDir)) {
    return;
  }

  const entries = fs.readdirSync(staticRootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (SKIP_FILES.includes(entry.name)) continue;

    const src = path.join(staticRootDir, entry.name);
    const dest = path.join(destination, entry.name);

    fs.copySync(src, dest);
    Logger.success(`Copied static-root file → docs: ${entry.name}`);
  }
}

module.exports = { copyStaticRoot };
