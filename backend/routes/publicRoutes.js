const express = require('express');
const router = express.Router();
const { getHotels, getHotelRooms } = require('../controllers/publicController');

router.get('/hotels', getHotels);
router.get('/hotels/:id/rooms', getHotelRooms);

module.exports = router;
