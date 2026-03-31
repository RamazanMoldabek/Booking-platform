// frontend/src/pages/AdminPanel.jsx
// Админ-панель. Позволяет создавать, редактировать и удалять услуги.
// Доступна только пользователю с флагом is_admin.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_URL from '../apiConfig';
import './AdminPanel.css';

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
    image_url: '',
    website: '',
    rating: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.is_admin) {
      navigate('/');
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        setServices(response.data);
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };

    fetchServices();
  }, [user, navigate]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        image_url: formData.image_url,
        website: formData.website,
        rating: formData.rating ? Number(formData.rating) : undefined,
      };

      const response = editMode
        ? await axios.put(`${API_URL}/admin/services/${editingServiceId}`, payload)
        : await axios.post(`${API_URL}/admin/services`, payload);

      if (editMode) {
        setServices((prev) => prev.map((item) => (item.id === response.data.id ? response.data : item)));
        setSuccessMessage('Service updated successfully.');
      } else {
        setServices((prev) => [...prev, response.data]);
        setSuccessMessage('Service created successfully.');
      }

      setFormData({
        title: '',
        description: '',
        short_description: '',
        price: '',
        duration: '1',
        image_url: '',
        website: '',
        rating: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save service.');
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
      image_url: '',
      website: '',
      rating: '',
    });
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
      image_url: service.image_url || '',
      website: service.website || '',
      rating: service.rating?.toString() || '',
    });
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

          <div className="admin-row">
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

          <div className="admin-row">
            <label>URL изображения</label>
            <input name="image_url" value={formData.image_url} onChange={handleChange} />
          </div>

          <div className="admin-row">
            <label>Сайт услуги</label>
            <input name="website" value={formData.website} onChange={handleChange} />
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
              <div className="admin-service-top">
                <h3>{service.title}</h3>
                <span>${service.price}</span>
              </div>
              <p>{service.short_description || service.description}</p>
              <div className="admin-service-meta">
                <span>Длительность: {service.duration || 1} дн</span>
                {service.website && (
                  <a href={service.website} target="_blank" rel="noreferrer">
                    Сайт
                  </a>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
