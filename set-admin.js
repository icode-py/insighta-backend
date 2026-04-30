require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const uri = process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
    // Make icode-py an admin
    const user = await User.findOneAndUpdate(
        { username: 'icode-py' },
        { role: 'admin' },
        { new: true }
    );
    console.log('Updated user:', user);
    process.exit(0);
});