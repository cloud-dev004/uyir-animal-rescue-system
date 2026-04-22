import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './VolunteerLogin.css';

const VolunteerLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    const session = sessionStorage.getItem('volunteerUser');
    if (session) {
      try {
        const user = JSON.parse(session);
        if (user && user._id) {
          navigate('/uyir_volunteer', { replace: true, state: { user } });
        }
      } catch (e) {
        sessionStorage.removeItem('volunteerUser');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      // Simplistic login logic based on User schema constraints (phone as unique id)
      const response = await axios.post('https://uyir-animal-rescue-system.onrender.com/api/users/login', { phone, password });
      if (response.data.success || response.status === 200) {
        // Store full user object for persistent session
        // Clear ALL session storage to ensure only one session is active
        sessionStorage.clear();
        sessionStorage.setItem('volunteerUser', JSON.stringify(response.data.data));
        navigate('/uyir_volunteer', { replace: true, state: { user: response.data.data } });
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.status === 404) {
        setErrorMsg('No user found with this phone number. Please register first.');
      } else if (error.response && error.response.status === 401) {
        setErrorMsg('Invalid password. Please try again.');
      } else {
        setErrorMsg('An error occurred during login. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="vl-container">
      <div className="vl-card">
        <div className="vl-icon">U</div>
        <h1 className="vl-title">Welcome Back</h1>
        <p className="vl-subtitle">Login to your Volunteer Dashboard</p>
        <form onSubmit={handleSubmit} className="vl-form">
          {errorMsg && (
            <div style={{ color: '#ff5e5e', backgroundColor: 'rgba(255, 94, 94, 0.1)', padding: '10px 15px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 94, 94, 0.2)' }}>
              {errorMsg}
            </div>
          )}
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              placeholder="Enter your registered number" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="vl-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        <p className="vl-register-prompt">
          New here? <Link to="/VolunteerRegister">Register as volunteer</Link>
        </p>
      </div>
    </div>
  );
};

export default VolunteerLogin;
