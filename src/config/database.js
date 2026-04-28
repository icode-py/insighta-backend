const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error('MONGODB_URI is not set in environment');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        console.log('URI prefix:', uri.substring(0, 40) + '...');

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;