import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Building2, Plus, Search, Edit2, Trash2, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchaseOrders } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', address: '', leadTime: '', paymentTerms: 'NET 30', rating: 4, status: 'Active', categories: [] });

  const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.contact?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setEditing(null); setForm({ name: '', contact: '', email: '', phone: '', address: '', leadTime: '', paymentTerms: 'NET 30', rating: 4, status: 'Active', categories: [] }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setShowModal(true); };
  const handleSave = () => { if (editing) updateSupplier(editing.id, form); else addSupplier(form); setShowModal(false); };

  const renderStars = (rating) => Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill={i < Math.floor(rating) ? '#FFD700' : 'none'} stroke={i < Math.floor(rating) ? '#FFD700' : '#ddd'} />);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Building2 size={28} /> Supplier Directory</h1>
        {hasPermission('suppliers', 'create') && <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Supplier</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon blue"><Building2 size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Suppliers</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{suppliers.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><Building2 size={22} /></div><div className="kpi-info"><div className="kpi-label">Active</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{suppliers.filter(s => s.status === 'Active').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Star size={22} /></div><div className="kpi-info"><div className="kpi-label">Avg Rating</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{suppliers.length > 0 ? (suppliers.reduce((s, x) => s + (x.rating || 0), 0) / suppliers.length).toFixed(1) : '—'}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search suppliers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        <table className="data-table">
          <thead><tr><th>Supplier</th><th>Contact</th><th>Lead Time</th><th>Terms</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(sup => (
              <tr key={sup.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{sup.name}</div>
                  <div className="text-xs text-muted">{sup.email}</div>
                </td>
                <td>{sup.contact}<br /><span className="text-xs text-muted">{sup.phone}</span></td>
                <td style={{ fontWeight: 500 }}>{sup.leadTime} days</td>
                <td><span className="badge badge-grey">{sup.paymentTerms}</span></td>
                <td><div style={{ display: 'flex', gap: 1 }}>{renderStars(sup.rating)}</div></td>
                <td><span className={`badge ${sup.status === 'Active' ? 'badge-success' : 'badge-grey'}`}>{sup.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(sup)}><Eye size={15} /></button>
                    {hasPermission('suppliers', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(sup)}><Edit2 size={15} /></button>}
                    {hasPermission('suppliers', 'delete') && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteSupplier(sup.id); }}><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} suppliers</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Add Supplier'}</button></>
      }>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Company Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Contact Person</label><input className="form-control" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Lead Time (days)</label><input type="number" className="form-control" value={form.leadTime} onChange={e => setForm(p => ({ ...p, leadTime: parseInt(e.target.value) || 0 }))} /></div>
          <div className="form-group"><label className="form-label">Payment Terms</label><select className="form-control form-select" value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))}><option>NET 15</option><option>NET 30</option><option>NET 45</option><option>NET 60</option><option>Prepaid</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Rating (1-5)</label><input type="number" min={1} max={5} step={0.1} className="form-control" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="form-group"><label className="form-label">Status</label><select className="form-control form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option>Active</option><option>Inactive</option></select></div>
        </div>
      </Modal>

      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name} size="lg">
        {showDetail && (
          <div>
            <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
              <div><div className="text-sm text-muted">Contact</div><p style={{ fontWeight: 600 }}>{showDetail.contact}</p></div>
              <div><div className="text-sm text-muted">Email</div><p style={{ fontWeight: 600 }}>{showDetail.email}</p></div>
              <div><div className="text-sm text-muted">Phone</div><p style={{ fontWeight: 600 }}>{showDetail.phone}</p></div>
              <div><div className="text-sm text-muted">Address</div><p style={{ fontWeight: 600 }}>{showDetail.address}</p></div>
              <div><div className="text-sm text-muted">Lead Time</div><p style={{ fontWeight: 600 }}>{showDetail.leadTime} days</p></div>
              <div><div className="text-sm text-muted">Payment Terms</div><p style={{ fontWeight: 600 }}>{showDetail.paymentTerms}</p></div>
            </div>
            <h4 style={{ marginBottom: 8 }}>Purchase Orders</h4>
            {(() => {
              const pos = purchaseOrders.filter(po => po.supplier?.id === showDetail.id);
              return pos.length === 0 ? <p className="text-sm text-muted" style={{ padding: 20, textAlign: 'center' }}>No purchase orders found</p> : (
                <table className="data-table" style={{ fontSize: '0.857rem' }}>
                  <thead><tr><th>PO #</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>{pos.map(po => (<tr key={po.id}><td style={{ fontWeight: 600 }}>{po.poNumber}</td><td className="text-muted">{po.date}</td><td style={{ fontWeight: 600 }}>Rs.{po.total?.toLocaleString()}</td><td><span className={`badge ${po.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{po.status}</span></td></tr>))}</tbody>
                </table>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
