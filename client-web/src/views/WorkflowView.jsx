import React, { useState, useEffect } from 'react';
import { fetchApplicationDetails, transitionWorkflow } from '../services/api';

const STEPS = [
  { n: 1, title: 'Registration', role: 'ops', type: 'MAKER (Field Registration)' },
  { n: 2, title: 'KYC', role: 'ops', type: 'MAKER (Data Verification)' },
  { n: 3, title: 'Onboarding Approval', role: 'sup', type: 'CHECKER (Supervisor Gate 1)' },
  { n: 4, title: 'Land', role: 'ops', type: 'MAKER (Land Verification)' },
  { n: 5, title: 'Collateral', role: 'ops', type: 'MAKER (Collateral Check)' },
  { n: 6, title: 'Yield', role: 'ops', type: 'MAKER / ENGINE (Yield Calc)' },
  { n: 7, title: 'Eligibility', role: 'sys', type: 'SYSTEM ENGINE (Auto Cap)' },
  { n: 8, title: 'Credit Score', role: 'sup', type: 'CHECKER (Supervisor Gate 2)' },
  { n: 9, title: 'Financing', role: 'ops', type: 'MAKER (Terms Selection)' },
  { n: 10, title: 'Submit to Bank', role: 'sup', type: 'CHECKER (Supervisor Gate 3)' }
];

const roleLabel = { ops: 'Ops Officer (Maker)', sup: 'Supervisor (Checker)', sys: 'System Engine', admin: 'Admin' };

