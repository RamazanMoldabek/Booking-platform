import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, Clock3 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './MyBookings.css';

const MyBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/me`);
      setBookings(response.data);
    } catch (err) {
      setError(t('errorLoadingBookings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const handleDelete = async (bookingId) => {
    if (!window.confirm(t('confirmCancel'))) return;

    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`);
      // Refresh the list after deletion
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error ? t(err.response.data.error) : t('cancelBooking') + ' failed.');
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="my-bookings-container">
      <h1 className="animate-fade-in">{t('myBookings')}</h1>
      
      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 && !error ? (
        <div className="empty-state animate-slide-up">
          <p>{t('noBookingsYet')}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => {
            const dateObj = new Date(booking.booking_date);
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={booking.id} 
                className="card booking-list-item animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="booking-info-primary">
                  <h3>{booking.service_title}</h3>
                  <div className="booking-status-badge" data-status={booking.status}>
                    {booking.status === 'paid' ? <CheckCircle size={14}/> : <Clock3 size={14}/>}
                    {t('status' + booking.status.charAt(0).toUpperCase() + booking.status.slice(1))}
                  </div>
                </div>
                
                <div className="booking-info-secondary">
                  <div className="info-group">
                    <Calendar size={16} /> <span>{dateStr}</span>
                  </div>
                  <div className="info-group">
                    <Clock size={16} /> <span>{timeStr}</span>
                  </div>
                  <div className="booking-price">₸{booking.service_price}</div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <a href={`/payment/${booking.id}`} className="btn btn-payment-small">{t('completePayment')}</a>
                  )}
                  <button 
                    onClick={() => handleDelete(booking.id)} 
                    className="btn btn-secondary btn-payment-small"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    {t('cancelBooking')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
