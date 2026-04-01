import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './ServiceCard.css';

const IMAGE_BASE_URL = API_URL.replace('/api', '');

const ServiceCard = ({ service }) => {
  const { t } = useLanguage();
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);

  // Map initialization
  React.useEffect(() => {
    if (service.latitude && service.longitude && mapRef.current && window.ymaps && !mapInstance.current) {
      window.ymaps.ready(() => {
        if (mapInstance.current) return;
        try {
          const coords = [Number(service.latitude), Number(service.longitude)];
          mapInstance.current = new window.ymaps.Map(mapRef.current, {
            center: coords,
            zoom: 14,
            controls: [] // Minimalist map
          });
          
          const placemark = new window.ymaps.Placemark(coords, {}, {
            preset: 'islands#dotIcon',
            iconColor: '#ff4d4d'
          });
          mapInstance.current.geoObjects.add(placemark);
        } catch (err) {
          console.error("Card map error:", err);
        }
      });
    }
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [service]);

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
            <span className="tenge-icon">₸</span>
            <span>{service.price}</span>
          </div>
        </div>
        
        <p className="service-description">{service.short_description || service.description}</p>
        
        {/* SMALL MAP PREVIEW */}
        {service.latitude && service.longitude && (
          <div className="service-card-map-wrapper">
             <div ref={mapRef} className="service-card-mini-map"></div>
             <div className="map-address-overlay">
                <MapPin size={12} />
                <span>{service.address}</span>
             </div>
          </div>
        )}

        <div className="service-card-footer">
          <div className="service-duration">
            <Clock size={16} />
            <span>{service.duration || 1} {t('days')}</span>
          </div>
          <Link to={`/services/${service.id}`} className="btn btn-book">
            {t('viewDetails')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
