
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;
const { exec } = require('child_process');

const fs = require('fs-extra');
const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const mergeStreams = require('merge-stream');
const cleanCSS = require('gulp-clean-css');
const axios = require('axios').default;
const assets = fs.readJsonSync('./config/asset-map.json');

let compileLocation = 'assets/compiled';

async function fetchSpecRefs() {
  return Promise.all([
    axios.get('https://raw.githubusercontent.com/tobie/specref/master/refs/ietf.json'),
    axios.get('https://raw.githubusercontent.com/tobie/specref/master/refs/w3c.json'),
    axios.get('https://raw.githubusercontent.com/tobie/specref/master/refs/whatwg.json'),
    axios.get('https://raw.githubusercontent.com/tobie/specref/master/refs/biblio.json')
  ]).then(async results => {
    let json = Object.assign(
      results[0].data,// IETF
      results[1].data,// W3C
      results[2].data,// WHATWG
      results[3].data// Biblio
    );
    return fs.outputFile(compileLocation + '/refs.json', JSON.stringify(json));
  }).catch(e => console.log(e));
}

/**
 * Removes forbidden control characters from compiled JavaScript files
 * to ensure W3C HTML validation compliance.
 * 
 * Specifically removes:
 * - U+0001 (SOH - Start of Heading) 
 * - U+001B (ESC - Escape, used in ANSI color codes)
 * 
 * These characters appear in third-party libraries (mermaid.js, dagre-d3)
 * and cause W3C validation errors when embedded in HTML.
 * 
 * @param {string} filePath - Absolute path to the JavaScript file to clean
 * @returns {Promise<void>}
 */
async function removeForbiddenControlCharacters(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Remove U+0001 (SOH - Start of Heading)
    // This appears in dagre-d3 library as a null character separator
    content = content.replace(/\x01/g, '');
    
    // Remove U+001B (ESC - Escape) 
    // This appears in ANSI color codes like [35m, [31m, etc.
    content = content.replace(/\x1b/g, '');
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✓ Cleaned forbidden characters from ${filePath}`);
  } catch (error) {
    console.error(`✗ Error cleaning ${filePath}:`, error.message);
    throw error;
  }
}

async function compileAssets() {
  await fs.ensureDir(compileLocation);
  return new Promise(resolve => {
    mergeStreams(
      gulp.src(assets.head.css)
        .pipe(cleanCSS())
        .pipe(concat('head.css'))
        .pipe(gulp.dest(compileLocation)),
      gulp.src(assets.head.js)
        .pipe(terser())
        .pipe(concat('head.js'))
        .pipe(gulp.dest(compileLocation)),
      gulp.src(assets.body.js)
        .pipe(terser())
        .pipe(concat('body.js'))
        .pipe(gulp.dest(compileLocation))
    ).on('finish', async function () {
      // Post-process compiled JavaScript files to remove forbidden control characters
      try {
        await removeForbiddenControlCharacters(`${compileLocation}/head.js`);
        await removeForbiddenControlCharacters(`${compileLocation}/body.js`);
      } catch (error) {
        console.error('Failed to clean compiled files:', error);
      }
      resolve();
    })
  });
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, {}, error => error ? reject() : resolve());
  });
}

async function bumpVersion() {
  return runCommand(`npm version --no-git-tag-version ${argv.v || 'patch'}`);
}

async function renderSpecs() {
  return runCommand('npm run render');
}

gulp.task('render', renderSpecs);

gulp.task('refs', fetchSpecRefs);

gulp.task('compile', compileAssets);

gulp.task('bump', bumpVersion);

gulp.task('publish', gulp.series(gulp.parallel(compileAssets, bumpVersion), renderSpecs));

gulp.task('watch', () => gulp.watch([
  'assets/**/*',
  '!assets/compiled/*'
], gulp.parallel('compile')));