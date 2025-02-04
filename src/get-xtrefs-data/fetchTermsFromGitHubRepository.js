async function fetchTermsFromGitHubRepository(GITHUB_API_TOKEN, searchString, owner, repo, subdirectory) {
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
        console.log(`Total matches for ${searchString} :`, searchResponse.data.total_count);

        /*
        
        Each item is a file that contains the search string one or more times. So if a search string is found in 'attribute-based-access-control.md' and 'abac.md', both files will be returned as separate items. Each item contains “text_matches”.

        - text_matches can contain multiple objects if there are multiple matches in the file.
        - fragment is a snippet of the file content around the matched search string, not the entire file content.

        In example below:

        - The total_count is 2, indicating there are two files that contain the search string.
        - Each item in the items array represents a file.
        - The text_matches array within each item contains objects representing different matches of the search string within the file.
        - Each fragment is a snippet of the file content around the matched search string, not the entire file content.

        {
        "total_count": 2,
        "items": [
            {
            "name": "example-file1.md",
            "path": "docs/example-file1.md",
            "sha": "abc123",
            "url": "https://api.github.com/repositories/123456789/contents/docs/example-file1.md",
            "git_url": "https://api.github.com/repositories/123456789/git/blobs/abc123",
            "html_url": "https://github.com/owner/repo/blob/main/docs/example-file1.md",
            "repository": {
                "id": 123456789,
                "name": "repo",
                "full_name": "owner/repo",
                "owner": {
                "login": "owner",
                "id": 12345,
                "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
                "url": "https://api.github.com/users/owner"
                }
            },
            "text_matches": [
                {
                "object_url": "https://api.github.com/repositories/123456789/contents/docs/example-file1.md",
                "object_type": "FileContent",
                "property": "content",
                "fragment": "This is an example content with the search string.",
                "matches": [
                    {
                    "text": "search string",
                    "indices": [31, 44]
                    }
                ]
                },
                {
                "object_url": "https://api.github.com/repositories/123456789/contents/docs/example-file1.md",
                "object_type": "FileContent",
                "property": "content",
                "fragment": "Another occurrence of the search string in the file.",
                "matches": [
                    {
                    "text": "search string",
                    "indices": [25, 38]
                    }
                ]
                }
            ]
            },
            {
            "name": "example-file2.md",
            "path": "docs/example-file2.md",
            "sha": "def456",
            "url": "https://api.github.com/repositories/123456789/contents/docs/example-file2.md",
            "git_url": "https://api.github.com/repositories/123456789/git/blobs/def456",
            "html_url": "https://github.com/owner/repo/blob/main/docs/example-file2.md",
            "repository": {
                "id": 123456789,
                "name": "repo",
                "full_name": "owner/repo",
                "owner": {
                "login": "owner",
                "id": 12345,
                "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
                "url": "https://api.github.com/users/owner"
                }
            },
            "text_matches": [
                {
                "object_url": "https://api.github.com/repositories/123456789/contents/docs/example-file2.md",
                "object_type": "FileContent",
                "property": "content",
                "fragment": "This file also contains the search string.",
                "matches": [
                    {
                    "text": "search string",
                    "indices": [25, 38]
                    }
                ]
                }
            ]
            }
        ]
        }
        */

        for (const item of searchResponse.data.items) {
            // Check if text_matches exists and is not empty
            if (!item.text_matches || item.text_matches.length === 0) {
                // console.log(`Skipping ${item.path}: No text matches found.`);
                continue;
            }

            // Check if the match is in the first line using text_matches
            const isFirstLineMatch = item.text_matches.some(match => {
                // Check if fragment exists, if not, skip this match
                if (!match.fragment) {
                    // console.log(`Skipping ${item.path}: No fragment found in text match.`);
                    return false;
                }

                const firstLine = match.fragment.split("\n")[0];
                return firstLine.includes(searchString);
            });

            if (!isFirstLineMatch) {
                // console.log(`Skipping ${item.path}: Match not in the first line.`);
                continue; // Skip the content fetching if the match is not in the first line and skip to the next item
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

exports.fetchTermsFromGitHubRepository = fetchTermsFromGitHubRepository;