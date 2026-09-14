const systemFiles = [
    '.env.example',
    'menu-wrapper.js',
    'assets/test.json',
    'assets/test.text',
];

// Directories replaced 1:1 with the boilerplate. Extra files in the
// consuming project are removed so old GitHub Actions workflows do not linger.
const systemDirsReplace = [
    '.github/workflows',
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
];

module.exports = { systemFiles, systemDirsReplace, systemFilesNoOverwrite, systemFilesToRemove };
