const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Demote any existing admins to customer (to ensure only one admin)
        await User.updateMany({ role: 'admin' }, { role: 'customer' });
        console.log('Existing admins demoted');

        // Check if the user already exists
        let user = await User.findOne({ email: 'patelkeshav03@gmail.com' });

        if (user) {
            user.password = '333333';
            user.role = 'admin';
            user.name = 'Patel Keshav';
            await user.save();
            console.log('Existing user updated to Admin');
        } else {
            user = await User.create({
                name: 'Patel Keshav',
                email: 'patelkeshav03@gmail.com',
                password: '333333',
                role: 'admin'
            });
            console.log('New Admin user created');
        }

        console.log('Admin Credentials:');
        console.log('Email: patelkeshav03@gmail.com');
        console.log('Password: 333333');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
