// backend/routes/adminRoutes.js
// Админские маршруты для управления услугами.
// Доступны только авторизованному пользователю с флагом is_admin.
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const upload = require('../middleware/multerConfig');

router.post('/services', authMiddleware, adminMiddleware, upload.array('images', 5), adminController.createService);
router.put('/services/:id', authMiddleware, adminMiddleware, upload.array('images', 5), adminController.updateService);
router.delete('/services/:id', authMiddleware, adminMiddleware, adminController.deleteService);

module.exports = router;
