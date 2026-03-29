import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import './Payment.css';

const API_URL = 'http://localhost:5000/api';

const Payment = () => {
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
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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
          <h2>Payment Successful!</h2>
          <p>Your booking has been confirmed.</p>
          <p className="redirect-text">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  if (loading && !bookingData) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!bookingData) {
    return <div className="error-message">Booking not found or cannot load booking details.</div>;
  }

  return (
    <div className="payment-container animate-fade-in">
      <div className="card payment-card">
        <div className="payment-header">
          <CreditCard size={32} className="payment-icon" />
          <h2>Complete Payment</h2>
        </div>
        
        <p className="payment-desc">
          You are about to pay <strong>${bookingData?.service_price}</strong> for Booking #{bookingId} ({bookingData?.service_title}).
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="mock-credit-card">
          <div className="mock-card-top">
            <span className="chip"></span>
            <span className="wifi">)))</span>
          </div>
          <div className="mock-card-number">**** **** **** 1234</div>
          <div className="mock-card-bottom">
            <span>John Doe</span>
            <span>12/28</span>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="btn btn-payment"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
