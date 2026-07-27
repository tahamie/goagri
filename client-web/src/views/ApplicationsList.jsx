import React, { useState, useEffect } from 'react';
import { fetchApplications } from '../services/api';

export default function ApplicationsList({ onNavigate, onOpenApp }) {
  const [apps, setApps] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications().then(res => {
      if (res.success && res.applications) setApps(res.applications);
    }).catch(console.error);
  }, []);

  const filtered = apps.filter(a => {
    const matchesText = 
      (a.app_code || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (a.farmer_name || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (a.farmer_cnic || '').includes(filterText);

    if (statusFilter === 'all') return matchesText;
    if (statusFilter === 'pending') return matchesText && a.status.includes('Pending');
    if (statusFilter === 'approval') return matchesText && a.status.includes('Verified');
    if (statusFilter === 'submitted') return matchesText && a.status.includes('Submitted');
    return matchesText;
  });

  const totalCount = apps.length;
  const pendingCount = apps.filter(a => a.status.includes('Pending')).length;
  const approvalCount = apps.filter(a => a.status.includes('Verified')).length;
  const submittedCount = apps.filter(a => a.status.includes('Submitted')).length;

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Applications Queue</h1>
          <p>All active financing applications across participating banks</p>
        </div>
        <button className="btn" onClick={() => onNavigate('register')}>＋ New Farmer</button>
      </div>

      {/* CONSISTENT UI KPI SUMMARY BOXES */}
      <div className="grid g4" style={{ marginBottom: '16px' }}>
        <div className="card stat hover">
          <div className="ic">▤</div>
          <div className="k">Total Applications</div>
          <div className="v num">{totalCount}</div>
          <div className="d">live records in queue</div>
        </div>
        <div className="card stat hover">
          <div className="ic">◔</div>
          <div className="k">KYC Pending</div>
          <div className="v num">{pendingCount}</div>
          <div className="d">ops officer data entry</div>
        </div>
        <div className="card stat hover">
          <div className="ic">✓</div>
          <div className="k">Awaiting Approval</div>
          <div className="v num">{approvalCount}</div>
          <div className="d">supervisor review gate</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>◈</div>
          <div className="k">Submitted to Bank</div>
          <div className="v num">{submittedCount}</div>
          <div className="d">bank dossier submitted</div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR WITH PROPER PLACEHOLDERS */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="row" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <div className="inp sel" style={{ width: '200px' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Status: All Stages</option>
              <option value="pending">Status: Pending KYC</option>
              <option value="approval">Status: Awaiting Approval</option>
              <option value="submitted">Status: Submitted to Bank</option>
            </select>
          </div>
          <div className="inp" style={{ flex: 1, minWidth: '240px' }}>
            <input 
              type="text" 
              placeholder="Search by farmer name, CNIC (e.g. 35201-1234567-1), or App ID (e.g. APP-1042)..." 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
          </div>
          {filterText && (
            <button className="btn ghost sm" onClick={() => setFilterText('')}>Clear Search</button>
          )}
        </div>
      </div>

      {/* TABLE VIEW WITH CLEAN EMPTY STATE */}
      <div className="card" style={{ padding: '16px 8px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '15px' }}>
              {apps.length === 0 ? 'No applications in database' : 'No matching applications found'}
            </div>
            <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>
              {apps.length === 0 ? 'Click below to register the first farmer application.' : 'Try adjusting your search criteria.'}
            </p>
            {apps.length === 0 && (
              <button className="btn" onClick={() => onNavigate('register')}>＋ Register New Farmer</button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Farmer Name</th>
                <th>CNIC</th>
                <th>Crop</th>
                <th>Bank</th>
                <th>Stage</th>
                <th>Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td><span className="appid">{app.app_code}</span></td>
                  <td>
                    <div className="fmr">
                      <span className="fav">{app.farmer_name ? app.farmer_name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'GA'}</span>
                      {app.farmer_name}
                    </div>
                  </td>
                  <td>{app.farmer_cnic}</td>
                  <td>{app.crop_type}</td>
                  <td>{app.bank_name}</td>
                  <td>
                    <span className={`pill ${app.status.includes('Pending') ? 'amber' : app.status.includes('Submitted') ? 'green' : app.status.includes('Sent Back') ? 'red' : 'pri'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.officer_name || 'Ali Raza'}</td>
                  <td><button className="btn sec sm" onClick={() => onOpenApp(app.id)}>Open Workflow →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
