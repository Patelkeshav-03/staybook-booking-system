const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
    const usersCount = await User.countDocuments({});
    const hotelsCount = await Hotel.countDocuments({});
    const bookingsCount = await Booking.countDocuments({});

    // Calculate total revenue from confirmed bookings
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    // Get recent data for tables
    const recentHotels = await Hotel.find({}).sort('-createdAt').limit(5);
    const recentUsers = await User.find({}).sort('-createdAt').limit(5).select('-password');

    res.status(200).json({
        message: 'Welcome to Admin Dashboard',
        user: req.user,
        stats: {
            users: usersCount,
            hotels: hotelsCount,
            bookings: bookingsCount,
            revenue: totalRevenue
        },
        recentHotels,
        recentUsers
    });
});

// @desc    Get vendor dashboard data
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
const getVendorDashboard = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'Welcome to Vendor Dashboard',
        user: req.user
    });
});

// @desc    Get customer dashboard data
// @route   GET /api/customer/dashboard
// @access  Private/Customer
const getCustomerDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
        .populate('hotelId', 'name location imageUrls')
        .populate('roomId', 'roomType pricePerNight')
        .sort('-createdAt');

    const payments = await Payment.find({
        bookingId: { $in: bookings.map(b => b._id) }
    }).sort('-date');

    // Summary calculations
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Get some recommendations (just taking random hotels for now)
    const recommendations = await Hotel.find({}).limit(3);

    const userWithWishlist = await User.findById(userId).populate('wishlist');
    if (!userWithWishlist) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        message: 'Welcome to Customer Dashboard',
        user: req.user,
        summary: {
            totalBookings: bookings.length,
            upcomingStays: confirmedBookings.length,
            cancelledBookings: cancelledBookings.length,
            totalSpent
        },
        bookings: bookings.map(b => ({
            ...b.toObject(),
            hotel: b.hotelId, // Map to match frontend field names
            room: b.roomId,
            checkIn: b.checkInDate,
            checkOut: b.checkOutDate,
            totalAmount: b.totalPrice
        })),
        payments: payments.map(p => ({
            ...p.toObject(),
            date: p.createdAt || p.date // Ensure date field exists
        })),
        wishlist: userWithWishlist.wishlist || [],
        recommendations,
        notifications: [
            {
                _id: '1',
                title: 'Welcome to Staybook!',
                message: 'Start exploring luxury hotels and book your first stay today.',
                type: 'system',
                createdAt: new Date(),
                isRead: false
            }
        ]
    });
});

module.exports = {
    getAdminDashboard,
    getVendorDashboard,
    getCustomerDashboard
};
