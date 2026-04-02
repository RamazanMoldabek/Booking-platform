import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import API_URL from '../apiConfig';
import './Payment.css';

const Payment = () => {
  const { t } = useLanguage();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/bookings/${bookingId}`);
        setBookingData(res.data);
      } catch (err) {
        setError(t('errorLoadingService'));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, t]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    if (!bookingData) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        booking_id: bookingId,
        amount: Number(bookingData.service_price)
      };

      await axios.post(`${API_URL}/payments`, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Payment processing failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-container animate-fade-in">
        <div className="card success-card text-center">
          <CheckCircle className="success-icon" size={64} />
          <h2>{t('paymentSuccess')}</h2>
          <p>{t('bookingSuccess')}</p>
          <p className="redirect-text">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  if (loading && !bookingData) {
    return <div className="loading">{t('loading')}</div>;
  }

  if (!bookingData) {
    return <div className="error-message">{t('bookingNotFound')}</div>;
  }

  return (
    <div className="payment-container animate-fade-in">
      <div className="card payment-card">
        <div className="payment-header">
          <CreditCard size={32} className="payment-icon" />
          <h2>{t('completePayment')}</h2>
        </div>
        
        <p className="payment-desc">
          {t('payNow')}: <strong>₸{bookingData?.service_price}</strong> {t('bookingFor')} #{bookingId} ({bookingData?.service_title}).
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="mock-credit-card">
          <div className="mock-card-top">
            <span className="chip"></span>
            <span className="wifi">)))</span>
          </div>
          <div className="mock-card-number">**** **** **** 1234</div>
          <div className="mock-card-bottom">
            <span>Customer Name</span>
            <span>12/28</span>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="btn btn-payment"
        >
          {loading ? t('processing') : t('payNow')}
        </button>
      </div>
    </div>
  );
};

export default Payment;
