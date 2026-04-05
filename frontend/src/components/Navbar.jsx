


import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, InfoIcon, Settings, SunMedium, Moon, Menu, X, ShieldUser } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  React.useEffect(() => {
    setIsMenuOpen(false); 
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo">
          <span className="logo-text">BookingPro</span>
        </Link>

        
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home className="nav-icon" size={18} />
            <span>{t('services')}</span>
          </Link>
          {user && (
            <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
              <Calendar className="nav-icon" size={18} />
              <span>{t('myBookings')}</span>
            </Link>
          )}
          {user && user.is_admin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <ShieldUser className="nav-icon" size={18} />
              <span>{t('admin')}</span>
            </Link>
          )}

          {/* В мобильном меню кнопки входа/выхода внизу списка ссылок */}
          <div className="mobile-only-actions">
            <div className="nav-login-wrapper">
                {user ? (
                <button type="button" className="nav-button logout-btn mobile-logout" onClick={handleLogout}>
                    {t('logout')}
                </button>
                ) : (
                <Link to="/login" className="nav-link login-link mobile-login">
                    <span>{t('login')}</span>
                </Link>
                )}
            </div>
          </div>
        </div>

        
        <div className="navbar-actions">
          <div className="desktop-only-auth">
            {user ? (
              <button type="button" className="nav-button logout-btn" onClick={handleLogout}>
                {t('logout')}
              </button>
            ) : (
              <Link to="/login" className="nav-link login-link">
                <span>{t('login')}</span>
              </Link>
            )}
          </div>

          <select
            className="lang-selector"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="kk">ҚАЗ</option>
            <option value="ru">РУС</option>
            <option value="en">ENG</option>
          </select>

          <button type="button" className="nav-button theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
