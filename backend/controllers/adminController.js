const db = require('../db');

exports.createService = async (req, res) => {
  try {
    const { title, description, short_description, price, duration, website, rating, address, advantages } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    
    let parsedAdvantages = [];
    if (advantages) {
      try {
        parsedAdvantages = typeof advantages === 'string' ? JSON.parse(advantages) : advantages;
      } catch (e) {
        console.error('Error parsing advantages:', e);
      }
    }

    const serviceRating = rating ? Number(rating) : 4.5;
    const insertQuery = `
      INSERT INTO services (title, description, short_description, price, duration, website, rating, images, address, advantages, latitude, longitude, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 1,
      website ? website.trim() : null,
      serviceRating,
      imageUrls,
      address ? address.trim() : null,
      JSON.stringify(parsedAdvantages),
      req.body.latitude ? Number(req.body.latitude) : null,
      req.body.longitude ? Number(req.body.longitude) : null,
      req.body.category_id ? Number(req.body.category_id) : null,
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
    const { title, description, short_description, price, duration, website, rating, address, advantages, existing_images } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required.' });
    }

    
    const newImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    
    let finalImages = [];
    if (existing_images) {
      try {
        finalImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      } catch (e) {
        console.error('Error parsing existing_images:', e);
      }
    }
    
    
    finalImages = [...finalImages, ...newImageUrls];

    
    let parsedAdvantages = [];
    if (advantages) {
      try {
        parsedAdvantages = typeof advantages === 'string' ? JSON.parse(advantages) : advantages;
      } catch (e) {
        console.error('Error parsing advantages:', e);
      }
    }

    const serviceRating = rating ? Number(rating) : 4.5;
    const updateQuery = `
      UPDATE services
      SET title = $1,
          description = $2,
          short_description = $3,
          price = $4,
          duration = $5,
          website = $6,
          rating = $7,
          images = $8,
          address = $9,
          advantages = $10,
          latitude = $11,
          longitude = $12,
          category_id = $13
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      short_description ? short_description.trim() : null,
      Number(price),
      duration ? Number(duration) : 1,
      website ? website.trim() : null,
      serviceRating,
      finalImages,
      address ? address.trim() : null,
      JSON.stringify(parsedAdvantages),
      req.body.latitude ? Number(req.body.latitude) : null,
      req.body.longitude ? Number(req.body.longitude) : null,
      req.body.category_id ? Number(req.body.category_id) : null,
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
    
    const checkQuery = 'SELECT COUNT(*) FROM bookings WHERE service_id = $1';
    const { rows: checkRows } = await db.query(checkQuery, [id]);
    const bookingCount = parseInt(checkRows[0].count, 10);

    if (bookingCount > 0) {
      return res.status(400).json({
        error: `Cannot delete service because it has ${bookingCount} existing booking(s).`
      });
    }

    
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
