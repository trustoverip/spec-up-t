// Function to check the rate limit of the GitHub API
function checkRateLimit(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (response.status === 403 && remaining === '0') {
        const resetTime = new Date(reset * 1000);
        console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.\n`);
        return true;
    } else if (remaining !== null) {
        console.log(`\n   SPEC-UP-T: Github API rate limit: ${remaining} requests remaining. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.\n`);
    } else {
        console.warn(`\n   SPEC-UP-T: Unable to determine rate limit status. Check your GitHub API token and network connection.\n`);
    }
    return false;
}
exports.checkRateLimit = checkRateLimit;