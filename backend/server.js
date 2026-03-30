// backend/server.js
// Точка входа для бэкенд-сервера.
// Загружает переменные окружения, создает Express-приложение,
// подключает middleware и маршруты, а затем запускает сервер.
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Импорт маршрутов: каждый модуль отвечает за свою часть API.
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
