// Function to check the rate limit of the GitHub API
function checkRateLimit(response) {
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
        console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
        return true;
    } else {
        console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
    }
    return false;
}
exports.checkRateLimit = checkRateLimit;
