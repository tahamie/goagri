import React, { useState } from 'react';
import { registerFarmer } from '../services/api';

function formatCnic(val) {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function formatMobile(val) {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '';
  const cleanStr = String(val).replace(/[^0-9]/g, '');
  if (!cleanStr) return '';
  return Number(cleanStr).toLocaleString('en-US');
}

function parseRawNumber(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '');
}

const PURPOSE_OPTIONS = [
  'Crop Seeds & Inputs',
  'Fertilizers & Pesticides',
  'Solar Tube-Well Irrigation',
  'Land Preparation & Tillage',
  'Farm Machinery & Implements',
  'Harvesting & Storage'
];

export default function NewFarmer({ onNavigate, onOpenApp }) {
  const [formData, setFormData] = useState({
    full_name: '',
    cnic: '',
    mobile: '',
    date_of_birth: '1990-01-01',
    address: '',
    crop_type: 'Wheat',
    cultivated_area: '',
    bank_id: 1,
    initial_financing_requirement: ''
  });

  const [selectedPurposes, setSelectedPurposes] = useState(['Crop Seeds & Inputs', 'Fertilizers & Pesticides']);
  const [cnicFile, setCnicFile] = useState(null);
  const [supportingFile, setSupportingFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdAppId, setCreatedAppId] = useState(null);
  const [createdFarmerName, setCreatedFarmerName] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleAddPurpose = (e) => {
    const val = e.target.value;
    if (val && !selectedPurposes.includes(val)) {
      setSelectedPurposes([...selectedPurposes, val]);
    }
  };

  const handleRemovePurpose = (purpose) => {
    setSelectedPurposes(selectedPurposes.filter(p => p !== purpose));
  };

  const validateForm = () => {
    const errs = {};
    const cleanCNIC = formData.cnic.replace(/[^0-9]/g, '');
    const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');

    if (!formData.full_name || formData.full_name.trim().length < 3) {
      errs.full_name = 'Full Name is required (minimum 3 characters).';
    }

    if (!cleanCNIC || cleanCNIC.length !== 13) {
      errs.cnic = 'CNIC must be a valid 13-digit number (e.g. 35201-1234567-1).';
    }

    if (!cleanMobile || cleanMobile.length !== 11 || !cleanMobile.startsWith('03')) {
      errs.mobile = 'Mobile Number must be 11 digits starting with 03 (e.g. 03001234567).';
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errs.address = 'Address is required (minimum 5 characters).';
    }

    const area = parseFloat(formData.cultivated_area);
    if (isNaN(area) || area <= 0) {
      errs.cultivated_area = 'Cultivated area must be a number greater than 0.';
    }

    const reqAmt = parseFloat(formData.initial_financing_requirement);
    if (isNaN(reqAmt) || reqAmt <= 0) {
      errs.initial_financing_requirement = 'Financing requirement must be a valid amount in PKR.';
    }

    if (selectedPurposes.length === 0) {
      errs.initial_financing_purpose = 'Please select at least one financing purpose LOV.';
    }

    // STRICT CNIC IMAGE / DOCUMENT UPLOAD VALIDATION
    if (!cnicFile) {
      errs.cnicFile = 'CNIC Picture / Document upload is STRICTLY MANDATORY. Please upload CNIC front/back image before submitting.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        cnic: formData.cnic.replace(/[^0-9]/g, ''),
        mobile: formData.mobile.replace(/[^0-9]/g, ''),
        initial_financing_purpose: selectedPurposes.join(', '),
        cnic_file_name: cnicFile,
        doc_file_name: supportingFile
      };
      const res = await registerFarmer(payload);
      if (res.success) {
        setCreatedAppId(res.application_id);
        setCreatedFarmerName(formData.full_name);
        setShowPromptModal(true);
      } else {
        setServerError(res.error || 'Failed to register farmer');
      }
    } catch (err) {
      setServerError('Error registering farmer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="screen on">
      <div className="phead">
        <h1>New Farmer Registration</h1>
        <p>Step 1 · Registered by Operations Officer <span className="role ops" style={{ marginLeft: '6px' }}>Ops Officer</span></p>
      </div>

      {serverError && (
        <div className="login-error-alert" style={{ marginBottom: '16px' }}>
          <span>⚠️</span> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="sectitle"><span className="ic">◔</span> Farmer details</div>
          <div className="grid g2e">
            <div className="field">
              <label>Full Name <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.full_name ? 'var(--red)' : undefined }}>
                <input 
                  type="text" 
                  placeholder="e.g. Muhammad Aslam"
                  value={formData.full_name} 
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
                />
              </div>
              {errors.full_name && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.full_name}</div>}
            </div>

            <div className="field">
              <label>CNIC (13 Digits) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.cnic ? 'var(--red)' : undefined }}>
                <input 
                  type="text" 
                  placeholder="35201-1234567-1" 
                  value={formData.cnic} 
                  onChange={e => setFormData({ ...formData, cnic: formatCnic(e.target.value) })} 
                />
              </div>
              {errors.cnic && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.cnic}</div>}
            </div>

            <div className="field">
              <label>Mobile Number (03XXXXXXXXX) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.mobile ? 'var(--red)' : undefined }}>
                <input 
                  type="text" 
                  placeholder="0300-1234567" 
                  value={formData.mobile} 
                  onChange={e => setFormData({ ...formData, mobile: formatMobile(e.target.value) })} 
                />
              </div>
              {errors.mobile && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.mobile}</div>}
            </div>

            <div className="field">
              <label>Date of Birth <span className="req">*</span></label>
              <div className="inp">
                <input 
                  type="date" 
                  value={formData.date_of_birth} 
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} 
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label>Address <span className="req">*</span></label>
            <div className="inp area" style={{ borderColor: errors.address ? 'var(--red)' : undefined }}>
              <textarea 
                placeholder="Village, Tehsil, District..."
                value={formData.address} 
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            {errors.address && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.address}</div>}
          </div>
        </div>

        <div className="card">
          <div className="sectitle"><span className="ic">▤</span> Farming &amp; financing</div>
          <div className="grid g2e">
            <div className="field">
              <label>Crop Type <span className="req">*</span></label>
              <div className="inp sel">
                <select value={formData.crop_type} onChange={e => setFormData({ ...formData, crop_type: e.target.value })}>
                  <option value="Wheat">Wheat</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Rice">Rice</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Maize">Maize</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Cultivated Area (acres) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.cultivated_area ? 'var(--red)' : undefined }}>
                <input 
                  type="number" 
                  step="0.5"
                  placeholder="e.g. 12"
                  value={formData.cultivated_area} 
                  onChange={e => setFormData({ ...formData, cultivated_area: e.target.value })} 
                />
              </div>
              {errors.cultivated_area && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.cultivated_area}</div>}
            </div>

            <div className="field">
              <label>Target Bank <span className="req">*</span></label>
              <div className="inp sel">
                <select value={formData.bank_id} onChange={e => setFormData({ ...formData, bank_id: e.target.value })}>
                  <option value="1">Bank A</option>
                  <option value="2">Bank B</option>
                  <option value="3">Bank C</option>
                  <option value="4">Bank D</option>
                  <option value="5">HBL</option>
                  <option value="6">UBL</option>
                  <option value="7">Meezan Bank</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Financing Requirement (PKR) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.initial_financing_requirement ? 'var(--red)' : undefined }}>
                <input 
                  type="text" 
                  placeholder="e.g. 1,200,000"
                  value={formatCurrency(formData.initial_financing_requirement)} 
                  onChange={e => setFormData({ ...formData, initial_financing_requirement: parseRawNumber(e.target.value) })} 
                />
              </div>
              {errors.initial_financing_requirement && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.initial_financing_requirement}</div>}
            </div>
          </div>

          {/* MULTI-LOV FINANCING PURPOSE */}
          <div className="field" style={{ marginTop: '12px' }}>
            <label>Financing Purpose (Multi-Select LOV) <span className="req">*</span></label>
            <div className="inp sel" style={{ borderColor: errors.initial_financing_purpose ? 'var(--red)' : undefined }}>
              <select value="" onChange={handleAddPurpose}>
                <option value="">+ Select Financing Purpose LOV Option...</option>
                {PURPOSE_OPTIONS.map(opt => (
                  <option key={opt} value={opt} disabled={selectedPurposes.includes(opt)}>
                    {selectedPurposes.includes(opt) ? `✓ ${opt} (Added)` : opt}
                  </option>
                ))}
              </select>
            </div>
            
            {/* TAG CHIPS */}
            <div className="row" style={{ flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {selectedPurposes.map(purpose => (
                <span key={purpose} className="pill pri" style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {purpose}
                  <button 
                    type="button" 
                    onClick={() => handleRemovePurpose(purpose)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            {errors.initial_financing_purpose && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.initial_financing_purpose}</div>}
          </div>
        </div>

        {/* WORKING DOCUMENT UPLOAD SECTION */}
        <div className="card">
          <div className="sectitle"><span className="ic">⬆</span> Documents</div>
          <div className="grid g2e">
            <div className="field">
              <label>CNIC Copy (Front / Back) <span className="req">*</span></label>
              <label className="upload" style={{ cursor: 'pointer', display: 'block', borderColor: errors.cnicFile ? 'var(--red)' : undefined, background: errors.cnicFile ? 'rgba(239, 68, 68, 0.05)' : undefined }}>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  style={{ display: 'none' }} 
                  onChange={e => e.target.files[0] && setCnicFile(e.target.files[0].name)}
                />
                ⬆ {cnicFile ? `✓ File Selected: ${cnicFile}` : 'Upload CNIC (front / back)'}
                <small>{cnicFile ? 'Ready to upload' : 'JPG or PDF · up to 5MB (STRICTLY REQUIRED)'}</small>
              </label>
              {errors.cnicFile && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px', fontWeight: 600 }}>⚠️ {errors.cnicFile}</div>}
            </div>

            <div className="field">
              <label>Supporting Land / Income Documents</label>
              <label className="upload" style={{ cursor: 'pointer', display: 'block' }}>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  style={{ display: 'none' }} 
                  onChange={e => e.target.files[0] && setSupportingFile(e.target.files[0].name)}
                />
                ⬆ {supportingFile ? `✓ File Selected: ${supportingFile}` : 'Upload supporting documents'}
                <small>{supportingFile ? 'Ready to upload' : 'Optional'}</small>
              </label>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
          <button type="button" className="btn ghost" onClick={() => onNavigate('dashboard')}>Cancel</button>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving to Database...' : 'Save & create application →'}
          </button>
        </div>
      </form>

      {/* POST-REGISTRATION LOAN ONBOARDING MODAL PROMPT */}
      {showPromptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '460px', maxWidth: '90%', padding: '32px', textAlign: 'center', background: '#fff', borderRadius: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-050)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>✓</div>
            <h2 style={{ fontSize: '22px', margin: '0 0 8px' }}>Farmer Registered Successfully!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, margin: '8px 0 24px' }}>
              Farmer <b>{createdFarmerName}</b> has been registered in the database.<br/>
              Would you like to start <b>Farmer KYC Onboarding</b> for loan financing now?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn ok" 
                style={{ width: '100%', padding: '12px' }} 
                onClick={() => { setShowPromptModal(false); onOpenApp(createdAppId); }}
              >
                🚀 Start Loan Onboarding Now →
              </button>
              <button 
                className="btn ghost" 
                style={{ width: '100%', padding: '12px' }} 
                onClick={() => { setShowPromptModal(false); onNavigate('applications'); }}
              >
                📋 Go to Applications Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
