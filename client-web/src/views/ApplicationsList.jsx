import React, { useState, useEffect } from 'react';
import { fetchApplications } from '../services/api';

export default function ApplicationsList({ onNavigate, onOpenApp }) {
  const [apps, setApps] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchApplications().then(res => {
      if (res.success) setApps(res.applications);
    }).catch(console.error);
  }, []);

  const filtered = apps.filter(a => 
    a.app_code.toLowerCase().includes(filterText.toLowerCase()) ||
    a.farmer_name.toLowerCase().includes(filterText.toLowerCase()) ||
    a.farmer_cnic.includes(filterText)
  );

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Applications</h1>
          <p>All financing applications across participating banks</p>
        </div>
        <button className="btn" onClick={() => onNavigate('register')}>＋ New Farmer</button>
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="row">
          <div className="inp sel" style={{ width: '180px' }}>Bank: All</div>
          <div className="inp sel" style={{ width: '210px' }}>Status: All stages</div>
          <div className="inp" style={{ flex: 1, minWidth: '220px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search by name / CNIC / App ID" 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
          </div>
          <button className="btn sec">Apply filters</button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>Farmer</th>
              <th>CNIC</th>
              <th>Crop</th>
              <th>Bank</th>
              <th>Stage</th>
              <th>Officer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id}>
                <td><span className="appid">{app.app_code}</span></td>
                <td>
                  <div className="fmr">
                    <span className="fav">{app.farmer_name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>
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
                <td>{app.officer_name || 'Ali R.'}</td>
                <td><button className="btn sec sm" onClick={() => onOpenApp(app.id)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
