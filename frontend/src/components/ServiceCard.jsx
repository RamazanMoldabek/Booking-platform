import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, ArrowRight, Star } from 'lucide-react';
import API_URL from '../apiConfig';
import './ServiceCard.css';

const IMAGE_BASE_URL = API_URL.replace('/api', '');

const ServiceCard = ({ service }) => {
  // Use the first image from the uploaded images array if it exists, otherwise fallback to placeholder
  let imageUrl = 'https://tse4.mm.bing.net/th/id/OIP.RFDXdjS5yiwV0P2sposv-QHaEo?w=1600&h=1000&rs=1&pid=ImgDetMain&o=7&rm=3';

  if (service.images && service.images.length > 0) {
    const firstImg = service.images[0];
    imageUrl = firstImg.startsWith('http') ? firstImg : IMAGE_BASE_URL + firstImg;
  } else if (service.image_url) {
    imageUrl = service.image_url;
  }

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
