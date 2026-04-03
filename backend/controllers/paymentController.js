const db = require('../db');

exports.processPayment = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'booking_id and amount are required' });
    }

    const checkQuery = `
      SELECT b.*, s.price as service_price
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.id = $1
    `;
    const { rows } = await db.query(checkQuery, [booking_id]);
    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user_id !== user.id) {
      return res.status(403).json({ error: 'You are not authorized to pay for this booking.' });
    }

    if (booking.status === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    const expectedAmount = Number(booking.service_price);
    const paymentAmount = Number(amount);
    if (Number.isNaN(paymentAmount) || paymentAmount !== expectedAmount) {
      return res.status(400).json({ error: 'Payment amount must equal the booking price.' });
    }

    const paymentStatus = 'completed'; 

    
    const insertPaymentQuery = `
      INSERT INTO payments (booking_id, amount, status) 
      VALUES ($1, $2, $3) RETURNING *
    `;
    const paymentValues = [booking_id, amount, paymentStatus];
    const newPayment = await db.query(insertPaymentQuery, paymentValues);

    
    const updateBookingQuery = `
      UPDATE bookings SET status = 'paid' WHERE id = $1 RETURNING *
    `;
    const updatedBooking = await db.query(updateBookingQuery, [booking_id]);

    res.status(200).json({ payment: newPayment.rows[0], booking: updatedBooking.rows[0] });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Server error processing payment' });
  }
};
