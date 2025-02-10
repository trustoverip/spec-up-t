const { configScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');

addScriptsKeys(configScriptsKeys);

copySystemFiles();

console.log("✅ custom update done");