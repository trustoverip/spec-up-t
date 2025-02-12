const { configScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const {updateGitignore} = require('./add-gitignore-entries');

addScriptsKeys(configScriptsKeys);
copySystemFiles();
updateGitignore(gitIgnoreEntries.gitignorePath, gitIgnoreEntries.filesToAdd);

console.log("✅ custom update done");