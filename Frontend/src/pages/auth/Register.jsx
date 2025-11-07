import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email format
  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(emailValue.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validate password strength
  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return 'Password is required';
    }
    if (passwordValue.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(passwordValue)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(passwordValue)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(passwordValue)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailError = validateEmail(value);
    setFieldErrors(prev => ({ ...prev, email: emailError }));
    if (error && emailError === '') {
      setError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const passwordError = validatePassword(value);
    setFieldErrors(prev => ({ ...prev, password: passwordError }));
    
    // Also validate confirm password if it has a value
    if (confirmPassword) {
      const confirmError = value !== confirmPassword ? 'Passwords do not match' : '';
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
    
    if (error && passwordError === '') {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const confirmError = value !== password ? 'Passwords do not match' : '';
    setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    if (error && confirmError === '') {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Trim email
    const trimmedEmail = email.trim();

    // Validate all fields
    const emailError = validateEmail(trimmedEmail);
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? 'Passwords do not match' : '';

    if (emailError || passwordError || confirmError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError
      });
      setError(emailError || passwordError || confirmError);
      return;
    }

    setLoading(true);
    const result = await register(trimmedEmail, password);
    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Cafe Akasa</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailChange}
              required
              placeholder="Enter your email"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordChange}
              required
              placeholder="Enter your password (min 8 characters)"
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            {!fieldErrors.password && password && (
              <div className="password-requirements">
                <small>Password must contain: uppercase, lowercase, number, and special character</small>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordChange}
              required
              placeholder="Confirm your password"
              className={fieldErrors.confirmPassword ? 'input-error' : ''}
            />
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

