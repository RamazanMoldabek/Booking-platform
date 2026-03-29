import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, DollarSign, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import './ServiceDetails.css';

const API_URL = 'http://localhost:5000/api';
const placeholderImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
const defaultWebsite = 'https://example.com';

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [serviceId]);

  if (loading) {
    return <div className="loading">Жүктелуде...</div>;
  }

  if (error || !service) {
    return <div className="error-message">{error || 'Service not found.'}</div>;
  }

  const imageUrl = service.image_url || placeholderImage;
  const websiteUrl = service.website || defaultWebsite;
  const title = service.title || service.name;
  const shortDescription = service.short_description || service.description;

  return (
    <div className="service-detail-page">
      <div
        className="service-detail-hero"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="service-detail-hero-overlay">
          <div className="service-detail-badge">Сервис</div>
          <h1>{title}</h1>
          <p>{shortDescription}</p>
        </div>
      </div>

      <div className="service-detail-body">
        <div className="service-detail-info">
          <div className="service-detail-card">
            <div className="service-detail-row">
              <DollarSign size={18} />
              <span>Бағасы: ${service.price}</span>
            </div>
            <div className="service-detail-row">
              <Clock size={18} />
              <span>Ұзақтығы: {service.duration} минут</span>
            </div>
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
            <h3>Негізгі артықшылықтары</h3>
            <ul>
              <li>Тәжірибелі мамандар</li>
              <li>Жылдам брондау</li>
              <li>Қолайлы баға</li>
            </ul>
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
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
