const db = require('../db');

exports.createBooking = async (req, res) => {
  try {
    const { service_id, booking_date } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required to create a booking.' });
    }

    if (!service_id || !booking_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: service_id and booking_date are required.' 
      });
    }

    // Simple double booking check logic
    const checkQuery = 'SELECT * FROM bookings WHERE service_id = $1 AND booking_date = $2 AND status != $3';
    const checkValues = [service_id, booking_date, 'cancelled'];

    const existingBooking = await db.query(checkQuery, checkValues);
    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const insertQuery = `
      INSERT INTO bookings (user_id, user_name, service_id, booking_date, status) 
      VALUES ($1, $2, $3, $4, 'pending') RETURNING *
    `;
    const insertValues = [user.id, user.name, service_id, booking_date];

    const { rows } = await db.query(insertQuery, insertValues);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Server error creating booking' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const query = `
      SELECT b.*, s.title as service_title, s.price as service_price 
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
    `;

    const { rows } = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: 'Server error fetching user bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const query = `
      SELECT b.*, s.title AS service_title, s.price AS service_price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `;
    const { rows } = await db.query(query, [bookingId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching booking by id:', err);
    res.status(500).json({ error: 'Server error fetching booking' });
  }
};
