const path = require('path');

// Configuration
const gitIgnoreEntries = {
    gitignorePath: path.join(__dirname, '../../../../', '.gitignore'),
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