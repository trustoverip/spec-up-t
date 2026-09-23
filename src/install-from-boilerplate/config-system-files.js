const systemFiles = [
    '.env.example',
    'menu-wrapper.js',
    'assets/test.json',
    'assets/test.text',
    // Known boilerplate workflows are replaced file by file. Extra workflows
    // in the consuming repo are left alone. menu.yml stays in this list so
    // GitHubUi keeps a custom-update option.
    '.github/workflows/menu.yml',
    '.github/workflows/render-and-deploy.yml',
    '.github/workflows/zenodo-update.yml',
];

// Files that are only copied when they do not already exist in the consuming
// project, so user customisations are never overwritten by updates.
const systemFilesNoOverwrite = [
    'README.md',
    'assets/custom.css',
];

// Stale files from previous boilerplate versions, removed on custom-update.
const systemFilesToRemove = [
    'menu-wrapper.sh',
    // Replaced by the Pages-source step in render-and-deploy.yml (no MY_PAT).
    '.github/workflows/set-gh-pages.yml',
];

module.exports = { systemFiles, systemFilesNoOverwrite, systemFilesToRemove };
