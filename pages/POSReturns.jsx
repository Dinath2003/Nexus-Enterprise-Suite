import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { RotateCcw, Search, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Eye, Package } from 'lucide-react';

const REASONS = ['Defective', 'Wrong Item', 'Changed Mind', 'Damaged in Transit', 'Not as Described', 'Other'];

export default function POSReturns() {
  const { returns, addReturn, updateReturn, posTransactions, products, updateProduct } = useData();
  const { hasPermission, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [receiptLookup, setReceiptLookup] = useState('');
  const [foundTxn, setFoundTxn] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [showDetail, setShowDetail] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = returns
    .filter(r => statusFilter === 'All' || r.status === statusFilter)
    .filter(r => r.returnNumber?.toLowerCase().includes(search.toLowerCase()) || r.originalReceipt?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalRefunds = returns.filter(r => r.status === 'Completed').reduce((s, r) => s + r.refundAmount, 0);
  const pendingReturns = returns.filter(r => r.status === 'Pending').length;

  const lookupReceipt = () => {
    const txn = posTransactions.find(t => t.receiptNumber.toLowerCase() === receiptLookup.toLowerCase());
    if (txn) {
      setFoundTxn(txn);
      setReturnItems(txn.items.map(it => ({ ...it, returnQty: 0, reason: 'Defective', selected: false })));
    } else {
      setFoundTxn(null);
      setReturnItems([]);
    }
  };

  const toggleItem = (idx) => {
    setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: !it.selected, returnQty: !it.selected ? it.quantity : 0 } : it));
  };

  const processReturn = () => {
    const selectedItems = returnItems.filter(it => it.selected && it.returnQty > 0);
    if (selectedItems.length === 0) return;
    const refund = selectedItems.reduce((s, it) => s + it.price * it.returnQty, 0);
    const tax = Math.round(refund * 0.1 * 100) / 100;
    const ret = addReturn({
      originalReceipt: foundTxn.receiptNumber,
      originalTransactionId: foundTxn.id,
      items: selectedItems.map(it => ({ productId: it.productId, productName: it.productName, returnQty: it.returnQty, price: it.price, reason: it.reason, image: it.image })),
      refundAmount: Math.round((refund + tax) * 100) / 100,
      refundMethod: foundTxn.paymentMethod,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      processedBy: user?.name || 'System',
      notes: ''
    });
    setShowModal(false);
    setFoundTxn(null);
    setReturnItems([]);
    setReceiptLookup('');
  };

  const approveReturn = (ret) => {
    updateReturn(ret.id, { status: 'Completed' });
    // Restock items
    ret.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) updateProduct(prod.id, { stock: prod.stock + item.returnQty });
    });
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><RotateCcw size={28} /> Returns & Exchanges</h1>
        {hasPermission('pos_returns', 'create') && (
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setFoundTxn(null); setReceiptLookup(''); }}>
            <RotateCcw size={18} /> Process Return
          </button>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><RotateCcw size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Returns</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{returns.length}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><AlertTriangle size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{pendingReturns}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Package size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Refunded</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalRefunds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search returns..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Pending', 'Approved', 'Completed'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Return #</th><th>Original Receipt</th><th>Items</th><th>Refund</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(ret => (
              <tr key={ret.id}>
                <td style={{ fontWeight: 600 }}>{ret.returnNumber}</td>
                <td className="text-muted">{ret.originalReceipt}</td>
                <td>{ret.items?.length} item{ret.items?.length !== 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-${ret.refundAmount?.toFixed(2)}</td>
                <td><span className="badge badge-grey">{ret.refundMethod}</span></td>
                <td className="text-muted">{ret.date}</td>
                <td><span className={`badge ${ret.status === 'Completed' ? 'badge-success' : ret.status === 'Approved' ? 'badge-info' : 'badge-warning'}`}>{ret.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(ret)}><Eye size={15} /></button>
                    {ret.status === 'Pending' && hasPermission('pos_returns', 'edit') && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => approveReturn(ret)}><CheckCircle size={14} /> Approve</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="table-pagination">
            <span>{filtered.length} return{filtered.length !== 1 ? 's' : ''}</span>
            <div className="table-pagination-btns">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Process Return Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Process Return" size="lg" footer={
        foundTxn && returnItems.some(it => it.selected) ? <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={processReturn}>Process Return</button>
        </> : null
      }>
        <div className="form-group">
          <label className="form-label">Receipt Number Lookup</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="POS-0001" value={receiptLookup} onChange={e => setReceiptLookup(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupReceipt()} />
            <button className="btn btn-secondary" onClick={lookupReceipt}><Search size={16} /> Find</button>
          </div>
        </div>

        {receiptLookup && !foundTxn && <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-danger)' }}>❌ Receipt not found</div>}

        {foundTxn && (
          <>
            <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{foundTxn.receiptNumber}</span>
                <span className="text-muted">{foundTxn.date} {foundTxn.time}</span>
              </div>
              <div className="text-sm text-muted">Customer: {foundTxn.customerName} • Payment: {foundTxn.paymentMethod} • Total: ${foundTxn.total?.toFixed(2)}</div>
            </div>

            <h4 style={{ marginBottom: 12 }}>Select Items to Return</h4>
            {returnItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <input type="checkbox" checked={item.selected} onChange={() => toggleItem(idx)} style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
                <span style={{ fontSize: '1.3rem' }}>{item.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.857rem' }}>{item.productName}</div>
                  <div className="text-xs text-muted">Qty purchased: {item.quantity} × ${item.price}</div>
                </div>
                {item.selected && (
                  <>
                    <input type="number" min={1} max={item.quantity} value={item.returnQty} onChange={e => setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, returnQty: Math.min(parseInt(e.target.value) || 0, it.quantity) } : it))} style={{ width: 60, padding: '6px 8px', border: '1px solid var(--color-grey-light)', borderRadius: 6, textAlign: 'center' }} />
                    <select value={item.reason} onChange={e => setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, reason: e.target.value } : it))} style={{ padding: '6px 8px', border: '1px solid var(--color-grey-light)', borderRadius: 6, fontSize: '0.786rem' }}>
                      {REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </>
                )}
              </div>
            ))}

            {returnItems.some(it => it.selected) && (
              <div style={{ marginTop: 16, padding: 14, background: 'rgba(239,68,68,0.05)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Estimated Refund</span>
                <span style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: '1.1rem' }}>
                  ${(returnItems.filter(it => it.selected).reduce((s, it) => s + it.price * it.returnQty * 1.1, 0)).toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Return Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={`Return ${showDetail?.returnNumber}`}>
        {showDetail && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><span className="text-sm text-muted">Original Receipt</span><p style={{ fontWeight: 600 }}>{showDetail.originalReceipt}</p></div>
              <div><span className="text-sm text-muted">Date</span><p style={{ fontWeight: 600 }}>{showDetail.date}</p></div>
              <div><span className="text-sm text-muted">Refund Method</span><p style={{ fontWeight: 600 }}>{showDetail.refundMethod}</p></div>
              <div><span className="text-sm text-muted">Processed By</span><p style={{ fontWeight: 600 }}>{showDetail.processedBy}</p></div>
            </div>
            <h4 style={{ marginBottom: 8 }}>Returned Items</h4>
            {showDetail.items?.map((item, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.857rem' }}>{item.image} {item.productName}</div>
                  <div className="text-xs text-muted">Qty: {item.returnQty} • Reason: {item.reason}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-${(item.price * item.returnQty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(0,0,0,0.02)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total Refund</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-danger)' }}>-${showDetail.refundAmount?.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
