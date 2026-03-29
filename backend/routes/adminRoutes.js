const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/services', authMiddleware, adminMiddleware, adminController.createService);
router.put('/services/:id', authMiddleware, adminMiddleware, adminController.updateService);
router.delete('/services/:id', authMiddleware, adminMiddleware, adminController.deleteService);

module.exports = router;
