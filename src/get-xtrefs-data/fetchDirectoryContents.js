const fs = require('fs-extra');
const path = require('path');
const { setupFetchHeaders } = require('./setupFetchHeaders');
const { addDirectory, getDirectory, getAllDirectories } = require('../config/directories');

async function fetchDirectoryContents(GITHUB_API_TOKEN, owner, repo, dirPath, baseLocalDir) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`;
    const response = await fetch(url, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

    if (response.ok) {
        const contents = await response.json();
        for (const item of contents) {
            const itemPath = path.join(baseLocalDir, owner, repo, item.path);
            if (item.type === 'file') {
                const fileResponse = await fetch(item.download_url, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });
                const fileContent = await fileResponse.text();
                fs.outputFileSync(itemPath, fileContent);
            } else if (item.type === 'dir') {
                fs.ensureDirSync(itemPath);
                await fetchDirectoryContents(GITHUB_API_TOKEN, owner, repo, item.path, baseLocalDir);
            }
        }
    } else {
        console.error(`Failed to fetch directory contents: ${response.statusText}`);
    }
}

async function downloadAllDirectories(GITHUB_API_TOKEN, allXTrefs) {
    const promises = allXTrefs.xtrefs.map(xtref => {
        if (!xtref.repoUrl) {
            console.error(`\n   SPEC-UP-T: No repository URL found for ${xtref.term} in ${xtref.externalSpec}. Please check your specs.json file.\n`);
            return Promise.resolve(); // Return a resolved promise to continue the map
        } else {
            return fetchDirectoryContents(GITHUB_API_TOKEN, xtref.owner, xtref.repo, xtref.terms_dir, getDirectory('output-local-terms')).then(() => {
                console.log(`\n   SPEC-UP-T: Directory downloaded successfully for ${xtref.term} in ${xtref.externalSpec}.\n`);
            });
        }
    });

    await Promise.all(promises);
}

exports.fetchDirectoryContents = downloadAllDirectories;