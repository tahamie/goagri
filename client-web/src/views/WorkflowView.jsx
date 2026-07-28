import React, { useState, useEffect } from 'react';
import { fetchApplicationDetails, transitionWorkflow } from '../services/api';

const STEPS = [
  { n: 1, title: 'Registration', role: 'ops', type: 'MAKER (Field Registration)' },
  { n: 2, title: 'KYC', role: 'ops', type: 'MAKER (Data Verification)' },
  { n: 3, title: 'Land', role: 'ops', type: 'MAKER (Land Verification)' },
  { n: 4, title: 'Collateral', role: 'ops', type: 'MAKER (Collateral Check)' },
  { n: 5, title: 'Yields', role: 'ops', type: 'MAKER (Historical Yields)' },
  { n: 6, title: 'Financing Crop', role: 'ops', type: 'MAKER (Crop Value Calc)' },
  { n: 7, title: 'Eligibility', role: 'sys', type: 'SYSTEM ENGINE (60% Cap)' },
  { n: 8, title: 'Credit Score', role: 'sys', type: 'SYSTEM ENGINE (Auto Score)' },
  { n: 9, title: 'Selection', role: 'ops', type: 'MAKER (Terms Selection)' },
  { n: 10, title: 'Submit to Bank', role: 'sup', type: 'CHECKER (Supervisor Authorization)' }
];

const roleLabel = { ops: 'Ops Officer (Maker)', sup: 'Supervisor (Checker)', sys: 'System Engine', admin: 'Admin' };

