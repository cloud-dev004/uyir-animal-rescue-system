import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './uyir_admin.css';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { phone, password });
      
      if (res.data.success && res.data.data.role === 'admin') {
        // Clear ALL session storage to ensure only one session is active
        sessionStorage.clear();
        sessionStorage.setItem('adminUser', JSON.stringify(res.data.data));
        navigate('/uyir_admin');
      } else {
        setError('Access denied. You are not an authorized administrator.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="admin-dashboard" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="a-panel" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="a-logo-icon" style={{ margin: '0 auto 15px', width: '48px', height: '48px', fontSize: '24px' }}>U</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Sign in to the Control Center</p>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-red)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Secure Phone</label>
            <input 
                type="tel" 
                placeholder="Enter authorized mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Password</label>
            <div className="password-wrapper">
              <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '45px', // Space for eye icon
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                  }}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px'
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" style={{
              backgroundColor: 'var(--color-turquoise)',
              color: 'var(--bg-dark)',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px'
          }}>SYSTEM LOGIN</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>New coordinator? </span>
            <Link to="/AdminRegister" style={{ color: 'var(--color-turquoise)', textDecoration: 'none', fontWeight: 'bold' }}>Register Authorization</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
