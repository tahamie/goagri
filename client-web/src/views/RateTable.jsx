import React, { useState, useEffect } from 'react';
import { fetchRateTable } from '../services/api';

export default function RateTable() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    fetchRateTable().then(res => {
      if (res.success) setRates(res.rates);
    }).catch(console.error);
  }, []);

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Rate Table</h1>
          <p>Crop yield &amp; market rates used in yield assessment <span className="role admin" style={{ marginLeft: '6px' }}>Admin</span></p>
        </div>
        <button className="btn">＋ Add crop</button>
      </div>

      <div className="card" style={{ padding: '16px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Yield / acre</th>
              <th>Market rate (PKR)</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id}>
                <td><b>{r.crop_name}</b></td>
                <td>{r.yield_per_acre_maunds} {r.unit}</td>
                <td className="num">{Number(r.market_rate_pkr).toLocaleString()} / {r.unit}</td>
                <td style={{ color: 'var(--muted)' }}>{new Date(r.updated_at).toLocaleDateString()}</td>
                <td><button className="btn sec sm">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note gold" style={{ marginTop: '14px' }}>Market rates are maintained by Admin and drive auto yield calculations.</div>
    </section>
  );
}
