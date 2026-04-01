const express = require('express');
const router = express.Router();
const db = require('../db'); // Убедитесь, что путь к db.js правильный

// GET /api/categories - Получить все категории
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id - Получить категорию по ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Categories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;