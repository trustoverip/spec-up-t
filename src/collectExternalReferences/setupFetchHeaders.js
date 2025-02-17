function setupFetchHeaders(GITHUB_API_TOKEN) {
    const fetchHeaders = {
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_API_TOKEN) {
        fetchHeaders['Authorization'] = `token ${GITHUB_API_TOKEN}`;
    } else {
        console.log('ℹ️ There is no GitHub token set up. Therefore, you are more likely to be at your limit of GitHub API requests. If you run into the limit, create a token and search the documentation on this topic.\n');
    }

    return fetchHeaders;
}
exports.setupFetchHeaders = setupFetchHeaders;
