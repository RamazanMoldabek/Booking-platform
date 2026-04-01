// frontend/src/components/Navbar.jsx
// Навигационная панель сайта. Показывает ссылки в зависимости от авторизации пользователя.
// Если пользователь админ, появляется ссылка на админ-панель.
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, InfoIcon, Settings, SunMedium, Moon } from 'lucide-react';
import { useAuth } from '../AuthContext';
import './Navbar.css';
import logo from '../assets/Booking.png';

const Navbar = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Logo" className="logo-icon" />
          <span className="logo-text">BookingPro</span>
        </Link>

        {/* Links Section (Centered) */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home className="nav-icon" size={18} />
            <span>Қызметтер</span>
          </Link>
          {user && (
            <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
              <Calendar className="nav-icon" size={18} />
              <span>Менің брондауларым</span>
            </Link>
          )}
          <Link to="/About us" className={`nav-link ${location.pathname === '/About us' ? 'active' : ''}`}>
            <InfoIcon className="nav-icon" size={18} />
            <span>Біз туралы</span>
          </Link>
          {user && user.is_admin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <Settings className="nav-icon" size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Actions Section (Right) */}
        <div className="navbar-actions">
          <button type="button" className="nav-button theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? '' : ''}</span>
          </button>

          {user ? (
            <button type="button" className="nav-button" onClick={handleLogout}>
              Шығу
            </button>
          ) : (
            <div className="nav-loginBtn">
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                <span>Кіру</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
