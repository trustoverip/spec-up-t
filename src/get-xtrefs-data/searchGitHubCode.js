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
            q: `"${searchString}" repo:${owner}/${repo} path:${subdirectory}`, // Exact match in subdirectory
            headers: {
                Accept: "application/vnd.github.v3.text-match+json", // Include text-match media type
            },
        });

        // Log the search results
        console.log("Total results:", searchResponse.data.total_count);

        // Fetch the content of each file
        for (const item of searchResponse.data.items) {
            // Check if text_matches exists and is not empty
            if (!item.text_matches || item.text_matches.length === 0) {
                console.log(`Skipping ${item.path}: No text matches found.`);
                continue;
            }

            // Check if the match is in the first line using text_matches
            const isFirstLineMatch = item.text_matches.some(match => {
                if (!match.fragment) {
                    console.log(`Skipping ${item.path}: No fragment found in text match.`);
                    return false;
                }

                const firstLine = match.fragment.split("\n")[0];
                return firstLine.includes(searchString);
            });

            if (!isFirstLineMatch) {
                console.log(`Skipping ${item.path}: Match not in the first line.`);
                continue; // Skip this file
            }

            // Fetch file content
            let content = "";
            try {
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
            } catch (error) {
                console.error(`Error fetching content for ${item.path}:`, error);
                content = ""; // Set content to an empty string if there's an error
            }

            // Attach the content to the item
            item.content = content;
        }

        return searchResponse;
    } catch (error) {
        console.error("Error searching GitHub or fetching file content:", error);
    }
}

exports.searchGitHubCode = searchGitHubCode;