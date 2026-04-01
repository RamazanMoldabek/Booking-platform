// backend/server.js
// Точка входа для бэкенд-сервера.
// Загружает переменные окружения, создает Express-приложение,
// подключает middleware и маршруты, а затем запускает сервер.
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Импорт маршрутов: каждый модуль отвечает за свою часть API.
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Добавляем маршруты для категорий

app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes); // Подключаем маршруты для категорий

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database Config: Using Render DATABASE_URL`);
  console.log('==========================================');
});
