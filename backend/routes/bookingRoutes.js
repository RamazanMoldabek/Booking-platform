const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/me', authMiddleware, bookingController.getUserBookings);
router.get('/user/:userId', bookingController.getUserBookings);
router.get('/:bookingId', bookingController.getBookingById);

module.exports = router;
