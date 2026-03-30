// backend/routes/paymentRoutes.js
// Маршрут оплаты. Принимает данные брони и проводит оплату через контроллер.
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/payments — обработка платежа для брони
router.post('/', authMiddleware, paymentController.processPayment);

module.exports = router;
