import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Auth.css';

const Login = () => {
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
      setError('Email және құпия сөз толтырылуы керек.');
      return;
    }

    setSubmitting(true);

    try {
      await login({ email: formData.email.trim(), password: formData.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Кіру</h2>
        <p>Жеке кабинетке кіру үшін почта және құпия сөз енгізіңіз.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
          />

          <label>Құпия сөз</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Құпия сөзіңіз"
          />

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Күте тұрыңыз...' : 'Кіру'}
          </button>
        </form>

        <p className="auth-footer">
          Жаңа қолданушысыз? <Link to="/register">Тіркелу</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
