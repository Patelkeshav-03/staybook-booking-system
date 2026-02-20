const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'keshav@gmail.com' }).select('+password');
        if (user) {
            fs.writeFileSync('user_debug.json', JSON.stringify(user, null, 2));
            console.log('User data written to user_debug.json');
        } else {
            console.log('User NOT found.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyUser();
