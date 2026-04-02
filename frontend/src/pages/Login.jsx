import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import './Auth.css';

const Login = () => {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(t('fieldsRequired'));
      return;
    }

    setSubmitting(true);

    try {
      await login({ email: formData.email.trim(), password: formData.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error ? t(err.response.data.error) : t('loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{t('login')}</h2>
        <p>{t('loginSubtitle')}</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>{t('email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
          />

          <label>{t('password')}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="******"
          />

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('pleaseWait') : t('login')}
          </button>
        </form>

        <p className="auth-footer">
          {t('newToSite')} <Link to="/register">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
