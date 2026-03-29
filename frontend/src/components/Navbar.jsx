import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Home, InfoIcon, Settings } from 'lucide-react';
import { useAuth } from '../AuthContext';
import './Navbar.css';

const Navbar = () => {
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
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">BookingPro</span>
        </Link>
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

          {user ? (
            <>
              {user.is_admin && (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <Settings className="nav-icon" size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <button type="button" className="nav-button" onClick={handleLogout}>
                Шығу
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                <span>Кіру</span>
              </Link>
              <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
                <span>Тіркелу</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
