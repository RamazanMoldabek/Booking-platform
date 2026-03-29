const db = require('../db');

exports.getServices = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Server error fetching services' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: 'Server error fetching service' });
  }
};
