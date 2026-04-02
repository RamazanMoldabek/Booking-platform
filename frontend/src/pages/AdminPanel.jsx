// frontend/src/pages/AdminPanel.jsx
// Админ-панель. Позволяет создавать, редактировать и удалять услуги.
// Доступна только пользователю с флагом is_admin.
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Upload, MapPin, Search, Save, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './AdminPanel.css';

// Base URL for images
const IMAGE_BASE_URL = API_URL.replace('/api', '');

const AdminPanel = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
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
    category_id: '',
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
  const [categories, setCategories] = useState([]);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) { console.error('Failed to load categories:', err); }
  };

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

    fetchCategories();
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
    let isMounted = true;

    if (isMapLoaded && mapRef.current && !mapInstance.current && window.ymaps) {
      window.ymaps.ready(() => {
        if (!isMounted || mapInstance.current || !mapRef.current) return;

        const initialCoords = formData.latitude && formData.longitude 
          ? [Number(formData.latitude), Number(formData.longitude)]
          : [51.1694, 71.4491]; // Default to Astana

        try {
          mapRef.current.innerHTML = '';
          
          mapInstance.current = new window.ymaps.Map(mapRef.current, {
            center: initialCoords,
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl', 'searchControl']
          }, {
            searchControlNoSuggestPanel: true
          });

          mapInstance.current.events.add('click', (e) => {
            const coords = e.get('coords');
            updatePlacemark(coords);
            
            window.ymaps.geocode(coords).then((res) => {
              const firstGeoObject = res.geoObjects.get(0);
              const address = firstGeoObject ? firstGeoObject.getAddressLine() : '';
              
              setFormData(prev => ({
                ...prev,
                address: address,
                latitude: coords[0].toFixed(6),
                longitude: coords[1].toFixed(6)
              }));
            });
          });

          const searchControl = mapInstance.current.controls.get('searchControl');
          searchControl.events.add('resultselect', (e) => {
            const index = e.get('index');
            searchControl.getResult(index).then((res) => {
              const coords = res.geometry.getCoordinates();
              const address = res.properties.get('text');
              updatePlacemark(coords);
              setFormData(prev => ({
                ...prev,
                address: address,
                latitude: coords[0].toFixed(6),
                longitude: coords[1].toFixed(6)
              }));
            });
          });

          if (formData.latitude && formData.longitude) {
            updatePlacemark(initialCoords);
          }
        } catch (err) {
          console.error('Error creating map instance:', err);
        }
      });
    }

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
        placemarkInstance.current = null;
      }
    };
  }, [isMapLoaded, formData.latitude, formData.longitude]);

  const updatePlacemark = (coords) => {
    if (!window.ymaps || !mapInstance.current) return;

    if (placemarkInstance.current) {
      placemarkInstance.current.geometry.setCoordinates(coords);
    } else {
      placemarkInstance.current = new window.ymaps.Placemark(coords, {
        balloonContent: t('selectedLocation')
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
          setError('');
        } else {
          setError(t('addressNotFound'));
        }
      }).catch(err => {
        console.error('Geocoding error:', err);
        setError(t('errorFindingAddress'));
      });
    });
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length + existingImages.length > 5) {
      setError(t('maxImagesError'));
      return;
    }

    const validFiles = files.filter(file => /\.(jpe?g|png|webp)$/i.test(file.name));
    if (validFiles.length !== files.length) {
      setError(t('invalidFileTypeError'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

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
      data.append('category_id', formData.category_id);
      data.append('longitude', formData.longitude);

      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      if (editMode) {
        data.append('existing_images', JSON.stringify(existingImages));
      }

      const serviceId = formData.id || (editMode ? editingServiceId : null);
      
      const response = serviceId
        ? await axios.put(`${API_URL}/admin/services/${serviceId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await axios.post(`${API_URL}/admin/services`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

      if (serviceId) {
        setServices((prev) => prev.map((item) => (item.id === response.data.id ? response.data : item)));
        setSuccessMessage(t('serviceUpdated'));
      } else {
        setServices((prev) => [...prev, response.data]);
        setSuccessMessage(t('serviceAdded'));
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || t('errorSavingService'));
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditingServiceId(null);
    setFormData({
      id: null,
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
      category_id: '',
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
      id: service.id,
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
      category_id: service.category_id?.toString() || '',
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
    if (!window.confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/services/${serviceId}`);
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      setSuccessMessage(t('delete') + ' success.');
      if (editMode && editingServiceId === serviceId) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || t('delete') + ' failed.');
    }
  };

  return (
    <div className="admin-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="admin-header">
        <h1>{t('admin')}</h1>
        <button className="btn-add" onClick={() => setEditMode(true)}>
          <Plus size={24} />
          {t('addService')}
        </button>
      </div>

      {editMode && (
        <div className="edit-form-card">
          <h2>{editingServiceId ? t('edit') : t('addService')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('title')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('price')}</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('category')}</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{t(cat.key)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('rating')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>{t('shortDescription')}</label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  rows="2"
                />
              </div>

              <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>{t('description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>{t('advantages')}</label>
                <div className="advantages-manager">
                  {formData.advantages.map((adv, index) => (
                    <div key={index} className="advantage-input-group">
                      <input 
                        value={adv} 
                        onChange={(e) => handleAdvantageChange(index, e.target.value)} 
                        placeholder={t('advantagePlaceholder')}
                      />
                      <button type="button" onClick={() => removeAdvantage(index)} className="btn-remove-adv">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-adv" onClick={addAdvantage}>
                    <Plus size={14} /> {t('addAdvantage')}
                  </button>
                </div>
              </div>

              <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>{t('location')}</label>
                <div className="address-search-group">
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="Almaty, Abay Ave, 1"
                  />
                  <button type="button" className="btn-find" onClick={handleGeocode}>
                    <Search size={18} /> {t('findOnMap')}
                  </button>
                </div>
                <div ref={mapRef} className="admin-map-container">
                  {!isMapLoaded && <div className="loading">{t('loading')}</div>}
                </div>
              </div>

              <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>{t('images')}</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="file-upload"
                    className="file-input-hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <Upload size={20} />
                    <span>{selectedFiles.length > 0 ? `${t('selected')}: ${selectedFiles.length}` : t('chooseFiles')}</span>
                  </label>
                </div>

                <div className="image-previews-grid">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="preview-item">
                      <img src={`${IMAGE_BASE_URL}${img}`} alt="existing" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {previews.map((url, index) => (
                    <div key={`new-${index}`} className="preview-item">
                      <img src={url} alt="preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => removeNewImage(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={resetForm}
              >
                <X size={18} />
                {t('cancel')}
              </button>
              <button type="submit" className="btn-save">
                <Save size={18} />
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="services-table-container">
        <table className="services-table">
          <thead>
            <tr>
              <th>{t('title')}</th>
              <th>{t('category')}</th>
              <th>{t('price')}</th>
              <th>{t('rating')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>
                  <div className="service-info-cell">
                    {service.images && service.images.length > 0 && (
                      <img 
                        src={`${IMAGE_BASE_URL}${service.images[0]}`} 
                        alt={service.title} 
                        className="service-mini-img"
                      />
                    )}
                    <div>
                      <span className="service-name">{service.title}</span>
                      <span className="service-id">ID: {service.id}</span>
                    </div>
                  </div>
                </td>
                <td>{categories.find(c => c.id === service.category_id) ? t(categories.find(c => c.id === service.category_id).key) : '—'}</td>
                <td>₸{service.price}</td>
                <td>{service.rating}</td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(service)}>
                      <Edit2 size={16} /> {t('edit')}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(service.id)}>
                      <Trash2 size={16} /> {t('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
