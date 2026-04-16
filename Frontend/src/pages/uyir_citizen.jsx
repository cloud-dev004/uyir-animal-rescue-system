import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './uyir_citizen.css';
import {Link} from 'react-router-dom';

const UyirCitizen = () => {
    const [animalType, setAnimalType] = useState('Dog');
    const [severity, setSeverity] = useState('Moderate');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [photos, setPhotos] = useState([]);
    const [trackId, setTrackId] = useState('');
    const [trackedCase, setTrackedCase] = useState(null);
    const [stats, setStats] = useState({ openCases: '--', avgResponse: '--', volunteersOnline: '--' });
    const fileInputRef = useRef(null);

    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [locationStatus, setLocationStatus] = useState('detecting'); 
    const [gpsLocation, setGpsLocation] = useState(null); 

    const detectLocation = () => {
        setLocationStatus('detecting');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    try {
                        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        if (response.data && response.data.address) {
                            const addr = response.data.address;
                            // Prioritize the district string (county/state_district) down to city
                            let detectedCity = addr.state_district || addr.county || addr.city || addr.town || addr.village || '';
                            
                            // Clean up strings like "Chennai District" to just "Chennai" if desired
                            if (detectedCity.toLowerCase().includes('district')) {
                                detectedCity = detectedCity.replace(/district/gi, '').trim();
                            }
                            
                            const detectedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
                            
                            setCity(detectedCity);
                            setArea(detectedArea);
                            
                            setGpsLocation({ lat, lng, detectedCity, detectedArea });
                        } else {
                            setGpsLocation({ lat, lng });
                        }
                    } catch (err) {
                        console.error("Reverse geocoding failed", err);
                        setGpsLocation({ lat, lng });
                    }
                    setLocationStatus('success');
                },
                (error) => {
                    console.error("GPS Error:", error);
                    setLocationStatus('failed');
                },
                { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('failed');
        }
    };

    useEffect(() => {
        detectLocation();
    }, []);

    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files.length > 0) {
           
            const newPhotos = Array.from(e.target.files).filter(f => f.type.startsWith('image/')).slice(0, 3 - photos.length);
            if (newPhotos.length > 0) {
                // Create local object URLs for preview
                const photoPreviews = newPhotos.map(file => URL.createObjectURL(file));
                setPhotos([...photos, ...photoPreviews]);
            }
        }
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const reportData = {
            reporterPhone: phone,
            animalType: animalType.toLowerCase(),
            severity: severity.toLowerCase(),
            description: description,
            location: {
                type: 'Point',
                coordinates: gpsLocation ? [gpsLocation.lng, gpsLocation.lat] : [0, 0] 
            },
            city: city,
            area: area
        };

        try {
            const response = await axios.post('http://localhost:5000/api/reports', reportData);
            
            if (response.data.success) {
                alert(`Report submitted successfully! Case ID: ${response.data.data.caseId}`);
                
                // Clear form fields
                setAnimalType('Dog');
                setSeverity('Moderate');
                setDescription('');
                setPhone('');
                setPhotos([]);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            if (error.response && error.response.data) {
                alert(`Failed: ${error.response.data.message}`);
            } else {
                alert('Failed to submit the report. Is the server running?');
            }
        }
    };

    const handleTrackCase = async () => {
        if (!trackId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/reports/track/${trackId}`);
            if (response.data.success) {
                setTrackedCase(response.data.data);
            }
        } catch (error) {
            console.error('Error tracking report:', error);
            if (error.response && error.response.data) {
                alert(error.response.data.message);
            } else {
                alert('Failed to connect to the tracking service.');
            }
            setTrackedCase(null);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to load system stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        
        <div className="citizen-container">
            {/* Top Navigation */}
            <nav className="c-navbar">
                <div className="c-nav-brand">
                    <div className="c-logo-icon">U</div>
                    <div className="c-logo-text">
                        <span className="c-logo-title">Uyir</span>
                        <span className="c-logo-sub">உயிர் • Citizen Portal</span>
                    </div>
                </div>
                
                <div className="c-nav-links">
                    <Link to="/Home"><button className="c-nav-btn">Home</button></Link>
                    <button className="c-nav-btn active">Report animal</button>
                    <button className="c-nav-btn"
                    onClick={() => document.getElementById('c-track-widget')?.scrollIntoView({ behavior: 'smooth' })}
                    
                    >Track case</button>
                    
                    <button className="c-nav-btn">Nearby drives</button>
                    
                </div>

                <div className="c-nav-actions">
                    <button className="c-new-report-btn"
                    onClick={() => document.getElementById('c-main-content')?.scrollIntoView({ behavior: 'smooth' })}
                    
                    >+ New report</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="c-hero-section">
                <div className="c-hero-badge">
                    <span className="c-hero-dot"></span>
                    No account needed · Report in 30 seconds
                </div>
                <h1 className="c-hero-title">
                    Spot an animal.<br/>
                    <span className="c-hero-highlight">Save a life.</span>
                </h1>
                <p className="c-hero-subtitle">
                    Report injured or distressed animals near you. Our volunteer network<br/>
                    across Tamil Nadu responds within minutes.
                </p>
                
                <button 
                    className="c-scroll-down-btn" 
                    onClick={() => document.getElementById('c-main-content')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                </button>
            </section>

            <main className="c-main-content" id="c-main-content">
                {/* Left Side: Form */}
                <section className="c-form-section">
                    <div className="c-form-header">
                        <h2>Animal incident report</h2>
                        <p>Fill in the details below. The more info you provide, the faster volunteers can help.</p>
                    </div>

                    <form className="c-incident-form" onSubmit={handleSubmit}>
                        {/* Animal Type */}
                        <div className="c-form-group">
                            <label>Animal type <span className="c-required">Required</span></label>
                            <div className="c-selection-grid grid-5">
                                <div className={`c-select-card ${animalType === 'Dog' ? 'active' : ''}`} onClick={() => setAnimalType('Dog')}>
                                    <div className="c-icon">
                                        {/* Dog Icon Placeholder */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 8.789c.14-.18.4-.263.63-.162l2.427 1.056c.277.12.56.24.846.36m-7.234-4.8c-.14-.18-.4-.262-.63-.161L7.88 6.138A15 15 0 0 0 7.034 6.5M20 18v-3c0-2-2-4-5-4H9c-3 0-5 2-5 4v3" /><circle cx="15.5" cy="11.5" r="1.5"/><circle cx="8.5" cy="11.5" r="1.5"/></svg>
                                    </div>
                                    <span>Dog</span>
                                </div>
                                <div className={`c-select-card ${animalType === 'Cat' ? 'active' : ''}`} onClick={() => setAnimalType('Cat')}>
                                    <div className="c-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.5 0 4.1-3.6 7.5-8 7.5s-8-3.4-8-7.5c0-1.26.43-2.43 1-3.5 0 0-1.82-6.42-.42-7 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z"/></svg>
                                    </div>
                                    <span>Cat</span>
                                </div>
                                <div className={`c-select-card ${animalType === 'Cow' ? 'active' : ''}`} onClick={() => setAnimalType('Cow')}>
                                    <div className="c-icon">
                                        {/* Cow/Livestock Icon placeholder */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v4h2v-4H7zm8 0v4h2v-4h-2zm-4 6c-2 0-3-.5-4-1m8 1c-1 .5-2 1-4 1m6-6a4 4 0 0 0-8 0v3h8v-3zM5 8V4h3v4M16 4v4h3V4M4 14v6h4v-6h8v6h4v-6"/></svg>
                                    </div>
                                    <span>Cow</span>
                                </div>
                                <div className={`c-select-card ${animalType === 'Bird' ? 'active' : ''}`} onClick={() => setAnimalType('Bird')}>
                                    <div className="c-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.6 6.4a5 5 0 0 0-7.2 0L9 8.8l3 3 2.4-2.4a3 3 0 0 1 4.2 0 3 3 0 0 1 0 4.2L16.2 16l3-3 2.4-2.4a5 5 0 0 0 0-7.2Z"/><path d="M5.4 17.6a5 5 0 0 0 7.2 0L15 15.2l-3-3-2.4 2.4a3 3 0 0 1-4.2 0 3 3 0 0 1 0-4.2L7.8 8l-3 3-2.4 2.4a5 5 0 0 0 0 7.2Z"/></svg>
                                    </div>
                                    <span>Bird</span>
                                </div>
                                <div className={`c-select-card ${animalType === 'Other' ? 'active' : ''}`} onClick={() => setAnimalType('Other')}>
                                    <div className="c-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    </div>
                                    <span>Other</span>
                                </div>
                            </div>
                        </div>

                        {/* Injury Severity */}
                        <div className="c-form-group">
                            <label>Injury severity <span className="c-required">Required</span></label>
                            <div className="c-selection-grid grid-3">
                                <div 
                                    className={`c-select-card s-mild ${severity === 'Mild' ? 'active' : ''}`} 
                                    onClick={() => setSeverity('Mild')}
                                >
                                    <span className="c-dot mild"></span>
                                    <strong>Mild</strong>
                                    <small>Walking, minor wound</small>
                                </div>
                                <div 
                                    className={`c-select-card s-moderate ${severity === 'Moderate' ? 'active' : ''}`} 
                                    onClick={() => setSeverity('Moderate')}
                                >
                                    <span className="c-dot moderate"></span>
                                    <strong>Moderate</strong>
                                    <small>Limping, bleeding</small>
                                </div>
                                <div 
                                    className={`c-select-card s-critical ${severity === 'Critical' ? 'active' : ''}`} 
                                    onClick={() => setSeverity('Critical')}
                                >
                                    <span className="c-dot critical"></span>
                                    <strong>Critical</strong>
                                    <small>Unconscious, severe</small>
                                </div>
                            </div>
                        </div>

                        {/* GPS Location */}
                        <div className="c-form-group">
                            <label>Location <span className="c-auto">{locationStatus === 'success' ? 'Auto-detected' : 'Manual entry required'}</span></label>
                            
                            {locationStatus === 'detecting' && (
                                <div className="c-gps-box" style={{ opacity: 0.7 }}>
                                    <div className="c-gps-info">
                                        <div className="c-gps-text">
                                            <strong>Detecting GPS location...</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {locationStatus === 'success' && gpsLocation && (
                                <div className="c-gps-box">
                                    <div className="c-gps-info">
                                        <span className="c-dot mild pulse"></span>
                                        <div className="c-gps-text">
                                            <strong>{gpsLocation.detectedArea || gpsLocation.detectedCity ? `${gpsLocation.detectedArea ? gpsLocation.detectedArea + ', ' : ''}${gpsLocation.detectedCity}` : 'Location captured securely'}</strong>
                                            <small>{gpsLocation.lat.toFixed(4)}° N, {gpsLocation.lng.toFixed(4)}° E</small>
                                        </div>
                                    </div>
                                    <button type="button" className="c-refresh-btn" onClick={detectLocation}>Refresh</button>
                                </div>
                            )}

                            {locationStatus === 'failed' && (
                                <div className="c-manual-location" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{color: '#ff5e5e', marginBottom: '15px', fontSize: '0.9rem'}}> GPS failed. Please enter location manually:</div>
                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <input 
                                            type="text" 
                                            className="c-input-field" 
                                            placeholder="City (e.g. Chennai)" 
                                            required={locationStatus === 'failed'} 
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                        <input 
                                            type="text" 
                                            className="c-input-field" 
                                            placeholder="Area (e.g. Adyar)" 
                                            required={locationStatus === 'failed'} 
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                        <button type="button" className="c-refresh-btn" onClick={detectLocation}>Retry GPS</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Photos/Video */}
                        <div className="c-form-group">
                            <label>Photos / video <span className="c-limit">Up to 3 images</span></label>
                            <div className="c-photo-upload-area">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    accept="image/*" 
                                    multiple 
                                    onChange={handlePhotoUpload}
                                />
                                {photos.length === 0 ? (
                                    <div className="c-upload-placeholder" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                                        <div className="c-upload-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                        </div>
                                        <p>Tap to upload photos</p>
                                        <small>JPG, PNG - Max 5MB each</small>
                                    </div>
                                ) : (
                                    <div className="c-uploaded-thumbnails" style={{ flexWrap: 'wrap' }}>
                                        {photos.map((src, idx) => (
                                            <div key={idx} className="c-thumb" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                                <div 
                                                    onClick={() => removePhoto(idx)}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: 12 }}
                                                >✕</div>
                                            </div>
                                        ))}
                                        {photos.length < 3 && (
                                            <div className="c-thumb empty" onClick={() => fileInputRef.current?.click()}>+ Add</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Describe the situation */}
                        <div className="c-form-group">
                            <label>Describe the situation</label>
                            <textarea 
                                className="c-input-field"
                                placeholder="e.g., Dog hit by vehicle near Adyar signal, left hind leg injured, cannot walk..."
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Phone Number */}
                        <div className="c-form-group">
                            <label>Your phone number <span className="c-update-note">For SMS updates</span></label>
                            <input 
                                type="text" 
                                className="c-input-field" 
                                placeholder="+91 98765 43210" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <button className="c-submit-btn">Submit rescue report &rarr;</button>
                    </form>
                </section>

                {/* Right Side: Tracking & Stats */}
                <aside className="c-sidebar">
                    {/* Top Stats */}
                    <div className="c-stats-row">
                        <div className="c-stat-box">
                            <h3>{stats.openCases}</h3>
                            <p>Open cases nearby</p>
                        </div>
                        <div className="c-stat-box">
                            <h3>{stats.avgResponse}</h3>
                            <p>Avg response</p>
                        </div>
                        <div className="c-stat-box">
                            <h3>{stats.volunteersOnline}</h3>
                            <p>Volunteers online</p>
                        </div>
                    </div>

                    {/* Track Case Widget */}
                    <div className="c-widget c-track-widget" id="c-track-widget">
                        <h3>Track your case</h3>
                        <p>Enter your case ID to see live rescue status</p>
                        <div className="c-track-input-group">
                            <input 
                                type="text" 
                                placeholder="UYR-2026-1234" 
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                            />
                            <button className="c-track-btn" onClick={handleTrackCase}>Track</button>
                        </div>
                    </div>

                    {/* Active Case Widget */}
                    {trackedCase && (
                        <div className="c-widget c-active-case-widget">
                            <div className="c-widget-badge">ACTIVE CASE - LIVE</div>
                            <h2 className="c-case-id-large">{trackedCase.caseId}</h2>
                            <p className="c-case-desc" style={{textTransform: 'capitalize'}}>{trackedCase.animalType} - {trackedCase.address || 'Address info pending'}</p>
                            
                            <div className="c-timeline">
                                {/* Status 1: Report Submitted */}
                                <div className="c-t-item completed">
                                    <div className="c-t-icon check">✓</div>
                                    <div className="c-t-content">
                                        <h4>Report submitted</h4>
                                        <p>{new Date(trackedCase.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                {/* Status 2: Volunteer Assigned */}
                                <div className={`c-t-item ${['assigned', 'en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'completed' : trackedCase.status === 'open' ? 'active' : 'pending'}`}>
                                    <div className={`c-t-icon ${['assigned', 'en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'check' : trackedCase.status === 'open' ? 'pulse-orange' : 'empty'}`}>
                                        {['assigned', 'en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? '✓' : ''}
                                    </div>
                                    <div className="c-t-content">
                                        <h4 className={trackedCase.status === 'open' ? 'c-orange-text' : ''}>Volunteer assigned</h4>
                                        <p>{['assigned', 'en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'Assigned' : 'Pending volunteer'}</p>
                                    </div>
                                </div>

                                {/* Status 3: En route */}
                                <div className={`c-t-item ${['en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'completed' : ['assigned'].includes(trackedCase.status) ? 'active' : 'pending'}`}>
                                    <div className={`c-t-icon ${['en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'check' : ['assigned'].includes(trackedCase.status) ? 'pulse-orange' : 'empty'}`}>
                                        {['en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? '✓' : ''}
                                    </div>
                                    <div className="c-t-content">
                                        <h4 className={['assigned'].includes(trackedCase.status) ? 'c-orange-text' : ''}>En route to animal</h4>
                                        <p>{['en-route', 'rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'Arrived' : 'ETA unknown'}</p>
                                    </div>
                                </div>

                                {/* Status 4: Animal rescued */}
                                <div className={`c-t-item ${['rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'completed' : ['en-route'].includes(trackedCase.status) ? 'active' : 'pending'}`}>
                                    <div className={`c-t-icon ${['rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'check' : ['en-route'].includes(trackedCase.status) ? 'pulse-orange' : 'empty'}`}>
                                        {['rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? '✓' : ''}
                                    </div>
                                    <div className="c-t-content">
                                        <h4 className={['en-route'].includes(trackedCase.status) ? 'c-orange-text' : ''}>Animal rescued</h4>
                                        <p>{['rescued', 'treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'Secured' : 'Pending'}</p>
                                    </div>
                                </div>

                                {/* Status 5: Treated at vet clinic */}
                                <div className={`c-t-item ${['treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'completed' : ['rescued'].includes(trackedCase.status) ? 'active' : 'pending'}`}>
                                    <div className={`c-t-icon ${['treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'check' : ['rescued'].includes(trackedCase.status) ? 'pulse-orange' : 'empty'}`}>
                                        {['treated', 'adopted', 'closed'].includes(trackedCase.status) ? '✓' : ''}
                                    </div>
                                    <div className="c-t-content">
                                        <h4 className={['rescued'].includes(trackedCase.status) ? 'c-orange-text' : ''}>Treated at vet clinic</h4>
                                        <p>{['treated', 'adopted', 'closed'].includes(trackedCase.status) ? 'Treated' : 'Pending'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Widget */}
                    <div className="c-widget c-tips-widget">
                        <h3 className="c-tips-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            Tips for a better report
                        </h3>
                        <ul>
                            <li>Take a photo from at least 2 angles — front and injury area</li>
                            <li>Mention a nearby landmark — signal, shop name, or street</li>
                            <li>Do not move the animal unless it is in immediate danger</li>
                            <li>Stay nearby if safe — volunteer may need your guidance</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default UyirCitizen;
