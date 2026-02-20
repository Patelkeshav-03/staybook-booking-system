const express = require('express');
const router = express.Router();
const { getVendorStats, createHotel, updateHotel, deleteHotel } = require('../controllers/vendorController');
const { getVendorBookings } = require('../controllers/bookingController');
const { getVendorDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('vendor'), getVendorDashboard);
router.get('/stats', protect, authorize('vendor'), getVendorStats);
router.get('/bookings', protect, authorize('vendor'), getVendorBookings);

router.post('/hotels', protect, authorize('vendor'), createHotel);
router.put('/hotels/:id', protect, authorize('vendor'), updateHotel);
router.delete('/hotels/:id', protect, authorize('vendor'), deleteHotel);

module.exports = router;
