const systemFiles = [
    'README.md',
    '.env.example',
    'menu-wrapper.sh',
    '.github/workflows/menu.yml',
    '.github/workflows/render-and-deploy.yml',
    '.github/workflows/set-gh-pages.yml',
    'assets/test.json',
    'assets/test.text',
];

// Files that are only copied when they do not already exist in the consuming
// project, so user customisations are never overwritten by updates.
const systemFilesNoOverwrite = [
    'assets/custom.css',
];

module.exports = { systemFiles, systemFilesNoOverwrite };