export default function WorkflowView({ appId, currentUser, onNavigate }) {
  const [data, setData] = useState(null);
  const [currentStep, setCurrentStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Dynamic GPS state
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [gpsFetching, setGpsFetching] = useState(false);

  // Form dropdown states
  const [bankName, setBankName] = useState('Bank A');
  const [cropType, setCropType] = useState('Wheat');
  const [ownership, setOwnership] = useState('Owned');
  const [mortgageStatus, setMortgageStatus] = useState('Clear');
  const [encumbranceStatus, setEncumbranceStatus] = useState('No Encumbrance Found');
  const [submissionMode, setSubmissionMode] = useState('API Integration');

  const loadData = () => {
    if (!appId) return;
    fetchApplicationDetails(appId).then(res => {
      if (res.success) {
        setData(res);
        if (res.application.crop_type) setCropType(res.application.crop_type);
        if (res.application.bank_name) setBankName(res.application.bank_name);

        const statusMap = {
          'KYC Pending': 2,
          'KYC Verified': 3,
          'Land Verified': 4,
          'Collateral Verified': 5,
          'Yield Calculated': 6,
          'Eligibility Calculated': 7,
          'Credit Score Generated': 8,
          'Requirement Selected': 9,
          'Pending Approval': 10,
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
        <h2>No application selected.</h2>
        <p style={{ color: 'var(--muted)' }}>Select an application from the queue or register a new farmer.</p>
        <button className="btn" onClick={() => onNavigate('register')}>＋ Register New Farmer</button>
      </div>
    );
  }

  const app = data.application;
  const userRole = currentUser ? currentUser.role : 'ops_officer';
  const isSupervisorOrAdmin = userRole === 'supervisor' || userRole === 'admin';
  const isOpsOfficer = userRole === 'ops_officer';

  const handleFetchGps = () => {
    setGpsFetching(true);
    setTimeout(() => {
      setLat('32.0836');
      setLng('72.6711');
      setGpsFetching(false);
    }, 500);
  };

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

        // If Officer finishes Step 9 (Financing Selection)
        if (currentStep === 9 && action === 'select' && !isSupervisorOrAdmin) {
          setShowSuccessModal(true);
        } else if (targetStep) {
          setCurrentStep(targetStep);
        }
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

    const canExecuteAction =
      userRole === 'admin' ||
      (isOpsStep && isOpsOfficer) ||
      (isSupervisorStep && isSupervisorOrAdmin);

    const badge = (
      <div style={{ textAlign: 'right' }}>
        <span className={`role ${stepInfo.role}`}>{roleLabel[stepInfo.role]}</span>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>{stepInfo.type}</div>
      </div>
    );

    const restrictedBanner = !canExecuteAction && isSupervisorStep ? (
      <div className="note red" style={{ background: 'var(--red-050)', borderColor: '#e8c7c7', color: 'var(--red)', marginBottom: '18px', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔒</span> RESTRICTED AUTHORIZATION STEP — SUPERVISOR / MANAGER ACCOUNT REQUIRED
        </div>
        <div>
          You are signed in as <b>{currentUser.full_name} (Ops Officer)</b>. As a Sales/Ops Officer, your workflow ends after Step 9.
          Final review and bank authorization is performed by <b>Supervisors (e.g. Bilal Ahmed)</b>.
        </div>
      </div>
    ) : !canExecuteAction && isOpsStep ? (
      <div className="note" style={{ background: 'var(--plum-050)', borderColor: 'var(--plum-100)', color: 'var(--plum)', marginBottom: '18px', padding: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
          👁️ SUPERVISOR REVIEW MODE — MAKER DATA ENTRY STEP
        </div>
        <div>
          You are signed in as <b>{currentUser.full_name} (Supervisor)</b> viewing captured records in review mode.
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
              <div className="readrow"><span className="k">Target Crop</span><span className="v">{app.crop_type}</span></div>
              <div className="readrow"><span className="k">Cultivated Area</span><span className="v">{app.cultivated_area} acres</span></div>
              <div className="readrow"><span className="k">Indicative Requirement</span><span className="v num">PKR {Number(app.initial_financing_requirement).toLocaleString()}</span></div>
            </div>
            <div className="note" style={{ marginTop: '16px' }}>✓ CNIC photos uploaded &nbsp;·&nbsp; ✓ Registration record stored in MySQL database</div>
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
              <div className="field">
                <label>CNIC Validation (NADRA Check)</label>
                <div className="inp sel">
                  <select disabled={!canExecuteAction}>
                    <option>Match — Verified</option>
                    <option>Mismatch</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Identity Verification</label>
                <div className="inp sel">
                  <select disabled={!canExecuteAction}>
                    <option>Passed</option>
                    <option>Failed</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>eCIB Result</label>
                <div className="inp sel">
                  <select disabled={!canExecuteAction}>
                    <option>Clear</option>
                    <option>Flagged</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>eCIB Report Document</label>
                <div className="upload">⬆ Upload eCIB Report (PDF / JPG)<small>Phase-1 Manual Verification</small></div>
              </div>
            </div>
            <div className="field">
              <label>Verification Observations / Remarks</label>
              <div className="inp area">
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter Ops Officer verification observations..." disabled={!canExecuteAction} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn danger" disabled={loading || !canExecuteAction} onClick={() => handleAction('reject')}>Reject Application</button>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 3)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Complete KYC & Proceed to Land Verification →'}
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
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 3 · Land Verification (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer field land area, interactive dropdowns &amp; dynamic GPS</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field">
                <label>Land Area (acres) <span className="req">*</span></label>
                <div className="inp"><input defaultValue={app.cultivated_area} disabled={!canExecuteAction} /></div>
              </div>
              <div className="field">
                <label>Ownership Status <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={ownership} onChange={e => setOwnership(e.target.value)} disabled={!canExecuteAction}>
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Jointly Owned">Jointly Owned</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>GPS Coordinates <span className="req">*</span></label>
                <div className="row" style={{ gap: '10px' }}>
                  <div className="inp" style={{ flex: 1 }}>
                    <input placeholder="Latitude (e.g. 32.0836)" value={lat} onChange={e => setLat(e.target.value)} disabled={!canExecuteAction} />
                  </div>
                  <div className="inp" style={{ flex: 1 }}>
                    <input placeholder="Longitude (e.g. 72.6711)" value={lng} onChange={e => setLng(e.target.value)} disabled={!canExecuteAction} />
                  </div>
                  <button className="btn sec" type="button" onClick={handleFetchGps} disabled={gpsFetching || !canExecuteAction}>
                    {gpsFetching ? 'Fetching...' : '📍 Fetch Current Location'}
                  </button>
                </div>
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>Land Documents Upload</label>
                <div className="upload">⬆ Upload Fard / Registry Document (PDF / JPG)<small>Land Records Verification</small></div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 4)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Verify Land & Continue →'}
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
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 4 · Collateral Verification (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer encumbrance &amp; mortgage status verification</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field">
                <label>Mortgage Status <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={mortgageStatus} onChange={e => setMortgageStatus(e.target.value)} disabled={!canExecuteAction}>
                    <option value="Clear">Clear</option>
                    <option value="Mortgaged">Mortgaged</option>
                    <option value="Under Verification">Under Verification</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Encumbrance Check <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={encumbranceStatus} onChange={e => setEncumbranceStatus(e.target.value)} disabled={!canExecuteAction}>
                    <option value="No Encumbrance Found">No Encumbrance Found</option>
                    <option value="Encumbrance Found">Encumbrance Found</option>
                    <option value="Under Verification">Under Verification</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="field" style={{ marginTop: '12px' }}>
              <label>Collateral Verification Remarks</label>
              <div className="inp area">
                <textarea placeholder="Officer notes on land registry & encumbrance checks..." disabled={!canExecuteAction} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back</button>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('verify', 5)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Confirm Collateral & Proceed →'}
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
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 5 · Historical Yields (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Farmer's historical crop yield records</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e" style={{ marginBottom: '16px' }}>
              <div className="card" style={{ background: 'var(--canvas)' }}>
                <div className="spread"><b>Wheat (Rabi 2024)</b><span className="pill pri">44 maund/acre</span></div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Harvested Apr 2025 · Verified by Field Survey</div>
              </div>
              <div className="card" style={{ background: 'var(--canvas)' }}>
                <div className="spread"><b>Cotton (Kharif 2024)</b><span className="pill pri">28 maund/acre</span></div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Harvested Oct 2024 · Verified by Market Receipts</div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('continue', 6)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Save Yields & Calculate Crop Value →'}
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
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 6 · Financing Crop (MAKER)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Select crop &amp; compute estimated harvest value</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field">
                <label>Target Crop Type <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={cropType} onChange={e => setCropType(e.target.value)} disabled={!canExecuteAction}>
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                    <option value="Rice">Rice</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Cultivated Area (acres)</label>
                <div className="inp"><input defaultValue={app.cultivated_area} disabled={!canExecuteAction} /></div>
              </div>
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
                <div className="sectitle" style={{ margin: '0 0 4px' }}>Step 8 · Credit Scoring (AUTOMATED ENGINE)</div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Automated credit scoring ring gauge (no intermediate approval required)</span>
              </div>
              {badge}
            </div>
            <div className="calcbox" style={{ background: 'linear-gradient(135deg,#2E9E6B,#27885b)' }}>
              <div>
                <div className="k">Computed Credit Score</div>
                <div className="v num">726 / 900 &nbsp;<span className="pill green" style={{ color: '#fff', background: 'rgba(255,255,255,0.2)' }}>Approve Band</span></div>
              </div>
            </div>
            <div className="note green" style={{ marginTop: '16px', background: 'var(--green-050)', borderColor: '#bfe3cf', color: 'var(--green)' }}>
              ✓ Credit score 726 generated successfully. Intermediate approval is removed per policy — proceed directly to Financing Selection.
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading} onClick={() => handleAction('score', 9)}>Proceed to Financing Selection →</button>
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
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Ops Officer final financing terms selection &amp; submission to Supervisor</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e">
              <div className="field">
                <label>Financing Product Type <span className="req">*</span></label>
                <div className="inp sel">
                  <select disabled={!canExecuteAction}>
                    <option>Seasonal Crop Financing</option>
                    <option>Equipment Term Loan</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Target Bank <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={bankName} onChange={e => setBankName(e.target.value)} disabled={!canExecuteAction}>
                    <option value="Bank A">Bank A</option>
                    <option value="Bank B">Bank B</option>
                    <option value="Bank C">Bank C</option>
                    <option value="Bank D">Bank D</option>
                    <option value="HBL">HBL</option>
                    <option value="UBL">UBL</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>Final Requested Amount (PKR) <span className="req">*</span></label>
                <div className="inp"><input defaultValue={app.initial_financing_requirement} disabled={!canExecuteAction} /></div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn ok" disabled={loading || !canExecuteAction} onClick={() => handleAction('select', 10)}>
                {!canExecuteAction ? '🔒 Officer Action Restricted' : 'Submit Application for Supervisor Approval →'}
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
                  Step 10 · Supervisor Authorization &amp; Bank Submission (CHECKER)
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Supervisor reviews full KYC dossier &amp; authorizes submission to Bank</span>
              </div>
              {badge}
            </div>
            <div className="grid g2e" style={{ marginBottom: '16px' }}>
              <div className="readrow"><span className="k">Target Bank</span><span className="v">{app.bank_name}</span></div>
              <div className="readrow"><span className="k">Current Status</span><span className="v">{app.status}</span></div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>Submission Mode <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={submissionMode} onChange={e => setSubmissionMode(e.target.value)} disabled={!canExecuteAction}>
                    <option value="API Integration">API Integration (Structured JSON Data Payload)</option>
                    <option value="Manual PDF Package">Manual PDF Dossier Package</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="field">
              <label>Supervisor Authorization Remarks</label>
              <div className="inp area">
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Supervisor approval notes..." disabled={!canExecuteAction} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
              <button className="btn danger" disabled={loading || !canExecuteAction} onClick={() => handleAction('reject')}>Reject Application</button>
              <button className="btn ghost" disabled={loading || !canExecuteAction} onClick={() => handleAction('send_back')}>Send Back to Officer</button>
              <button className="btn ok" disabled={loading || !canExecuteAction || app.status === 'Submitted to Bank'} onClick={() => handleAction('submit')}>
                {app.status === 'Submitted to Bank' ? '✓ Submitted to Bank' : !canExecuteAction ? '🔒 Supervisor Authorization Required' : 'Authorize & Submit to Bank →'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

      {/* OFFICER SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '420px', maxWidth: '90%', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--green-050)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px' }}>✓</div>
            <h2>Application Submitted!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, margin: '8px 0 20px' }}>
              Application <b>{app.app_code}</b> has been successfully submitted to the <b>Pending Approval Queue</b> for Supervisor review.
            </p>
            <button className="btn" style={{ width: '100%' }} onClick={() => { setShowSuccessModal(false); onNavigate('applications'); }}>
              Back to Applications Queue →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
