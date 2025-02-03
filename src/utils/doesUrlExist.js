const axios = require('axios');

async function doesUrlExist(repo, termsDir) {
    const url = `${repo}/blob/main/${termsDir}`;
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        }
        if (error.code === 'ENOTFOUND') {
            return false;
        }
        console.log('Error:', error);
        return false;
    }
}

exports.doesUrlExist = doesUrlExist;