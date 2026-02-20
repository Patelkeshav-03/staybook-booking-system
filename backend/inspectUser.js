const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const inspectUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'keshav@gmail.com' }).select('+password');
        if (user) {
            console.log(`Email: "${user.email}" (Length: ${user.email.length})`);
            console.log(`Password Hash Length: ${user.password.length}`);
            console.log(`Password Hash: ${user.password}`);
        } else {
            console.log('User not found exactly as "keshav@gmail.com"');
            const allUsers = await User.find({});
            console.log('All users in DB:');
            allUsers.forEach(u => console.log(`- "${u.email}"`));
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectUser();
