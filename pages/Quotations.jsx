import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { FileText, Plus, Search, Eye, Edit2, Trash2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColor = (s) => {
  const map = { Draft: 'badge-grey', Sent: 'badge-info', Accepted: 'badge-success', Rejected: 'badge-danger' };
  return map[s] || 'badge-grey';
};

export default function Quotations() {
  const { quotations, products, customers, addQuotation, updateQuotation, deleteQuotation, convertQuotationToInvoice } = useData();
  const { hasPermission, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const emptyItem = { productId: '', productName: '', quantity: 1, price: 0, tax: 0, discount: 0, image: '' };
  const [form, setForm] = useState({
    customerId: '', customer: null, items: [{ ...emptyItem }],
    notes: 'Prices valid for 30 days', terms: 'Payment due within 30 days of invoice date.',
    validUntil: '', status: 'Draft'
  });

  const filtered = quotations
    .filter(q => statusFilter === 'All' || q.status === statusFilter)
    .filter(q => q.quotationNumber?.toLowerCase().includes(search.toLowerCase()) || q.customer?.name?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditing(null);
    setForm({ customerId: '', customer: null, items: [{ ...emptyItem }], notes: 'Prices valid for 30 days', terms: 'Payment due within 30 days of invoice date.', validUntil: '', status: 'Draft' });
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({ customerId: q.customer?.id || '', customer: q.customer, items: q.items || [], notes: q.notes, terms: q.terms, validUntil: q.validUntil, status: q.status });
    setShowModal(true);
  };

  const handleSave = () => {
    const cust = customers.find(c => c.id === form.customerId) || form.customer;
    const items = form.items.filter(it => it.productId);
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = items.reduce((s, it) => s + it.tax, 0);
    const discount = items.reduce((s, it) => s + it.discount, 0);
    const data = {
      customer: cust, items, subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100, discount: Math.round(discount * 100) / 100,
      total: Math.round((subtotal + tax - discount) * 100) / 100,
      date: new Date().toISOString().split('T')[0],
      validUntil: form.validUntil, notes: form.notes, terms: form.terms,
      status: form.status, createdBy: user?.id
    };
    if (editing) {
      updateQuotation(editing.id, data);
    } else {
      addQuotation(data);
    }
    setShowModal(false);
  };

  const handleProductChange = (index, productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const items = [...form.items];
    items[index] = { productId: prod.id, productName: prod.name, quantity: items[index].quantity || 1, price: prod.price, tax: Math.round(prod.price * (items[index].quantity || 1) * 0.1 * 100) / 100, discount: 0, image: prod.image };
    setForm(prev => ({ ...prev, items }));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0 };
    if (field === 'quantity') items[index].tax = Math.round(items[index].price * items[index].quantity * 0.1 * 100) / 100;
    setForm(prev => ({ ...prev, items }));
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  const removeItem = (i) => setForm(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><FileText size={28} /> Quotations</h1>
        {hasPermission('quotations', 'create') && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> New Quotation</button>
        )}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search quotations..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Draft', 'Sent', 'Accepted', 'Rejected'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(q => (
              <tr key={q.id}>
                <td style={{ fontWeight: 600 }}>{q.quotationNumber}</td>
                <td>{q.customer?.name}</td>
                <td>{q.items?.length} items</td>
                <td style={{ fontWeight: 600 }}>Rs.{q.total?.toLocaleString()}</td>
                <td className="text-muted">{q.date}</td>
                <td className="text-muted">{q.validUntil}</td>
                <td><span className={`badge ${statusColor(q.status)}`}>{q.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => { setSelected(q); setShowDetail(true); }}><Eye size={15} /></button>
                    {hasPermission('quotations', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(q)}><Edit2 size={15} /></button>}
                    {q.status === 'Sent' && hasPermission('invoices', 'create') && (
                      <button className="btn btn-ghost btn-icon" title="Convert to Invoice" onClick={() => { if (confirm('Convert to invoice?')) convertQuotationToInvoice(q.id); }} style={{ color: 'var(--color-success)' }}><ArrowRight size={15} /></button>
                    )}
                    {hasPermission('quotations', 'delete') && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteQuotation(q.id); }}><Trash2 size={15} /></button>
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

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Quotation ${selected?.quotationNumber}`} size="lg">
        {selected && (
          <>
            <div className="detail-grid" style={{ marginBottom: 20 }}>
              <div className="detail-item"><label>Customer</label><span>{selected.customer?.name}</span></div>
              <div className="detail-item"><label>Email</label><span>{selected.customer?.email}</span></div>
              <div className="detail-item"><label>Date</label><span>{selected.date}</span></div>
              <div className="detail-item"><label>Valid Until</label><span>{selected.validUntil}</span></div>
              <div className="detail-item"><label>Status</label><span className={`badge ${statusColor(selected.status)}`}>{selected.status}</span></div>
            </div>
            <h4 style={{ marginBottom: 12 }}>Line Items</h4>
            <table className="line-items-table">
              <thead><tr><th></th><th>Product</th><th>Qty</th><th>Price</th><th>Tax</th><th>Total</th></tr></thead>
              <tbody>
                {selected.items?.map((it, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '1.2rem' }}>{it.image}</td>
                    <td style={{ fontWeight: 500 }}>{it.productName}</td>
                    <td>{it.quantity}</td>
                    <td>Rs.{it.price?.toFixed(2)}</td>
                    <td>Rs.{it.tax?.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>Rs.{(it.price * it.quantity + it.tax).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="totals-section">
              <div className="totals-table">
                <div className="row"><span>Subtotal</span><span>Rs.{selected.subtotal?.toFixed(2)}</span></div>
                <div className="row"><span>Tax</span><span>Rs.{selected.tax?.toFixed(2)}</span></div>
                {selected.discount > 0 && <div className="row"><span>Discount</span><span>-${selected.discount?.toFixed(2)}</span></div>}
                <div className="row total"><span>Total</span><span>Rs.{selected.total?.toFixed(2)}</span></div>
              </div>
            </div>
            {selected.notes && <p className="text-sm text-muted" style={{ marginTop: 16 }}><strong>Notes:</strong> {selected.notes}</p>}
            {selected.terms && <p className="text-sm text-muted" style={{ marginTop: 8 }}><strong>Terms:</strong> {selected.terms}</p>}
          </>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Quotation' : 'New Quotation'} size="lg" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Quotation'}</button>
        </>
      }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select className="form-control form-select" value={form.customerId} onChange={e => {
              const c = customers.find(c => c.id === e.target.value);
              setForm(prev => ({ ...prev, customerId: e.target.value, customer: c }));
            }}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Valid Until</label>
            <input type="date" className="form-control" value={form.validUntil} onChange={e => setForm(prev => ({ ...prev, validUntil: e.target.value }))} />
          </div>
        </div>

        <h4 style={{ marginBottom: 12 }}>Line Items</h4>
        <table className="line-items-table">
          <thead><tr><th>Product</th><th style={{ width: 80 }}>Qty</th><th style={{ width: 100 }}>Price</th><th style={{ width: 90 }}>Tax</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {form.items.map((item, i) => (
              <tr key={i}>
                <td>
                  <select className="form-control form-select" value={item.productId} onChange={e => handleProductChange(i, e.target.value)} style={{ fontSize: '0.857rem' }}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </td>
                <td><input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} /></td>
                <td><input type="number" value={item.price} onChange={e => handleItemChange(i, 'price', e.target.value)} /></td>
                <td className="text-muted" style={{ fontSize: '0.857rem' }}>Rs.{item.tax?.toFixed(2)}</td>
                <td><button className="btn btn-ghost btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: 8 }}><Plus size={14} /> Add Item</button>

        <div className="form-row" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} style={{ minHeight: 60 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Terms & Conditions</label>
            <textarea className="form-control" value={form.terms} onChange={e => setForm(prev => ({ ...prev, terms: e.target.value }))} style={{ minHeight: 60 }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
