const validateNameParam = (name) => {
    if (name === undefined || name === null) {
        return {
            status: 400,
            message: 'Name parameter is required'
        };
    }

    if (typeof name === 'string' && name.trim() === '') {
        return {
            status: 400,
            message: 'Name parameter cannot be empty'
        };
    }

    if (typeof name !== 'string') {
        return {
            status: 422,
            message: 'Name parameter must be a string'
        };
    }

    return null;
};

module.exports = { validateNameParam };