const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
    const usersCount = await User.countDocuments({});
    const vendorsCount = await User.countDocuments({ role: 'vendor' });
    const hotelsCount = await Hotel.countDocuments({});
    const roomsCount = await Room.countDocuments({});
    const bookingsCount = await Booking.countDocuments({});

    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    const recentHotels = await Hotel.find({}).sort('-createdAt').limit(5);
    const recentUsers = await User.find({}).sort('-createdAt').limit(5).select('-password');

    res.status(200).json({
        stats: {
            users: usersCount,
            vendors: vendorsCount,
            hotels: hotelsCount,
            rooms: roomsCount,
            bookings: bookingsCount,
            revenue: totalRevenue
        },
        recentHotels,
        recentUsers
    });
});

// @desc    Get all users with optional search
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let query = {};

    if (search) {
        query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const users = await User.find(query).select('-password').sort('-createdAt');
    res.status(200).json(users);
});

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleUserBlock = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot block an admin');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json(user);
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot change admin role here');
    }

    user.role = role;
    await user.save();
    res.status(200).json(user);
});

// @desc    Get all vendors with aggregated stats
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAdminVendors = asyncHandler(async (req, res) => {
    const vendors = await User.find({ role: 'vendor' }).select('-password').sort('-createdAt');

    // Aggregate stats for each vendor
    const vendorsWithStats = await Promise.all(vendors.map(async (vendor) => {
        const hotelCount = await Hotel.countDocuments({ vendorId: vendor._id });

        // Find all hotels for this vendor to count bookings
        const vendorHotels = await Hotel.find({ vendorId: vendor._id }).select('_id');
        const hotelIds = vendorHotels.map(h => h._id);

        const bookingCount = await Booking.countDocuments({ hotelId: { $in: hotelIds } });

        return {
            ...vendor.toObject(),
            hotelCount,
            bookingCount
        };
    }));

    res.status(200).json(vendorsWithStats);
});

// @desc    Update vendor approval status
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
        res.status(404);
        throw new Error('Vendor not found');
    }

    vendor.vendorStatus = status;
    await vendor.save();
    res.status(200).json(vendor);
});

// @desc    Get all hotels
// @route   GET /api/admin/hotels
// @access  Private/Admin
const getAdminHotels = asyncHandler(async (req, res) => {
    const hotels = await Hotel.find({}).sort('-createdAt');
    res.status(200).json(hotels);
});

// @desc    Toggle hotel status
// @route   PUT /api/admin/hotels/:id/toggle
// @access  Private/Admin
const toggleHotelStatus = asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
        res.status(404);
        throw new Error('Hotel not found');
    }

    hotel.isActive = !hotel.isActive;
    await hotel.save();

    res.status(200).json(hotel);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin user');
    }

    await user.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAdminBookings = asyncHandler(async (req, res) => {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) {
        query.status = status;
    }

    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const bookings = await Booking.find(query)
        .populate('userId', 'name email')
        .populate('hotelId', 'name location')
        .populate('roomId', 'type price')
        .sort('-createdAt');

    res.status(200).json(bookings);
});

module.exports = {
    getAdminDashboard,
    getAdminUsers,
    getAdminHotels,
    toggleHotelStatus,
    deleteUser,
    toggleUserBlock,
    updateUserRole,
    getAdminVendors,
    updateVendorStatus,
    getAdminBookings
};
