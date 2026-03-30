// backend/routes/bookingRoutes.js
// Маршруты бронирования. Создание брони и получение своих броней.
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/bookings — создать новую бронь (требует авторизации)
router.post('/', authMiddleware, bookingController.createBooking);
// GET /api/bookings/me — получить брони текущего пользователя
router.get('/me', authMiddleware, bookingController.getUserBookings);
// GET /api/bookings/user/:userId — получить брони по userId (публичный или отладочный)
router.get('/user/:userId', bookingController.getUserBookings);
// GET /api/bookings/:bookingId — получить детали конкретной брони
router.get('/:bookingId', bookingController.getBookingById);

module.exports = router;
