// frontend/src/pages/ServiceDetails.jsx
// Страница детали услуги. Показывает подробную информацию, фото и кнопку бронирования.
// Если пользователь не в системе, предлагает перейти на страницу логина.
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Clock, Globe, ExternalLink, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './ServiceDetails.css';

const placeholderImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
const defaultWebsite = 'https://example.com';
const IMAGE_BASE_URL = API_URL.replace('/api', '');

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${serviceId}`);
        setService(response.data);
      } catch (err) {
        setError('Бұл қызмет табылған жоқ немесе сервер жауабы жоқ.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();

    // Singleton-like Yandex Maps loader
    const scriptId = 'yandex-maps-api-script';
    const apiKey = 'ff8fb748-4eb6-45be-9b9c-f4c788a60db2';
    const expectedSrc = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${apiKey}`;
    
    const onScriptLoad = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => setIsMapLoaded(true));
      }
    };

    if (!window.ymaps) {
      let script = document.getElementById(scriptId);
      if (!script) {
        // Double check for any other yandex scripts that might have been added without our ID
        const otherScripts = document.querySelectorAll('script[src*="api-maps.yandex.ru"]');
        otherScripts.forEach(s => s.remove());

        script = document.createElement('script');
        script.id = scriptId;
        script.src = expectedSrc;
        script.type = 'text/javascript';
        script.async = true;
        script.addEventListener('load', onScriptLoad);
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', onScriptLoad);
      }
    } else {
      window.ymaps.ready(() => setIsMapLoaded(true));
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [serviceId]);

  // Initialize Map
  useEffect(() => {
    if (isMapLoaded && mapRef.current && service && service.latitude && service.longitude && !mapInstance.current && window.ymaps) {
      window.ymaps.ready(() => {
        if (mapInstance.current) return;

        const coords = [Number(service.latitude), Number(service.longitude)];
        try {
          mapInstance.current = new window.ymaps.Map(mapRef.current, {
            center: coords,
            zoom: 14,
            controls: ['zoomControl', 'fullscreenControl']
          });

          const placemark = new window.ymaps.Placemark(coords, {
            balloonContent: service.title || service.name,
            hintContent: service.address
          }, {
            preset: 'islands#dotIcon',
            iconColor: '#ff4d4d'
          });

          mapInstance.current.geoObjects.add(placemark);
        } catch (err) {
          console.error('Error creating map instance on details page:', err);
        }
      });
    }
  }, [isMapLoaded, service]);

  if (loading) {
    return <div className="loading">Жүктелуде...</div>;
  }

  if (error || !service) {
    return <div className="error-message">{error || 'Service not found.'}</div>;
  }

  const images = (service.images && service.images.length > 0) ? service.images : [placeholderImage];
  const websiteUrl = service.website || defaultWebsite;
  const title = service.title || service.name;
  const shortDescription = service.short_description || service.description;
  
  // Parse advantages
  const advantages = Array.isArray(service.advantages) 
    ? service.advantages 
    : (typeof service.advantages === 'string' ? JSON.parse(service.advantages || '[]') : []);

  return (
    <div className="service-detail-page">
      {/* Hero Section with Active Image */}
      <div
        className="service-detail-hero"
        style={{ backgroundImage: `url(${images[activeImage].startsWith('http') ? images[activeImage] : IMAGE_BASE_URL + images[activeImage]})` }}
      >
        <div className="service-detail-hero-overlay">
          <div className="service-detail-badge">Сервис</div>
          <h1>{title}</h1>
          <p>{shortDescription}</p>
        </div>
      </div>

      <div className="service-detail-body">
        <div className="service-detail-info">
          {/* Gallery Section */}
          {images.length > 1 && (
            <div className="service-gallery">
              <h3>Галерея</h3>
              <div className="gallery-grid">
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`gallery-item ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img.startsWith('http') ? img : IMAGE_BASE_URL + img} alt={`View ${index}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="service-detail-card">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <span className="tenge-icon">₸</span>
                </div>
                <div className="info-text">
                  <label>{t('price')}</label>
                  <span>{service.price}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <Clock size={20} />
                </div>
                <div className="info-text">
                  <label>{t('duration')}</label>
                  <span>{service.duration || 1} {t('days')}</span>
                </div>
              </div>
            </div>
            {service.address && (
              <div className="service-detail-row">
                <MapPin size={18} />
                <span>Мекен-жайы: {service.address}</span>
              </div>
            )}
            <div className="service-detail-row service-detail-link">
              <Globe size={18} />
              <a href={websiteUrl} target="_blank" rel="noreferrer">
                Нақты сайтқа өту <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="service-detail-copy">
            <h2>Қызмет туралы</h2>
            <p>{service.description}</p>
            
            {advantages.length > 0 && (
              <>
                <h3>Негізгі артықшылықтары</h3>
                <ul className="advantages-list">
                  {advantages.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="service-detail-actions">
            {user ? (
              <Link to={`/book/${service.id}`} className="btn btn-book">
                Бронировать сейчас <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-book">
                Кіру арқылы брондау <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {service.latitude && service.longitude && (
            <div className="service-map-section">
              <h3>Бұл қай жерде орналасқан? 🗺</h3>
              <div ref={mapRef} className="service-map-container">
                {!isMapLoaded && <div className="map-loading">Карта жүктелуде...</div>}
              </div>
              <button 
                type="button" 
                className="btn-external-map"
                onClick={() => window.open(`https://yandex.ru/maps/?pt=${service.longitude},${service.latitude}&z=16&l=map`, '_blank')}
              >
                Яндекс Картадан ашу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
