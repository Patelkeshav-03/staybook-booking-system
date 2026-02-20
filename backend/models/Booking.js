const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    hotelId: { // Optional: for easier querying
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    checkInDate: {
        type: Date,
        required: [true, 'Please add a check-in date']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Please add a check-out date']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
