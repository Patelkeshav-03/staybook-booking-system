const express = require('express');
const router = express.Router();
const { getCustomerDashboard } = require('../controllers/dashboardController');
const { bookRoom, getCustomerBookings, cancelBooking } = require('../controllers/bookingController');
const { addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('customer'), getCustomerDashboard);
router.post('/book-room', protect, authorize('customer'), bookRoom);
router.get('/my-bookings', protect, authorize('customer'), getCustomerBookings);
router.put('/bookings/:id/cancel', protect, authorize('customer'), cancelBooking);

router.post('/wishlist', protect, authorize('customer'), addToWishlist);
router.delete('/wishlist/:hotelId', protect, authorize('customer'), removeFromWishlist);

module.exports = router;
