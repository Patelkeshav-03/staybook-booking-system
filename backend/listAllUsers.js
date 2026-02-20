const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).select('email name role createdAt');
        fs.writeFileSync('all_users.json', JSON.stringify(users, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
