const fs = require('fs');
const readlineSync = require('readline-sync');

let errorFound = false;

// Function to pause the script and wait for the ENTER key synchronously
function pauseForEnterSync() {
    readlineSync.question('Press ENTER to continue...');
}

function loadData() {
    return JSON.parse(fs.readFileSync('./specs.json', 'utf8'));
}

function checkKeysSync(object, expectedKeys, parentKey = '') {
    for (let key of expectedKeys) {
        if (Array.isArray(object)) {
            for (let [index, item] of object.entries()) {
                checkKeysSync(item, expectedKeys, `${parentKey}[${index}]`);
            }
        } else if (typeof object === 'object') {
            if (!(key in object)) {
                console.error(`\n   SPEC-UP-T: Error: Missing key '${key}' in ${parentKey}\n   We cannot guarantee that Spec-Up-T will work properly.\n   Here is an example specs.json file:\n   https://github.com/blockchainbird/spec-up-t-starter-pack/blob/main/spec-up-t-starterpack/specs.json` + "\n");
                errorFound = true;
                pauseForEnterSync(); // Pause synchronously
            }
            if (typeof expectedKeys[key] === 'object' && object[key]) {
                checkKeysSync(object[key], expectedKeys[key], `${parentKey}.${key}`);
            }
        }
    }
}

function runJsonKeyValidatorSync() {
    const data = loadData();
    const expectedKeys = {
        specs: [
            "title",
            "spec_directory",
            "spec_terms_directory",
            "output_path",
            "markdown_paths",
            "logo",
            "logo_link",
            "source",
            "external_specs",
            "external_specs_repos",
            "assets",
            "katex",
            "searchHighlightStyle"
        ],
        source: [
            "host",
            "account",
            "repo"
        ],
        external_specs_repos: [
            "external_spec",
            "url",
            "terms_dir"
        ],
        assets: [
            "path",
            "inject",
            "module"
        ]
    };

    for (let [index, spec] of data.specs.entries()) {
        console.log(`\n   SPEC-UP-T: Checking spec #${index + 1}` + "\n");
        checkKeysSync(spec, expectedKeys.specs, `specs[${index}]`);

        if (spec.source) {
            checkKeysSync(spec.source, expectedKeys.source, `specs[${index}].source`);
        }

        if (spec.external_specs_repos) {
            checkKeysSync(spec.external_specs_repos, expectedKeys.external_specs_repos, `specs[${index}].external_specs_repos`);
        }

        // if (spec.assets) {
        //     checkKeysSync(spec.assets, expectedKeys.assets, `specs[${index}].assets`);
        // }
    }

    if (!errorFound) {
        console.log('\n   SPEC-UP-T: All keys are present. No errors found. Continuing…' + "\n");
    }
}

// Export the function to be used in other scripts
module.exports = {
    runJsonKeyValidatorSync
};
