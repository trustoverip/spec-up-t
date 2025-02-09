const copyBoilerplate = require('./copy-boilerplate');
const { configScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');

copyBoilerplate();
addScriptsKeys(configScriptsKeys);

require('./postinstall-message');