import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './VolunteerRegister.css';

const VolunteerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'volunteer',
    district: '',
    skills: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    let newSkills = [...formData.skills];
    if (checked) {
      newSkills.push(value);
    } else {
      newSkills = newSkills.filter(s => s !== value);
    }
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await axios.post('https://uyir-animal-rescue-system.onrender.com/api/users/register', {
        ...formData,
        role: 'volunteer'
      });
      if (response.data.success || response.status === 201) {
        setSuccessMsg('Registration successful! Connecting to your dashboard...');
        localStorage.setItem('volunteerUser', JSON.stringify(response.data.data));

        setTimeout(() => {
          navigate('/uyir_volunteer', { replace: true, state: { user: response.data.data } });
        }, 1500);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response && error.response.status === 400) {
        setErrorMsg('The mobile number already exists, please login.');
      } else {
        setErrorMsg('An error occurred during registration. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="vr-container">
      <div className="vr-card">
        <h1 className="vr-title">Join Uyir</h1>
        <p className="vr-subtitle">Become a volunteer and save animal lives</p>
        <form onSubmit={handleSubmit} className="vr-form">
          {errorMsg && (
            <div style={{ color: '#ff5e5e', backgroundColor: 'rgba(255, 94, 94, 0.1)', padding: '10px 15px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 94, 94, 0.2)' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: '#00cc6a', backgroundColor: 'rgba(0, 204, 106, 0.1)', padding: '10px 15px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(0, 204, 106, 0.2)' }}>
              {successMsg}
            </div>
          )}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              type="text"
              placeholder="e.g. Chennai"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Skills &amp; Resources</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" value="vehicle" onChange={handleSkillChange} />
                <span className="custom-checkbox"></span>
                Two/Four Wheeler
              </label>
              <label className="checkbox-label">
                <input type="checkbox" value="first-aid" onChange={handleSkillChange} />
                <span className="custom-checkbox"></span>
                First-Aid Knowledge
              </label>
              <label className="checkbox-label">
                <input type="checkbox" value="large-animal" onChange={handleSkillChange} />
                <span className="custom-checkbox"></span>
                Large Animal Handling
              </label>
            </div>
          </div>

          <button type="submit" className="vr-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register as Volunteer'}
          </button>
        </form>
        <p className="vr-login-prompt">
          Already a volunteer? <Link to="/VolunteerLogin">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default VolunteerRegister;
