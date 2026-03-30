// frontend/src/pages/MyBookings.jsx
// Страница пользователя. Показывает его личные брони и статус оплаты.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, Clock3 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import API_URL from '../apiConfig';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_URL}/bookings/me`);
        setBookings(response.data);
      } catch (err) {
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  if (loading) return <div className="loading">Loading your bookings...</div>;

  return (
    <div className="my-bookings-container">
      <h1 className="animate-fade-in">My Bookings</h1>
      
      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 && !error ? (
        <div className="empty-state animate-slide-up">
          <p>You have no bookings yet. Go to the home page to book a service!</p>
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
                    {booking.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="booking-info-secondary">
                  <div className="info-group">
                    <Calendar size={16} /> <span>{dateStr}</span>
                  </div>
                  <div className="info-group">
                    <Clock size={16} /> <span>{timeStr}</span>
                  </div>
                  <div className="booking-price">${booking.service_price}</div>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-actions">
                    <a href={`/payment/${booking.id}`} className="btn btn-payment-small">Complete Payment</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
