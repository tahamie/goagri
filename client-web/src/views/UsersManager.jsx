import React from 'react';

export default function UsersManager() {
  const users = [
    { id: 1, name: 'Ali Raza', email: 'ali@goagri.pk', role: 'ops_officer', initials: 'AR' },
    { id: 2, name: 'Hina Shah', email: 'hina@goagri.pk', role: 'ops_officer', initials: 'HS' },
    { id: 3, name: 'Bilal Ahmed', email: 'bilal@goagri.pk', role: 'supervisor', initials: 'BA' },
    { id: 4, name: 'Admin Account', email: 'admin@goagri.pk', role: 'admin', initials: 'AD' }
  ];

  return (
    <section className="screen on">
      <div className="phead spread">
        <div>
          <h1>Users &amp; Roles</h1>
          <p>Staff accounts and RBAC access <span className="role admin" style={{ marginLeft: '6px' }}>Admin</span></p>
        </div>
        <button className="btn">＋ Add user</button>
      </div>

      <div className="card" style={{ padding: '16px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="fmr">
                    <span className="fav">{u.initials}</span>
                    {u.name}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role ${u.role === 'ops_officer' ? 'ops' : u.role === 'supervisor' ? 'sup' : 'admin'}`}>
                    {u.role === 'ops_officer' ? 'Ops Officer' : u.role === 'supervisor' ? 'Supervisor' : 'Admin'}
                  </span>
                </td>
                <td><span className="pill green">Active</span></td>
                <td><button className="btn sec sm">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
