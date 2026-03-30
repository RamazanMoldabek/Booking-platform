// backend/routes/serviceRoutes.js
// Публичные маршруты для получения списка услуг и деталей конкретной услуги.
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/services
router.get('/', serviceController.getServices);
// GET /api/services/:id
router.get('/:id', serviceController.getServiceById);

module.exports = router;
