const asyncHandler = require('express-async-handler');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private/Vendor
const getVendorStats = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    const hotels = await Hotel.find({ vendorId: req.user.id });
    const hotelIds = hotels.map(hotel => hotel._id);
    const rooms = await Room.find({ hotelId: { $in: hotelIds } });

    const bookings = await Booking.find({ hotelId: { $in: hotelIds } })
        .populate('userId', 'name email') // Changed from 'user' to 'userId' to match schema
        .populate('roomId', 'roomType') // Changed from 'room' to 'roomId'
        .populate('hotelId', 'name')
        .sort('-createdAt');

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    const totalEarnings = confirmedBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    res.status(200).json({
        summary: {
            totalHotels: hotels.length,
            totalRooms: rooms.length,
            totalBookings: bookings.length,
            confirmedBookings: confirmedBookings.length,
            cancelledBookings: cancelledBookings.length,
            totalEarnings
        },
        hotels: hotels.map(h => ({
            ...h.toObject(),
            roomCount: rooms.filter(r => r.hotelId.toString() === h._id.toString()).length,
            rooms: rooms.filter(r => r.hotelId.toString() === h._id.toString())
        })),
        recentBookings: bookings.slice(0, 5),
        bookings
    });
});

// @desc    Create new hotel
// @route   POST /api/vendor/hotels
// @access  Private/Vendor
const createHotel = asyncHandler(async (req, res) => {
    const { name, location, description, amenities, images } = req.body;

    if (!name || !location || !description) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const hotel = await Hotel.create({
        vendorId: req.user.id,
        name,
        location,
        description,
        amenities,
        imageUrls: images
    });

    res.status(201).json(hotel);
});

// @desc    Update hotel
// @route   PUT /api/vendor/hotels/:id
// @access  Private/Vendor
const updateHotel = asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
        res.status(404);
        throw new Error('Hotel not found');
    }

    if (hotel.vendorId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    if (req.body.images) {
        updatedHotel.imageUrls = req.body.images;
        await updatedHotel.save();
    }

    res.status(200).json(updatedHotel);
});

// @desc    Delete hotel
// @route   DELETE /api/vendor/hotels/:id
// @access  Private/Vendor
const deleteHotel = asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
        res.status(404);
        throw new Error('Hotel not found');
    }

    if (hotel.vendorId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await hotel.deleteOne();
    await Room.deleteMany({ hotelId: hotel._id });

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getVendorStats,
    createHotel,
    updateHotel,
    deleteHotel
};
