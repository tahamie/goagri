import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import ApplicationsList from './views/ApplicationsList';
import NewFarmer from './views/NewFarmer';
import WorkflowView from './views/WorkflowView';
import BusinessRules from './views/BusinessRules';
import RateTable from './views/RateTable';
import BanksManager from './views/BanksManager';
import UsersManager from './views/UsersManager';
import { fetchMe } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedAppId, setSelectedAppId] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('goagri_token');
    if (token) {
      fetchMe().then(res => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
        } else {
          handleLogout();
        }
      }).catch(() => handleLogout())
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('goagri_token', token);
    localStorage.setItem('goagri_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('goagri_token');
    localStorage.removeItem('goagri_user');
    setCurrentUser(null);
  };

  const handleOpenApp = (id) => {
    setSelectedAppId(id);
    setActiveScreen('workflow');
  };

  if (checkingAuth) {
    return (
      <div className="login-screen">
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
          Verifying security credentials...
        </div>
      </div>
    );
  }

  // Force Login screen if unauthenticated
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const getBreadcrumb = () => {
    const labels = {
      dashboard: 'Dashboard',
      applications: 'Applications',
      register: 'New Farmer',
      workflow: `Application Workflow (APP-104${selectedAppId || 2})`,
      rules: 'Business Rules Engine',
      rates: 'Crop Rate Table',
      users: 'Users & Roles',
      banks: 'Participating Banks'
    };
    return labels[activeScreen] || 'Dashboard';
  };

  const getRoleLabel = (role) => {
    if (role === 'ops_officer') return 'Ops Officer';
    if (role === 'supervisor') return 'Supervisor';
    if (role === 'admin') return 'Admin';
    return role;
  };

  const getRoleClass = (role) => {
    if (role === 'ops_officer') return 'ops';
    if (role === 'supervisor') return 'sup';
    if (role === 'admin') return 'admin';
    return 'ops';
  };

  return (
    <div className="app">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">GA</div>
          <div>
            <div className="name">GoAgri</div>
            <div className="sub">Farmer Onboarding · Staff Portal</div>
          </div>
        </div>

        <div className="navgroup">
          <div className="lbl">Main</div>
          <button className={`navbtn ${activeScreen === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveScreen('dashboard')}>
            <span className="n">◧</span> Dashboard
          </button>
          <button className={`navbtn ${activeScreen === 'applications' ? 'active' : ''}`} onClick={() => setActiveScreen('applications')}>
            <span className="n">≡</span> Applications
          </button>
          <button className={`navbtn ${activeScreen === 'register' ? 'active' : ''}`} onClick={() => setActiveScreen('register')}>
            <span className="n">＋</span> New Farmer
          </button>
        </div>

        <div className="navgroup">
          <div className="lbl">Application Workflow</div>
          <button className={`navbtn ${activeScreen === 'workflow' ? 'active' : ''}`} onClick={() => setActiveScreen('workflow')}>
            <span className="n">10</span> 10-Step Workflow
          </button>
        </div>

        {currentUser.role === 'admin' && (
          <div className="navgroup">
            <div className="lbl">Admin</div>
            <button className={`navbtn ${activeScreen === 'rules' ? 'active' : ''}`} onClick={() => setActiveScreen('rules')}>
              <span className="n">ƒ</span> Business Rules
            </button>
            <button className={`navbtn ${activeScreen === 'rates' ? 'active' : ''}`} onClick={() => setActiveScreen('rates')}>
              <span className="n">₨</span> Rate Table
            </button>
            <button className={`navbtn ${activeScreen === 'users' ? 'active' : ''}`} onClick={() => setActiveScreen('users')}>
              <span className="n">◔</span> Users &amp; Roles
            </button>
            <button className={`navbtn ${activeScreen === 'banks' ? 'active' : ''}`} onClick={() => setActiveScreen('banks')}>
              <span className="n">▤</span> Participating Banks
            </button>
          </div>
        )}

        <div className="sidefoot">
          Logged in as <b>{currentUser.full_name}</b><br />
          GoAgri v1.0 · Phase-1
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main">
        <div className="topbar">
          <div className="crumb"><b>{getBreadcrumb()}</b></div>
          <div className="topright">
            <div className="tsearch">
              🔍 <input type="text" placeholder="Search farmer, CNIC or App ID" />
            </div>
            <div className="bell">🔔</div>
            <span className="wftag">Live System</span>
            
            <div className="rolechip" title="Click to log out" onClick={handleLogout}>
              <span className="av">{currentUser.avatar_initials || 'GA'}</span>
              {currentUser.full_name} · <span className={`role ${getRoleClass(currentUser.role)}`}>{getRoleLabel(currentUser.role)}</span>
            </div>

            <button className="btn ghost sm" onClick={handleLogout} style={{ color: 'var(--red)' }}>
              Log out 🚪
            </button>
          </div>
        </div>

        <div className="canvas">
          {activeScreen === 'dashboard' && <Dashboard onNavigate={setActiveScreen} onOpenApp={handleOpenApp} />}
          {activeScreen === 'applications' && <ApplicationsList onNavigate={setActiveScreen} onOpenApp={handleOpenApp} />}
          {activeScreen === 'register' && <NewFarmer onNavigate={setActiveScreen} onOpenApp={handleOpenApp} />}
          {activeScreen === 'workflow' && <WorkflowView appId={selectedAppId} currentUser={currentUser} onNavigate={setActiveScreen} />}
          {activeScreen === 'rules' && <BusinessRules />}
          {activeScreen === 'rates' && <RateTable />}
          {activeScreen === 'users' && <UsersManager />}
          {activeScreen === 'banks' && <BanksManager />}
        </div>
      </div>
    </div>
  );
}
