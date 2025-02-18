// Function to check the rate limit of the GitHub API
function checkRateLimit(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (response.status === 403 && remaining === '0') {
        const resetTime = new Date(reset * 1000);
        console.error(`❌ Github API rate limit exceeded. Try again after ${resetTime}. See https://trustoverip.github.io/spec-up-t-website/docs/getting-started/github-token for more info.`);
        return true;
    } else if (remaining !== null) {
        console.log(`ℹ️ Github API rate limit: ${remaining} requests remaining. See https://trustoverip.github.io/spec-up-t-website/docs/getting-started/github-token for more info.`);
    } else {
        console.warn(`ℹ️ Unable to determine rate limit status. Check your GitHub API token and network connection.`);
    }
    return false;
}
exports.checkRateLimit = checkRateLimit;