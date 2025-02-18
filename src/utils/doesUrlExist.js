const axios = require('axios');

/**
 * Checks if a URL returns a 200 status code.
 * @param {string} url - The URL to check.
 * @returns {Promise<boolean>} - True if the URL exists (200), false otherwise.
 */
async function doesUrlExist(url) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false; // URL does not exist
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNABORTED') {
            return false; // Network issues
        }
        return false; // Fail-safe return
    }
}

module.exports = { doesUrlExist };
