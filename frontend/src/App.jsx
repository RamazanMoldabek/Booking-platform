// frontend/src/App.jsx
// Главный компонент приложения. Настраивает роутинг для всех страниц frontend.
// Здесь подключается Navbar и определяются основные URL-адреса.
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import ServiceDetails from './pages/ServiceDetails';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services/:serviceId" element={<ServiceDetails />} />
            <Route path="/book/:serviceId" element={<Booking />} />
            <Route path="/payment/:bookingId" element={<Payment />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

