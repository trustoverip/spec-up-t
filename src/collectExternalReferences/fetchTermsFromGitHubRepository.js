const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // For generating cache keys
const isLineWithDefinition = require('../utils/isLineWithDefinition').isLineWithDefinition;
const { addPath, getPath, getAllPaths } = require('../config/paths');

// Directory to store cached files
const CACHE_DIR = getPath('githubcache');

// Ensure the cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Helper function to generate a cache key
function generateCacheKey(...args) {
    const hash = crypto.createHash('md5').update(args.join('-')).digest('hex');
    return hash;
}

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
        // Generate a cache key for the search query
        const searchCacheKey = generateCacheKey('search', searchString, owner, repo, subdirectory);
        const searchCacheFilePath = path.join(CACHE_DIR, `${searchCacheKey}.json`);

        let searchResponse;

        // Check if the search response is already cached
        if (fs.existsSync(searchCacheFilePath)) {
            console.log(`Serving search results from cache: ${searchCacheFilePath}`);
            searchResponse = JSON.parse(fs.readFileSync(searchCacheFilePath, 'utf-8'));
        } else {
            // Perform the search using Octokit with exact match
            console.log(`Performing search and caching results: ${searchCacheFilePath}`);
            searchResponse = await octokit.rest.search.code({
                q: `"${searchString}" repo:${owner}/${repo} path:${subdirectory}`, // Exact match in subdirectory
                headers: {
                    Accept: "application/vnd.github.v3.text-match+json", // Include text-match media type
                },
            });

            // Cache the search response
            fs.writeFileSync(searchCacheFilePath, JSON.stringify(searchResponse), 'utf-8');
        }

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
                continue;
            }

            // Loop through each text match. Can contain multiple fragments
            for (const match of item.text_matches) {
                // Split the fragment into lines, lines can be empty ('')
                const lines = match.fragment.split("\n");
                for (const line of lines) {
                    if (isLineWithDefinition(line)) {
                        // Generate a unique cache key for the file
                        const fileCacheKey = generateCacheKey('file', owner, repo, item.path);
                        const fileCacheFilePath = path.join(CACHE_DIR, `${fileCacheKey}.txt`);

                        let fileContent;

                        // Check if the file is already cached
                        if (fs.existsSync(fileCacheFilePath)) {
                            console.log(`Serving file from cache: ${fileCacheFilePath}`);
                            fileContent = fs.readFileSync(fileCacheFilePath, 'utf-8');
                        } else {
                            // Fetch file content from GitHub
                            console.log(`Downloading and caching file: ${fileCacheFilePath}`);
                            try {
                                const fileContentResponse = await octokit.rest.repos.getContent({
                                    owner: item.repository.owner.login, // Repository owner
                                    repo: item.repository.name, // Repository name
                                    path: item.path, // File path
                                });

                                // Decode the file content (it's base64-encoded)
                                if (fileContentResponse.data.content) {
                                    fileContent = Buffer.from(fileContentResponse.data.content, "base64").toString("utf-8");
                                    // Save the file to the cache
                                    fs.writeFileSync(fileCacheFilePath, fileContent, 'utf-8');
                                } else {
                                    // If the file is larger than 1 MB, GitHub's API will return a download URL instead of the content.
                                    console.log("File is too large. Download URL:", fileContentResponse.data.download_url);
                                    fileContent = "";
                                }
                            } catch (error) {
                                console.error(`Error fetching content for ${item.path}:`, error);
                                fileContent = ""; // Set content to an empty string if there's an error
                            }
                        }

                        // Attach the content to the item
                        item.content = fileContent;

                        // Return the item as soon as we find the correct line
                        return item;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error searching GitHub or fetching file content:", error);
    }

    // If no item is found, return null or undefined
    return null;
}

exports.fetchTermsFromGitHubRepository = fetchTermsFromGitHubRepository;