import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Truck, Plus, Search, Eye, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Inbound() {
  const { grns, addGRN, updateGRN, suppliers, products, updateProduct } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [form, setForm] = useState({ supplierId: '', poNumber: '', items: [], notes: '' });
  const [grnItems, setGrnItems] = useState([]);

  const filtered = grns
    .filter(g => statusFilter === 'All' || g.status === statusFilter)
    .filter(g => g.grnNumber?.toLowerCase().includes(search.toLowerCase()) || g.supplier?.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setForm({ supplierId: suppliers[0]?.id || '', poNumber: '', notes: '' });
    setGrnItems(products.slice(0, 3).map(p => ({ productId: p.id, productName: p.name, image: p.image, expectedQty: 10, receivedQty: 0, damagedQty: 0 })));
    setShowModal(true);
  };

  const handleCreate = () => {
    const supplier = suppliers.find(s => s.id === form.supplierId);
    addGRN({ supplier, poNumber: form.poNumber, items: grnItems, status: 'Pending', receivedDate: new Date().toISOString().split('T')[0], receivedBy: 'Current User', notes: form.notes });
    setShowModal(false);
  };

  const completeGRN = (grn) => {
    updateGRN(grn.id, { status: 'Completed' });
    grn.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) updateProduct(prod.id, { stock: prod.stock + item.receivedQty - item.damagedQty });
    });
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Truck size={28} /> Inbound Shipments (GRN)</h1>
        {hasPermission('inbound', 'create') && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> New GRN</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon blue"><Truck size={22} /></div><div className="kpi-info"><div className="kpi-label">Total GRNs</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{grns.length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Truck size={22} /></div><div className="kpi-info"><div className="kpi-label">Pending</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{grns.filter(g => g.status === 'Pending').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><CheckCircle size={22} /></div><div className="kpi-info"><div className="kpi-label">Completed</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{grns.filter(g => g.status === 'Completed').length}</div></div></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search GRNs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Pending', 'Inspecting', 'Completed'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>GRN #</th><th>Supplier</th><th>PO #</th><th>Items</th><th>Date</th><th>Received By</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(grn => (
              <tr key={grn.id}>
                <td style={{ fontWeight: 600 }}>{grn.grnNumber}</td>
                <td>{grn.supplier?.name}</td>
                <td className="text-muted">{grn.poNumber || '—'}</td>
                <td>{grn.items?.length} items</td>
                <td className="text-muted">{grn.receivedDate}</td>
                <td>{grn.receivedBy}</td>
                <td><span className={`badge ${grn.status === 'Completed' ? 'badge-success' : grn.status === 'Inspecting' ? 'badge-info' : 'badge-warning'}`}>{grn.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(grn)}><Eye size={15} /></button>
                    {grn.status !== 'Completed' && hasPermission('inbound', 'edit') && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => completeGRN(grn)}><CheckCircle size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="table-pagination"><span>{filtered.length} GRNs</span><div className="table-pagination-btns"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>))}<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div></div>}
      </div>

      {/* Create GRN Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Goods Received Note" size="lg" footer={
        <><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create GRN</button></>
      }>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Supplier</label><select className="form-control form-select" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">PO Reference</label><input className="form-control" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} placeholder="PO-2026-XXXX" /></div>
        </div>
        <h4 style={{ margin: '12px 0 8px' }}>Items</h4>
        <table className="data-table" style={{ fontSize: '0.857rem' }}>
          <thead><tr><th>Product</th><th>Expected</th><th>Received</th><th>Damaged</th></tr></thead>
          <tbody>
            {grnItems.map((item, i) => (
              <tr key={i}>
                <td>{item.image} {item.productName}</td>
                <td><input type="number" value={item.expectedQty} onChange={e => setGrnItems(prev => prev.map((it, j) => j === i ? { ...it, expectedQty: parseInt(e.target.value) || 0 } : it))} style={{ width: 60, padding: 4, border: '1px solid var(--color-grey-light)', borderRadius: 4, textAlign: 'center' }} /></td>
                <td><input type="number" value={item.receivedQty} onChange={e => setGrnItems(prev => prev.map((it, j) => j === i ? { ...it, receivedQty: parseInt(e.target.value) || 0 } : it))} style={{ width: 60, padding: 4, border: '1px solid var(--color-grey-light)', borderRadius: 4, textAlign: 'center' }} /></td>
                <td><input type="number" value={item.damagedQty} onChange={e => setGrnItems(prev => prev.map((it, j) => j === i ? { ...it, damagedQty: parseInt(e.target.value) || 0 } : it))} style={{ width: 60, padding: 4, border: '1px solid var(--color-grey-light)', borderRadius: 4, textAlign: 'center' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
      </Modal>

      {/* GRN Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={`GRN ${showDetail?.grnNumber}`}>
        {showDetail && (
          <div>
            <div className="grid grid-2" style={{ gap: 12, marginBottom: 16 }}>
              <div><span className="text-sm text-muted">Supplier</span><p style={{ fontWeight: 600 }}>{showDetail.supplier?.name}</p></div>
              <div><span className="text-sm text-muted">Date</span><p style={{ fontWeight: 600 }}>{showDetail.receivedDate}</p></div>
              <div><span className="text-sm text-muted">PO Reference</span><p style={{ fontWeight: 600 }}>{showDetail.poNumber || '—'}</p></div>
              <div><span className="text-sm text-muted">Received By</span><p style={{ fontWeight: 600 }}>{showDetail.receivedBy}</p></div>
            </div>
            <table className="data-table" style={{ fontSize: '0.857rem' }}>
              <thead><tr><th>Product</th><th className="text-right">Expected</th><th className="text-right">Received</th><th className="text-right">Damaged</th><th>Variance</th></tr></thead>
              <tbody>
                {showDetail.items?.map((item, i) => {
                  const variance = item.receivedQty - item.expectedQty;
                  return (
                    <tr key={i}>
                      <td>{item.image} {item.productName}</td>
                      <td className="text-right">{item.expectedQty}</td>
                      <td className="text-right">{item.receivedQty}</td>
                      <td className="text-right">{item.damagedQty}</td>
                      <td><span style={{ fontWeight: 700, color: variance === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{variance >= 0 ? '+' : ''}{variance}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
