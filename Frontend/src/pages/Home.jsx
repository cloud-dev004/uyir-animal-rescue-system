import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Shield, Stethoscope, Heart } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const navigate = useNavigate();
  
  const handleProfileClick = (e) => {
    e.preventDefault();
    
    // Check for administrative session
    if (sessionStorage.getItem('adminUser')) {
      navigate('/uyir_admin');
      return;
    } 
    
    // Check for volunteer session
    if (sessionStorage.getItem('volunteerUser')) {
      navigate('/uyir_volunteer');
      return;
    }

    // Check for vet session (assuming vetUser)
    if (sessionStorage.getItem('vetUser')) {
      navigate('/uyir_vet');
      return;
    }

    // If no session, toggle options dropdown
    setShowProfileOptions(!showProfileOptions);
  };

  return (
    <div className="home-container">
      {/* Background elements */}
      <div className="bg-gradients" />
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
           <span className="logo-dot"></span>
           <span className="logo-text">UYIR</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how" className="active">How it works</a></li>
          <li><a href="#modules">Modules</a></li>
          <li><a href="#impact">Impact</a></li>
          <li><a href="#tech">Tech</a></li>
        </ul>
        <div className="nav-actions">
           <Link to="/uyir_citizen">
           <button className="btn-primary nav-btn">
              Report an Animal
           </button>
           </Link>
            <div className="profile-container" style={{ position: 'relative' }}>
              <button 
                onClick={handleProfileClick} 
                className="nav-profile"
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                 <User size={20} />
              </button>
              
              {showProfileOptions && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">Sign in as</div>
                  <Link to="/VolunteerLogin" className="dropdown-item">
                    <User size={16} /> <span>Volunteer</span>
                  </Link>
                  <Link to="/AdminLogin" className="dropdown-item">
                    <Shield size={16} /> <span>Administrator</span>
                  </Link>
                  <Link to="/uyir_vet" className="dropdown-item">
                    <Stethoscope size={16} /> <span>Vet Clinic Portal</span>
                  </Link>
                </div>
              )}
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
         <div className="hero-left">
           <div className="badge">
             <span className="live-dot"></span>
             LIVE RESCUE NETWORK - TAMIL NADU
           </div>
           
           <h1 className="hero-title">
             <span className="tamil-text">உயிர்</span>
             <br />
             Every <span className="highlight">life</span><br />
             deserves<br />
             rescue.
           </h1>

           <p className="hero-subtitle">
             A real-time coordination platform connecting<br />
             citizens, volunteers, and vet clinics to rescue<br />
             injured stray animals across Tamil Nadu.
           </p>

           <div className="hero-buttons">
             <Link to="/uyir_citizen">
             <button className="btn-primary btn-large">
               Report Animal <ArrowRight size={20} />
             </button>
             </Link>
             <button className="btn-secondary">
               How it works <ArrowRight size={20} />
             </button>
           </div>

           <div className="stats-container">
             <div className="stat">
               <h3>5km</h3>
               <p>Alert radius</p>
             </div>
             <div className="stat">
               <h3>10m</h3>
               <p>Response window</p>
             </div>
             <div className="stat">
               <h3>38</h3>
               <p>Districts covered</p>
             </div>
           </div>
         </div>

         <div className="hero-right">
            <div className="phone-mockup">
               {/* Phone Camera Notch */}
               <div className="notch"></div>
               
               {/* App UI */}
               <header className="app-header">
                 <div className="logo-small">
                    <span className="logo-text">UYIR</span>
                 </div>
                 <div className="user-avatar">
                   <div className="avatar-dot"></div>
                 </div>
               </header>

               <div className="app-content">
                  <div className="rescue-card critical">
                    <div className="card-header">
                      <span className="tag critical-tag">CRITICAL</span>
                      <span className="distance">0.8 km away</span>
                    </div>
                    <h4>Injured dog — Adyar</h4>
                    <p>Near Adyar signal, Chennai</p>
                    <button className="btn-accept">Accept Rescue</button>
                  </div>

                  <div className="rescue-card moderate">
                    <div className="card-header">
                      <span className="tag moderate-tag">MODERATE</span>
                      <span className="distance">2.1 km away</span>
                    </div>
                    <h4>Stray cow — Velachery</h4>
                    <p>Main road junction</p>
                  </div>

                  <div className="map-view">
                     <div className="map-grid"></div>
                     <div className="marker user-marker"></div>
                     <div className="marker rescue-marker"></div>
                     <div className="marker other-marker"></div>
                     <p className="map-label">Live - Chennai</p>
                  </div>
               </div>

               {/* Floating Widgets */}
               <div className="floating-widget widget-rescues">
                  <div className="widget-icon-container">
                    <span>🐕</span>
                  </div>
                  <div className="widget-info">
                      <p className="widget-label">Rescues today</p>
                      <p className="widget-value">24</p>
                  </div>
               </div>

               <div className="floating-widget widget-volunteers">
                  <div className="widget-info">
                      <p className="widget-label">Active volunteers</p>
                      <p className="widget-value highlight-text">38</p>
                      <p className="widget-sub"><span className="dot-online"></span>Online now</p>
                  </div>
               </div>

               <div className="floating-widget widget-adopted">
                  <div className="widget-icon-container">
                    <span>💚</span>
                  </div>
                  <div className="widget-info">
                      <p className="widget-label">Animals adopted</p>
                      <p className="widget-value">142</p>
                      <p className="widget-sub">this month</p>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* How It Works Section */}
      <section className="how-section" id="how">
        <h2 className="section-heading">From spot to <span className="highlight">safety</span><br/>in minutes.</h2>
        
        <div className="how-grid">
          <div className="how-card">
            <span className="how-step">01 —</span>
            <div className="how-icon-wrapper how-icon-1">📸</div>
            <h3>Citizen reports</h3>
            <p>Anyone spots an injured animal and submits a report with photo and GPS location. No app install needed.</p>
          </div>
          <div className="how-card">
            <span className="how-step">02 —</span>
            <div className="how-icon-wrapper how-icon-2">🔔</div>
            <h3>Volunteer alerted</h3>
            <p>Volunteers within 5 km radius get instant push notification. They have 10 minutes to accept before the next one is pinged.</p>
          </div>
          <div className="how-card">
            <span className="how-step">03 —</span>
            <div className="how-icon-wrapper how-icon-3">🗺️</div>
            <h3>Rescue happens</h3>
            <p>Volunteer gets live directions, updates case status in real-time, and fills a digital handover form for the vet clinic.</p>
          </div>
          <div className="how-card">
            <span className="how-step">04 —</span>
            <div className="how-icon-wrapper how-icon-4">🏥</div>
            <h3>Treated & adopted</h3>
            <p>Vet clinic receives the case digitally, logs treatment, and marks the animal adoption-ready when recovered.</p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="modules-section" id="modules">
        <h2 className="section-heading smaller">Built for <span className="highlight">every</span><br/>stakeholder.</h2>
        
        <div className="modules-grid">
          <Link to="/uyir_citizen" className="module-card module-citizen" style={{ display: 'block' }}>
            <span className="module-icon">👤</span>
            <h3>Citizen Module</h3>
            <p className="module-desc">Zero friction for the public. No account needed to save a life.</p>
            <ul className="module-features">
              <li>GPS + photo report in 30 seconds</li>
              <li>Auto-severity tagging</li>
              <li>SMS case tracking via Case ID</li>
              <li>Tamil language support</li>
            </ul>
          </Link>
          
          <Link to="/VolunteerLogin"  className="module-card module-volunteer" style={{display: 'block'}}>
            <span className="module-icon">🦺</span>
            <h3>Volunteer Dashboard</h3>
            <p className="module-desc">Real-time coordination for rescuers on the ground.</p>
            <ul className="module-features">
              <li>Push alerts within 5 km radius</li>
              <li>Live Leaflet map with directions</li>
              <li>Rescue history & badge system</li>
              <li>ABC drive registration</li>
            </ul>
          </Link>
          <Link to="/uyir_vet" className="module-card module-vet">
            <span className="module-icon">📋</span>
            <h3>Vet Clinic Portal</h3>
            <p className="module-desc">Digital handover pipeline for faster, better treatment.</p>
            <ul className="module-features">
              <li>Incoming handover queue</li>
              <li>Treatment & outcome logging</li>
              <li>Adoption-ready flagging</li>
              <li>Monthly report export</li>
            </ul>
          </Link>
          <Link to="/uyir_admin" className="module-card module-admin" style={{ display: 'block' }}>
            <span className="module-icon">📊</span>
            <h3>Admin Dashboard</h3>
            <p className="module-desc">City-wide visibility for NGOs and municipal coordinators.</p>
            <ul className="module-features">
              <li>Live case map by ward & district</li>
              <li>Escalation alerts (2hr+ open)</li>
              <li>Drive scheduler</li>
              <li>CSV export for TNAW</li>
            </ul>
          </Link>
          <div className="module-card module-adoption">
            <span className="module-icon">💜</span>
            <h3>Adoption Listings</h3>
            <p className="module-desc">Give recovered animals a permanent home.</p>
            <ul className="module-features">
              <li>Grid of adoption-ready animals</li>
              <li>Filter by type, district, gender</li>
              <li>WhatsApp share integration</li>
              <li>Adoption success tracking</li>
            </ul>
          </div>
          <div className="module-card module-notification">
            <span className="module-icon">🔔</span>
            <h3>Notification Engine</h3>
            <p className="module-desc">Real-time alerts that actually reach people.</p>
            <ul className="module-features">
              <li>Firebase FCM push notifications</li>
              <li>Twilio SMS fallback</li>
              <li>Socket.io live dashboard updates</li>
              <li>In-app notification bell</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section" id="impact">
        <h2 className="section-heading smaller">The <span className="highlight">problem</span> is real.<br/>The solution is here.</h2>
        
        <div className="impact-grid">
          <div className="impact-stat">
            <span className="stat-number color-1">3.5L+</span>
            <p>Stray dogs in Chennai alone with no coordinated rescue system</p>
          </div>
          <div className="impact-stat">
            <span className="stat-number color-2">5L+</span>
            <p>Annual dog bite cases in Tamil Nadu due to lack of sterilisation</p>
          </div>
          <div className="impact-stat">
            <span className="stat-number color-3">0</span>
            <p>Digital coordination tools exist today for animal rescue volunteers</p>
          </div>
          <div className="impact-stat">
            <span className="stat-number color-4">38</span>
            <p>Districts in TN needing active Animal Birth Control drives</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2 className="cta-heading">Be the reason<br/>an animal <em className="highlight" style={{ fontStyle: 'italic' }}>lives.</em></h2>
          <p className="cta-subtext">Join hundreds of volunteers across Tamil Nadu who are already making a difference — one rescue at a time.</p>
          <div className="cta-actions">
            <Link to="/uyir_volunteer">
            <button className="btn-primary btn-large">Join as Volunteer <ArrowRight size={20} /></button>
            </Link>
            <Link to="/uyir_citizen">
            <button className="btn-outline">Report an Animal</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">UYIR</div>
        <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><Link to="/uyir_volunteer">Volunteer</Link></li>
          <li><a href="#clinics">Vet Clinics</a></li>
          <li><a href="#adoption">Adoption</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="footer-right">Tamil Nadu - 2024</div>
      </footer>
    </div>
  );
};

export default Home;
