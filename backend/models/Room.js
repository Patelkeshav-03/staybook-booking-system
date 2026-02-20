const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    roomType: {
        type: String, // e.g., 'Single', 'Double', 'Suite'
        required: [true, 'Please add a room type']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add a price']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    count: {
        type: Number,
        default: 1,
        required: [true, 'Please add number of rooms']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
