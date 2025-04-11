// Simple wrapper for Octokit functionality
let octokitClient = null;
let initPromise = null;

/**
 * Initialize the Octokit client (only happens once)
 */
async function initializeClient(token) {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const { Octokit } = await import('octokit');
            const { throttling } = await import('@octokit/plugin-throttling');

            const ThrottledOctokit = Octokit.plugin(throttling);
            octokitClient = new ThrottledOctokit({
                auth: token,
                throttle: {
                    onRateLimit: (retryAfter, options) => {
                        console.warn(`Request quota exhausted for ${options.method} ${options.url}`);
                        return options.request.retryCount <= 1; // retry once
                    },
                    onSecondaryRateLimit: (retryAfter, options) => {
                        console.warn(`Secondary rate limit hit for ${options.method} ${options.url}`);
                        return options.request.retryCount <= 1; // retry once
                    },
                }
            });

            console.log("Octokit client initialized successfully");
            return octokitClient;
        } catch (error) {
            console.error("Failed to initialize Octokit:", error);
            initPromise = null; // Reset so we can try again later
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Get a GitHub search client
 */
async function getSearchClient(token) {
    const client = await initializeClient(token);
    return {
        search: async (query, owner, repo, path) => {
            // First check if the repo is a fork
            let isForked = false;
            try {
                const repoInfo = await client.rest.repos.get({
                    owner,
                    repo
                });
                isForked = repoInfo.data.fork;
            } catch (error) {
                console.warn(`Could not determine fork status: ${error.message}`);
            }

            // Use appropriate search parameter based on fork status
            const forkParam = isForked ? ' fork:true' : '';
            const searchQuery = `${query} repo:${owner}/${repo} path:${path}${forkParam}`;

            console.log(`Executing GitHub search: ${searchQuery}`);
            return client.rest.search.code({
                q: searchQuery,
                headers: {
                    Accept: "application/vnd.github.v3.text-match+json",
                },
            });
        }
    };
}

/**
 * Get a GitHub content client
 */
async function getContentClient(token) {
    const client = await initializeClient(token);
    return {
        getContent: async (owner, repo, path) => {
            return client.rest.repos.getContent({
                owner,
                repo,
                path
            });
        }
    };
}

module.exports = {
    getSearchClient,
    getContentClient
};