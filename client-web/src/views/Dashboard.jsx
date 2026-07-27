import React, { useState, useEffect } from 'react';
import { fetchDashboardSummary, fetchApplications } from '../services/api';

export default function Dashboard({ onNavigate, onOpenApp }) {
  const [metrics, setMetrics] = useState({ totalApplications: 0, kycPending: 0, awaitingApproval: 0, submittedToBank: 0 });
  const [funnel, setFunnel] = useState([
    { name: 'Registration', count: 0 },
    { name: 'KYC verified', count: 0 },
    { name: 'Onboarded', count: 0 },
    { name: 'Land & Collateral', count: 0 },
    { name: 'Yield & Eligibility', count: 0 },
    { name: 'Credit & Financing', count: 0 },
    { name: 'Submitted to Bank', count: 0 }
  ]);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    fetchDashboardSummary().then(res => {
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
        if (res.funnel) setFunnel(res.funnel);
      }
    }).catch(console.error);

    fetchApplications().then(res => {
      if (res.success && res.applications) {
        setRecentApps(res.applications.slice(0, 5));
      }
    }).catch(console.error);
  }, []);

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Dashboard Overview 👋</h1>
          <p>Here's what's moving through the onboarding pipeline today.</p>
        </div>
        <button className="btn" onClick={() => onNavigate('register')}>＋ New Farmer</button>
      </div>

      <div className="grid g4">
        <div className="card stat hover">
          <div className="ic">▤</div>
          <div className="k">Total Applications</div>
          <div className="v num">{metrics.totalApplications}</div>
          <div className="d">live system records · across participating banks</div>
        </div>
        <div className="card stat hover">
          <div className="ic">◔</div>
          <div className="k">KYC Pending</div>
          <div className="v num">{metrics.kycPending}</div>
          <div className="d">awaiting officer review</div>
        </div>
        <div className="card stat hover">
          <div className="ic">✓</div>
          <div className="k">Awaiting Approval</div>
          <div className="v num">{metrics.awaitingApproval}</div>
          <div className="d">supervisor queue</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>◈</div>
          <div className="k">Submitted to Bank</div>
          <div className="v num">{metrics.submittedToBank}</div>
          <div className="d">completed bank submissions</div>
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: '16px' }}>
        <div className="card hover">
          <div className="sectitle"><span className="ic">▦</span> Pipeline Funnel</div>
          <div className="funnel">
            {funnel.map((item, idx) => {
              const max = funnel[0]?.count || 1;
              const pct = max > 0 ? Math.round((item.count / max) * 100) : 0;
              return (
                <div key={idx} className="fstage">
                  <span className="lbl">{item.name}</span>
                  <div className="ftrack">
                    <div className="ffill" style={{ width: `${Math.max(pct, max === 0 ? 0 : 4)}%` }}>
                      <span className="num">{item.count}</span>
                    </div>
                  </div>
                  <span className="pct num">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card hover">
          <div className="sectitle"><span className="ic">◎</span> Needs your action</div>
          <div className="actlist">
            <div className="actrow"><span className="ai p">◔</span><span className="at">KYC to verify</span><span className="ac num">{metrics.kycPending}</span></div>
            <div className="actrow"><span className="ai r">↩</span><span className="at">Sent back for correction</span><span className="ac num">0</span></div>
            <div className="actrow"><span className="ai a">▤</span><span className="at">Land &amp; Collateral check</span><span className="ac num">0</span></div>
            <div className="actrow"><span className="ai g">₨</span><span className="at">Ready for supervisor approval</span><span className="ac num">{metrics.awaitingApproval}</span></div>
          </div>
          <button className="btn sec sm" style={{ marginTop: '16px' }} onClick={() => onNavigate('applications')}>Open my queue →</button>
        </div>
      </div>

      <div className="card hover" style={{ marginTop: '16px' }}>
        <div className="spread" style={{ marginBottom: '14px' }}>
          <div className="sectitle" style={{ margin: 0 }}><span className="ic">≡</span> Recent applications</div>
          <button className="btn ghost sm" onClick={() => onNavigate('applications')}>View all</button>
        </div>
        
        {recentApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌾</div>
            <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '15px' }}>No farmer applications in queue</div>
            <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>The database is clean and ready for real entries.</p>
            <button className="btn sm" onClick={() => onNavigate('register')}>＋ Register First Farmer</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Farmer</th>
                <th>Crop</th>
                <th>Bank</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id}>
                  <td><span className="appid">{app.app_code}</span></td>
                  <td>
                    <div className="fmr">
                      <span className="fav">{app.farmer_name ? app.farmer_name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'GA'}</span>
                      {app.farmer_name}
                    </div>
                  </td>
                  <td>{app.crop_type}</td>
                  <td>{app.bank_name}</td>
                  <td>
                    <span className={`pill ${app.status.includes('Pending') ? 'amber' : app.status.includes('Submitted') ? 'green' : app.status.includes('Sent Back') ? 'red' : 'pri'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn sec sm" onClick={() => onOpenApp(app.id)}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
