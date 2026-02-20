const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json({
        message: 'Welcome to Admin Dashboard',
        user: req.user,
        totalUsers: users.length
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
    res.status(200).json({
        message: 'Welcome to Customer Dashboard',
        user: req.user
    });
});

module.exports = {
    getAdminDashboard,
    getVendorDashboard,
    getCustomerDashboard
};
