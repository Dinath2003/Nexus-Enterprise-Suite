import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Users, Search, Plus, Edit2, Trash2, Eye, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CRM() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, posTransactions, orders } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);

  const openAdd = () => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '', notes: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, notes: c.notes || '' }); setShowModal(true); };
  const handleSave = () => { if (editing) updateCustomer(editing.id, form); else addCustomer(form); setShowModal(false); };

  const getCustomerOrders = (name) => [...orders.filter(o => o.customer?.name === name), ...posTransactions.filter(t => t.customerName === name).map(t => ({ ...t, orderNumber: t.receiptNumber, total: t.total, date: t.date, status: 'POS Sale' }))].sort((a, b) => b.date?.localeCompare(a.date));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Users size={28} /> Customer Directory</h1>
        {hasPermission('crm', 'create') && <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Customer</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon blue"><Users size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Customers</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{customers.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><Users size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Revenue</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalSpent.toLocaleString()}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Users size={22} /></div><div className="kpi-info"><div className="kpi-label">Avg. Spend</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{customers.length > 0 ? Math.round(totalSpent / customers.length).toLocaleString() : 0}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Contact</th><th>Total Spent</th><th>Loyalty</th><th>Member Since</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.714rem', fontWeight: 700 }}>{c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div><div style={{ fontWeight: 600 }}>{c.name}</div><div className="text-xs text-muted">{c.address}</div></div>
                  </div>
                </td>
                <td><div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="text-sm"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />{c.email}</span><span className="text-xs text-muted"><Phone size={10} style={{ display: 'inline', marginRight: 4 }} />{c.phone}</span></div></td>
                <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>Rs.{(c.totalSpent || 0).toLocaleString()}</td>
                <td><span className={`badge ${c.loyaltyTier === 'Platinum' ? 'badge-primary' : c.loyaltyTier === 'Gold' ? 'badge-warning' : c.loyaltyTier === 'Silver' ? 'badge-grey' : 'badge-info'}`}>{c.loyaltyTier || 'Bronze'}</span></td>
                <td className="text-muted">{c.joinDate || '—'}</td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(c)}><Eye size={15} /></button>
                    {hasPermission('crm', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(c)}><Edit2 size={15} /></button>}
                    {hasPermission('crm', 'delete') && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteCustomer(c.id); }}><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} customers</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'} footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Add Customer'}</button></>
      }>
        <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
      </Modal>

      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name} size="lg">
        {showDetail && (() => {
          const history = getCustomerOrders(showDetail.name);
          return (
            <div>
              <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
                <div><div className="text-sm text-muted">Email</div><p style={{ fontWeight: 600 }}>{showDetail.email}</p></div>
                <div><div className="text-sm text-muted">Phone</div><p style={{ fontWeight: 600 }}>{showDetail.phone}</p></div>
                <div><div className="text-sm text-muted">Address</div><p style={{ fontWeight: 600 }}>{showDetail.address}</p></div>
                <div><div className="text-sm text-muted">Member Since</div><p style={{ fontWeight: 600 }}>{showDetail.joinDate || '—'}</p></div>
              </div>
              <div className="grid grid-3" style={{ marginBottom: 20 }}>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}><div className="text-sm text-muted">Total Spent</div><div style={{ fontWeight: 800, color: 'var(--color-success)' }}>Rs.{(showDetail.totalSpent || 0).toLocaleString()}</div></div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}><div className="text-sm text-muted">Loyalty Points</div><div style={{ fontWeight: 800 }}>{(showDetail.loyaltyPoints || 0).toLocaleString()}</div></div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}><div className="text-sm text-muted">Orders</div><div style={{ fontWeight: 800 }}>{history.length}</div></div>
              </div>
              {showDetail.notes && <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}><div className="text-sm text-muted" style={{ marginBottom: 4 }}>Notes</div><div className="text-sm">{showDetail.notes}</div></div>}
              <h4 style={{ marginBottom: 8 }}>Purchase History</h4>
              {history.length === 0 ? <p className="text-sm text-muted" style={{ textAlign: 'center', padding: 20 }}>No orders found</p> : (
                <table className="data-table" style={{ fontSize: '0.857rem' }}>
                  <thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>{history.slice(0, 15).map((o, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{o.orderNumber}</td><td className="text-muted">{o.date}</td><td style={{ fontWeight: 700 }}>Rs.{o.total?.toFixed?.(2) || o.total}</td><td><span className={`badge ${o.status === 'Delivered' || o.status === 'POS Sale' ? 'badge-success' : 'badge-grey'}`}>{o.status}</span></td></tr>))}</tbody>
                </table>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
