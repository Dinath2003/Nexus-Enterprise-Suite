import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import {
  Monitor, Search, Plus, Minus, X, Trash2, CreditCard,
  Banknote, Smartphone, CheckCircle, Printer, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function POS() {
  const {
    products, posCart, posTransactions,
    addPosToCart, updatePosCartItem, removePosCartItem, clearPosCart, completePosTransaction
  } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [histPage, setHistPage] = useState(1);
  const histPerPage = 10;

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products
    .filter(p => p.stock > 0)
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  const cartSubtotal = posCart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.1 * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;
  const cartCount = posCart.reduce((s, c) => s + c.quantity, 0);

  const handleComplete = () => {
    const txn = completePosTransaction(paymentMethod, user?.name, user?.id, customerName || 'Walk-in Customer');
    if (txn) {
      setLastReceipt(txn);
      setShowSuccess(true);
      setCustomerName('');
      setPaymentMethod('Cash');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const r = receipt || lastReceipt;
    if (!r) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Receipt ${r.receiptNumber}</title>
    <style>
      body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; padding: 2px 0; }
      h2 { font-size: 18px; margin: 0; }
    </style></head><body>
      <div class="center"><h2>ERPSuite</h2><p>Point of Sale Receipt</p></div>
      <div class="line"></div>
      <div class="row"><span>Receipt #:</span><span class="bold">${r.receiptNumber}</span></div>
      <div class="row"><span>Date:</span><span>${r.date} ${r.time}</span></div>
      <div class="row"><span>Cashier:</span><span>${r.cashier}</span></div>
      <div class="row"><span>Customer:</span><span>${r.customerName}</span></div>
      <div class="line"></div>
      ${r.items.map(it => `<div class="row"><span>${it.productName} x${it.quantity}</span><span>Rs.${(it.price * it.quantity).toFixed(2)}</span></div>`).join('')}
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>Rs.${r.subtotal.toFixed(2)}</span></div>
      <div class="row"><span>Tax (10%):</span><span>Rs.${r.tax.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row bold" style="font-size:16px"><span>TOTAL:</span><span>Rs.${r.total.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row"><span>Payment:</span><span>${r.paymentMethod}</span></div>
      <div class="line"></div>
      <div class="center" style="margin-top:16px;font-size:11px">Thank you for your purchase!</div>
    </body></html>`);
    win.document.close();
    win.print();
  };

  const histFiltered = posTransactions;
  const histTotalPages = Math.ceil(histFiltered.length / histPerPage);
  const histPaged = histFiltered.slice((histPage - 1) * histPerPage, histPage * histPerPage);
  const todaySales = posTransactions.filter(t => t.date === new Date().toISOString().split('T')[0]).reduce((s, t) => s + t.total, 0);
  const todayCount = posTransactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="animate-in">
      {showSuccess && (
        <div style={{
          position: 'fixed', top: 20, right: 20, background: 'var(--color-success)', color: '#fff',
          padding: '16px 24px', borderRadius: 12, zIndex: 999, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(16,185,129,0.3)', animation: 'slideUp 0.3s ease', fontWeight: 600
        }}>
          <CheckCircle size={20} /> Sale completed! Receipt #{lastReceipt?.receiptNumber}
        </div>
      )}

      <div className="page-header">
        <h1><Monitor size={28} /> Point of Sale</h1>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => setShowHistory(true)}>Transaction History</button>
          {lastReceipt && <button className="btn btn-outline" onClick={() => handlePrintReceipt()}><Printer size={16} /> Last Receipt</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, minHeight: 'calc(100vh - 180px)' }}>
        {/* Product Grid */}
        <div>
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <div className="table-search" style={{ flex: 1 }}>
              <Search />
              <input placeholder="Scan barcode or search product..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
            </div>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${category === c ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map(product => (
              <div key={product.id} onClick={() => addPosToCart(product)} style={{
                background: 'var(--color-white)', borderRadius: 12, padding: 16, cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease', textAlign: 'center', position: 'relative'
              }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{product.image}</div>
                <div style={{ fontWeight: 600, fontSize: '0.857rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>Rs.{product.price.toLocaleString()}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{product.stock} avail.</div>
                {posCart.find(c => c.productId === product.id) && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6, background: 'var(--color-primary)', color: '#fff',
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.714rem', fontWeight: 700
                  }}>
                    {posCart.find(c => c.productId === product.id)?.quantity}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-white)', borderRadius: 12, boxShadow: 'var(--shadow)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-grey-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Monitor size={18} /> Current Sale</h3>
            {posCart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearPosCart} style={{ color: 'var(--color-danger)', fontSize: '0.786rem' }}><Trash2 size={14} /> Clear</button>
            )}
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {posCart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-grey)' }}>
                <Monitor size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: '0.857rem' }}>Tap products to add to sale</p>
              </div>
            ) : (
              posCart.map(item => (
                <div key={item.productId} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                  borderBottom: '1px solid rgba(0,0,0,0.03)'
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.image}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.857rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.786rem' }}>Rs.{item.price.toLocaleString()} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updatePosCartItem(item.productId, item.quantity - 1)} style={{
                      width: 26, height: 26, border: '1px solid var(--color-grey-light)', background: '#fff',
                      borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}><Minus size={12} /></button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: '0.929rem' }}>{item.quantity}</span>
                    <button onClick={() => updatePosCartItem(item.productId, item.quantity + 1)} style={{
                      width: 26, height: 26, border: '1px solid var(--color-grey-light)', background: '#fff',
                      borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}><Plus size={12} /></button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.929rem', minWidth: 65, textAlign: 'right' }}>
                    Rs.{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button onClick={() => removePosCartItem(item.productId)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-grey)', padding: 2
                  }}><X size={14} /></button>
                </div>
              ))
            )}
          </div>

          {/* Totals & Payment */}
          <div style={{ borderTop: '1px solid var(--color-grey-light)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.857rem' }}>
              <span className="text-muted">Subtotal ({cartCount} items)</span><span style={{ fontWeight: 500 }}>Rs.{cartSubtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.857rem' }}>
              <span className="text-muted">Tax (10%)</span><span style={{ fontWeight: 500 }}>Rs.{cartTax.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>Rs.{cartTotal.toLocaleString()}</span>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <input className="form-control" placeholder="Customer name (optional)" value={customerName}
                onChange={e => setCustomerName(e.target.value)} style={{ fontSize: '0.857rem', padding: '8px 12px' }} />
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { method: 'Cash', icon: <Banknote size={14} /> },
                { method: 'Credit Card', icon: <CreditCard size={14} /> },
                { method: 'Debit Card', icon: <CreditCard size={14} /> },
                { method: 'Mobile Pay', icon: <Smartphone size={14} /> },
              ].map(pm => (
                <button key={pm.method} className={`btn btn-sm ${paymentMethod === pm.method ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => setPaymentMethod(pm.method)} style={{ flex: 1, fontSize: '0.714rem', padding: '6px 4px', gap: 3 }}>
                  {pm.icon} {pm.method.split(' ')[0]}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleComplete} disabled={posCart.length === 0}
              style={{ opacity: posCart.length === 0 ? 0.5 : 1 }}>
              <CheckCircle size={18} /> Complete Sale — Rs.{cartTotal.toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Transaction History" size="xl">
        <div className="grid grid-3" style={{ marginBottom: 20 }}>
          <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Today's Sales</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-success)' }}>Rs.{todaySales.toFixed(2)}</div>
          </div>
          <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Today's Transactions</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{todayCount}</div>
          </div>
          <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Total Sales (All Time)</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Rs.{posTransactions.reduce((s, t) => s + t.total, 0).toFixed(2)}</div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Receipt #</th><th>Date</th><th>Time</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th></th></tr>
          </thead>
          <tbody>
            {histPaged.map(txn => (
              <tr key={txn.id}>
                <td style={{ fontWeight: 600 }}>{txn.receiptNumber}</td>
                <td className="text-muted">{txn.date}</td>
                <td className="text-muted">{txn.time}</td>
                <td>{txn.customerName}</td>
                <td>{txn.items?.length} items</td>
                <td style={{ fontWeight: 700 }}>Rs.{txn.total?.toFixed(2)}</td>
                <td><span className={`badge ${txn.paymentMethod === 'Cash' ? 'badge-success' : txn.paymentMethod === 'Credit Card' ? 'badge-info' : 'badge-grey'}`}>{txn.paymentMethod}</span></td>
                <td><button className="btn btn-ghost btn-icon" onClick={() => handlePrintReceipt(txn)}><Printer size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {histTotalPages > 1 && (
          <div className="table-pagination">
            <span>{histFiltered.length} transactions</span>
            <div className="table-pagination-btns">
              <button disabled={histPage === 1} onClick={() => setHistPage(p => p - 1)}><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(histTotalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={histPage === p ? 'active' : ''} onClick={() => setHistPage(p)}>{p}</button>
              ))}
              <button disabled={histPage === histTotalPages} onClick={() => setHistPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
