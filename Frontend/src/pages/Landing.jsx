import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Masthead from '../components/Masthead';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="landing-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Masthead 
        isLanding={true}
        onCTAClick={() => navigate('/login')}
        ctaText="Login / Signup to Continue"
      />
      <div className="landing-features">
        <div className="container">
          <h2 className="features-title">Why Choose Cafe Akasa?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🍕</div>
              <h3>Fresh Ingredients</h3>
              <p>We use only the freshest ingredients to prepare your favorite meals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered quickly and safely to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Ordering</h3>
              <p>Simple and secure ordering process with multiple payment options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Assured</h3>
              <p>Every dish is prepared with care and attention to detail</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

