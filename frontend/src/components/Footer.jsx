import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>{t('appName')}</h3>
          <p>{t('footerDescription')}</p>
        </div>
        <div className="footer-section links">
          <h3>{t('quickLinks')}</h3>
          <ul>
            <li><Link to="/">{t('services')}</Link></li>
            <li><Link to="/my-bookings">{t('myBookings')}</Link></li>
          </ul>
        </div>
        <div className="footer-section contact">
          <h3>{t('contactUs')}</h3>
          <p>Email: ramazanmoldabek06@gmail.com</p>
          <p>Phone: +7 (777) 562-21-08</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
      </div>
    </footer>
  );
};

export default Footer;