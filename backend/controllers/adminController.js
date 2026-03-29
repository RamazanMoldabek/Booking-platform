const db = require('../db');

exports.createService = async (req, res) => {
  try {
    const { title, description, short_description, price, duration, image_url, website } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    const insertQuery = `
      INSERT INTO services (title, description, short_description, price, duration, image_url, website)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 60,
      image_url ? image_url.trim() : null,
      website ? website.trim() : null,
    ];

    const { rows } = await db.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Server error creating service.' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, short_description, price, duration, image_url, website } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    const updateQuery = `
      UPDATE services
      SET title = $1,
          description = $2,
          short_description = $3,
          price = $4,
          duration = $5,
          image_url = $6,
          website = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 60,
      image_url ? image_url.trim() : null,
      website ? website.trim() : null,
      id,
    ];

    const { rows } = await db.query(updateQuery, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Server error updating service.' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Server error deleting service.' });
  }
};
