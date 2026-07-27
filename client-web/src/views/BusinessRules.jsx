import React, { useState, useEffect } from 'react';
import { fetchBusinessRules, updateBusinessRule } from '../services/api';

export default function BusinessRules() {
  const [activeTab, setActiveTab] = useState('yield');
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fetchBusinessRules().then(res => {
      if (res.success) setRules(res.rules);
    }).catch(console.error);
  }, []);

  return (
    <section className="screen on">
      <div className="phead">
        <h1>Business Rules</h1>
        <p>Configurable engines — change formulas without code <span className="role admin" style={{ marginLeft: '6px' }}>Admin</span></p>
      </div>

      <div className="tabbar">
        <div className={`tab ${activeTab === 'yield' ? 'on' : ''}`} onClick={() => setActiveTab('yield')}>Yield</div>
        <div className={`tab ${activeTab === 'eligibility' ? 'on' : ''}`} onClick={() => setActiveTab('eligibility')}>Eligibility</div>
        <div className={`tab ${activeTab === 'credit' ? 'on' : ''}`} onClick={() => setActiveTab('credit')}>Credit Scoring</div>
      </div>

      <div className="card">
        {activeTab === 'yield' && (
          <>
            <div className="sectitle"><span className="ic">▤</span> Yield assessment rule</div>
            <div className="note" style={{ marginBottom: '18px' }}>
              <b>crop_value = cultivated_area × yield_per_unit × market_rate.</b> Sourced from Admin Rate Table with manual override enabled.
            </div>
            <div className="grid g3">
              <div className="field"><label>Applies to crop</label><div className="inp sel"><select><option>Wheat</option><option>Cotton</option><option>Rice</option></select></div></div>
              <div className="field"><label>Yield per acre (source)</label><div className="inp sel"><select><option>Rate Table</option></select></div></div>
              <div className="field"><label>Allow manual override</label><div className="inp sel"><select><option>Yes</option><option>No</option></select></div></div>
            </div>
          </>
        )}

        {activeTab === 'eligibility' && (
          <>
            <div className="sectitle"><span className="ic">₨</span> Eligibility policy</div>
            <div className="grid g3">
              <div className="field"><label>% of crop value</label><div className="inp"><input defaultValue="60%" /></div></div>
              <div className="field"><label>Collateral ratio</label><div className="inp"><input defaultValue="1.5×" /></div></div>
              <div className="field"><label>Min / Max cap (PKR)</label><div className="inp"><input defaultValue="100,000 – 5,000,000" /></div></div>
            </div>
          </>
        )}

        {activeTab === 'credit' && (
          <>
            <div className="sectitle"><span className="ic">◈</span> Credit scoring parameters</div>
            <table>
              <thead>
                <tr><th>Factor</th><th>Weight</th><th>Notes</th></tr>
              </thead>
              <tbody>
                <tr><td>KYC / eCIB outcome</td><td><div className="inp" style={{ width: '90px', height: '34px' }}><input defaultValue="30%" /></div></td><td style={{ color: 'var(--faint)' }}>Verified status weight</td></tr>
                <tr><td>Verified yield vs requested</td><td><div className="inp" style={{ width: '90px', height: '34px' }}><input defaultValue="40%" /></div></td><td style={{ color: 'var(--faint)' }}>Coverage ratio weight</td></tr>
                <tr><td>Collateral coverage</td><td><div className="inp" style={{ width: '90px', height: '34px' }}><input defaultValue="30%" /></div></td><td style={{ color: 'var(--faint)' }}>Asset security weight</td></tr>
              </tbody>
            </table>
            <div className="note gold" style={{ marginTop: '16px' }}>Score bands (Approve: 700-900 / Review: 550-699 / Reject: 0-549).</div>
          </>
        )}

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
          <button className="btn" onClick={() => alert('Business rules updated successfully')}>Save rules</button>
        </div>
      </div>
    </section>
  );
}
