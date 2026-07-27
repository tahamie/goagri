import React, { useState, useEffect } from 'react';
import { fetchBanks } from '../services/api';

export default function BanksManager() {
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    fetchBanks().then(res => {
      if (res.success) setBanks(res.banks);
    }).catch(console.error);
  }, []);

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Participating Banks</h1>
          <p>Each bank sees only its own submitted applications <span className="role admin" style={{ marginLeft: '6px' }}>Admin</span></p>
        </div>
        <button className="btn">＋ Add bank</button>
      </div>

      <div className="grid g3">
        {banks.map(bank => (
          <div key={bank.id} className="card hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <span className="fav" style={{ width: '44px', height: '44px', fontSize: '15px' }}>{bank.logo_initial}</span>
                <div>
                  <b style={{ fontSize: '16px' }}>{bank.name}</b>
                  <div>
                    <span className={`pill ${bank.status === 'active' ? 'green' : 'amber'} plain`} style={{ marginTop: '6px' }}>
                      {bank.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="readrow">
                <span className="k">Submission mode</span>
                <span className="v">{bank.submission_mode === 'api' ? 'API Integration' : 'Manual / PDF'}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <div style={{ flex: 1, background: 'var(--plum-050)', borderRadius: '10px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 }}>Applications</div>
                  <div className="num" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{bank.total_applications || 0}</div>
                </div>
                <div style={{ flex: 1, background: 'var(--plum-050)', borderRadius: '10px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 }}>Submitted</div>
                  <div className="num" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{bank.submitted_applications || 0}</div>
                </div>
              </div>
            </div>
            <button className="btn sec" style={{ marginTop: '20px' }}>Configure</button>
          </div>
        ))}
      </div>
    </section>
  );
}
