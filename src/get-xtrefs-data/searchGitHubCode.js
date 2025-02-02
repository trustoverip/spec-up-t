async function searchGitHubCode(GITHUB_API_TOKEN, searchString, owner, repo, subdirectory) {
    const { Octokit } = await import("octokit");
    const { throttling } = await import("@octokit/plugin-throttling");

    // Create a throttled Octokit instance
    const ThrottledOctokit = Octokit.plugin(throttling);
    const octokit = new ThrottledOctokit({
        auth: GITHUB_API_TOKEN,
        throttle: {
            onRateLimit: (retryAfter, options) => {
                console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
                if (options.request.retryCount <= 1) {
                    console.log(`Retrying after ${retryAfter} seconds...`);
                    return true;
                }
            },
            onAbuseLimit: (retryAfter, options) => {
                console.warn(`Abuse detected for request ${options.method} ${options.url}`);
            },
            onSecondaryRateLimit: (retryAfter, options) => {
                console.warn(`Secondary rate limit hit for request ${options.method} ${options.url}`);
                if (options.request.retryCount <= 1) {
                    console.log(`Retrying after ${retryAfter} seconds...`);
                    return true;
                }
            },
        },
    });

    try {
        // Perform the search using Octokit with exact match
        const searchResponse = await octokit.rest.search.code({
            // q: `${searchString} repo:${owner}/${repo}`, // Fuzzy search
            q: `"${searchString}" repo:${owner}/${repo} path:${subdirectory}`, // Use quotation marks for exact match
            // q: `"${searchString}" repo:${owner}/${repo} case:true`, // DOES NOT WORK Use quotation marks for exact match. Case sensitive search
        });

        // Log the search results
        console.log("Total results:", searchResponse.data.total_count);

        // const rateLimitResponse = await octokit.rest.rateLimit.get();
        // console.log("Rate limit:", rateLimitResponse.data);

        // Fetch the content of each file
        for (const item of searchResponse.data.items) {
            let content = "";
            const fileContentResponse = await octokit.rest.repos.getContent({
                owner: item.repository.owner.login, // Repository owner
                repo: item.repository.name, // Repository name
                path: item.path, // File path
            });

            // Decode the file content (it's base64-encoded)
            if (fileContentResponse.data.content) {
                content = Buffer.from(fileContentResponse.data.content, "base64").toString("utf-8");
            } else {
                // If the file is larger than 1 MB, GitHub's API will return a download URL instead of the content. 
                console.log("File is too large. Download URL:", fileContentResponse.data.download_url);
            }

            item.content = content;
        }
        return searchResponse;
    } catch (error) {
        console.error("Error searching GitHub or fetching file content:", error);
    }
}

exports.searchGitHubCode = searchGitHubCode;