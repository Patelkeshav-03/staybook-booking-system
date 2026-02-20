const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const registerTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete if exists
        await User.deleteOne({ email: 'testuser@test.com' });

        const user = await User.create({
            name: 'Test User',
            email: 'testuser@test.com',
            password: 'password123',
            role: 'customer'
        });

        console.log('User registered successfully');
        console.log('Stored Hash:', user.password);

        const isMatch = await user.matchPassword('password123');
        console.log('Immediate password check match:', isMatch);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

registerTestUser();
