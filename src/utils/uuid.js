const { uuidv7 } = require('uuidv7');

const generateUUIDv7 = () => {
    return uuidv7();
};

module.exports = { generateUUIDv7 };