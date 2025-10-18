#!/usr/bin/env node
/**
 * freeze.js
 *
 * Legacy wrapper to run the existing src/freeze-spec-data.js script.
 * This file intentionally keeps logic minimal: it simply requires the
 * implementation file so older tooling or CI jobs that call `freeze.js`
 * continue to work without changing behaviour.
 *
 * Usage:
 *   node freeze.js
 * or make it executable and run:
 *   ./freeze.js
 *
 * Rationale for keeping this file:
 * - It provides a stable legacy entry point used by external consumers.
 * - The real implementation remains in src/freeze-spec-data.js so maintenance
 *   and tests remain focused there.
 */

const path = require('path');

// The implementation `freeze-spec-data.js` now lives in the same `src` folder
// as this wrapper, so require it directly from __dirname.
const scriptPath = path.join(__dirname, 'freeze-spec-data.js');

try {
  // Require executes the implementation file. It is expected to run
  // synchronously at top-level (the existing file performs its actions
  // when loaded).
  require(scriptPath);
} catch (err) {
  // Keep error reporting minimal and consistent with CLI usage.
  // Use stderr for messages and exit with non-zero code on failure.
  // This keeps behaviour predictable for callers.
  // eslint-disable-next-line no-console
  console.error('Failed to execute freeze script:', err && err.message ? err.message : err);
  process.exitCode = 1;
}
