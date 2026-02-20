const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'keshav@gmail.com' });
        if (user) {
            user.password = 'password123';
            await user.save();
            console.log('Password reset to "password123" for keshav@gmail.com');

            // Re-verify
            const updatedUser = await User.findOne({ email: 'keshav@gmail.com' }).select('+password');
            console.log('New Hash:', updatedUser.password);
        } else {
            console.log('User not found');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
