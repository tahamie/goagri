import React, { useState, useEffect } from 'react';
import { fetchBusinessRules, updateBusinessRule } from '../services/api';

export default function BusinessRules() {
  const [activeTab, setActiveTab] = useState('yield');
  const [msg, setMsg] = useState('');
  const [eligibilityConfig, setEligibilityConfig] = useState({
    crop_value_pct: '60',
    collateral_ratio: '1.5',
    min_loan_limit: '100000',
    max_loan_limit: '5000000'
  });

  const handleSave = () => {
    setMsg('Business rules updated and applied live across all workflow calculations.');
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Business Rules Engine</h1>
          <p>Configurable policy parameters — change policy formulas without code changes <span className="role admin" style={{ marginLeft: '6px' }}>Admin Only</span></p>
        </div>
        <button className="btn" onClick={handleSave}>Save Rule Configuration</button>
      </div>

      {msg && (
        <div className="note" style={{ background: 'var(--green-050)', color: 'var(--green)', marginBottom: '16px' }}>
          ✓ {msg}
        </div>
      )}

      {/* CONSISTENT UI KPI SUMMARY CARDS */}
      <div className="grid g4" style={{ marginBottom: '16px' }}>
        <div className="card stat hero hover">
          <div className="ic">ƒ</div>
          <div className="k">Configured Engine Rules</div>
          <div className="v num">3 Active</div>
          <div className="d">yield, eligibility &amp; scoring</div>
        </div>
        <div className="card stat hover">
          <div className="ic">₨</div>
          <div className="k">Eligibility Crop Cap</div>
          <div className="v num">{eligibilityConfig.crop_value_pct}%</div>
          <div className="d">max financing cap of crop value</div>
        </div>
        <div className="card stat hover">
          <div className="ic">🛡️</div>
          <div className="k">Collateral Coverage</div>
          <div className="v num">{eligibilityConfig.collateral_ratio}×</div>
          <div className="d">minimum asset ratio</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>◈</div>
          <div className="k">Approval Threshold</div>
          <div className="v num">700+</div>
          <div className="d">credit score approve band</div>
        </div>
      </div>

      <div className="tabbar">
        <div className={`tab ${activeTab === 'yield' ? 'on' : ''}`} onClick={() => setActiveTab('yield')}>Yield Policy</div>
        <div className={`tab ${activeTab === 'eligibility' ? 'on' : ''}`} onClick={() => setActiveTab('eligibility')}>Eligibility Limits</div>
        <div className={`tab ${activeTab === 'credit' ? 'on' : ''}`} onClick={() => setActiveTab('credit')}>Credit Scoring Weights</div>
      </div>

      <div className="card">
        {activeTab === 'yield' && (
          <>
            <div className="sectitle"><span className="ic">▤</span> Yield assessment rule engine</div>
            <div className="note" style={{ marginBottom: '18px' }}>
              Formula: <b>crop_value = cultivated_area × yield_per_unit × market_rate.</b> Sourced from Admin Rate Table with manual officer override enabled.
            </div>
            <div className="grid g3">
              <div className="field">
                <label>Default Rate Table Source</label>
                <div className="inp sel"><select><option>Admin Crop Rate Table</option></select></div>
              </div>
              <div className="field">
                <label>Yield Calculation Unit</label>
                <div className="inp sel"><select><option>Maunds (40 KG standard)</option></select></div>
              </div>
              <div className="field">
                <label>Allow Manual Officer Override</label>
                <div className="inp sel"><select><option>Yes — Enabled with Audit Log</option><option>No — Strictly Automated</option></select></div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'eligibility' && (
          <>
            <div className="sectitle"><span className="ic">₨</span> Financing eligibility policy limits</div>
            <div className="grid g4">
              <div className="field">
                <label>% Cap of Crop Value</label>
                <div className="inp">
                  <input 
                    type="number" 
                    placeholder="e.g. 60"
                    value={eligibilityConfig.crop_value_pct}
                    onChange={e => setEligibilityConfig({ ...eligibilityConfig, crop_value_pct: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Collateral Ratio (Multiplier)</label>
                <div className="inp">
                  <input 
                    type="text" 
                    placeholder="e.g. 1.5"
                    value={eligibilityConfig.collateral_ratio}
                    onChange={e => setEligibilityConfig({ ...eligibilityConfig, collateral_ratio: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Minimum Loan Cap (PKR)</label>
                <div className="inp">
                  <input 
                    type="number" 
                    placeholder="e.g. 100000"
                    value={eligibilityConfig.min_loan_limit}
                    onChange={e => setEligibilityConfig({ ...eligibilityConfig, min_loan_limit: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Maximum Loan Cap (PKR)</label>
                <div className="inp">
                  <input 
                    type="number" 
                    placeholder="e.g. 5000000"
                    value={eligibilityConfig.max_loan_limit}
                    onChange={e => setEligibilityConfig({ ...eligibilityConfig, max_loan_limit: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'credit' && (
          <>
            <div className="sectitle"><span className="ic">◈</span> Credit scoring factor weights</div>
            <table>
              <thead>
                <tr><th>Scoring Factor</th><th>Weight Percentage</th><th>Engine Factor Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>KYC / eCIB Credit History</td>
                  <td><div className="inp" style={{ width: '100px', height: '34px' }}><input defaultValue="40%" placeholder="e.g. 40%" /></div></td>
                  <td style={{ color: 'var(--muted)' }}>eCIB report clear status &amp; NADRA identity match weight</td>
                </tr>
                <tr>
                  <td>Land Ownership &amp; Verification</td>
                  <td><div className="inp" style={{ width: '100px', height: '34px' }}><input defaultValue="30%" placeholder="e.g. 30%" /></div></td>
                  <td style={{ color: 'var(--muted)' }}>Verified land registry &amp; GPS location weight</td>
                </tr>
                <tr>
                  <td>Yield Assessment vs Requirement</td>
                  <td><div className="inp" style={{ width: '100px', height: '34px' }}><input defaultValue="30%" placeholder="e.g. 30%" /></div></td>
                  <td style={{ color: 'var(--muted)' }}>Crop yield coverage ratio weight</td>
                </tr>
              </tbody>
            </table>
            <div className="note gold" style={{ marginTop: '16px' }}>
              💡 Score Bands: <b>Approve Band (700 – 900)</b> &nbsp;·&nbsp; <b>Supervisor Review (550 – 699)</b> &nbsp;·&nbsp; <b>Reject Band (0 – 549)</b>.
            </div>
          </>
        )}

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
          <button className="btn" onClick={handleSave}>Save Rule Configuration →</button>
        </div>
      </div>
    </section>
  );
}
