// frontend/src/pages/Home.jsx
// Главная страница. Загружает список доступных услуг с бэкенда и отображает их.
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './Home.css';

const Home = () => {
  const [services, setServices] = useState([]);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const [categories, setCategories] = useState([]); // New state for categories
  const [selectedCategory, setSelectedCategory] = useState(''); // New state for selected category

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        setError(t('errorLoadingService'));
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchServices();
    fetchCategories();
  }, [t]);

  const filteredServices = useMemo(() => {
    let filtered = services
      .filter((service) => {
        if (minPrice !== '' && Number(service.price) < Number(minPrice)) return false;
        if (maxPrice !== '' && Number(service.price) > Number(maxPrice)) return false;
        const ratingValue = service.rating !== undefined ? Number(service.rating) : 0;
        if (minRating !== '' && ratingValue < Number(minRating)) return false;
        return true;
      })

    if (selectedCategory) {
      filtered = filtered.filter(service => service.category_id === Number(selectedCategory));
    }

    return filtered
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        const aRating = a.rating !== undefined ? Number(a.rating) : 0;
        const bRating = b.rating !== undefined ? Number(b.rating) : 0;
        if (sortBy === 'rating-desc') return bRating - aRating;
        if (sortBy === 'rating-asc') return aRating - bRating;
        return 0;
      });
  }, [services, minPrice, maxPrice, minRating, sortBy, selectedCategory]);

  if (loading) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="animate-fade-in">{t('heroTitle')}</h1>
        <p className="hero-subtitle animate-slide-up">
          {t('heroSubtitle')}
        </p>
      </div>

      <div className="home-controls">
        <div className="filter-group">
          <label>{t('sortBy')}</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">{t('sortBy')}</option>
            <option value="price-asc">↑ {t('price')}</option>
            <option value="price-desc">↓ {t('price')}</option>
            <option value="rating-desc">★ {t('rating')}</option>
          </select>
        </div>
        <div className="filter-group">
          <label>{t('category')}</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{t(cat.key)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{t('minPrice')}</label>
          <input
            type="number"
            min="0"
            value={minPrice}
            placeholder="0"
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>{t('maxPrice')}</label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            placeholder="1000"
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>{t('minRating')}</label>
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
              <p>{t('noServicesFound') || 'No services found.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
