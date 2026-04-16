import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Gift, Plus, Search, Edit2, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const PROMO_TYPES = ['Percentage', 'Fixed', 'BOGO'];

export default function Promotions() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ name: '', code: '', type: 'Percentage', value: '', minOrder: '', maxUses: '', startDate: '', endDate: '', status: 'Active', description: '', applicableCategories: ['All'] });

  const filtered = promotions
    .filter(p => statusFilter === 'All' || p.status === statusFilter)
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = promotions.filter(p => p.status === 'Active').length;
  const totalUsage = promotions.reduce((s, p) => s + (p.usedCount || 0), 0);

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', type: 'Percentage', value: '', minOrder: 0, maxUses: 100, startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], status: 'Active', description: '', applicableCategories: ['All'] }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setShowModal(true); };
  const handleSave = () => { if (editing) updatePromotion(editing.id, form); else addPromotion(form); setShowModal(false); };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Gift size={28} /> Promotions & Discounts</h1>
        {hasPermission('promotions', 'create') && <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> New Promotion</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon green"><Gift size={22} /></div><div className="kpi-info"><div className="kpi-label">Active Promotions</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{activeCount}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon blue"><Tag size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Coupons</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{promotions.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Tag size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Usage</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalUsage.toLocaleString()}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search promotions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Active', 'Expired', 'Scheduled'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Promotion</th><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Valid Period</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(promo => (
              <tr key={promo.id}>
                <td><div style={{ fontWeight: 600 }}>{promo.name}</div><div className="text-xs text-muted">{promo.description}</div></td>
                <td><code style={{ background: 'var(--color-grey-lightest)', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.857rem' }}>{promo.code}</code></td>
                <td><span className="badge badge-grey">{promo.type}</span></td>
                <td style={{ fontWeight: 700 }}>
                  {promo.type === 'Percentage' ? `${promo.value}%` : promo.type === 'Fixed' ? `Rs.${promo.value}` : 'BOGO'}
                </td>
                <td className="text-muted">{promo.minOrder > 0 ? `Rs.${promo.minOrder.toLocaleString()}` : '—'}</td>
                <td>
                  <div style={{ fontSize: '0.857rem' }}>
                    <span style={{ fontWeight: 700 }}>{promo.usedCount}</span>
                    <span className="text-muted"> / {promo.maxUses || '∞'}</span>
                  </div>
                  <div style={{ height: 4, background: '#eee', borderRadius: 2, marginTop: 4, width: 60 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: promo.usedCount >= promo.maxUses ? 'var(--color-danger)' : 'var(--color-success)', width: `${Math.min(100, (promo.usedCount / (promo.maxUses || 1)) * 100)}%` }} />
                  </div>
                </td>
                <td className="text-muted" style={{ fontSize: '0.786rem' }}>{promo.startDate} → {promo.endDate}</td>
                <td><span className={`badge ${promo.status === 'Active' ? 'badge-success' : promo.status === 'Expired' ? 'badge-grey' : 'badge-info'}`}>{promo.status}</span></td>
                <td>
                  <div className="action-cell">
                    {hasPermission('promotions', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(promo)}><Edit2 size={15} /></button>}
                    {hasPermission('promotions', 'delete') && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deletePromotion(promo.id); }}><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} promotions</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Promotion' : 'New Promotion'} footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Create Promotion'}</button></>
      }>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Promotion Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Summer Sale" /></div>
          <div className="form-group"><label className="form-label">Coupon Code</label><input className="form-control" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" style={{ fontFamily: 'monospace', fontWeight: 700 }} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Type</label><select className="form-control form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{PROMO_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{form.type === 'Percentage' ? 'Discount %' : form.type === 'Fixed' ? 'Discount Amount (Rs.)' : 'Value'}</label><input type="number" className="form-control" value={form.value} onChange={e => setForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Min Order (Rs.)</label><input type="number" className="form-control" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="form-group"><label className="form-label">Max Uses</label><input type="number" className="form-control" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        <div className="form-group"><label className="form-label">Status</label><select className="form-control form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option>Active</option><option>Expired</option><option>Scheduled</option></select></div>
      </Modal>
    </div>
  );
}
