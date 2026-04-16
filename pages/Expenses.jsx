import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { CreditCard, Plus, Search, Edit2, Trash2, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [form, setForm] = useState({ category: 'Supplies', description: '', amount: '', date: '', recurring: false, status: 'Pending' });
  const categories = ['All', 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Travel', 'Insurance', 'Maintenance'];

  const filtered = expenses
    .filter(e => categoryFilter === 'All' || e.category === categoryFilter)
    .filter(e => statusFilter === 'All' || e.status === statusFilter)
    .filter(e => e.description?.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const catBreakdown = {};
  expenses.filter(e => e.status === 'Approved').forEach(e => {
    catBreakdown[e.category] = (catBreakdown[e.category] || 0) + e.amount;
  });
  const catLabels = Object.keys(catBreakdown);
  const catValues = Object.values(catBreakdown);
  const catColors = ['#f5141f', '#1a1a1a', '#6b7280', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const categoryChartData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: catColors.slice(0, catLabels.length),
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ category: 'Supplies', description: '', amount: '', date: new Date().toISOString().split('T')[0], recurring: false, status: 'Pending' });
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({ category: e.category, description: e.description, amount: e.amount, date: e.date, recurring: e.recurring, status: e.status });
    setShowModal(true);
  };

  const handleSave = () => {
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editing) {
      updateExpense(editing.id, data);
    } else {
      addExpense(data);
    }
    setShowModal(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><CreditCard size={28} /> Expenses</h1>
        {hasPermission('expenses', 'create') && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Expense</button>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><CreditCard size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Approved</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalApproved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Clock size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Pending Approval</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalPending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="card" style={{ minHeight: 'auto' }}>
          <div className="card-header" style={{ paddingBottom: 8 }}><h3 style={{ fontSize: '0.857rem' }}>By Category</h3></div>
          <div style={{ height: 100, padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search expenses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select className="form-control form-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.857rem' }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            {['All', 'Approved', 'Pending'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Recurring</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(exp => (
              <tr key={exp.id}>
                <td><span className="badge badge-grey">{exp.category}</span></td>
                <td style={{ fontWeight: 500 }}>{exp.description}</td>
                <td style={{ fontWeight: 600 }}>Rs.{exp.amount?.toLocaleString()}</td>
                <td className="text-muted">{exp.date}</td>
                <td>{exp.recurring ? <span className="badge badge-info">Yes</span> : <span className="text-muted">No</span>}</td>
                <td><span className={`badge ${exp.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{exp.status}</span></td>
                <td>
                  <div className="action-cell">
                    {hasPermission('expenses', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(exp)}><Edit2 size={15} /></button>}
                    {hasPermission('expenses', 'edit') && exp.status === 'Pending' && (
                      <button className="btn btn-ghost btn-icon" title="Approve" style={{ color: 'var(--color-success)' }} onClick={() => updateExpense(exp.id, { status: 'Approved' })}><CheckCircle size={15} /></button>
                    )}
                    {hasPermission('expenses', 'delete') && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteExpense(exp.id); }}><Trash2 size={15} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Add Expense'}</button>
        </>
      }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control form-select" value={form.category} onChange={e => update('category', e.target.value)}>
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input type="number" className="form-control" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-control" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Expense description" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => update('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control form-select" value={form.status} onChange={e => update('status', e.target.value)}>
              <option>Pending</option><option>Approved</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.recurring} onChange={e => update('recurring', e.target.checked)} />
            <span>Recurring expense (monthly)</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
