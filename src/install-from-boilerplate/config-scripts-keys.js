const configScriptsKeys = {
    "edit": "node -e \"require('spec-up-t')()\"",
    "render": "node --no-warnings -e \"require('spec-up-t/index.js')({ nowatch: true })\"",
    "dev": "node -e \"require('spec-up-t')({ dev: true })\"",
    "collectExternalReferencesCache": "node --no-warnings -e \"require('spec-up-t/src/collect-external-references.js').collectExternalReferences({cache: true})\"",
    "collectExternalReferencesNoCache": "node --no-warnings -e \"require('spec-up-t/src/collect-external-references.js').collectExternalReferences({cache: false})\"",
    "topdf": "node -e \"require('spec-up-t/src/create-pdf.js')\"",
    "freeze": "node -e \"require('spec-up-t/src/freeze.js')\"",
    "references": "node -e \"require('spec-up-t/src/references.js')\"",
    "help": "cat ./node_modules/spec-up-t/src/install-from-boilerplate/help.txt",
    "menu": "bash ./node_modules/spec-up-t/src/install-from-boilerplate/menu.sh",
    "addremovexrefsource": "node --no-warnings -e \"require('spec-up-t/src/add-remove-xref-source.js')\"",
    "configure": "node --no-warnings -e \"require('spec-up-t/src/configure.js')\"",
    "custom-update": "npm update && node -e \"require('spec-up-t/src/install-from-boilerplate/custom-update.js')\""
};

// Defines which script keys to overwrite. If a key is not present, it will not be overwritten
const configOverwriteScriptsKeys = {
    "edit": true,
    "render": true,
    "dev": true,
    "collectExternalReferencesCache": true,
    "collectExternalReferencesNoCache": true,
    "topdf": true,
    "freeze": true,
    "references": true,
    "help": true,
    "menu": true,
    "addremovexrefsource": true,
    "configure": true,
    "custom-update": true
};

module.exports = { configScriptsKeys, configOverwriteScriptsKeys };