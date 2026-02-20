const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data (optional, maybe safe to skip clearing for now to preserve user data)
        // await User.deleteMany({});
        // await Hotel.deleteMany({});
        // await Room.deleteMany({});

        // Create Vendor
        let vendor = await User.findOne({ email: 'vendor@example.com' });
        if (!vendor) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            vendor = await User.create({
                name: 'Main Vendor',
                email: 'vendor@example.com',
                password: hashedPassword, // hashing manually here as create might bypass pre-save if using insertMany, but create uses save
                role: 'vendor'
            });
            console.log('Vendor created');
        } else {
            console.log('Vendor already exists');
        }

        // Create Hotels
        const hotels = [
            {
                vendorId: vendor._id,
                name: 'Grand Plaza Hotel',
                location: 'New York, USA',
                description: 'A luxury hotel in the heart of the city.',
                amenities: ['Pool', 'Gym', 'Spa', 'WiFi'],
                imageUrls: ['https://images.unsplash.com/photo-1566073771259-6a8506099945']
            },
            {
                vendorId: vendor._id,
                name: 'Seaside Resort',
                location: 'Miami, USA',
                description: 'Relax by the ocean in our beautiful resort.',
                amenities: ['Beach Access', 'Pool', 'Bar', 'WiFi'],
                imageUrls: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4']
            },
            {
                vendorId: vendor._id,
                name: 'Mountain Retreat',
                location: 'Aspen, USA',
                description: 'Cozy cabins with breathtaking mountain views.',
                amenities: ['Skiing', 'Fireplace', 'Hiking', 'WiFi'],
                imageUrls: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4']
            }
        ];

        for (const hotelData of hotels) {
            // Check if hotel exists
            const existingHotel = await Hotel.findOne({ name: hotelData.name });
            if (!existingHotel) {
                const hotel = await Hotel.create(hotelData);
                console.log(`Created hotel: ${hotel.name}`);

                // Create Rooms for this hotel
                const rooms = [
                    { hotelId: hotel._id, roomType: 'Standard', pricePerNight: 100, count: 5 },
                    { hotelId: hotel._id, roomType: 'Deluxe', pricePerNight: 200, count: 3 },
                    { hotelId: hotel._id, roomType: 'Suite', pricePerNight: 350, count: 2 }
                ];
                await Room.insertMany(rooms);
            } else {
                console.log(`Hotel ${hotelData.name} already exists`);
            }
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
