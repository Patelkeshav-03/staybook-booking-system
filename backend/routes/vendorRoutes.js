const express = require('express');
const router = express.Router();
const { getVendorStats, createHotel, updateHotel, deleteHotel } = require('../controllers/vendorController');
const { getVendorBookings } = require('../controllers/bookingController');
const { getVendorDashboard } = require('../controllers/dashboardController');
const { protect, authorize, checkApproved } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('vendor'));
router.use(checkApproved);

router.get('/dashboard', getVendorDashboard);
router.get('/stats', getVendorStats);
router.get('/bookings', getVendorBookings);

router.post('/hotels', createHotel);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);

module.exports = router;
