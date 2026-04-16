import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { ShoppingCart, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColor = (s) => {
  const map = { Pending: 'badge-warning', Processing: 'badge-info', Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger' };
  return map[s] || 'badge-grey';
};

export default function Orders() {
  const { orders, updateOrder, deleteOrder } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = orders
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openDetail = (order) => { setSelected(order); setShowDetail(true); };

  const updateStatus = (order, status) => {
    updateOrder(order.id, { status });
    setSelected({ ...order, status });
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><ShoppingCart size={28} /> Orders</h1>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search orders..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                <td>{order.customer?.name}</td>
                <td>{order.items?.length} items</td>
                <td style={{ fontWeight: 600 }}>Rs.{order.total?.toLocaleString()}</td>
                <td className="text-muted">{order.date}</td>
                <td><span className={`badge ${statusColor(order.status)}`}>{order.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => openDetail(order)}><Eye size={15} /></button>
                    {hasPermission('orders', 'delete') && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete order?')) deleteOrder(order.id); }}><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-pagination">
          <span>Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="table-pagination-btns">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Order ${selected?.orderNumber}`} size="lg" footer={
        hasPermission('orders', 'edit') && selected?.status !== 'Delivered' && selected?.status !== 'Cancelled' && (
          <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
            {selected?.status === 'Pending' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selected, 'Processing')}>Process Order</button>}
            {selected?.status === 'Processing' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selected, 'Shipped')}>Mark Shipped</button>}
            {selected?.status === 'Shipped' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(selected, 'Delivered')}>Mark Delivered</button>}
            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(selected, 'Cancelled')}>Cancel</button>
          </div>
        )
      }>
        {selected && (
          <>
            <div className="detail-grid" style={{ marginBottom: 20 }}>
              <div className="detail-item"><label>Customer</label><span>{selected.customer?.name}</span></div>
              <div className="detail-item"><label>Email</label><span>{selected.customer?.email}</span></div>
              <div className="detail-item"><label>Date</label><span>{selected.date}</span></div>
              <div className="detail-item"><label>Status</label><span className={`badge ${statusColor(selected.status)}`}>{selected.status}</span></div>
            </div>

            <h4 style={{ marginBottom: 12 }}>Order Items</h4>
            <table className="line-items-table">
              <thead><tr><th></th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {selected.items?.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '1.3rem' }}>{item.image}</td>
                    <td style={{ fontWeight: 500 }}>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>Rs.{item.price?.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>Rs.{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="totals-section">
              <div className="totals-table">
                <div className="row total"><span>Total</span><span>Rs.{selected.total?.toFixed(2)}</span></div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
