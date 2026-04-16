import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { FileText, Plus, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PurchaseOrders() {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, suppliers, products } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ supplierId: '', notes: '', expectedDate: '' });
  const [poItems, setPoItems] = useState([]);

  const filtered = purchaseOrders
    .filter(po => statusFilter === 'All' || po.status === statusFilter)
    .filter(po => po.poNumber?.toLowerCase().includes(search.toLowerCase()) || po.supplier?.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalValue = purchaseOrders.reduce((s, po) => s + (po.total || 0), 0);

  const openCreate = () => {
    setForm({ supplierId: suppliers[0]?.id || '', notes: '', expectedDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] });
    setPoItems([{ productId: products[0]?.id || '', quantity: 10 }]);
    setShowModal(true);
  };

  const addItem = () => setPoItems(prev => [...prev, { productId: products[0]?.id || '', quantity: 10 }]);
  const removeItem = (i) => setPoItems(prev => prev.filter((_, j) => j !== i));

  const handleCreate = () => {
    const supplier = suppliers.find(s => s.id === form.supplierId);
    const items = poItems.map(item => {
      const p = products.find(pr => pr.id === item.productId);
      return { productId: p?.id, productName: p?.name, image: p?.image, quantity: parseInt(item.quantity), unitCost: p?.cost || 0, total: parseInt(item.quantity) * (p?.cost || 0), quantityReceived: 0 };
    });
    const total = items.reduce((s, it) => s + it.total, 0);
    addPurchaseOrder({ supplier, items, total, status: 'Draft', date: new Date().toISOString().split('T')[0], expectedDate: form.expectedDate, notes: form.notes });
    setShowModal(false);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><FileText size={28} /> Purchase Orders</h1>
        {hasPermission('purchase_orders', 'create') && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> New PO</button>}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon blue"><FileText size={22} /></div><div className="kpi-info"><div className="kpi-label">Total POs</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{purchaseOrders.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><FileText size={22} /></div><div className="kpi-info"><div className="kpi-label">Pending</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{purchaseOrders.filter(po => po.status === 'Draft' || po.status === 'Sent').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><FileText size={22} /></div><div className="kpi-info"><div className="kpi-label">Completed</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{purchaseOrders.filter(po => po.status === 'Completed').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon red"><FileText size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Value</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalValue.toLocaleString()}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search POs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Draft', 'Sent', 'Partially Received', 'Completed'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Total</th><th>Date</th><th>Expected</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(po => (
              <tr key={po.id}>
                <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                <td>{po.supplier?.name}</td>
                <td>{po.items?.length} items</td>
                <td style={{ fontWeight: 700 }}>Rs.{po.total?.toLocaleString()}</td>
                <td className="text-muted">{po.date}</td>
                <td className="text-muted">{po.expectedDate}</td>
                <td><span className={`badge ${po.status === 'Completed' ? 'badge-success' : po.status === 'Sent' ? 'badge-info' : po.status === 'Partially Received' ? 'badge-warning' : 'badge-grey'}`}>{po.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(po)}><Eye size={15} /></button>
                    {po.status === 'Draft' && hasPermission('purchase_orders', 'edit') && (
                      <button className="btn btn-ghost btn-sm" onClick={() => updatePurchaseOrder(po.id, { status: 'Sent' })}>Send</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} POs</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Purchase Order" size="lg" footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create PO</button></>
      }>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Supplier</label><select className="form-control form-select" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Expected Date</label><input type="date" className="form-control" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))} /></div>
        </div>
        <h4 style={{ margin: '8px 0' }}>Line Items</h4>
        {poItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select className="form-control form-select" value={item.productId} onChange={e => setPoItems(prev => prev.map((it, j) => j === i ? { ...it, productId: e.target.value } : it))} style={{ flex: 2 }}>{products.map(p => <option key={p.id} value={p.id}>{p.name} (Cost: ${p.cost})</option>)}</select>
            <input type="number" className="form-control" value={item.quantity} onChange={e => setPoItems(prev => prev.map((it, j) => j === i ? { ...it, quantity: e.target.value } : it))} style={{ flex: 0, width: 80 }} />
            <button className="btn btn-ghost btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--color-danger)' }}>×</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addItem}><Plus size={14} /> Add Item</button>
        <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
      </Modal>

      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={`Purchase Order ${showDetail?.poNumber}`} size="lg">
        {showDetail && (
          <div>
            <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
              <div><div className="text-sm text-muted">Supplier</div><p style={{ fontWeight: 600 }}>{showDetail.supplier?.name}</p></div>
              <div><div className="text-sm text-muted">Date</div><p style={{ fontWeight: 600 }}>{showDetail.date}</p></div>
              <div><div className="text-sm text-muted">Expected</div><p style={{ fontWeight: 600 }}>{showDetail.expectedDate}</p></div>
              <div><div className="text-sm text-muted">Status</div><p><span className={`badge ${showDetail.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{showDetail.status}</span></p></div>
            </div>
            <table className="data-table">
              <thead><tr><th>Product</th><th className="text-right">Qty</th><th className="text-right">Unit Cost</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {showDetail.items?.map((item, i) => (
                  <tr key={i}><td>{item.image} {item.productName}</td><td className="text-right">{item.quantity}</td><td className="text-right">Rs.{item.unitCost}</td><td className="text-right" style={{ fontWeight: 600 }}>Rs.{item.total?.toLocaleString()}</td></tr>
                ))}
                <tr style={{ background: 'var(--color-grey-lightest)' }}><td colSpan={3} style={{ fontWeight: 700 }}>Total</td><td className="text-right" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Rs.{showDetail.total?.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