export default function WorkflowView({ appId, currentUser, onNavigate }) {
  const [data, setData] = useState(null);
  const [currentStep, setCurrentStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  const loadData = () => {
    if (!appId) return;
    fetchApplicationDetails(appId).then(res => {
      if (res.success) {
        setData(res);
        const statusMap = {
          'KYC Pending': 2,
          'KYC Verified': 3,
          'Farmer Active': 4,
          'Land Verified': 5,
          'Collateral Verified': 6,
          'Yield Calculated': 7,
          'Eligibility Calculated': 8,
          'Credit Score Generated': 9,
          'Requirement Selected': 10,
          'Submitted to Bank': 10
        };
        if (statusMap[res.application.status]) {
          setCurrentStep(statusMap[res.application.status]);
        }
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [appId]);

  if (!data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>No application selected or database is empty.</h2>
        <p style={{ color: 'var(--muted)' }}>Register a new farmer to start real data entries in MySQL.</p>
        <button className="btn" onClick={() => onNavigate('register')}>＋ Register New Farmer</button>
      </div>
    );
  }

  const app = data.application;
  const userRole = currentUser ? currentUser.role : 'ops_officer';

  const handleAction = async (action, targetStep) => {
    setLoading(true);
    try {
      const res = await transitionWorkflow(app.id, {
        step: currentStep,
        action,
        remarks,
        actor_id: currentUser ? currentUser.id : 1
      });
      if (res.success) {
        setRemarks('');
        loadData();
        if (targetStep) setCurrentStep(targetStep);
      } else {
        alert(res.error || 'Transition failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPanel = (stepNum) => {
    const stepInfo = STEPS.find(s => s.n === stepNum);
    const isSupervisorStep = stepInfo.role === 'sup';
    const isOpsStep = stepInfo.role === 'ops';

    // Role permission check
    const canExecuteAction = 
      userRole === 'admin' ||
      (isOpsStep && userRole === 'ops_officer') ||
      (isSupervisorStep && userRole === 'supervisor');

    const badge = (
      <div style={{ textAlign: 'right' }}>
        <span className={`role ${stepInfo.role}`}>{roleLabel[stepInfo.role]}</span>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>{stepInfo.type}</div>
      </div>
    );

    const restrictedBanner = !canExecuteAction && isSupervisorStep ? (
      <div className="note red" style={{ background: 'var(--red-050)', borderColor: '#e8c7c7', color: 'var(--red)', marginBottom: '18px', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔒</span> RESTRICTED APPROVAL STEP — SUPERVISOR / MANAGER ACCOUNT REQUIRED
        </div>
        <div>
          You are currently signed in as <b>{currentUser.full_name} ({getRoleLabel(userRole)})</b>.
          As an Operations Officer (Maker), you cannot execute approval actions at this step. Please switch to or notify a <b>Supervisor (e.g. Bilal Ahmed)</b> to review and approve Gate {stepNum === 3 ? 1 : stepNum === 8 ? 2 : 3}.
        </div>
      </div>
    ) : !canExecuteAction && isOpsStep ? (
      <div className="note" style={{ background: 'var(--plum-050)', borderColor: 'var(--plum-100)', color: 'var(--plum)', marginBottom: '18px', padding: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
          👁️ SUPERVISOR REVIEW MODE — MAKER DATA ENTRY STEP
        </div>
        <div>
          You are currently signed in as <b>{currentUser.full_name} ({getRoleLabel(userRole)})</b>. Data entry for this step is performed by Operations Officers. You are viewing captured records in read-only review mode.
        </div>
      </div>
    ) : null;

    switch (stepNum) {
      case 1:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 1 · Farmer Registration (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Captured at field registration · Ops Officer data entry</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="readrow"><span className="k">Full Name</span><span className="v">{app.farmer_name}</span></div>
              <div className="readrow"><span className="k">CNIC</span><span className="v">{app.farmer_cnic}</span></div>
              <div className="readrow"><span className="k">Mobile</span><span className="v">{app.farmer_mobile}</span></div>
              <div className="readrow"><span className="k">Crop</span><span className="v">{app.crop_type}</span></div>
              <div className="readrow"><span className="k">Cultivated Area</span><span className="v">{app.cultivated_area} acres</span></div>
              <div className="readrow"><span className="k">Indicative Requirement</span><span className="v num">PKR {Number(app.initial_financing_requirement).toLocaleString()}</span></div>
            </div>
            <div className="note" style={{ marginTop: '16px' }}>✓ CNIC front/back uploaded &nbsp;·&nbsp; ✓ Registration record stored in MySQL database</div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn" onClick={() => setCurrentStep(2)}>Proceed to KYC Verification →</button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 2 · KYC Verification (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer data verification &amp; eCIB document upload</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field"><label>CNIC Validation (NADRA Manual Check)</label><div className="inp sel"><select><option>Match — Verified</option><option>Mismatch</option></select></div></div>
              <div className="field"><label>Identity Verification</label><div className="inp sel"><select><option>Passed</option><option>Failed</option></select></div></div>
              <div className="field"><label>eCIB Result</label><div className="inp sel"><select><option>Clear</option><option>Flagged</option></select></div></div>
              <div className="field"><label>eCIB Report Document</label><div className="upload">⬆ Upload eCIB Report (PDF / JPG)<small>Phase-1 Manual Verification</small></div></div>
            </div>
            <div className="field">
              <label>Verification Observations / Remarks</label>
              <div className="inp area">
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter Ops Officer verification observations..." disabled={!canExecuteAction} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn danger" disabled={loading || !canExecuteAction} onClick={() => handleAction('reject')}>Reject Application</button>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back for Fixes</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 3)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Complete KYC & Submit to Supervisor →'}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>
                  {isSupervisorStep && !canExecuteAction && <span style={{ marginRight: '6px' }}>🔒</span>}
                  Step 3 · Onboarding Approval (CHECKER GATE 1)
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Supervisor decision point to activate farmer &amp; application</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="readrow"><span className="k">KYC Status</span><span className="v" style={{ color: 'var(--green)' }}>Verified by Ops Officer ✓</span></div>
              <div className="readrow"><span className="k">eCIB Report Result</span><span className="v">Clear</span></div>
            </div>
            <div className="field" style={{ marginTop: '14px' }}>
              <label>Supervisor Approval / Rejection Remarks</label>
              <div className="inp area">
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Supervisor approval notes..." disabled={!canExecuteAction} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn danger" disabled={loading || !canExecuteAction} onClick={() => handleAction('reject')}>
                {!canExecuteAction ? '🔒 Locked' : 'Reject Application'}
              </button>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>
                {!canExecuteAction ? '🔒 Locked' : 'Send Back to Ops Officer'}
              </button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('approve', 4)}>
                {!canExecuteAction ? '🔒 Supervisor Approval Required' : 'Approve Farmer Onboarding →'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 4 · Land Verification (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer field land area &amp; document verification</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field"><label>Land Area (acres)</label><div className="inp"><input defaultValue={app.cultivated_area} disabled={!canExecuteAction} /></div></div>
              <div className="field"><label>Ownership Type</label><div className="inp sel"><select disabled={!canExecuteAction}><option>Owned</option><option>Leased</option></select></div></div>
              <div className="field"><label>GPS Coordinates</label><div className="inp"><input defaultValue="32.0836° N, 72.6711° E (Sargodha)" disabled={!canExecuteAction} /></div></div>
              <div className="field"><label>Land Documents</label><div className="upload">⬆ Upload Fard / Registry<small>Verified by Field Officer</small></div></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 5)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Verify Land & Continue →'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 5 · Collateral Verification (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer encumbrance &amp; mortgage document verification</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="readrow"><span className="k">Ownership Status</span><span className="v">Verified ✓</span></div>
              <div className="readrow"><span className="k">Mortgage Status</span><span className="v">Clear</span></div>
              <div className="readrow"><span className="k">Encumbrance Check</span><span className="v">No Encumbrance Found</span></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 6)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Confirm Collateral & Proceed →'}
              </button>
            </div>
          </div>
        );

      case 6:
        const maunds = app.cultivated_area * 45;
        const rate = 3900;
        const val = maunds * rate;
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 6 · Yield Assessment (MAKER / ENGINE)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Calculated crop value based on Admin Rate Table</span>
              </div>
              {badge}
            </div>
            <div className="grid g3">
              <div className="readrow"><span className="k">Crop Type</span><span className="v">{app.crop_type}</span></div>
              <div className="readrow"><span className="k">Cultivated Area</span><span className="v">{app.cultivated_area} acres</span></div>
              <div className="readrow"><span className="k">Expected Yield</span><span className="v num">{maunds} maund</span></div>
            </div>
            <div className="calcbox" style={{ marginTop: '16px' }}>
              <div>
                <div className="k">Estimated Crop Value ({maunds} maund × PKR {rate})</div>
                <div className="v num">PKR {val.toLocaleString()}</div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('calculate', 7)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Calculate Eligibility Cap →'}
              </button>
            </div>
          </div>
        );

      case 7:
        const eligVal = (app.cultivated_area * 45 * 3900) * 0.60;
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 7 · Financing Eligibility (AUTOMATED ENGINE)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>System policy eligibility calculation</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="readrow"><span className="k">Verified Land Area</span><span className="v">{app.cultivated_area} acres</span></div>
              <div className="readrow"><span className="k">Crop Value</span><span className="v num">PKR {(app.cultivated_area * 45 * 3900).toLocaleString()}</span></div>
              <div className="readrow"><span className="k">Requested Amount</span><span className="v num">PKR {Number(app.initial_financing_requirement).toLocaleString()}</span></div>
            </div>
            <div className="calcbox gold" style={{ marginTop: '16px' }}>
              <div>
                <div className="k">Eligible Amount Cap (60% of crop value)</div>
                <div className="v num">PKR {eligVal.toLocaleString()}</div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading} onClick={() => handleAction('continue', 8)}>Generate Credit Score →</button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>
                  {isSupervisorStep && !canExecuteAction && <span style={{ marginRight: '6px' }}>🔒</span>}
                  Step 8 · Credit Scoring (CHECKER GATE 2)
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Automated scoring engine &amp; Supervisor risk review</span>
              </div>
              {badge}
            </div>
            <div className="calcbox" style={{ background: 'linear-gradient(135deg,#2E9E6B,#27885b)' }}>
              <div>
                <div className="k">Computed Credit Score</div>
                <div className="v num">726 / 900 &nbsp;<span className="pill green">Approve Band</span></div>
              </div>
            </div>
            <div className="field" style={{ marginTop: '16px' }}>
              <label>Supervisor Credit Risk Review Decision</label>
              <div className="inp sel"><select disabled={!canExecuteAction}><option>Confirm Score (Approve Band)</option><option>Override Band</option></select></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('score', 9)}>
                {!canExecuteAction ? '🔒 Supervisor Risk Review Required' : 'Confirm Score & Pass to Ops Officer →'}
              </button>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 9 · Financing Requirement Selection (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer final financing terms selection</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field"><label>Financing Type</label><div className="inp sel"><select disabled={!canExecuteAction}><option>Seasonal Crop Financing</option><option>Equipment Term Loan</option></select></div></div>
              <div className="field"><label>Final Requested Amount (PKR)</label><div className="inp"><input defaultValue={app.initial_financing_requirement} disabled={!canExecuteAction} /></div></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('select', 10)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Submit to Supervisor for Bank Authorization →'}
              </button>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="card">
            {restrictedBanner}
            <div className="spread" style={{ marginBottom: '18px' }}>
              <div>
                <div className="sectitle" style={{ margin: '0 0 4px' }}>
                  {isSupervisorStep && !canExecuteAction && <span style={{ marginRight: '6px' }}>🔒</span>}
                  Step 10 · Bank Submission Authorization (CHECKER GATE 3)
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Supervisor final package verification &amp; bank submission</span>
              </div>
              {badge}
            </div>
            <div className="readrow"><span className="k">Target Bank</span><span className="v">{app.bank_name}</span></div>
            <div className="readrow"><span className="k">Submission Package</span><span className="v">Consolidated PDF Dossier + Structured JSON Data</span></div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction || app.status === 'Submitted to Bank'} onClick={() => handleAction('submit')}>
                {app.status === 'Submitted to Bank' ? '✓ Submitted to Bank' : !canExecuteAction ? '🔒 Supervisor Authorization Required' : 'Authorize & Submit to Bank'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  function getRoleLabel(role) {
    if (role === 'ops_officer') return 'Ops Officer';
    if (role === 'supervisor') return 'Supervisor';
    if (role === 'admin') return 'Admin';
    return role;
  }

  return (
    <section className="screen on">
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="appmeta">
          <div className="m"><div className="k">Application</div><div className="v num">{app.app_code}</div></div>
          <div className="m"><div className="k">Farmer</div><div className="v">{app.farmer_name}</div></div>
          <div className="m"><div className="k">CNIC</div><div className="v">{app.farmer_cnic}</div></div>
          <div className="m"><div className="k">Target Bank</div><div className="v">{app.bank_name}</div></div>
          <div className="m">
            <div className="k">Status</div>
            <div className="v">
              <span className={`pill ${app.status.includes('Pending') ? 'amber' : app.status.includes('Submitted') ? 'green' : app.status.includes('Sent Back') ? 'red' : 'pri'}`}>
                {app.status}
              </span>
            </div>
          </div>
        </div>
        <hr className="hr" />
        <div className="stepper">
          {STEPS.map(s => {
            const isDone = s.n < currentStep;
            const isCur = s.n === currentStep;
            const cls = isDone ? 'done' : isCur ? 'cur' : '';
            return (
              <div key={s.n} className={`stp ${cls}`}>
                <button onClick={() => setCurrentStep(s.n)}>
                  <span className="dot">{isDone ? '✓' : s.n}</span>
                  <span className="t">{s.title}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {renderPanel(currentStep)}
    </section>
  );
}
