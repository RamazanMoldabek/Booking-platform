import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, ArrowRight, Star } from 'lucide-react';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const imageUrl = service.image_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80';
  const rating = service.rating !== undefined ? Number(service.rating).toFixed(1) : null;

  return (
    <div className="card service-card">
      <div className="service-card-image">
        <img src={imageUrl} alt={service.title} />
      </div>
      <div className="service-card-body">
        <div className="service-card-header">
          <div>
            <h3 className="service-title">{service.title}</h3>
            {rating && (
              <div className="service-rating">
                <Star size={14} />
                <span>{rating}</span>
              </div>
            )}
          </div>
          <div className="service-price">
            <DollarSign size={16} />
            <span>{service.price}</span>
          </div>
        </div>
        <p className="service-description">{service.short_description || service.description}</p>
        <div className="service-card-footer">
          <div className="service-duration">
            <Clock size={16} />
            <span>{service.duration || 1} дня/дней</span>
          </div>
          <Link to={`/services/${service.id}`} className="btn btn-book">
            View Details <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
