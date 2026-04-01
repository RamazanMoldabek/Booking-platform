// frontend/src/pages/AdminPanel.jsx
// Админ-панель. Позволяет создавать, редактировать и удалять услуги.
// Доступна только пользователю с флагом is_admin.
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_URL from '../apiConfig';
import './AdminPanel.css';

// Base URL for images
const IMAGE_BASE_URL = API_URL.replace('/api', '');

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    price: '',
    duration: '1',
    website: '',
    rating: '',
    address: '',
    advantages: [],
    latitude: '',
    longitude: '',
  });

  // Yandex Maps Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const placemarkInstance = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // States for images
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      setServices(response.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.is_admin) {
      navigate('/');
      return;
    }

    fetchServices();

    fetchServices();

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
      // Basic cleanup
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
        placemarkInstance.current = null;
      }
    };
  }, [user, navigate]);

  // Handle Map Initialization
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstance.current && window.ymaps) {
      window.ymaps.ready(() => {
        // Prevent double initialization if ymaps.ready fires twice or similar
        if (mapInstance.current) return;

        const initialCoords = formData.latitude && formData.longitude 
          ? [Number(formData.latitude), Number(formData.longitude)]
          : [51.1694, 71.4491]; // Astana

        try {
          mapInstance.current = new window.ymaps.Map(mapRef.current, {
            center: initialCoords,
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl', 'searchControl']
          }, {
            // Options to prevent "Suggest is not available" if the user's key doesn't support it
            searchControlNoSuggestPanel: true
          });

          // Click handler to set coordinates AND address (reverse geocoding)
          mapInstance.current.events.add('click', (e) => {
            const coords = e.get('coords');
            updatePlacemark(coords);
            
            // Reverse geocoding to get address from coordinates
            window.ymaps.geocode(coords).then((res) => {
              const firstGeoObject = res.geoObjects.get(0);
              const address = firstGeoObject ? firstGeoObject.getAddressLine() : '';
              
              setFormData(prev => ({
                ...prev,
                address: address, // Automatically fill address
                latitude: coords[0].toFixed(6),
                longitude: coords[1].toFixed(6)
              }));
            });
          });

          // Handle search results to pick coordinates
          const searchControl = mapInstance.current.controls.get('searchControl');
          searchControl.events.add('resultselect', (e) => {
            const index = e.get('index');
            searchControl.getResult(index).then((res) => {
              const coords = res.geometry.getCoordinates();
              const address = res.properties.get('text');
              updatePlacemark(coords);
              setFormData(prev => ({
                ...prev,
                address: address, // Update address from search
                latitude: coords[0].toFixed(6),
                longitude: coords[1].toFixed(6)
              }));
            });
          });

          // If editing and has coords, show placemark
          if (formData.latitude && formData.longitude) {
            updatePlacemark(initialCoords);
          }
          
          console.log('Yandex Map initialized successfully');
        } catch (err) {
          console.error('Error creating map instance:', err);
        }
      });
    }
  }, [isMapLoaded]);

  const updatePlacemark = (coords) => {
    if (!window.ymaps || !mapInstance.current) return;

    if (placemarkInstance.current) {
      placemarkInstance.current.geometry.setCoordinates(coords);
    } else {
      placemarkInstance.current = new window.ymaps.Placemark(coords, {
        balloonContent: 'Выбранное местоположение'
      }, {
        preset: 'islands#dotIcon',
        iconColor: '#ff4d4d'
      });
      mapInstance.current.geoObjects.add(placemarkInstance.current);
    }
  };

  const handleGeocode = () => {
    if (!formData.address || !window.ymaps) return;

    window.ymaps.ready(() => {
      window.ymaps.geocode(formData.address).then((res) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          if (mapInstance.current) {
            mapInstance.current.setCenter(coords, 14);
            updatePlacemark(coords);
          }
          setFormData(prev => ({
            ...prev,
            latitude: coords[0].toFixed(6),
            longitude: coords[1].toFixed(6)
          }));
          setError(''); // Clear error if found
        } else {
          setError('Адрес не найден на карте.');
        }
      }).catch(err => {
        console.error('Geocoding error:', err);
        setError('Ошибка при поиске адреса.');
      });
    });
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validation: max 5 images total (new + existing)
    if (files.length + selectedFiles.length + existingImages.length > 5) {
      setError('Максимум 5 изображений на сервис.');
      return;
    }

    // Filter only jpg/png/webp
    const validFiles = files.filter(file => /\.(jpe?g|png|webp)$/i.test(file.name));
    if (validFiles.length !== files.length) {
      setError('Допускаются только изображения (JPG, PNG, WEBP).');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdvantageChange = (index, value) => {
    const newAdvantages = [...formData.advantages];
    newAdvantages[index] = value;
    setFormData({ ...formData, advantages: newAdvantages });
  };

  const addAdvantage = () => {
    setFormData({ ...formData, advantages: [...formData.advantages, ''] });
  };

  const removeAdvantage = (index) => {
    const newAdvantages = formData.advantages.filter((_, i) => i !== index);
    setFormData({ ...formData, advantages: newAdvantages });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('short_description', formData.short_description);
      data.append('price', formData.price);
      data.append('duration', formData.duration);
      data.append('website', formData.website);
      data.append('rating', formData.rating || '4.5');
      data.append('address', formData.address);
      data.append('advantages', JSON.stringify(formData.advantages));
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);

      // Append new files
      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      // Append remaining existing images (for update)
      if (editMode) {
        data.append('existing_images', JSON.stringify(existingImages));
      }

      const response = editMode
        ? await axios.put(`${API_URL}/admin/services/${editingServiceId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await axios.post(`${API_URL}/admin/services`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

      if (editMode) {
        setServices((prev) => prev.map((item) => (item.id === response.data.id ? response.data : item)));
        setSuccessMessage('Услуга успешно обновлена.');
      } else {
        setServices((prev) => [...prev, response.data]);
        setSuccessMessage('Услуга успешно добавлена.');
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сохранении услуги.');
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditingServiceId(null);
    setFormData({
      title: '',
      description: '',
      short_description: '',
      price: '',
      duration: '1',
      website: '',
      rating: '',
      address: '',
      advantages: [],
      latitude: '',
      longitude: '',
    });
    
    if (placemarkInstance.current && mapInstance.current) {
      mapInstance.current.geoObjects.remove(placemarkInstance.current);
      placemarkInstance.current = null;
    }
    
    if (mapInstance.current) {
      mapInstance.current.setCenter([51.1694, 71.4491], 12);
    }

    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages([]);
    setError('');
    setSuccessMessage('');
  };

  const handleEdit = (service) => {
    setEditMode(true);
    setEditingServiceId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      short_description: service.short_description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '1',
      website: service.website || '',
      rating: service.rating?.toString() || '',
      address: service.address || '',
      advantages: Array.isArray(service.advantages) ? service.advantages : (typeof service.advantages === 'string' ? JSON.parse(service.advantages || '[]') : []),
      latitude: service.latitude?.toString() || '',
      longitude: service.longitude?.toString() || '',
    });

    if (service.latitude && service.longitude) {
      const coords = [Number(service.latitude), Number(service.longitude)];
      setTimeout(() => {
        updatePlacemark(coords);
        if (mapInstance.current) {
          mapInstance.current.setCenter(coords, 14);
        }
      }, 100);
    } else if (placemarkInstance.current && mapInstance.current) {
      mapInstance.current.geoObjects.remove(placemarkInstance.current);
      placemarkInstance.current = null;
    }

    setExistingImages(service.images || []);
    setSelectedFiles([]);
    setPreviews([]);
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Удалить этот сервис?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/services/${serviceId}`);
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      setSuccessMessage('Service deleted successfully.');
      if (editMode && editingServiceId === serviceId) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete service.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-panel-card">
        <h1>Admin Panel</h1>
        <p>Добавьте новый сервис и просмотрите существующие.</p>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-row">
            <label>Название</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="admin-row">
            <label>Краткое описание</label>
            <input name="short_description" value={formData.short_description} onChange={handleChange} />
          </div>

          <div className="admin-row">
            <label>Полное описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-row admin-row-grid">
            <div>
              <label>Цена</label>
              <input name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
              <label>Длительность (дни)</label>
              <input name="duration" type="number" value={formData.duration} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-row admin-row-grid">
            <div>
              <label>Рейтинг (0–5)</label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                placeholder="4.5"
              />
            </div>
            <div>
              <label>Адрес (для отображения)</label>
              <div className="address-search-group">
                <input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="г. Алматы, ул. Абая, 1"
                />
                <button type="button" className="btn-search-map" onClick={handleGeocode}>
                  🔍 Найти
                </button>
              </div>
            </div>
          </div>

          <div className="admin-row">
            <label>Местоположение на карте (кликните, чтобы выбрать)</label>
            <div ref={mapRef} className="map-container">
              {!isMapLoaded && <div className="map-loading">Загрузка карты...</div>}
            </div>
            {(formData.latitude || formData.longitude) && (
              <div className="coords-display">
                <span>Широта: <strong>{formData.latitude}</strong></span>
                <span>Долгота: <strong>{formData.longitude}</strong></span>
              </div>
            )}
          </div>

          <div className="admin-row">
            <label>Сайт услуги</label>
            <input name="website" value={formData.website} onChange={handleChange} />
          </div>

          {/* ADVANTAGES SECTION */}
          <div className="admin-row advantages-section">
            <label>Преимущества</label>
            {formData.advantages.map((adv, index) => (
              <div key={index} className="advantage-input-group">
                <input 
                  value={adv} 
                  onChange={(e) => handleAdvantageChange(index, e.target.value)} 
                  placeholder="Например: Завтрак включен"
                />
                <button type="button" className="btn-remove-adv" onClick={() => removeAdvantage(index)}>×</button>
              </div>
            ))}
            <button type="button" className="btn-add-adv" onClick={addAdvantage}>+ Добавить преимущество</button>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div className="admin-row image-upload-section">
            <label>Изображения (макс. 5)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              id="file-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn btn-secondary upload-btn">
              📁 Выбрать файлы
            </label>

            <div className="image-previews-grid">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="preview-item">
                  <img src={`${IMAGE_BASE_URL}${img}`} alt="existing" />
                  <button type="button" className="remove-preview" onClick={() => removeExistingImage(index)}>×</button>
                </div>
              ))}
              
              {/* New Previews */}
              {previews.map((url, index) => (
                <div key={`new-${index}`} className="preview-item">
                  <img src={url} alt="preview" />
                  <button type="button" className="remove-preview" onClick={() => removeNewImage(index)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-book">
              {editMode ? 'Сохранить изменения' : 'Добавить сервис'}
            </button>
            {editMode && (
              <button type="button" className="btn btn-cancel" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-services-list">
        <h2>Существующие услуги</h2>
        <div className="admin-services-grid">
          {services.map((service) => (
            <div key={service.id} className="admin-service-card">
              <div className="admin-service-images">
                {service.images && service.images.length > 0 ? (
                  <img src={`${IMAGE_BASE_URL}${service.images[0]}`} alt={service.title} className="admin-service-thumb" />
                ) : (
                  <div className="no-image-placeholder">Нет фото</div>
                )}
                {service.images && service.images.length > 1 && (
                  <span className="image-count">+{service.images.length - 1}</span>
                )}
              </div>
              <div className="admin-service-content">
                <div className="admin-service-top">
                  <h3>{service.title}</h3>
                  <span className="price-tag">${service.price}</span>
                </div>
                <p className="short-desc">{service.short_description || service.description.substring(0, 60) + '...'}</p>
                <div className="admin-service-meta">
                  <span>⏱ {service.duration || 1} дн</span>
                  {service.address && <span title={service.address}>📍 {service.address.substring(0, 20)}...</span>}
                  {service.latitude && service.longitude && (
                    <button 
                      type="button" 
                      className="btn-open-map"
                      onClick={() => window.open(`https://yandex.ru/maps/?pt=${service.longitude},${service.latitude}&z=16&l=map`, '_blank')}
                    >
                      🗺 Мап
                    </button>
                  )}
                </div>
                <div className="admin-service-actions">
                  <button type="button" className="btn btn-edit" onClick={() => handleEdit(service)}>
                    Редактировать
                  </button>
                  <button type="button" className="btn btn-delete" onClick={() => handleDelete(service.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
