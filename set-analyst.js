require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const uri = process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
    const user = await User.findOneAndUpdate(
        { username: 'icode-py' },
        { role: 'analyst' },
        { new: true }
    );
    console.log('Role changed to:', user.role);
    process.exit(0);
});