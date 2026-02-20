const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const testLogin = async (email, password) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log(`User ${email} NOT found.`);
            return;
        }

        console.log(`User ${email} found.`);
        console.log(`Hash in DB: ${user.password}`);

        const isMatch = await user.matchPassword(password);
        console.log(`Password match for "${password}": ${isMatch}`);

        // Try double bcrypt if first one failed
        if (!isMatch) {
            const salt = await bcrypt.genSalt(10);
            // This won't work easily because salt is random, but we can check if the hash in DB is a hash of a hash
            // Wait, we can't easily check that without knowing the intermediate salt.
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const email = process.argv[2] || 'vendor@example.com';
const password = process.argv[3] || 'password123';

testLogin(email, password);
