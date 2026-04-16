import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { ArrowRightLeft, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StockTransfers() {
  const { stockTransfers, addStockTransfer, updateStockTransfer, products } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ productId: '', quantity: '', fromZone: 'Zone A', toZone: 'Zone B' });
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Main Store'];

  const filtered = stockTransfers
    .filter(t => statusFilter === 'All' || t.status === statusFilter)
    .filter(t => t.transferNumber?.toLowerCase().includes(search.toLowerCase()) || t.productName?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCreate = () => {
    const prod = products.find(p => p.id === form.productId);
    if (!prod) return;
    addStockTransfer({ productId: prod.id, productName: prod.name, image: prod.image, quantity: parseInt(form.quantity), fromZone: form.fromZone, toZone: form.toZone, status: 'Requested', date: new Date().toISOString().split('T')[0], requestedBy: 'Current User' });
    setShowModal(false);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><ArrowRightLeft size={28} /> Stock Transfers</h1>
        {hasPermission('transfers', 'create') && <button className="btn btn-primary" onClick={() => { setForm({ productId: products[0]?.id || '', quantity: '', fromZone: 'Zone A', toZone: 'Zone B' }); setShowModal(true); }}><Plus size={18} /> New Transfer</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon blue"><ArrowRightLeft size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Transfers</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{stockTransfers.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><ArrowRightLeft size={22} /></div><div className="kpi-info"><div className="kpi-label">In Transit</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{stockTransfers.filter(t => t.status === 'In Transit').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><ArrowRightLeft size={22} /></div><div className="kpi-info"><div className="kpi-label">Completed</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{stockTransfers.filter(t => t.status === 'Completed').length}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search transfers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Requested', 'In Transit', 'Completed'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Transfer #</th><th>Product</th><th>Qty</th><th>From</th><th></th><th>To</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(tf => (
              <tr key={tf.id}>
                <td style={{ fontWeight: 600 }}>{tf.transferNumber}</td>
                <td>{tf.image} {tf.productName}</td>
                <td style={{ fontWeight: 700 }}>{tf.quantity}</td>
                <td><span className="badge badge-grey">{tf.fromZone}</span></td>
                <td style={{ textAlign: 'center' }}>→</td>
                <td><span className="badge badge-info">{tf.toZone}</span></td>
                <td className="text-muted">{tf.date}</td>
                <td><span className={`badge ${tf.status === 'Completed' ? 'badge-success' : tf.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>{tf.status}</span></td>
                <td>
                  <div className="action-cell">
                    {tf.status === 'Requested' && hasPermission('transfers', 'edit') && (
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStockTransfer(tf.id, { status: 'In Transit' })}>Ship</button>
                    )}
                    {tf.status === 'In Transit' && hasPermission('transfers', 'edit') && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => updateStockTransfer(tf.id, { status: 'Completed' })}>Complete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} transfers</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Stock Transfer" footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Transfer</button></>
      }>
        <div className="form-group"><label className="form-label">Product</label><select className="form-control form-select" value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}>{products.map(p => <option key={p.id} value={p.id}>{p.image} {p.name} (Stock: {p.stock})</option>)}</select></div>
        <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-control" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">From Zone</label><select className="form-control form-select" value={form.fromZone} onChange={e => setForm(p => ({ ...p, fromZone: e.target.value }))}>{zones.map(z => <option key={z}>{z}</option>)}</select></div>
          <div className="form-group"><label className="form-label">To Zone</label><select className="form-control form-select" value={form.toZone} onChange={e => setForm(p => ({ ...p, toZone: e.target.value }))}>{zones.filter(z => z !== form.fromZone).map(z => <option key={z}>{z}</option>)}</select></div>
        </div>
      </Modal>
    </div>
  );
}
