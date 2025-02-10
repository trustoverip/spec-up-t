const configScriptsKeys = {
    "edit": "node -e \"require('spec-up-t')()\"",
    "render": "node --no-warnings -e \"require('spec-up-t/index.js')({ nowatch: true })\"",
    "dev": "node -e \"require('spec-up-t')({ dev: true })\"",
    "collectExternalReferencesCache": "node --no-warnings -e \"require('spec-up-t/src/collect-external-references.js').collectExternalReferences({cache: true})\"",
    "collectExternalReferencesNoCache": "node --no-warnings -e \"require('spec-up-t/src/collect-external-references.js').collectExternalReferences({cache: false})\"",
    "topdf": "node -e \"require('spec-up-t/src/create-pdf.js')\"",
    "freeze": "node -e \"require('spec-up-t/src/freeze.js')\"",
    "references": "node -e \"require('spec-up-t/src/references.js')\"",
    "help": "cat help.txt",
    "menu": "bash ./main.sh",
    "addremovexrefsource": "node --no-warnings -e \"require('spec-up-t/src/add-remove-xref-source.js')\"",
    "configure": "node --no-warnings -e \"require('spec-up-t/src/configure.js')\"",
    "custom-update": "npm update && node -e \"require('spec-up-t/src/install-from-boilerplate/custom-update.js')\""
};

module.exports = { configScriptsKeys };