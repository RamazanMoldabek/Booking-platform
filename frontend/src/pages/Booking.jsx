// frontend/src/pages/Booking.jsx
// Страница обработки бронирования выбранной услуги.
// Пользователь должен быть авторизован, чтобы создать бронь.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, ArrowRight, UserPen } from 'lucide-react';
import { useAuth } from '../AuthContext';
import API_URL from '../apiConfig';
import './Booking.css';

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${serviceId}`);
        setService(response.data);
      } catch (err) {
        setError('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Сіз жүйеге кірмегенсіз.');
      return;
    }

    try {
      const bookingDate = formData.date; // дата в формате YYYY-MM-DD
      const payload = {
        service_id: Number(serviceId),
        booking_date: bookingDate
      };

      const response = await axios.post(`${API_URL}/bookings`, payload);
      navigate(`/payment/${response.data.id}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create booking.');
      }
    }
  };

  if (loading) return <div className="loading">Loading service details...</div>;
  if (!service) return <div className="error-message">Service not found.</div>;

  return (
    <div className="booking-container animate-fade-in">
      <div className="card booking-card">
        <h2>{service.title} броньдау</h2>
        <p className="service-desc">{service.description}</p>
        
        <div className="service-meta">
          <div className="meta-item"><Clock size={18}/> {service.duration} дня/дней</div>
          <div className="meta-item price">${service.price}</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label><UserPen size={16}/> Аты-жөніңіз</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              placeholder="Жүйеге кіріңіз"
            />
          </div>

          <div className="form-group">
            <label><Calendar size={16}/> Уақыт</label>
            <input 
              type="date" 
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label><Clock size={16}/> Select Time</label>
            <input 
              type="time" 
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-submit">
            Proceed to Payment <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
