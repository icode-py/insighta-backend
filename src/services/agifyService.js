const axios = require('axios');

const AGIFY_API_URL = 'https://api.agify.io';

const getAgeData = async (name) => {
    try {
        const response = await axios.get(AGIFY_API_URL, {
            params: { name: name.trim().toLowerCase() },
            timeout: 10000
        });

        const { age } = response.data;

        // Edge case: API returns null age
        if (age === null) {
            const error = new Error('Agify returned an invalid response');
            error.apiName = 'Agify';
            throw error;
        }

        return { age };
    } catch (error) {
        if (error.apiName) throw error;

        error.apiName = 'Agify';
        error.message = 'Agify returned an invalid response';
        throw error;
    }
};

module.exports = { getAgeData };