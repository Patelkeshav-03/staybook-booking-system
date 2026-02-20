const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const users = await User.find({}).select('email name role');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) [${u.name}]`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
