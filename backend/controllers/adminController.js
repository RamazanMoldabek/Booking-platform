const db = require('../db');

exports.createService = async (req, res) => {
  try {
    const { title, description, short_description, price, duration, image_url, website, rating } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    const serviceRating = rating ? Number(rating) : 4.5;
    const insertQuery = `
      INSERT INTO services (title, description, short_description, price, duration, image_url, website, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 1,
      image_url ? image_url.trim() : null,
      website ? website.trim() : null,
      serviceRating,
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
    const { title, description, short_description, price, duration, image_url, website, rating } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    const serviceRating = rating ? Number(rating) : 4.5;
    const updateQuery = `
      UPDATE services
      SET title = $1,
          description = $2,
          short_description = $3,
          price = $4,
          duration = $5,
          image_url = $6,
          website = $7,
          rating = $8
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 1,
      image_url ? image_url.trim() : null,
      website ? website.trim() : null,
      serviceRating,
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
  const { id } = req.params;

  try {
    // 1. Check if there are any bookings for this service
    const checkQuery = 'SELECT COUNT(*) FROM bookings WHERE service_id = $1';
    const { rows: checkRows } = await db.query(checkQuery, [id]);
    const bookingCount = parseInt(checkRows[0].count, 10);

    if (bookingCount > 0) {
      return res.status(400).json({
        error: `Cannot delete service because it has ${bookingCount} existing booking(s).`
      });
    }

    // 2. If no bookings, proceed to delete
    const deleteQuery = 'DELETE FROM services WHERE id = $1 RETURNING *';
    const { rows: deleteRows } = await db.query(deleteQuery, [id]);

    if (deleteRows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    console.log(`Service with ID ${id} deleted successfully.`);
    res.json({ 
      success: true, 
      message: 'Service deleted successfully.',
      deletedService: deleteRows[0]
    });
  } catch (err) {
    console.error('Error in deleteService controller:', err);
    res.status(500).json({ error: 'Internal server error while trying to delete service.' });
  }
};
