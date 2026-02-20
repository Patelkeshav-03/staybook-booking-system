const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const userCount = await User.countDocuments();
        const hotelCount = await Hotel.countDocuments();
        const roomCount = await Room.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Hotels: ${hotelCount}`);
        console.log(`Rooms: ${roomCount}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
