import React, { useState } from 'react';

export default function UsersManager() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Ali Raza', email: 'ali@goagri.pk', role: 'ops_officer', initials: 'AR' },
    { id: 2, name: 'Hina Shah', email: 'hina@goagri.pk', role: 'ops_officer', initials: 'HS' },
    { id: 3, name: 'Bilal Ahmed', email: 'bilal@goagri.pk', role: 'supervisor', initials: 'BA' },
    { id: 4, name: 'Admin Account', email: 'admin@goagri.pk', role: 'admin', initials: 'AD' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'ops_officer', password: '' });
  const [msg, setMsg] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const initials = newUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) || 'US';
    const userObj = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      initials
    };

    setUsers([...users, userObj]);
    setMsg(`Staff account for ${newUser.name} created successfully.`);
    setNewUser({ name: '', email: '', role: 'ops_officer', password: '' });
    setShowAddForm(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const opsCount = users.filter(u => u.role === 'ops_officer').length;
  const supCount = users.filter(u => u.role === 'supervisor').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Users &amp; Roles Manager</h1>
          <p>Staff accounts and RBAC access permissions <span className="role admin" style={{ marginLeft: '6px' }}>Admin Only</span></p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(true)}>＋ Add User Account</button>
      </div>

      {msg && (
        <div className="note" style={{ background: 'var(--green-050)', color: 'var(--green)', marginBottom: '16px' }}>
          ✓ {msg}
        </div>
      )}

      {/* CONSISTENT UI KPI SUMMARY CARDS */}
      <div className="grid g4" style={{ marginBottom: '16px' }}>
        <div className="card stat hover">
          <div className="ic">◔</div>
          <div className="k">Total Staff Users</div>
          <div className="v num">{users.length}</div>
          <div className="d">active portal accounts</div>
        </div>
        <div className="card stat hover">
          <div className="ic">👤</div>
          <div className="k">Operations Officers</div>
          <div className="v num">{opsCount}</div>
          <div className="d">data entry (Maker role)</div>
        </div>
        <div className="card stat hover">
          <div className="ic">🛡️</div>
          <div className="k">Supervisors / Managers</div>
          <div className="v num">{supCount}</div>
          <div className="d">checker approval gates</div>
        </div>
        <div className="card stat hover">
          <div className="ic" style={{ background: 'var(--gold-050)', color: 'var(--gold)' }}>⚙️</div>
          <div className="k">System Admins</div>
          <div className="v num">{adminCount}</div>
          <div className="d">full system access</div>
        </div>
      </div>

      {/* ADD USER MODAL / FORM */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '16px', borderColor: 'var(--pri)' }}>
          <div className="sectitle">Add New Staff Account</div>
          <form onSubmit={handleAddUser}>
            <div className="grid g4">
              <div className="field">
                <label>Full Name <span className="req">*</span></label>
                <div className="inp">
                  <input 
                    type="text" 
                    placeholder="e.g. Tariq Mehmood"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <div className="inp">
                  <input 
                    type="email" 
                    placeholder="e.g. tariq@goagri.pk"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Assigned Role <span className="req">*</span></label>
                <div className="inp sel">
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="ops_officer">Ops Officer (Maker)</option>
                    <option value="supervisor">Supervisor (Checker)</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Password <span className="req">*</span></label>
                <div className="inp">
                  <input 
                    type="password" 
                    placeholder="Password123!"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
              <button type="button" className="btn ghost sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn sm">Create Account →</button>
            </div>
          </form>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="card" style={{ padding: '16px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Staff User</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="fmr">
                    <span className="fav">{u.initials}</span>
                    <b>{u.name}</b>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role ${u.role === 'ops_officer' ? 'ops' : u.role === 'supervisor' ? 'sup' : 'admin'}`}>
                    {u.role === 'ops_officer' ? 'Ops Officer (Maker)' : u.role === 'supervisor' ? 'Supervisor (Checker)' : 'System Admin'}
                  </span>
                </td>
                <td><span className="pill green">Active</span></td>
                <td><button className="btn sec sm" onClick={() => alert(`Managed access settings for ${u.name}`)}>Manage Role →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
