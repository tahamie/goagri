import React, { useState } from 'react';
import { loginUser } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('ali@goagri.pk');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error logging in. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="login-screen">
      <div className="login-bg-glow1"></div>
      <div className="login-bg-glow2"></div>

      <div className="logincard">
        <div className="logo">GA</div>
        <h2>Welcome to GoAgri</h2>
        <p>Digital Financing Platform · Staff Portal</p>

        {error && (
          <div className="login-error-alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email Address</label>
            <div className="inp">
              <input 
                type="email" 
                required 
                placeholder="officer@goagri.pk"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="inp" style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Authenticating...' : 'Sign in to Staff Portal →'}
          </button>
        </form>

        <div className="demo-accounts-box">
          <div className="demo-title">Quick Demo Sign In (Phase-1 Accounts):</div>
          <div className="demo-chips">
            <button type="button" className={`demo-chip ${email === 'ali@goagri.pk' ? 'active' : ''}`} onClick={() => setDemoAccount('ali@goagri.pk', 'Password123!')}>
              <span className="role ops">Ops</span> Ali (Officer)
            </button>
            <button type="button" className={`demo-chip ${email === 'bilal@goagri.pk' ? 'active' : ''}`} onClick={() => setDemoAccount('bilal@goagri.pk', 'Password123!')}>
              <span className="role sup">Sup</span> Bilal (Supervisor)
            </button>
            <button type="button" className={`demo-chip ${email === 'admin@goagri.pk' ? 'active' : ''}`} onClick={() => setDemoAccount('admin@goagri.pk', 'Admin123!')}>
              <span className="role admin">Admin</span> System Admin
            </button>
          </div>
        </div>

        <div className="login-footer-note">
          Secured with JWT authentication &amp; bcrypt encryption
        </div>
      </div>
    </div>
  );
}
