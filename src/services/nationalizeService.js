const axios = require('axios');

const NATIONALIZE_API_URL = 'https://api.nationalize.io';

const getNationalityData = async (name) => {
    try {
        const response = await axios.get(NATIONALIZE_API_URL, {
            params: { name: name.trim().toLowerCase() },
            timeout: 10000
        });

        const { country } = response.data;

        // Edge case: No country data
        if (!country || country.length === 0) {
            const error = new Error('Nationalize returned an invalid response');
            error.apiName = 'Nationalize';
            throw error;
        }

        // Get country with highest probability
        const topCountry = country.reduce((max, curr) =>
            curr.probability > max.probability ? curr : max
        );

        return {
            country_id: topCountry.country_id,
            country_probability: topCountry.probability
        };
    } catch (error) {
        if (error.apiName) throw error;

        error.apiName = 'Nationalize';
        error.message = 'Nationalize returned an invalid response';
        throw error;
    }
};

module.exports = { getNationalityData };