import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './uyir_admin.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    district: '',
    age: '',
    position: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        role: 'admin' // Force the database to lock this as an admin request
      };
      
      const res = await axios.post('https://uyir-animal-rescue-system.onrender.com/api/users/register', payload);
      
      if (res.data.success) {
        setSuccess('Administrator access requested securely. You may log in now.');
        setTimeout(() => navigate('/AdminLogin'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check connectivity.');
    }
  };

  const inputStyle = {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: 'var(--bg-dark)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      marginBottom: '15px'
  };

  const labelStyle = {
      display: 'block', 
      fontSize: '11px', 
      color: 'var(--text-secondary)', 
      marginBottom: '6px', 
      fontWeight: '700', 
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
  };

  return (
    <div className="admin-dashboard" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
      <div className="a-panel" style={{ width: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="a-logo-icon" style={{ margin: '0 auto 15px', width: '48px', height: '48px', fontSize: '24px' }}>U</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>Register Administrator</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Provision a new Central Control auth token</p>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-red)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>{error}</div>}
        {success && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-green)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{success}</div>}

        <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required style={inputStyle} />
                </div>
                <div style={{ width: '100px' }}>
                    <label style={labelStyle}>Age</label>
                    <input type="number" name="age" placeholder="32" value={formData.age} onChange={handleInputChange} required style={inputStyle} />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Secure Phone</label>
                <input type="tel" name="phone" placeholder="+91 9999999999" value={formData.phone} onChange={handleInputChange} required style={inputStyle} />
            </div>

            <div>
                <label style={labelStyle}>Password</label>
                <div className="password-wrapper">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        style={{...inputStyle, paddingRight: '45px', marginBottom: 0 }} 
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

            <div>
                <label style={labelStyle}>Control District</label>
                <input type="text" name="district" placeholder="Chennai" value={formData.district} onChange={handleInputChange} required style={inputStyle} />
            </div>

            <div>
                <label style={labelStyle}>Assigned Position</label>
                <input type="text" name="position" placeholder="Nodal Coordinator" value={formData.position} onChange={handleInputChange} required style={inputStyle} />
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
              marginTop: '15px',
              width: '100%'
          }}>REQUEST AUTHORIZATION</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Already have clearance? </span>
            <Link to="/AdminLogin" style={{ color: 'var(--color-turquoise)', textDecoration: 'none', fontWeight: 'bold' }}>Sign IN</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
