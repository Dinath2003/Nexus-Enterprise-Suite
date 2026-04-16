import { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Receipt, Plus, Search, Eye, Edit2, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColor = (s) => {
  const map = { Draft: 'badge-grey', Sent: 'badge-warning', Paid: 'badge-success', Overdue: 'badge-danger', Cancelled: 'badge-grey' };
  return map[s] || 'badge-grey';
};

export default function Invoices() {
  const { invoices, products, customers, addInvoice, updateInvoice, deleteInvoice } = useData();
  const { hasPermission, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const printRef = useRef(null);

  const emptyItem = { productId: '', productName: '', quantity: 1, price: 0, tax: 0, discount: 0, image: '' };
  const [form, setForm] = useState({
    customerId: '', customer: null, items: [{ ...emptyItem }],
    notes: 'Thank you for your business!', dueDate: '', status: 'Draft'
  });

  const filtered = invoices
    .filter(i => statusFilter === 'All' || i.status === statusFilter)
    .filter(i => i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || i.customer?.name?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditing(null);
    setForm({ customerId: '', customer: null, items: [{ ...emptyItem }], notes: 'Thank you for your business!', dueDate: '', status: 'Draft' });
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({ customerId: inv.customer?.id || '', customer: inv.customer, items: inv.items || [], notes: inv.notes, dueDate: inv.dueDate, status: inv.status });
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
      date: new Date().toISOString().split('T')[0], dueDate: form.dueDate,
      notes: form.notes, status: form.status, createdBy: user?.id
    };
    if (editing) {
      updateInvoice(editing.id, data);
    } else {
      addInvoice(data);
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

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Invoice ${selected?.invoiceNumber}</title><style>
      body { font-family: Inter, sans-serif; padding: 40px; color: #1a1a1a; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #f9fafb; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #e6e6e6; }
      td { padding: 10px 14px; border-bottom: 1px solid rgba(0,0,0,0.04); }
      .header { display: flex; justify-content: space-between; border-bottom: 3px solid #f5141f; padding-bottom: 20px; margin-bottom: 30px; }
      .title { font-size: 28px; color: #f5141f; font-weight: 800; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 24px; }
      .meta h4 { color: #f5141f; margin-bottom: 6px; }
      .meta p { font-size: 13px; line-height: 1.7; color: #6b7280; }
      .totals { text-align: right; margin-top: 20px; }
      .totals .row { display: flex; justify-content: flex-end; gap: 40px; padding: 4px 0; }
      .totals .total { font-weight: 700; font-size: 18px; border-top: 2px solid #1a1a1a; padding-top: 8px; margin-top: 4px; }
    </style></head><body>`);
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'Sent').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Receipt size={28} /> Invoices</h1>
        {hasPermission('invoices', 'create') && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> New Invoice</button>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon green"><Receipt size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Paid</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card" style={{ '--color-primary': '#f59e0b' }}>
          <div className="kpi-icon yellow"><Receipt size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalPending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><Receipt size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Overdue</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalOverdue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                <td>{inv.customer?.name}</td>
                <td style={{ fontWeight: 600 }}>Rs.{inv.total?.toLocaleString()}</td>
                <td className="text-muted">{inv.date}</td>
                <td className="text-muted">{inv.dueDate}</td>
                <td><span className={`badge ${statusColor(inv.status)}`}>{inv.status}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-icon" onClick={() => { setSelected(inv); setShowDetail(true); }}><Eye size={15} /></button>
                    {hasPermission('invoices', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(inv)}><Edit2 size={15} /></button>}
                    {hasPermission('invoices', 'delete') && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete?')) deleteInvoice(inv.id); }}><Trash2 size={15} /></button>
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

      {/* Invoice Detail / Print Preview */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Invoice ${selected?.invoiceNumber}`} size="lg" footer={
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
          <div>
            {hasPermission('invoices', 'edit') && selected?.status !== 'Paid' && (
              <>
                {selected?.status === 'Draft' && <button className="btn btn-primary btn-sm" onClick={() => { updateInvoice(selected.id, { status: 'Sent' }); setSelected({ ...selected, status: 'Sent' }); }}>Send Invoice</button>}
                {(selected?.status === 'Sent' || selected?.status === 'Overdue') && <button className="btn btn-success btn-sm" onClick={() => { updateInvoice(selected.id, { status: 'Paid' }); setSelected({ ...selected, status: 'Paid' }); }}>Mark as Paid</button>}
              </>
            )}
          </div>
          <button className="btn btn-outline btn-sm" onClick={handlePrint}><Download size={14} /> Print / PDF</button>
        </div>
      }>
        {selected && (
          <div ref={printRef}>
            <div className="invoice-preview-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #f5141f', paddingBottom: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, background: '#f5141f', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>E</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>ERP<span style={{ color: '#f5141f' }}>Suite</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f5141f' }}>INVOICE</div>
                <div className="text-sm text-muted">{selected.invoiceNumber}</div>
              </div>
            </div>

            <div className="invoice-meta">
              <div>
                <h4 style={{ color: '#f5141f', marginBottom: 6, fontSize: '0.929rem' }}>Bill To</h4>
                <p style={{ fontSize: '0.929rem', lineHeight: 1.7, color: '#6b7280' }}>
                  <strong style={{ color: '#1a1a1a' }}>{selected.customer?.name}</strong><br />
                  {selected.customer?.email}<br />
                  {selected.customer?.phone}<br />
                  {selected.customer?.address}
                </p>
              </div>
              <div>
                <h4 style={{ color: '#f5141f', marginBottom: 6, fontSize: '0.929rem' }}>Invoice Details</h4>
                <p style={{ fontSize: '0.929rem', lineHeight: 1.7, color: '#6b7280' }}>
                  <strong style={{ color: '#1a1a1a' }}>Date:</strong> {selected.date}<br />
                  <strong style={{ color: '#1a1a1a' }}>Due:</strong> {selected.dueDate}<br />
                  <strong style={{ color: '#1a1a1a' }}>Status:</strong> {selected.status}
                </p>
              </div>
            </div>

            <table className="line-items-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Tax</th><th>Total</th></tr></thead>
              <tbody>
                {selected.items?.map((it, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{it.productName}</td>
                    <td>{it.quantity}</td>
                    <td>Rs.{it.price?.toFixed(2)}</td>
                    <td>Rs.{it.tax?.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>Rs.{(it.price * it.quantity + (it.tax || 0)).toFixed(2)}</td>
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

            {selected.notes && <p className="text-sm text-muted" style={{ marginTop: 20 }}>{selected.notes}</p>}
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Invoice' : 'New Invoice'} size="lg" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Create Invoice'}</button>
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
            <label className="form-label">Due Date</label>
            <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control form-select" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} style={{ width: 'auto' }}>
            <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option><option>Cancelled</option>
          </select>
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

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Notes</label>
          <textarea className="form-control" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} style={{ minHeight: 60 }} />
        </div>
      </Modal>
    </div>
  );
}
