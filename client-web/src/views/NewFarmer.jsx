import React, { useState } from 'react';
import { registerFarmer } from '../services/api';

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
    initial_financing_requirement: '',
    initial_financing_purpose: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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

    if (!formData.initial_financing_purpose || formData.initial_financing_purpose.trim().length < 3) {
      errs.initial_financing_purpose = 'Financing purpose is required.';
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
      const res = await registerFarmer(formData);
      if (res.success) {
        onOpenApp(res.application_id);
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
                  onChange={e => setFormData({ ...formData, cnic: e.target.value })} 
                />
              </div>
              {errors.cnic && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.cnic}</div>}
            </div>

            <div className="field">
              <label>Mobile Number (03XXXXXXXXX) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.mobile ? 'var(--red)' : undefined }}>
                <input 
                  type="text" 
                  placeholder="03001234567" 
                  value={formData.mobile} 
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })} 
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
                </select>
              </div>
            </div>

            <div className="field">
              <label>Financing Requirement (PKR) <span className="req">*</span></label>
              <div className="inp" style={{ borderColor: errors.initial_financing_requirement ? 'var(--red)' : undefined }}>
                <input 
                  type="number" 
                  placeholder="e.g. 800000"
                  value={formData.initial_financing_requirement} 
                  onChange={e => setFormData({ ...formData, initial_financing_requirement: e.target.value })} 
                />
              </div>
              {errors.initial_financing_requirement && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.initial_financing_requirement}</div>}
            </div>
          </div>

          <div className="field">
            <label>Financing Purpose <span className="req">*</span></label>
            <div className="inp" style={{ borderColor: errors.initial_financing_purpose ? 'var(--red)' : undefined }}>
              <input 
                type="text" 
                placeholder="e.g. Purchase of seeds and fertilizers for wheat crop"
                value={formData.initial_financing_purpose} 
                onChange={e => setFormData({ ...formData, initial_financing_purpose: e.target.value })} 
              />
            </div>
            {errors.initial_financing_purpose && <div style={{ color: 'var(--red)', fontSize: '11.5px', marginTop: '4px' }}>{errors.initial_financing_purpose}</div>}
          </div>
        </div>

        <div className="card">
          <div className="sectitle"><span className="ic">⬆</span> Documents</div>
          <div className="grid g2e">
            <div className="upload">
              ⬆ Upload CNIC (front / back)
              <small>JPG or PDF · up to 5MB</small>
            </div>
            <div className="upload">
              ⬆ Upload supporting documents
              <small>Optional</small>
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
    </section>
  );
}
