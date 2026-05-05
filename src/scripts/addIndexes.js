require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

const uri = process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
    console.log('Adding indexes...');

    await Profile.collection.createIndex({ gender: 1, age_group: 1, country_id: 1 });
    await Profile.collection.createIndex({ age: 1 });
    await Profile.collection.createIndex({ gender: 1, age: 1 });
    await Profile.collection.createIndex({ country_id: 1, age: 1 });
    await Profile.collection.createIndex({ created_at: -1 });
    await Profile.collection.createIndex({ name: 1 }, { unique: true });

    console.log('✅ Indexes created');
    process.exit(0);
});