const db = require('../db');

exports.createBooking = async (req, res) => {
  const { service_id, booking_date } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Auth required.' });
  }

  if (!service_id || !booking_date) {
    return res.status(400).json({ error: 'service_id and booking_date are required.' });
  }

  try {
    
    const checkQuery = `
      SELECT id FROM bookings 
      WHERE service_id = $1 
        AND booking_date = $2 
        AND status != 'cancelled'
    `;
    const { rows: existing } = await db.query(checkQuery, [service_id, booking_date]);

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Бұл уақытты басқа біреу алған. Басқа уақытты немесе басқа қызметті таңдаңыз.'
      });
    }

    
    const insertQuery = `
      INSERT INTO bookings (user_id, user_name, service_id, booking_date, status) 
      VALUES ($1, $2, $3, $4, 'pending') 
      RETURNING *
    `;
    const { rows: newBooking } = await db.query(insertQuery, [user.id, user.name, service_id, booking_date]);

    res.status(201).json(newBooking[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
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

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'User must be logged in to cancel a booking.' });
  }

  try {
    
    const findQuery = 'SELECT * FROM bookings WHERE id = $1 AND user_id = $2';
    const { rows: findRows } = await db.query(findQuery, [id, user.id]);

    if (findRows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized.' });
    }

    const booking = findRows[0];

    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled.' });
    }

    
    
    
    const updateQuery = `
      UPDATE bookings 
      SET status = 'cancelled', 
          cancelled_at = NOW() 
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `;
    const { rows: updateRows } = await db.query(updateQuery, [id, user.id]);

    console.log(`Booking ID ${id} cancelled by user ${user.id} at ${new Date().toISOString()}.`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updateRows[0]
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);

    
    if (err.code === '42703') { 
      try {
        const fallbackQuery = `
          UPDATE bookings 
          SET status = 'cancelled' 
          WHERE id = $1 AND user_id = $2 
          RETURNING *
        `;
        const { rows: fallbackRows } = await db.query(fallbackQuery, [id, user.id]);
        return res.json({
          success: true,
          message: 'Booking cancelled successfully (without timestamp)',
          booking: fallbackRows[0]
        });
      } catch (fallbackErr) {
        console.error('Fallback cancellation failed:', fallbackErr);
      }
    }

    res.status(500).json({ error: 'Internal server error while cancelling booking.' });
  }
};
