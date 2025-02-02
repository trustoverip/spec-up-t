async function doesUrlExist(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log('Error:', error);
    }
}

exports.doesUrlExist = doesUrlExist;