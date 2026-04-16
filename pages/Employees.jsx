import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Users, Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const { hasPermission, roles } = useAuth();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const departments = ['All', ...new Set(employees.map(e => e.department))];

  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: 'Sales', position: '', salary: '', hireDate: '', status: 'Active', performance: 80
  });

  const filtered = employees
    .filter(e => deptFilter === 'All' || e.department === deptFilter)
    .filter(e => e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', department: 'Sales', position: '', salary: '', hireDate: '', status: 'Active', performance: 80 });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone, department: emp.department,
      position: emp.position, salary: emp.salary, hireDate: emp.hireDate, status: emp.status, performance: emp.performance
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const data = { ...form, salary: parseFloat(form.salary), performance: parseInt(form.performance) };
    if (editing) {
      updateEmployee(editing.id, data);
    } else {
      addEmployee(data);
    }
    setShowModal(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const avgPerf = employees.length > 0 ? employees.reduce((s, e) => s + (e.performance || 0), 0) / employees.length : 0;
  const totalPayroll = employees.filter(e => e.status === 'Active').reduce((s, e) => s + (e.salary || 0), 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Users size={28} /> Employees</h1>
        {hasPermission('employees', 'create') && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Employee</button>
        )}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Users size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Employees</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{employees.length}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Users size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Active</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{employees.filter(e => e.status === 'Active').length}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Users size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Avg Performance</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{avgPerf.toFixed(0)}%</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><Users size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Monthly Payroll</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalPayroll.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {departments.map(d => (
              <button key={d} className={`btn btn-sm ${deptFilter === d ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setDeptFilter(d); setPage(1); }}>{d}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Performance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.714rem', fontWeight: 700
                    }}>
                      {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div className="text-xs text-muted">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-grey">{emp.department}</span></td>
                <td>{emp.position}</td>
                <td style={{ fontWeight: 600 }}>Rs.{emp.salary?.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 50 }}>
                      <div className={`progress-fill ${emp.performance >= 80 ? 'green' : emp.performance >= 60 ? 'yellow' : ''}`}
                        style={{ width: `${emp.performance}%`, background: emp.performance < 60 ? 'var(--color-danger)' : undefined }} />
                    </div>
                    <span className="text-sm">{emp.performance}%</span>
                  </div>
                </td>
                <td><span className={`badge ${emp.status === 'Active' ? 'badge-success' : emp.status === 'On Leave' ? 'badge-warning' : 'badge-grey'}`}>{emp.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => { setSelected(emp); setShowDetail(true); }}><Eye size={15} /></button>
                    {hasPermission('employees', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(emp)}><Edit2 size={15} /></button>}
                    {hasPermission('employees', 'delete') && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteEmployee(emp.id); }}><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-pagination">
          <span>Showing {Math.min(((page - 1) * perPage) + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="table-pagination-btns">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Employee Details" size="lg">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700
              }}>
                {selected.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{selected.name}</h2>
                <span className="text-muted">{selected.position} • {selected.department}</span>
              </div>
              <span className={`badge ${selected.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>{selected.status}</span>
            </div>

            <div className="detail-grid">
              <div className="detail-item"><label>Email</label><span>{selected.email}</span></div>
              <div className="detail-item"><label>Phone</label><span>{selected.phone}</span></div>
              <div className="detail-item"><label>Department</label><span>{selected.department}</span></div>
              <div className="detail-item"><label>Position</label><span>{selected.position}</span></div>
              <div className="detail-item"><label>Salary</label><span style={{ fontWeight: 600 }}>Rs.{selected.salary?.toLocaleString()}/mo</span></div>
              <div className="detail-item"><label>Hire Date</label><span>{selected.hireDate}</span></div>
            </div>

            <div style={{ marginTop: 24 }}>
              <label className="form-label">Performance Score</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <div className="progress-bar" style={{ flex: 1, height: 12 }}>
                  <div className={`progress-fill ${selected.performance >= 80 ? 'green' : selected.performance >= 60 ? 'yellow' : ''}`}
                    style={{ width: `${selected.performance}%`, background: selected.performance < 60 ? 'var(--color-danger)' : undefined }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selected.performance}%</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Add Employee'}</button>
        </>
      }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@erp.com" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1-555-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control form-select" value={form.department} onChange={e => update('department', e.target.value)}>
              <option>Management</option><option>Sales</option><option>Finance</option><option>Human Resources</option>
              <option>Marketing</option><option>Engineering</option><option>Operations</option><option>Support</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Position</label>
            <input className="form-control" value={form.position} onChange={e => update('position', e.target.value)} placeholder="Job title" />
          </div>
          <div className="form-group">
            <label className="form-label">Salary ($/month)</label>
            <input type="number" className="form-control" value={form.salary} onChange={e => update('salary', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hire Date</label>
            <input type="date" className="form-control" value={form.hireDate} onChange={e => update('hireDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control form-select" value={form.status} onChange={e => update('status', e.target.value)}>
              <option>Active</option><option>On Leave</option><option>Terminated</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Performance Score ({form.performance}%)</label>
          <input type="range" min="0" max="100" value={form.performance} onChange={e => update('performance', e.target.value)} style={{ width: '100%' }} />
        </div>
      </Modal>
    </div>
  );
}
