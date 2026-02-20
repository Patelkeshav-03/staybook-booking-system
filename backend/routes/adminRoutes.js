const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.put('/users/:id/block', toggleUserBlock);
router.put('/users/:id/role', updateUserRole);
router.get('/vendors', getAdminVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/hotels', getAdminHotels);
router.put('/hotels/:id/toggle', toggleHotelStatus);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAdminBookings);

module.exports = router;
