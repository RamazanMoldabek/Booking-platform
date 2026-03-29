import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import './Home.css';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Қызметтерді жүктеу сәтсіз аяқталды:', err);
        setError('Қызметтерді жүктеу сәтсіз аяқталды. Техникалық ақау!');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="loading">Жүктелуде...</div>;

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="animate-fade-in">Бізбен бірге тиімді, әрі тез саяхаттаңыз!</h1>
        <p className="hero-subtitle animate-slide-up">
          Келесі кездесуді оңай брондаңыз. Бастау үшін төмендегі қызметтің бірін таңдаңыз.
        </p>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
          {services.length === 0 && !error && (
            <div className="empty-state">
              <p>No services available right now. Check back later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
