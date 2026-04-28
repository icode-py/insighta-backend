const axios = require('axios');

const GENDERIZE_API_URL = 'https://api.genderize.io';

const getGenderData = async (name) => {
    try {
        const response = await axios.get(GENDERIZE_API_URL, {
            params: { name: name.trim().toLowerCase() },
            timeout: 10000
        });

        const { gender, probability, count } = response.data;

        // Edge case: API returns null gender or 0 count
        if (gender === null || count === 0) {
            const error = new Error('Genderize returned an invalid response');
            error.apiName = 'Genderize';
            throw error;
        }

        return {
            gender,
            gender_probability: probability,
            sample_size: count
        };
    } catch (error) {
        if (error.apiName) throw error;

        error.apiName = 'Genderize';
        error.message = 'Genderize returned an invalid response';
        throw error;
    }
};

module.exports = { getGenderData };