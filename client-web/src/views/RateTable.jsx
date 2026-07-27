import React, { useState, useEffect } from 'react';
import { fetchRateTable, updateCropRate } from '../services/api';

export default function RateTable() {
  const [rates, setRates] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newCrop, setNewCrop] = useState({ crop_name: '', yield_per_acre_maunds: '', market_rate_pkr: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState('');

  const loadRates = () => {
    fetchRateTable().then(res => {
      if (res.success && res.rates) setRates(res.rates);
    }).catch(console.error);
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await updateCropRate(editingItem.id, {
        yield_per_acre_maunds: editingItem.yield_per_acre_maunds,
        market_rate_pkr: editingItem.market_rate_pkr
      });
      if (res.success) {
        setMsg('Rate table updated successfully.');
        setEditingItem(null);
        loadRates();
      }
    } catch (err) {
      alert('Error updating rate: ' + err.message);
    }
  };

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Crop Rate Table</h1>
          <p>Crop yield &amp; market prices used in automated crop value engine <span className="role admin" style={{ marginLeft: '6px' }}>Admin Only</span></p>
        </div>
        <button className="btn" onClick={() => setShowAddModal(true)}>＋ Add Crop Policy</button>
      </div>

      {msg && (
        <div className="note" style={{ background: 'var(--green-050)', color: 'var(--green)', marginBottom: '16px' }}>
          ✓ {msg}
        </div>
      )}

      {/* CONSISTENT UI KPI SUMMARY CARDS */}
      <div className="grid g4" style={{ marginBottom: '16px' }}>
        <div className="card stat hover">
          <div className="ic">₨</div>
          <div className="k">Configured Crops</div>
          <div className="v num">{rates.length}</div>
          <div className="d">active crop rate policies</div>
        </div>
        <div className="card stat hover">
          <div className="ic">🌾</div>
          <div className="k">Wheat Benchmark</div>
          <div className="v num">PKR 3,900</div>
          <div className="d">per maund (45 maund/acre)</div>
        </div>
        <div className="card stat hover">
          <div className="ic">☁️</div>
          <div className="k">Cotton Benchmark</div>
          <div className="v num">PKR 8,500</div>
          <div className="d">per maund (25 maund/acre)</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>⚙️</div>
          <div className="k">Policy Status</div>
          <div className="v num">Active</div>
          <div className="d">drives Step 6 yield calc</div>
        </div>
      </div>

      {/* EDIT MODAL / INLINE FORM */}
      {editingItem && (
        <div className="card" style={{ marginBottom: '16px', borderColor: 'var(--pri)' }}>
          <div className="sectitle">Edit Crop Policy: <b>{editingItem.crop_name}</b></div>
          <form onSubmit={handleSaveEdit}>
            <div className="grid g2e">
              <div className="field">
                <label>Expected Yield per Acre (Maunds)</label>
                <div className="inp">
                  <input 
                    type="number" 
                    step="0.5"
                    placeholder="e.g. 45.00"
                    value={editingItem.yield_per_acre_maunds} 
                    onChange={e => setEditingItem({ ...editingItem, yield_per_acre_maunds: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Market Price per Maund (PKR)</label>
                <div className="inp">
                  <input 
                    type="number"
                    placeholder="e.g. 3900" 
                    value={editingItem.market_rate_pkr} 
                    onChange={e => setEditingItem({ ...editingItem, market_rate_pkr: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
              <button type="button" className="btn ghost sm" onClick={() => setEditingItem(null)}>Cancel</button>
              <button type="submit" className="btn sm">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* RATE TABLE VIEW */}
      <div className="card" style={{ padding: '16px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Standard Yield / Acre</th>
              <th>Market Rate (PKR)</th>
              <th>Unit</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id}>
                <td><b>{r.crop_name}</b></td>
                <td>{r.yield_per_acre_maunds} {r.unit}</td>
                <td className="num">PKR {Number(r.market_rate_pkr).toLocaleString()} / {r.unit}</td>
                <td>{r.unit}</td>
                <td style={{ color: 'var(--muted)' }}>{new Date(r.updated_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn sec sm" onClick={() => setEditingItem(r)}>Edit Rate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note gold" style={{ marginTop: '14px' }}>
        💡 Market rates are maintained by System Admins and drive Step 6 yield calculations across all applications.
      </div>
    </section>
  );
}
