// frontend/src/pages/Home.jsx
// Главная страница. Загружает список доступных услуг с бэкенда и отображает их.
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import API_URL from '../apiConfig';
import './Home.css';

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

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

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        if (minPrice !== '' && Number(service.price) < Number(minPrice)) return false;
        if (maxPrice !== '' && Number(service.price) > Number(maxPrice)) return false;
        const ratingValue = service.rating !== undefined ? Number(service.rating) : 0;
        if (minRating !== '' && ratingValue < Number(minRating)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        const aRating = a.rating !== undefined ? Number(a.rating) : 0;
        const bRating = b.rating !== undefined ? Number(b.rating) : 0;
        if (sortBy === 'rating-desc') return bRating - aRating;
        if (sortBy === 'rating-asc') return aRating - bRating;
        return 0;
      });
  }, [services, minPrice, maxPrice, minRating, sortBy]);

  if (loading) return <div className="loading">Жүктелуде...</div>;

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="animate-fade-in">Бізбен бірге тиімді, әрі тез саяхаттаңыз!</h1>
        <p className="hero-subtitle animate-slide-up">
          Келесі кездесуді оңай брондаңыз. Бастау үшін төмендегі қызметтің бірін таңдаңыз.
        </p>
      </div>

      <div className="home-controls">
        <div className="filter-group">
          <label>Сортировка</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="rating-desc">Рейтинг: высокий</option>
            <option value="rating-asc">Рейтинг: низкий</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Мин. цена</label>
          <input
            type="number"
            min="0"
            value={minPrice}
            placeholder="0"
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Макс. цена</label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            placeholder="1000"
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Мин. рейтинг</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            placeholder="4.0"
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
          {filteredServices.length === 0 && !error && (
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
