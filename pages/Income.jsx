import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Wallet, Plus, Search, Edit2, Trash2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Income() {
  const { income, addIncome, updateIncome, deleteIncome } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [form, setForm] = useState({
    source: 'Product Sales', description: '', amount: '', date: '',
    category: 'Operating', recurring: false, status: 'Received',
    reference: '', account: 'Sales Revenue', taxable: true
  });

  const sources = ['All', ...new Set(income.map(i => i.source))];

  const filtered = income
    .filter(i => sourceFilter === 'All' || i.source === sourceFilter)
    .filter(i => statusFilter === 'All' || i.status === statusFilter)
    .filter(i => i.description?.toLowerCase().includes(search.toLowerCase()) || i.source?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalReceived = income.filter(i => i.status === 'Received').reduce((s, i) => s + i.amount, 0);
  const totalPending = income.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);

  // Monthly income chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyIncome = Array(6).fill(0);
  income.filter(i => i.status === 'Received').forEach(inc => {
    const m = parseInt(inc.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyIncome[m] += inc.amount;
  });

  const monthlyChartData = {
    labels: months,
    datasets: [{
      label: 'Income',
      data: monthlyIncome,
      backgroundColor: months.map((_, i) => i === months.length - 1 ? '#f5141f' : 'rgba(245, 20, 31, 0.2)'),
      borderRadius: 6, barThickness: 36,
    }]
  };

  // Source breakdown
  const sourceBreakdown = {};
  income.filter(i => i.status === 'Received').forEach(i => {
    sourceBreakdown[i.source] = (sourceBreakdown[i.source] || 0) + i.amount;
  });
  const srcLabels = Object.keys(sourceBreakdown);
  const srcValues = Object.values(sourceBreakdown);
  const srcColors = ['#f5141f', '#1a1a1a', '#6b7280', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const sourceChartData = {
    labels: srcLabels,
    datasets: [{ data: srcValues, backgroundColor: srcColors.slice(0, srcLabels.length), borderWidth: 0, hoverOffset: 8 }]
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ source: 'Product Sales', description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Operating', recurring: false, status: 'Received', reference: '', account: 'Sales Revenue', taxable: true });
    setShowModal(true);
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({ source: inc.source, description: inc.description, amount: inc.amount, date: inc.date, category: inc.category, recurring: inc.recurring, status: inc.status, reference: inc.reference, account: inc.account, taxable: inc.taxable });
    setShowModal(true);
  };

  const handleSave = () => {
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editing) { updateIncome(editing.id, data); }
    else { addIncome(data); }
    setShowModal(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Wallet size={28} /> Income</h1>
        {hasPermission('income', 'create') && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Record Income</button>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon green"><Wallet size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Income</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><TrendingUp size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Received</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Wallet size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalPending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Monthly Income</h3></div>
          <div className="chart-container" style={{ height: 260 }}>
            <Bar data={monthlyChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', cornerRadius: 8, padding: 12 } },
              scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => 'Rs.' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K') } } }
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Income Sources</h3></div>
          <div className="chart-container" style={{ height: 260 }}>
            <Doughnut data={sourceChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11, family: 'Inter' } } } } }} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search income records..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select className="form-control form-select" value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.857rem' }}>
              {sources.map(s => <option key={s}>{s}</option>)}
            </select>
            {['All', 'Received', 'Pending'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Source</th><th>Description</th><th>Account</th><th>Amount</th><th>Date</th><th>Category</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paged.map(inc => (
              <tr key={inc.id}>
                <td style={{ fontWeight: 600 }}>{inc.source}</td>
                <td>{inc.description}</td>
                <td className="text-muted">{inc.account}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>+${inc.amount?.toLocaleString()}</td>
                <td className="text-muted">{inc.date}</td>
                <td><span className={`badge ${inc.category === 'Operating' ? 'badge-info' : 'badge-grey'}`}>{inc.category}</span></td>
                <td><span className={`badge ${inc.status === 'Received' ? 'badge-success' : 'badge-warning'}`}>{inc.status}</span></td>
                <td>
                  <div className="action-cell">
                    {hasPermission('income', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(inc)}><Edit2 size={15} /></button>}
                    {hasPermission('income', 'delete') && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteIncome(inc.id); }}><Trash2 size={15} /></button>}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Income' : 'Record Income'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Record Income'}</button>
        </>
      }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Income Source</label>
            <select className="form-control form-select" value={form.source} onChange={e => update('source', e.target.value)}>
              <option>Product Sales</option><option>Service Revenue</option><option>Consulting Fees</option>
              <option>Subscription Revenue</option><option>Licensing Fees</option><option>Interest Income</option>
              <option>Commission Income</option><option>Rental Income</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input type="number" className="form-control" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-control" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Income description" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => update('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Account</label>
            <select className="form-control form-select" value={form.account} onChange={e => update('account', e.target.value)}>
              <option>Sales Revenue</option><option>Service Revenue</option><option>Consulting Revenue</option>
              <option>Subscription Revenue</option><option>Other Revenue</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control form-select" value={form.category} onChange={e => update('category', e.target.value)}>
              <option>Operating</option><option>Non-Operating</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reference #</label>
            <input className="form-control" value={form.reference} onChange={e => update('reference', e.target.value)} placeholder="INV-XXX" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control form-select" value={form.status} onChange={e => update('status', e.target.value)}>
              <option>Received</option><option>Pending</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6, paddingBottom: 4 }}>
            <label className="form-check"><input type="checkbox" checked={form.recurring} onChange={e => update('recurring', e.target.checked)} /><span>Recurring</span></label>
            <label className="form-check"><input type="checkbox" checked={form.taxable} onChange={e => update('taxable', e.target.checked)} /><span>Taxable</span></label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
