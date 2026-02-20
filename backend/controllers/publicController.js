const asyncHandler = require('express-async-handler');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

// @desc    Get all hotels
// @route   GET /api/public/hotels
// @access  Public
const getHotels = asyncHandler(async (req, res) => {
    const hotels = await Hotel.find({});
    res.status(200).json(hotels);
});

// @desc    Get rooms for a hotel
// @route   GET /api/public/hotels/:id/rooms
// @access  Public
const getHotelRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({ hotelId: req.params.id });
    res.status(200).json(rooms);
});

module.exports = {
    getHotels,
    getHotelRooms
};
