import React, { useState, useEffect } from 'react';
import { fetchBanks } from '../services/api';

export default function BanksManager() {
  const [banks, setBanks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', logo_initial: '', submission_mode: 'manual_pdf' });
  const [msg, setMsg] = useState('');

  const loadBanks = () => {
    fetchBanks().then(res => {
      if (res.success && res.banks) setBanks(res.banks);
    }).catch(console.error);
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!newBank.name || newBank.name.trim().length === 0) return;
    try {
      const res = await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBank)
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Bank configured successfully.');
        setNewBank({ name: '', logo_initial: '', submission_mode: 'manual_pdf' });
        setShowAddForm(false);
        loadBanks();
      }
    } catch (err) {
      alert('Error creating bank: ' + err.message);
    }
  };

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Participating Banks</h1>
          <p>Multi-bank scoped access — each bank receives customized PDF dossier &amp; API packages <span className="role admin" style={{ marginLeft: '6px' }}>Admin Only</span></p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(true)}>＋ Add Participating Bank</button>
      </div>

      {msg && (
        <div className="note" style={{ background: 'var(--green-050)', color: 'var(--green)', marginBottom: '16px' }}>
          ✓ {msg}
        </div>
      )}

      {/* CONSISTENT UI KPI SUMMARY CARDS */}
      <div className="grid g4" style={{ marginBottom: '16px' }}>
        <div className="card stat hover">
          <div className="ic">▤</div>
          <div className="k">Participating Banks</div>
          <div className="v num">{banks.length}</div>
          <div className="d">active banking partners</div>
        </div>
        <div className="card stat hover">
          <div className="ic">✓</div>
          <div className="k">Active Banks</div>
          <div className="v num">{banks.filter(b=>b.status==='active').length}</div>
          <div className="d">receiving application dossiers</div>
        </div>
        <div className="card stat hover">
          <div className="ic">📄</div>
          <div className="k">PDF Dossier Mode</div>
          <div className="v num">{banks.filter(b=>b.submission_mode==='manual_pdf').length}</div>
          <div className="d">manual PDF export</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>⚡</div>
          <div className="k">Direct API Integration</div>
          <div className="v num">{banks.filter(b=>b.submission_mode==='api').length}</div>
          <div className="d">real-time bank API payload</div>
        </div>
      </div>

      {/* ADD BANK MODAL / FORM */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '16px', borderColor: 'var(--pri)' }}>
          <div className="sectitle">Configure New Participating Bank</div>
          <form onSubmit={handleCreateBank}>
            <div className="grid g3">
              <div className="field">
                <label>Bank Name <span className="req">*</span></label>
                <div className="inp">
                  <input 
                    type="text" 
                    placeholder="e.g. Bank D (Commercial Bank)" 
                    value={newBank.name}
                    onChange={e => setNewBank({ ...newBank, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Logo Initials (2 Letters)</label>
                <div className="inp">
                  <input 
                    type="text" 
                    placeholder="e.g. BD" 
                    value={newBank.logo_initial}
                    onChange={e => setNewBank({ ...newBank, logo_initial: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Submission Mode</label>
                <div className="inp sel">
                  <select value={newBank.submission_mode} onChange={e => setNewBank({ ...newBank, submission_mode: e.target.value })}>
                    <option value="manual_pdf">Manual PDF Dossier Package</option>
                    <option value="api">Direct Banking API Payload</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
              <button type="button" className="btn ghost sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn sm">Save &amp; Configure Bank →</button>
            </div>
          </form>
        </div>
      )}

      {/* BANKS GRID */}
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
                      {bank.status === 'active' ? 'Active Partner' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="readrow">
                <span className="k">Submission Mode</span>
                <span className="v">{bank.submission_mode === 'api' ? '⚡ Direct API Payload' : '📄 Manual PDF Dossier'}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <div style={{ flex: 1, background: 'var(--plum-050)', borderRadius: '10px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 }}>Total Applications</div>
                  <div className="num" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{bank.total_applications || 0}</div>
                </div>
                <div style={{ flex: 1, background: 'var(--plum-050)', borderRadius: '10px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 }}>Submitted</div>
                  <div className="num" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{bank.submitted_applications || 0}</div>
                </div>
              </div>
            </div>
            <button className="btn sec" style={{ marginTop: '20px' }} onClick={() => alert(`Configured ${bank.name} submission options.`)}>Configure Integration →</button>
          </div>
        ))}
      </div>
    </section>
  );
}
