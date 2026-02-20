const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Book a room
// @route   POST /api/customer/book-room
// @access  Private/Customer
const bookRoom = asyncHandler(async (req, res) => {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkInDate || !checkOutDate) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    const room = await Room.findById(roomId);
    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Calculate total price
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        res.status(400);
        throw new Error('Invalid dates');
    }

    const totalPrice = room.pricePerNight * nights;

    // TODO: Ideally check for room availability here

    const booking = await Booking.create({
        userId,
        roomId,
        hotelId: room.hotelId,
        checkInDate,
        checkOutDate,
        totalPrice,
        status: 'confirmed'
    });

    res.status(201).json(booking);
});

// @desc    Get bookings for a specific customer
// @route   GET /api/customer/my-bookings
// @access  Private/Customer
const getCustomerBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ userId: req.user.id })
        .populate('hotelId', 'name location')
        .populate('roomId', 'roomType')
        .sort('-createdAt');

    res.status(200).json(bookings);
});

// @desc    Get bookings for a vendor's hotels
// @route   GET /api/vendor/bookings
// @access  Private/Vendor
const getVendorBookings = asyncHandler(async (req, res) => {
    // Find all hotels owned by this vendor
    const hotels = await Hotel.find({ vendorId: req.user.id });
    const hotelIds = hotels.map(h => h._id);

    const bookings = await Booking.find({ hotelId: { $in: hotelIds } })
        .populate('userId', 'name email')
        .populate('roomId', 'roomType')
        .populate('hotelId', 'name')
        .sort('-createdAt');

    res.status(200).json(bookings);
});

// @desc    Cancel booking
// @route   PUT /api/customer/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Ensure the user owns the booking
    if (booking.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json(booking);
});

module.exports = {
    bookRoom,
    getCustomerBookings,
    getVendorBookings,
    cancelBooking
};
