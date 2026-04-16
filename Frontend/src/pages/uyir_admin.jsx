import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './uyir_admin.css';

const UyirAdmin = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [adminData, setAdminData] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/Home');
    };
    
    // Data states
    const [reports, setReports] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [vetClinics, setVetClinics] = useState([]);
    const [drives, setDrives] = useState([]);
    const [adoptions, setAdoptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser');
        if (!storedAdmin) {
            navigate('/AdminLogin');
            return;
        }
        try {
            const parsedAdmin = JSON.parse(storedAdmin);
            if (parsedAdmin.role !== 'admin') {
                navigate('/AdminLogin');
                return;
            }
            setAdminData(parsedAdmin);
        } catch (e) {
            navigate('/AdminLogin');
            return;
        }
        
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [repRes, volRes, vetRes, drvRes, adopRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/reports'),
                    axios.get('http://localhost:5000/api/admin/volunteers'),
                    axios.get('http://localhost:5000/api/admin/vetclinics'),
                    axios.get('http://localhost:5000/api/admin/drives'),
                    axios.get('http://localhost:5000/api/admin/adoptions')
                ]);
                setReports(repRes.data.data || []);
                setVolunteers(volRes.data.data || []);
                setVetClinics(vetRes.data.data || []);
                setDrives(drvRes.data.data || []);
                setAdoptions(adopRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch admin data', err);
            }
            setLoading(false);
        };
        
        fetchAllData();
    }, []);

    // --- DASHBOARD MATH AGGREGATIONS ---
    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };

    const isThisWeek = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - d) / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
    };

    const formatTimeDelta = (dateStr) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hrs}h ${mins}m`;
    };

    const stringToHash = (str) => { 
        let hash = 0; 
        if (!str) return hash;
        for (let i = 0; i < str.length; i++) { 
            hash = str.charCodeAt(i) + ((hash << 5) - hash); 
        } 
        return Math.abs(hash); 
    };

    const getMapPosition = (idStr) => {
        const h = stringToHash(idStr.toString());
        const top = 15 + (h % 70); // bounds 15%-85%
        const left = 15 + ((h >> 3) % 70);
        return { top: `${top}%`, left: `${left}%` };
    };

    // Derived State
    const totalCasesToday = reports.filter(r => isToday(r.createdAt)).length;
    const resolvedThisWeek = reports.filter(r => (r.status === 'resolved' || r.status === 'closed') && isThisWeek(r.resolvedAt || r.updatedAt)).length;
    
    // Escalations logic (> 2hrs & open)
    const escalatedReports = reports.filter(r => {
        if (r.status !== 'open') return false;
        return (Date.now() - new Date(r.createdAt).getTime()) > 2 * 60 * 60 * 1000;
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Stats
    const totalCapacity = vetClinics.reduce((acc, cv) => acc + (cv.capacity || 5), 0);
    const activeTreatments = vetClinics.length > 0 ? Math.floor(totalCapacity * 0.68) : 0; // Mock current occupancy

    // Ward Chart Data
    const wardGroups = {};
    reports.forEach(r => {
        const w = r.city || r.area || 'Unknown';
        wardGroups[w] = (wardGroups[w] || 0) + 1;
    });
    const sortedWards = Object.keys(wardGroups).map(k => ({ label: k, value: wardGroups[k] })).sort((a,b) => b.value - a.value).slice(0, 4);
    const maxWardValue = sortedWards.length > 0 ? sortedWards[0].value : 1;

    const renderDataTable = () => {
        if (loading) return <div className="a-loader">Loading...</div>;

        switch (activeMenu) {
            case 'All reports':
                return (
                    <div className="a-data-table-container">
                        <h2>System Reports</h2>
                        <table className="a-data-table">
                            <thead>
                                <tr>
                                    <th>Case ID</th>
                                    <th>Animal</th>
                                    <th>Severity</th>
                                    <th>City/Area</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? <tr><td colSpan="6">No reports found</td></tr> : null}
                                {reports.map(r => (
                                    <tr key={r._id}>
                                        <td>{r.caseId || r._id.substring(0,8)}</td>
                                        <td style={{textTransform: 'capitalize'}}>{r.animalType}</td>
                                        <td><span className={`a-badge ${r.severity}`}>{r.severity}</span></td>
                                        <td>{r.city || r.area || 'Unknown'}</td>
                                        <td><span className={`a-badge status-${r.status}`}>{r.status}</span></td>
                                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Volunteers':
                return (
                    <div className="a-data-table-container">
                        <h2>Registered Volunteers</h2>
                        <table className="a-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>District</th>
                                    <th>Rescues</th>
                                    <th>Credits</th>
                                    <th>Badge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {volunteers.length === 0 ? <tr><td colSpan="6">No volunteers found</td></tr> : null}
                                {volunteers.map(v => (
                                    <tr key={v._id}>
                                        <td>{v.name}</td>
                                        <td>{v.phone}</td>
                                        <td>{v.district || 'Any'}</td>
                                        <td>{v.rescueCount || 0}</td>
                                        <td>{v.credits || 0}</td>
                                        <td><span className={`a-badge badge-${v.badge}`}>{v.badge || 'none'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Vet clinics':
                return (
                    <div className="a-data-table-container">
                        <h2>Vet Clinics Network</h2>
                        <table className="a-data-table">
                            <thead>
                                <tr>
                                    <th>Clinic Name</th>
                                    <th>Phone</th>
                                    <th>Capacity</th>
                                    <th>Specializations</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vetClinics.length === 0 ? <tr><td colSpan="5">No clinics found</td></tr> : null}
                                {vetClinics.map(vc => (
                                    <tr key={vc._id}>
                                        <td>{vc.name}</td>
                                        <td>{vc.phone}</td>
                                        <td>{vc.capacity || 5} beds</td>
                                        <td>{(vc.specializations || []).join(', ') || 'General'}</td>
                                        <td><span className={vc.isActive !== false ? 'txt-green' : 'txt-red'}>{vc.isActive !== false ? 'Active' : 'Offline'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Drives & camps':
                return (
                    <div className="a-data-table-container">
                        <h2>Scheduled Drives</h2>
                        <table className="a-data-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>District - Ward</th>
                                    <th>Date</th>
                                    <th>Target Animals</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drives.length === 0 ? <tr><td colSpan="5">No drives scheduled</td></tr> : null}
                                {drives.map(d => (
                                    <tr key={d._id}>
                                        <td style={{textTransform: 'capitalize'}}>{d.type}</td>
                                        <td>{d.district} - {d.ward}</td>
                                        <td>{new Date(d.scheduledDate).toLocaleDateString()}</td>
                                        <td>{d.actualCount} / {d.targetCount || 'TBD'}</td>
                                        <td><span className={`a-badge drive-${d.status}`}>{d.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Adoption board':
                return (
                    <div className="a-data-table-container">
                        <h2>Adoption Listings</h2>
                        <table className="a-data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adoptions.length === 0 ? <tr><td colSpan="2">No adoptions currently listed</td></tr> : null}
                                {adoptions.map(a => (
                                    <tr key={a._id}>
                                        <td>{a._id}</td>
                                        <td>Info pending schema</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return (
                    <div className="a-data-table-container">
                        <h2>{activeMenu}</h2>
                        <p style={{color: '#94a3b8', marginTop: '10px'}}>Module is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="admin-dashboard">
            {/* TOP NAVIGATION */}
            <header className="a-top-nav">
                <div className="a-logo-section">
                    <div className="a-logo-icon">U</div>
                    <div className="a-logo-text">
                        <Link to="/Home" style={{textDecoration: 'none'}}>
                            <h1 className="a-brand-name">Uyir</h1>
                            <p className="a-brand-subtitle">Admin Control Center</p>
                        </Link>
                    </div>
                </div>
                
                <nav className="a-nav-links">
                    <span 
                        className={`a-nav-link ${activeMenu === 'Dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('Dashboard')}
                        style={{cursor: 'pointer'}}
                    >Overview</span>
                    <Link to="/Home" className="a-nav-link" style={{textDecoration: 'none'}}>Home</Link>
                    <span 
                        className={`a-nav-link ${activeMenu === 'Volunteers' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('Volunteers')}
                        style={{cursor: 'pointer'}}
                    >Volunteers</span>
                    <span 
                        className={`a-nav-link ${activeMenu === 'Vet Clinics' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('Vet Clinics')}
                        style={{cursor: 'pointer'}}
                    >Vet Clinics</span>
                    <span 
                        className={`a-nav-link ${activeMenu === 'Drives' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('Drives')}
                        style={{cursor: 'pointer'}}
                    >Drives</span>
                    <span 
                        className={`a-nav-link ${activeMenu === 'Analytics' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('Analytics')}
                        style={{cursor: 'pointer'}}
                    >Analytics</span>
                </nav>
                
                <div className="a-user-controls">
                    <div className="a-search-container">
                       <span className="a-search-icon">🔍</span>
                       <input type="text" placeholder="Search cases..." className="a-search-input" />
                    </div>
                    <button className="a-notification-btn">
                       🔔
                       <span className="a-notification-badge">{escalatedReports.length}</span>
                    </button>
                    <button className="a-export-btn">Export CSV</button>
                    <div style={{ position: 'relative' }}>
                        <div 
                            className="a-profile-icon" 
                            title={adminData?.name || 'Admin'}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{ cursor: 'pointer' }}
                        >
                            {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        
                        {showProfileMenu && (
                            <div className="a-profile-dropdown">
                                <div className="a-dropdown-item">Admin Profile</div>
                                <div className="a-dropdown-item red" onClick={handleLogout}>Logout Session</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="a-main-layout">
                {/* LEFT SIDEBAR */}
                <aside className="a-left-sidebar">
                    <div className="a-sidebar-group">
                        <div className="a-sidebar-title">OVERVIEW</div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Dashboard')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">⊞</span> Dashboard
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Live map' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Live map')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">📍</span> Live map
                        </div>
                    </div>

                    <div className="a-sidebar-group">
                        <div className="a-sidebar-title">MANAGEMENT</div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'All reports' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('All reports')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">📄</span> All reports
                            <span className="a-link-badge red">{reports.length}</span>
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Volunteers' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Volunteers')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">👥</span> Volunteers
                            <span className="a-link-badge blue">{volunteers.length}</span>
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Vet clinics' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Vet clinics')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">🏥</span> Vet clinics
                            <span className="a-link-badge green">{vetClinics.length}</span>
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Drives & camps' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Drives & camps')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">📅</span> Drives & camps
                            <span className="a-link-badge purple">{drives.length}</span>
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Adoption board' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Adoption board')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">💛</span> Adoption board
                            <span className="a-link-badge yellow">{adoptions.length}</span>
                        </div>
                    </div>

                    <div className="a-sidebar-group">
                        <div className="a-sidebar-title">SYSTEM</div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Settings' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Settings')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">⚙️</span> Settings
                        </div>
                        <div 
                            className={`a-sidebar-link ${activeMenu === 'Analytics' ? 'active' : ''}`}
                            onClick={() => setActiveMenu('Analytics')}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="a-link-icon">📈</span> Analytics
                        </div>
                    </div>
                </aside>

                {/* CONTENT AREA */}
                <main className="a-content-area">
                    {activeMenu === 'Dashboard' ? (
                        <>
                            {/* STATS ROW */}
                            <div className="a-stats-grid">
                                <div className="a-stat-card border-green">
                                    <p className="a-stat-title">Total cases today</p>
                                    <h2 className="a-stat-value text-green">{totalCasesToday}</h2>
                                    <p className="a-stat-trend text-green">LIVE TRACKING</p>
                                </div>
                                <div className="a-stat-card border-red">
                                    <p className="a-stat-title">Escalations (2hr+)</p>
                                    <h2 className="a-stat-value text-red">{escalatedReports.length}</h2>
                                    <p className="a-stat-trend text-red">▲ {escalatedReports.length} need action</p>
                                </div>
                                <div className="a-stat-card border-yellow">
                                    <p className="a-stat-title">Volunteers online</p>
                                    <h2 className="a-stat-value text-yellow">{volunteers.length}</h2>
                                    <p className="a-stat-trend text-green">System Total</p>
                                </div>
                                <div className="a-stat-card border-blue">
                                    <p className="a-stat-title">Vet clinic capacity</p>
                                    <h2 className="a-stat-value text-blue">{totalCapacity}</h2>
                                    <p className="a-stat-trend text-gray">{activeTreatments} animals in treatment</p>
                                </div>
                                <div className="a-stat-card border-green">
                                    <p className="a-stat-title">Resolved this week</p>
                                    <h2 className="a-stat-value text-green">{resolvedThisWeek}</h2>
                                    <p className="a-stat-trend text-green">7-day resolution window</p>
                                </div>
                            </div>

                            {/* TWO COLUMNS */}
                            <div className="a-dashboard-columns">
                                {/* LEFT COL - ESCALATIONS */}
                                <div className="a-col a-col-left">
                                    <div className="a-panel">
                                        <div className="a-panel-header">
                                            <div>
                                                <h3 className="a-panel-title"><span className="a-dot red pulse"></span> Escalation alerts</h3>
                                                <p className="a-panel-sub">Cases open &gt; 2 hours with no volunteer</p>
                                            </div>
                                            <button className="a-btn-outline-green">Assign all</button>
                                        </div>
                                        <div className="a-escalation-list">
                                            {escalatedReports.length === 0 ? (
                                                <p style={{color: '#94a3b8', padding: '20px'}}>No pending escalations found. All systems normal.</p>
                                            ) : null}
                                            {escalatedReports.slice(0, 4).map(r => (
                                                <div className="a-alert-item" key={r._id}>
                                                    <div className="a-alert-icon red-box">⚠️</div>
                                                    <div className="a-alert-content">
                                                        <h4>{r.caseId || r._id.substring(0,8)} - <span style={{textTransform: 'capitalize'}}>{r.animalType}</span> — {r.city || r.area || 'Unknown'}</h4>
                                                        <p className="a-alert-meta" style={{textTransform: 'capitalize'}}>{r.severity} · {r.status} · Reported {formatTimeDelta(r.createdAt)} ago</p>
                                                        <p className="a-alert-timer red-text">⏳ {formatTimeDelta(r.createdAt)} overdue</p>
                                                    </div>
                                                    <div className="a-alert-actions">
                                                        <button className="a-btn-small blue">Assign</button>
                                                        <button className="a-btn-small yellow">Escalate</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COL - MAP & CHARTS */}
                                <div className="a-col a-col-right">
                                    <div className="a-panel">
                                        <div className="a-panel-header">
                                            <div>
                                                <h3 className="a-panel-title">Live incident map — System Grid</h3>
                                                <p className="a-panel-sub">Real-time active case distribution</p>
                                            </div>
                                            <button className="a-btn-outline-green">Full map</button>
                                        </div>
                                        <div className="a-map-preview">
                                            <div className="a-map-grid-bg"></div>
                                            
                                            {reports.filter(r => r.status === 'open' || r.status === 'assigned').map(r => {
                                                const pos = getMapPosition(r._id);
                                                let colorClass = 'green';
                                                let colorHex = 'var(--color-green)';
                                                if (r.severity === 'critical') { colorClass = 'red'; colorHex = 'var(--color-red)'; }
                                                if (r.severity === 'moderate') { colorClass = 'yellow'; colorHex = 'var(--color-yellow)'; }

                                                return (
                                                    <div className={`a-map-marker ${colorClass}`} style={pos} key={`map-${r._id}`} title={`${r.animalType} - ${r.city}`}>
                                                        {r.severity === 'critical' ? <div className="a-pulse-ring"></div> : null}
                                                        <span style={{
                                                            position: 'absolute', 
                                                            top: '10px', 
                                                            left: '10px', 
                                                            fontSize: '9px',
                                                            color: colorHex,
                                                            whiteSpace: 'nowrap',
                                                            fontWeight: 'bold',
                                                            background: 'rgba(0,0,0,0.4)',
                                                            padding: '2px 4px',
                                                            borderRadius: '2px'
                                                        }}>{r.caseId || r._id.substring(0,4)}</span>
                                                    </div>
                                                );
                                            })}

                                            <div className="a-map-legend-small">
                                                <span><span className="a-dot red"></span> Critical</span>
                                                <span><span className="a-dot yellow"></span> Moderate</span>
                                                <span><span className="a-dot green"></span> Mild</span>
                                            </div>
                                        </div>

                                        <div className="a-chart-section">
                                            <h4 className="a-chart-title">Cases by Region (All Time)</h4>
                                            
                                            {sortedWards.length === 0 ? (
                                                 <p style={{color: '#94a3b8', fontSize: '12px'}}>No geographical data recorded.</p>
                                            ) : null}

                                            {sortedWards.map((w, index) => {
                                                 const percentage = Math.max(10, Math.floor((w.value / maxWardValue) * 100));
                                                 const colors = ['red', 'yellow', 'green', 'blue'];
                                                 return (
                                                    <div className="a-bar-row" key={w.label}>
                                                        <span className="a-bar-label">{w.label}</span>
                                                        <div className="a-bar-track">
                                                             <div className={`a-bar-fill ${colors[index % colors.length]}`} style={{width: `${percentage}%`}}></div>
                                                        </div>
                                                        <span className="a-bar-value">{w.value}</span>
                                                    </div>
                                                 );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        renderDataTable()
                    )}
                </main>
            </div>
        </div>
    );
};

export default UyirAdmin;
