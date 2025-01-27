const {setupFetchHeaders} = require('./setupFetchHeaders');

// Function to fetch the content of a file from a specific commit in a GitHub repository.
async function fetchFileContentFromCommit(GITHUB_API_TOKEN, owner, repo, commitHash, filePath) {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitHash}?recursive=1`;
            const treeResponse = await fetch(treeUrl, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

            if (treeResponse.ok) {
                const treeData = await treeResponse.json();
                const file = treeData.tree.find(item => item.path === filePath);
                if (file) {
                    const fileContentResponse = await fetch(file.url);
                    const fileContentData = await fileContentResponse.json();
                    if (fileContentData.content) {
                        return Buffer.from(fileContentData.content, 'base64').toString('utf-8');
                    } else {
                        console.error('Error: fileContentData.content is undefined');
                    }
                } else {
                    console.error(`Error: File ${filePath} not found in commit ${commitHash}`);
                }
            } else if (treeResponse.status === 403 && treeResponse.headers.get('X-RateLimit-Remaining') === '0') {
                const resetTime = treeResponse.headers.get('X-RateLimit-Reset');
                const waitTime = resetTime ? (resetTime - Math.floor(Date.now() / 1000)) * 1000 : 60000;
                console.warn(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                retries++;
            } else {
                console.error(`Error: Failed to fetch tree from ${treeUrl}`);
                break;
            }
        } catch (error) {
            console.error(`Error fetching file content: ${error.message}`);
            break;
        }
    }

    return null;
}

exports.fetchFileContentFromCommit = fetchFileContentFromCommit;