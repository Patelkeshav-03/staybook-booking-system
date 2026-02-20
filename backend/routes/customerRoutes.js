const express = require('express');
const router = express.Router();
const { getCustomerDashboard } = require('../controllers/dashboardController');
const { bookRoom, getCustomerBookings, cancelBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('customer'), getCustomerDashboard);
router.post('/book-room', protect, authorize('customer'), bookRoom);
router.get('/my-bookings', protect, authorize('customer'), getCustomerBookings);
router.put('/bookings/:id/cancel', protect, authorize('customer'), cancelBooking);

module.exports = router;
