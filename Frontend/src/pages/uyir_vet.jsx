import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './uyir_vet.css';

const UyirVet = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [stats, setStats] = useState({
        capacity: 10, animalsInClinic: 8, incomingToday: 3, underTreatment: 5, recoveredThisWeek: 22, adoptionReady: 5
    });
    const [incomingHandovers, setIncomingHandovers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/vet/dashboard');
                if (res.data.success) {
                    setStats(res.data.data.stats);
                    
                    // Fallback to mockup data if database is totally empty, else use DB data
                    if (res.data.data.incoming.length > 0) {
                        setIncomingHandovers(res.data.data.incoming);
                    } else {
                        // Mock injection (per implementation plan discussion) to display UI format
                        setIncomingHandovers([
                            {
                                _id: 'mock1',
                                caseId: 'UYR-118',
                                animalType: 'dog',
                                severity: 'critical',
                                description: 'Left hind leg fracture, bleeding from flank. Cannot walk. Photo sent by citizen.',
                                customTitle: 'Injured dog — hit by vehicle',
                                assignedTo: { name: 'Karthik R.', phone: '9876543210' },
                                eta: '4 min',
                                reportedTime: '2:14 PM',
                                etaColor: 'red'
                            },
                            {
                                _id: 'mock2',
                                caseId: 'UYR-116',
                                animalType: 'cat',
                                severity: 'moderate',
                                description: 'Young kitten, estimated 4-6 weeks. Dehydrated, no visible external injury. Needs IV fluids.',
                                customTitle: 'Kitten — trapped, malnourished',
                                assignedTo: { name: 'Meena V.', phone: '9123456780' },
                                eta: '12 min',
                                reportedTime: '1:50 PM',
                                etaColor: 'yellow'
                            },
                            {
                                _id: 'mock3',
                                caseId: 'UYR-115',
                                animalType: 'bird',
                                severity: 'mild',
                                description: 'found on sidewalk, cannot fly.',
                                customTitle: 'Injured bird — wing fracture',
                                assignedTo: { name: 'Ravi S.', phone: '9988776655' },
                                eta: '28 min',
                                reportedTime: '1:20 PM',
                                etaColor: 'green'
                            }
                        ]);
                    }
                }
            } catch (err) {
                console.error("Error fetching vet dashboard", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <div className="v-dashboard">
            {/* HEADER */}
            <header className="v-header">
                <div className="v-brand">
                    <div className="v-logo">U</div>
                    <Link to="/Home" style={{textDecoration: 'none'}}>
                        <div className="v-brand-text">
                            <h1 style={{ color: 'var(--vet-text-primary)' }}>Uyir</h1>
                            <p>Vet Clinic Portal</p>
                        </div>
                    </Link>
                </div>

                <nav className="v-top-nav">
                    <span className={`v-top-link ${activeMenu === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('Dashboard')}>Dashboard</span>
                    <span className={`v-top-link ${activeMenu === 'Incoming' ? 'active' : ''}`} onClick={() => setActiveMenu('Incoming')}>Incoming</span>
                    <span className={`v-top-link ${activeMenu === 'Treatments' ? 'active' : ''}`} onClick={() => setActiveMenu('Treatments')}>Treatments</span>
                    <span className={`v-top-link ${activeMenu === 'Records' ? 'active' : ''}`} onClick={() => setActiveMenu('Records')}>Records</span>
                    <span className={`v-top-link ${activeMenu === 'Adoption' ? 'active' : ''}`} onClick={() => setActiveMenu('Adoption')}>Adoption</span>
                    <span className={`v-top-link ${activeMenu === 'Reports' ? 'active' : ''}`} onClick={() => setActiveMenu('Reports')}>Reports</span>
                </nav>

                <div className="v-header-right">
                    <div className="v-clinic-pill">
                        <div className="v-clinic-dot"></div>
                        Blue Cross of India - Guindy
                    </div>
                    <div className="v-icon-btn">
                        🔔
                        <div className="v-icon-badge">3</div>
                    </div>
                    <button className="v-action-btn">Export report</button>
                    <div className="v-profile-icon">DR</div>
                </div>
            </header>

            <div className="v-main">
                {/* SIDEBAR */}
                <aside className="v-sidebar">
                    <div className="v-side-group">
                        <div className="v-group-title">Clinic</div>
                        <div className={`v-side-link ${activeMenu === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('Dashboard')}>
                            <span className="v-side-icon">⊞</span> Dashboard
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Incoming' ? 'active' : ''}`} onClick={() => setActiveMenu('Incoming')}>
                            <span className="v-side-icon">🩺</span> Incoming handovers
                            <span className="v-side-badge red">3</span>
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Log treatment' ? 'active' : ''}`} onClick={() => setActiveMenu('Log treatment')}>
                            <span className="v-side-icon">📋</span> Log treatment
                        </div>
                    </div>

                    <div className="v-side-group">
                        <div className="v-group-title">Animals</div>
                        <div className={`v-side-link ${activeMenu === 'Under treatment' ? 'active' : ''}`} onClick={() => setActiveMenu('Under treatment')}>
                            <span className="v-side-icon">⏱</span> Under treatment
                            <span className="v-side-badge yellow">8</span>
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Recovered' ? 'active' : ''}`} onClick={() => setActiveMenu('Recovered')}>
                            <span className="v-side-icon">✓</span> Recovered
                            <span className="v-side-badge green">12</span>
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Adoption listings' ? 'active' : ''}`} onClick={() => setActiveMenu('Adoption listings')}>
                            <span className="v-side-icon">♥</span> Adoption listings
                            <span className="v-side-badge pink">5</span>
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Vaccination records' ? 'active' : ''}`} onClick={() => setActiveMenu('Vaccination records')}>
                            <span className="v-side-icon">⚑</span> Vaccination records
                        </div>
                    </div>

                    <div className="v-side-group">
                        <div className="v-group-title">Admin</div>
                        <div className={`v-side-link ${activeMenu === 'Monthly report' ? 'active' : ''}`} onClick={() => setActiveMenu('Monthly report')}>
                            <span className="v-side-icon">📈</span> Monthly report
                        </div>
                        <div className={`v-side-link ${activeMenu === 'Clinic settings' ? 'active' : ''}`} onClick={() => setActiveMenu('Clinic settings')}>
                            <span className="v-side-icon">⚙</span> Clinic settings
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="v-content">
                    {activeMenu === 'Dashboard' ? (
                        <>
                            {/* OVERVIEW METRICS */}
                            <div className="v-overview-strip">
                                <div className="v-stat-card c-blue">
                                    <div className="v-stat-title">Animals in clinic</div>
                                    <div className="v-stat-value">{stats.animalsInClinic}</div>
                                    <div className="v-stat-sub">Capacity: {stats.capacity} slots</div>
                                </div>
                                <div className="v-stat-card c-pink">
                                    <div className="v-stat-title">Incoming today</div>
                                    <div className="v-stat-value">{stats.incomingToday}</div>
                                    <div className="v-stat-sub">2 arriving within 15 min</div>
                                </div>
                                <div className="v-stat-card c-yellow">
                                    <div className="v-stat-title">Under treatment</div>
                                    <div className="v-stat-value">{stats.underTreatment}</div>
                                    <div className="v-stat-sub">Critical: 2 · Stable: 3</div>
                                </div>
                                <div className="v-stat-card c-green">
                                    <div className="v-stat-title">Recovered this week</div>
                                    <div className="v-stat-value">{stats.recoveredThisWeek}</div>
                                    <div className="v-stat-sub">Discharge rate: 88%</div>
                                </div>
                                <div className="v-stat-card c-red">
                                    <div className="v-stat-title">Adoption ready</div>
                                    <div className="v-stat-value">{stats.adoptionReady}</div>
                                    <div className="v-stat-sub">Listed on Uyir board</div>
                                </div>
                            </div>

                            <div className="v-dashboard-split">
                                {/* LEFT SPLIT - INCOMING HANDOVERS */}
                                <div className="v-split-left">
                                    <div className="v-section-header">
                                        <div>
                                            <div className="v-section-title">
                                                <div className="v-indicator-dot"></div>
                                                Incoming handovers
                                            </div>
                                            <div className="v-section-sub">Volunteers en route — pre-arrival notification</div>
                                        </div>
                                        <button className="v-link-btn">View all</button>
                                    </div>

                                    {incomingHandovers.map((caseItem, idx) => (
                                        <div className="v-handover-card" key={idx}>
                                            <div className="v-handover-image">
                                                {caseItem.animalType === 'dog' ? '🐕' : caseItem.animalType === 'cat' ? '🐈' : '🐦'}
                                            </div>
                                            <div className="v-handover-content">
                                                <div className="v-handover-meta">{caseItem.caseId}</div>
                                                <div className="v-handover-title">{caseItem.customTitle || `${caseItem.animalType} issue`}</div>
                                                <div className="v-handover-vol">
                                                    Volunteer: {caseItem.assignedTo?.name} - 📞 {caseItem.assignedTo?.phone}
                                                </div>
                                                <div className="v-tags">
                                                    <div className="v-tag primary" style={{textTransform: 'capitalize'}}>{caseItem.animalType}</div>
                                                    <div className={`v-tag ${caseItem.severity === 'critical' ? 'danger' : caseItem.severity === 'moderate' ? 'warning' : 'success'}`} style={{textTransform: 'capitalize'}}>{caseItem.severity}</div>
                                                    <div className="v-tag info">Arriving soon</div>
                                                </div>
                                                <div className="v-handover-desc">
                                                    {caseItem.description}
                                                </div>
                                                <div className="v-handover-actions">
                                                    <button className="v-btn-primary">Accept handover</button>
                                                    <button className="v-btn-secondary">View photos</button>
                                                    {idx === 0 && <button className="v-btn-outline">Redirect to VSPCA</button>}
                                                </div>
                                            </div>
                                            
                                            <div className={`v-eta ${caseItem.etaColor || ''}`}>
                                                <div className="v-eta-time">ETA {caseItem.eta || '10 min'}</div>
                                                <div className="v-eta-sub">Reported {caseItem.reportedTime || 'Just now'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* RIGHT SPLIT - FORMS & CAPACITY */}
                                <div className="v-split-right">
                                    <div className="v-form-panel">
                                        <div className="v-section-header">
                                            <div>
                                                <div className="v-section-title">Log treatment</div>
                                                <div className="v-section-sub">UYR-118 - Injured dog — currently selected</div>
                                            </div>
                                            <button className="v-link-btn" style={{border: 'none'}}>Clear form</button>
                                        </div>

                                        <div className="v-grid-2">
                                            <div className="v-input-group">
                                                <label className="v-label">Diagnosis</label>
                                                <input type="text" className="v-input" placeholder="e.g. Left tibial fracture" />
                                            </div>
                                            <div className="v-input-group">
                                                <label className="v-label">Attending vet</label>
                                                <input type="text" className="v-input" defaultValue="Dr. Priya Anand" />
                                            </div>
                                        </div>

                                        <div className="v-grid-2">
                                            <div className="v-input-group">
                                                <label className="v-label">Medicines given</label>
                                                <input type="text" className="v-input" placeholder="e.g. Meloxicam 2mg, Amoxicillin" />
                                            </div>
                                            <div className="v-input-group">
                                                <label className="v-label">Procedure performed</label>
                                                <select className="v-input" style={{appearance: 'none'}}>
                                                    <option>Wound dressing</option>
                                                    <option>Surgery</option>
                                                    <option>Vaccination</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="v-input-group">
                                            <label className="v-label">Treatment outcome</label>
                                            <div className="v-outcome-selector">
                                                <div className="v-outcome-box active green">
                                                    <span className="v-outcome-icon">💉</span>
                                                    <span className="v-outcome-text">Vaccinated</span>
                                                </div>
                                                <div className="v-outcome-box active purple">
                                                    <span className="v-outcome-icon">✂</span>
                                                    <span className="v-outcome-text">Sterilised</span>
                                                </div>
                                                <div className="v-outcome-box active yellow">
                                                    <span className="v-outcome-icon">💊</span>
                                                    <span className="v-outcome-text">Recovering</span>
                                                </div>
                                                <div className="v-outcome-box active pink">
                                                    <span className="v-outcome-icon">🏡</span>
                                                    <span className="v-outcome-text">Adopt-ready</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="v-submit-block">Save treatment record →</button>
                                    </div>

                                    <div className="v-capacity-module">
                                        <div className="v-cap-flex">
                                            <div className="v-cap-title">Clinic capacity</div>
                                            <div className="v-cap-sub">Real-time slot usage</div>
                                        </div>

                                        <div className="v-progress-label">
                                            <span>Dogs</span>
                                            <span>4 / 5</span>
                                        </div>
                                        <div className="v-progress-track">
                                            <div className="v-progress-fill"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                            <h2 style={{color: 'var(--vet-text-secondary)'}}>{activeMenu} module is under construction.</h2>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UyirVet;
