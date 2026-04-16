import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './Home';
import './uyir_volunteer.css';

const UyirVolunteer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(location.state?.user || null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const [activeTab, setActiveTab] = useState('Dashboard');
    const [activeFilter, setActiveFilter] = useState('All');
    const [openCases, setOpenCases] = useState([]);
    const [myRescues, setMyRescues] = useState([]);
    const [resolveMsg, setResolveMsg] = useState('');

    const fetchMyRescues = async () => {
        if (user && user._id) {
            try {
                const response = await axios.get(`https://uyir-animal-rescue-system.onrender.com/api/reports/assigned/${user._id}`);
                if (response.data.success) {
                    setMyRescues(response.data.data);
                }
            } catch (error) {
                console.error('Failed to load my rescues:', error);
            }
        }
    };

    useEffect(() => {
        if (user && user._id) {
            fetchMyRescues();
        }
    }, [activeTab, user]);

    const handleAcceptRescue = async (id) => {
        if (!user || !user._id) {
            alert('Please log in properly to accept a rescue.');
            return;
        }
        try {
            const response = await axios.post(`https://uyir-animal-rescue-system.onrender.com/api/reports/${id}/accept`, { userId: user._id });
            if (response.data.success) {
                setOpenCases(openCases.filter(c => c._id !== id));
                setMyRescues([response.data.data, ...myRescues]);
                // Removed rescueCount increment from here based on user request
                setActiveTab('My rescues');
            }
        } catch (error) {
            console.error('Failed to accept rescue:', error);
            alert(error.response?.data?.message || 'Failed to accept rescue');
        }
    };

    // --- Mark case as Resolved → updates status + adds credits to volunteer ---
    const handleResolveCase = async (id) => {
        try {
            const response = await axios.put(`https://uyir-animal-rescue-system.onrender.com/api/reports/${id}/resolve`);
            if (response.data.success) {
                // Remove from myRescues list
                setMyRescues(prev => prev.filter(c => c._id !== id));
                // Update user credits, rescueCount, & badge locally
                const updatedUser = { 
                    ...user, 
                    credits: (user.credits || 0) + 10,
                    rescueCount: (user.rescueCount || 0) + 1
                };
                setUser(updatedUser);
                localStorage.setItem('volunteerUser', JSON.stringify(updatedUser));
                setResolveMsg('✅ Case resolved! +10 credits added to your profile.');
                setTimeout(() => setResolveMsg(''), 3500);
            }
        } catch (error) {
            console.error('Failed to resolve case:', error);
            alert(error.response?.data?.message || 'Failed to resolve case');
        }
    };

    // --- Session: Load user from localStorage and silently sync with backend ---
    useEffect(() => {
        const syncUserWithBackend = async (phone) => {
            try {
                const response = await axios.post('https://uyir-animal-rescue-system.onrender.com/api/users/login', { phone });
                if (response.data.success) {
                    setUser(response.data.data);
                    localStorage.setItem('volunteerUser', JSON.stringify(response.data.data));
                }
            } catch (error) {
                console.error('Failed to sync session with backend', error);
            }
        };

        if (!user) {
            const session = localStorage.getItem('volunteerUser');
            if (session) {
                try {
                    const parsed = JSON.parse(session);
                    if (parsed && parsed._id) {
                        setUser(parsed);
                        if (parsed.phone) syncUserWithBackend(parsed.phone);
                    } else {
                        navigate('/VolunteerLogin', { replace: true });
                    }
                } catch (e) {
                    navigate('/VolunteerLogin', { replace: true });
                }
            } else {
                navigate('/VolunteerLogin', { replace: true });
            }
        } else {
            if (user.phone) syncUserWithBackend(user.phone);
        }
    }, [navigate]);

    // --- Close profile menu when clicking outside ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Logout handler ---
    const handleLogout = () => {
        localStorage.removeItem('volunteerUser');
        navigate('/Home', { replace: true });
    };


    useEffect(() => {
        const fetchOpenCases = async () => {
            try {
                const response = await axios.get('https://uyir-animal-rescue-system.onrender.com/api/reports/open');
                if (response.data.success) {
                    setOpenCases(response.data.data);
                }
            } catch (error) {
                console.error('Failed to load open cases:', error);
            }
        };
        fetchOpenCases();
    }, []);

    // Simple time formatter
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins || 1} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hr ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    };

    const casesToDisplay = activeTab === 'My rescues' ? myRescues : openCases;

    const filteredCases = casesToDisplay.filter(c => {
        // Enforce location matching explicitly for the Open Cases dashboard list
        if (activeTab === 'Dashboard' && user && user.district && c.city) {
            if (c.city.toLowerCase() !== user.district.toLowerCase()) {
                return false;
            }
        }

        if (activeFilter === 'All') return true;
        if (activeFilter === 'Critical') return c.severity === 'critical';
        if (activeFilter === 'Dog') return c.animalType === 'dog';
        if (activeFilter === 'Cat') return c.animalType === 'cat';
        return true;
    });

    return (
        <div className="volunteer-dashboard">
            {/* Top Navigation */}
            <header className="v-top-nav">
                <div className="v-logo-section">
                    <div className="v-logo-icon">U</div>
                    <div className="v-logo-text">
                        <h1 className="v-brand-name">Uyir</h1>
                        <p className="v-brand-subtitle">Volunteer Command Center</p>
                    </div>
                </div>
                
                <nav className="v-nav-links">
                    <a href="#" className={`v-nav-link ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('Dashboard');}}>Dashboard</a>
                    <a href="#" className={`v-nav-link ${activeTab === 'My rescues' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('My rescues');}}>My rescues</a>
                    <a href="#" className={`v-nav-link ${activeTab === 'Drives & camps' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('Drives & camps');}}>Drives & camps</a>
                    <a href="#" className={`v-nav-link ${activeTab === 'Adoption board' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('Adoption board');}}>Adoption board</a>
                    <a href="#" className={`v-nav-link ${activeTab === 'Leaderboard' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('Leaderboard');}}>Leaderboard</a>
                    {/* <a href="#" className={`v-nav-link ${activeTab === 'Home' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setActiveTab('Home');}}>Home</a> */}
                    <a className='v-nav-link'><Link to="/Home">Home</Link></a>
                </nav>
                
                <div className="v-user-controls">
                    <div className="v-status-badge">
                        <span className="v-status-dot available"></span>
                        <span className="v-status-text">Available</span>
                    </div>
                    <button className="v-notification-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span className="v-notification-badge">3</span>
                    </button>
                    <div className="v-profile-menu-container" ref={profileMenuRef} style={{ position: 'relative' }}>
                        <div className="v-profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
                            {user ? user.name.charAt(0).toUpperCase() : 'K'}
                        </div>
                        {showProfileMenu && (
                            <div className="v-profile-dropdown" style={{
                                position: 'absolute', top: '120%', right: '0', 
                                backgroundColor: '#2b2d3c', borderRadius: '8px', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                minWidth: '150px', zIndex: 100, overflow: 'hidden'
                            }}>
                                <div className="v-dropdown-item" style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Profile</div>
                                <div className="v-dropdown-item" onClick={handleLogout} style={{ padding: '12px 16px', cursor: 'pointer', color: '#ff5e5e' }}>Logout</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="v-dashboard-content">
                {/* Left Sidebar - Open Cases */}
                <aside className="v-left-sidebar">
                    {resolveMsg && (
                        <div style={{ backgroundColor: 'rgba(0, 204, 106, 0.1)', color: '#00cc6a', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(0, 204, 106, 0.2)' }}>
                            {resolveMsg}
                        </div>
                    )}
                    <div className="v-sidebar-header">
                        <h2>{activeTab === 'My rescues' ? 'MY ASSIGNED CASES' : 'OPEN CASES NEARBY'}</h2>
                        <span className="v-active-count">{filteredCases.length} {activeTab === 'My rescues' ? 'assigned' : 'active'}</span>
                    </div>
                    
                    <div className="v-filters">
                        <div className="v-filter-group main">
                            <button className={`v-filter-btn ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
                            <button className={`v-filter-btn ${activeFilter === 'Critical' ? 'active' : ''}`} onClick={() => setActiveFilter('Critical')}>Critical</button>
                            <button className={`v-filter-btn ${activeFilter === 'Dog' ? 'active' : ''}`} onClick={() => setActiveFilter('Dog')}>Dog</button>
                            <button className={`v-filter-btn ${activeFilter === 'Cat' ? 'active' : ''}`} onClick={() => setActiveFilter('Cat')}>Cat</button>
                        </div>
                        <button className="v-filter-btn round">&lt; 2km</button>
                    </div>

                    <div className="v-cases-list">
                        {filteredCases.length === 0 ? (
                            <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>No active cases matching your filter.</p>
                        ) : (
                            filteredCases.map((caseItem) => (
                                <div key={caseItem._id} className="v-case-card">
                                   <div className="v-card-header">
                                       <span className={`v-severity ${caseItem.severity || 'moderate'}`}>
                                           {(caseItem.severity || 'moderate').toUpperCase()}
                                       </span>
                                       <span className="v-case-id">{caseItem.caseId}</span>
                                   </div>
                                   <h3 className="v-case-title" style={{textTransform: 'capitalize'}}>
                                       {caseItem.animalType} — {caseItem.description ? (caseItem.description.length > 25 ? caseItem.description.substring(0, 25) + '...' : caseItem.description) : `${caseItem.severity} injury`}
                                   </h3>
                                   <p className="v-case-location">
                                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                       {caseItem.address || 'Address info pending'}
                                    </p>
                                   <div className="v-case-meta">
                                       <span className="v-distance">2.1 km away</span>
                                       <span className="v-time">{getTimeAgo(caseItem.createdAt)}</span>
                                   </div>
                                   <div className="v-card-actions">
                                       {activeTab === 'Dashboard' ? (
                                           <>
                                               <button className="v-btn-primary" onClick={() => handleAcceptRescue(caseItem._id)}>Accept rescue</button>
                                               <button className="v-btn-secondary">Pass</button>
                                           </>
                                       ) : activeTab === 'My rescues' ? (
                                           caseItem.status !== 'closed' ? (
                                               <button className="v-btn-primary" style={{backgroundColor: '#00cc6a', color: '#fff'}} onClick={() => handleResolveCase(caseItem._id)}>Mark as Resolved</button>
                                           ) : (
                                               <button className="v-btn-secondary" disabled>Resolved</button>
                                           )
                                       ) : null}
                                   </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Center Map Area */}
                <section className="v-map-area">
                    {/* Top Stats */}
                    <div className="v-top-stats-row">
                        <div className="v-stat-card">
                            <h2 className="v-stat-value orange">{user ? user.rescueCount : 11}</h2>
                            <p className="v-stat-label">Total rescues</p>
                        </div>
                        <div className="v-stat-card">
                            <h2 className="v-stat-value green">94%</h2>
                            <p className="v-stat-label">Acceptance rate</p>
                        </div>
                        <div className="v-stat-card">
                            <h2 className="v-stat-value blue">7.2m</h2>
                            <p className="v-stat-label">Avg response time</p>
                        </div>
                        <div className="v-stat-card">
                            <h2 className="v-stat-value purple" style={{textTransform: 'capitalize'}}>{user && user.badge !== 'none' ? user.badge : 'No Badge'}</h2>
                            <p className="v-stat-label">Current badge</p>
                        </div>
                    </div>

                    <div className="v-map-container">
                        {/* Map Grid Background */}
                        <div className="v-map-grid"></div>
                        
                        {/* City labels (decorative) */}
                        <span className="v-map-label" style={{ top: '25%', left: '15%' }}>Adyar</span>
                        <span className="v-map-label" style={{ top: '55%', left: '42%' }}>Guindy</span>
                        <span className="v-map-label" style={{ top: '65%', left: '60%' }}>Velachery</span>
                        <span className="v-map-label" style={{ top: '78%', left: '20%' }}>Besant Nagar</span>
                        
                        {/* Map controls */}
                        <div className="v-map-controls">
                            <button className="v-map-control-btn">+</button>
                            <button className="v-map-control-btn">-</button>
                            <button className="v-map-control-btn target-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Map Markers */}
                        {/* Self Location */}
                        <div className="v-marker-container self" style={{ top: '58%', left: '45%' }}>
                            <div className="v-marker self-pulse"></div>
                        </div>

                        {filteredCases.map((c) => {
                            let hash = 0;
                            const idStr = c._id || 'default_case_id';
                            for (let i = 0; i < idStr.length; i++) {
                                hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
                            }
                            const top = 15 + Math.abs(hash % 70);
                            const left = 10 + Math.abs((hash >> 3) % 80);
                            
                            let severityClass = c.severity || 'moderate';
                            if (c.status === 'closed' || c.status === 'resolved') {
                                severityClass = 'mild';
                            }
                            const isCritical = severityClass === 'critical';

                            return (
                                <div key={c._id} className="v-marker-container" style={{ top: `${top}%`, left: `${left}%` }}>
                                    <div className={`v-marker ${severityClass}`}>
                                        {isCritical ? '!' : ''}
                                    </div>
                                    <div className="v-marker-label" style={{textTransform: 'capitalize'}}>{c.caseId} - {c.animalType}</div>
                                </div>
                            );
                        })}

                        {/* Map Legend */}
                        <div className="v-map-legend">
                            <h4>MAP LEGEND</h4>
                            <ul>
                                <li><span className="v-legend-dot critical"></span> Critical case</li>
                                <li><span className="v-legend-dot moderate"></span> Moderate case</li>
                                <li><span className="v-legend-dot mild"></span> Mild / resolved</li>
                                <li><span className="v-legend-dot orange"></span> Your location</li>
                            </ul>
                        </div>

                        {/* Active Rescue Widget */}
                        {myRescues && myRescues.length > 0 && (
                            <div className="v-active-rescue-widget">
                                <div className="v-widget-header">
                                    <span className="v-widget-badge">ACTIVE RESCUE</span>
                                </div>
                                <h3 style={{textTransform: 'capitalize'}}>{myRescues[0].caseId} • {myRescues[0].animalType}</h3>
                                <p className="v-widget-sub" style={{textTransform: 'capitalize'}}>
                                    {myRescues[0].area || myRescues[0].city || myRescues[0].address || 'En route to location'} - ETA 4 minutes
                                </p>
                                <div className="v-progress-container">
                                    <div className="v-progress-labels">
                                        <span>En route</span>
                                        <span>65% complete</span>
                                    </div>
                                    <div className="v-progress-bar">
                                        <div className="v-progress-fill" style={{width: '65%'}}></div>
                                    </div>
                                </div>
                                <button 
                                    className="v-btn-primary full-width v-update-btn"
                                    onClick={() => handleResolveCase(myRescues[0]._id)}
                                >
                                    Mark as Resolved &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Sidebar - Profile */}
                <aside className="v-right-sidebar">
                    <div className="v-profile-section">
                        <div className="v-profile-header">
                            <div className="v-profile-avatar-large">{user ? user.name.charAt(0).toUpperCase() : 'K'}</div>
                            <div className="v-profile-info">
                                <h2 style={{textTransform: 'capitalize'}}>{user ? user.name : 'Karthik Rajan'}</h2>
                                <p style={{textTransform: 'capitalize'}}>{user ? user.district : 'Chennai North - Adyar ward'}</p>
                            </div>
                        </div>
                        <div className="v-skills-tags">
                            {user && user.skills && user.skills.length > 0 ? (
                                user.skills.map(skill => (
                                    <span key={skill} className="v-tag" style={{textTransform: 'capitalize'}}>{skill.replace('-', ' ')}</span>
                                ))
                            ) : (
                                <>
                                    <span className="v-tag">Two-wheeler</span>
                                    <span className="v-tag">First aid</span>
                                    <span className="v-tag">Tamil</span>
                                    <span className="v-tag">Large animals</span>
                                </>
                            )}
                        </div>
                        <div className="v-profile-stats">
                            <div className="v-p-stat">
                                <h3>{user ? user.rescueCount : 47}</h3>
                                <p>Total rescues</p>
                            </div>
                            <div className="v-p-stat">
                                <h3>{user ? user.credits || 0 : 0}</h3>
                                <p>Credits earned</p>
                            </div>
                            <div className="v-p-stat">
                                <h3>4.9</h3>
                                <p>Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="v-right-divider"></div>

                    <div className="v-badges-section">
                        <div className="v-section-title">YOUR BADGES</div>
                        <div className="v-badges-list">
                            <div className={`v-badge-item ${user && user.badge === 'bronze' ? 'active' : ''}`}>
                                <div className="v-badge-icon bronze">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cd7f32" strokeWidth="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                                </div>
                                {user && user.badge === 'bronze' ? <span className="v-active-text">Bronze &check;</span> : <span>Bronze</span>}
                            </div>
                            <div className={`v-badge-item ${user && user.badge === 'silver' ? 'active' : (user && (user.badge === 'bronze' || user.badge === 'none') ? 'locked' : '')}`}>
                                <div className="v-badge-icon silver">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                                </div>
                                {user && user.badge === 'silver' ? <span className="v-active-text">Silver &check;</span> : <span>Silver <small>(up to 399)</small></span>}
                            </div>
                            <div className={`v-badge-item ${user && user.badge === 'gold' ? 'active' : (user && user.badge !== 'gold' ? 'locked' : '')}`}>
                                <div className="v-badge-icon gold">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                                </div>
                                {user && user.badge === 'gold' ? <span className="v-active-text">Gold &check;</span> : <span>Gold <small>(400+)</small></span>}
                            </div>
                            <div className="v-badge-item locked">
                                <div className="v-badge-icon diamond">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b9f2ff" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>
                                </div>
                                <span>Diamond</span>
                            </div>
                        </div>
                    </div>

                    <div className="v-right-divider"></div>

                    <div className="v-recent-rescues">
                        <div className="v-section-title">RECENT RESCUES</div>
                        <div className="v-rescue-timeline">
                            {myRescues && myRescues.length > 0 ? (
                                myRescues.slice(0, 3).map((rescue, index) => {
                                    const dotColor = rescue.status === 'treated' ? 'green' : 
                                                     rescue.status === 'adopted' ? 'blue' : 
                                                     rescue.status === 'assigned' ? 'orange' : 'orange';
                                    return (
                                        <div key={rescue._id || index} className="v-timeline-item">
                                            <div className={`v-timeline-dot ${dotColor}`}></div>
                                            <div className="v-timeline-content">
                                                <h4 style={{textTransform: 'capitalize'}}>{rescue.animalType || 'Animal'} — {rescue.address ? rescue.address.split(',')[0] : 'Location pending'}</h4>
                                                <p>{getTimeAgo(rescue.createdAt)} &middot; {rescue.caseId}</p>
                                                <span className={`v-status-tag ${dotColor}`} style={{textTransform: 'capitalize'}}>{rescue.status}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{color: '#999', fontSize: '0.9rem'}}>No recent rescues completed yet.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default UyirVolunteer;
