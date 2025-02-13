const path = require('path');

// Configuration
const gitIgnoreEntries = {
    gitignorePath: path.join(process.cwd(), '.gitignore'),
    filesToAdd: ['node_modules',
        '*.log',
        'dist',
        '*.bak',
        '*.tmp',
        '.DS_Store',
        '.env',
        'coverage',
        'build',
        '.history'
],
};

module.exports = { gitIgnoreEntries };