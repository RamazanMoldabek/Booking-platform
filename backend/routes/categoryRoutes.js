const express = require('express');
const router = express.Router();
const db = require('../db'); 


router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Categories ORDER BY key ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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