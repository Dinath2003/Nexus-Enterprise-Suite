import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Clock, DollarSign, ArrowRightLeft, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function POSShifts() {
  const { shifts, addShift, updateShift, posTransactions } = useData();
  const { user, hasPermission } = useAuth();
  const [showOpen, setShowOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState(50000);
  const [closingCash, setClosingCash] = useState('');
  const [closingShift, setClosingShift] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const myActiveShift = shifts.find(s => s.cashierId === user?.id && s.status === 'Open');
  const today = new Date().toISOString().split('T')[0];
  const todayShifts = shifts.filter(s => s.date === today);
  const todaySales = todayShifts.reduce((s, sh) => s + (sh.totalSales || 0), 0);

  const totalPages = Math.ceil(shifts.length / perPage);
  const paged = shifts.slice((page - 1) * perPage, page * perPage);

  const openRegister = () => {
    const now = new Date();
    addShift({
      cashier: user?.name, cashierId: user?.id,
      date: now.toISOString().split('T')[0],
      clockIn: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      clockOut: null, openingCash: parseFloat(openingCash), closingCash: null,
      expectedCash: parseFloat(openingCash), totalSales: 0, totalTransactions: 0, totalReturns: 0, status: 'Open'
    });
    setShowOpen(false); setOpeningCash(50000);
  };

  const startClose = (shift) => { setClosingShift(shift); setClosingCash(''); };

  const closeRegister = () => {
    if (!closingShift) return;
    const now = new Date();
    // Calculate shift sales
    const shiftTxns = posTransactions.filter(t => t.date === closingShift.date && t.cashierId === closingShift.cashierId);
    const totalSales = shiftTxns.reduce((s, t) => s + t.total, 0);
    const cashSales = shiftTxns.filter(t => t.paymentMethod === 'Cash').reduce((s, t) => s + t.total, 0);
    const expectedCash = closingShift.openingCash + cashSales;

    updateShift(closingShift.id, {
      clockOut: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      closingCash: parseFloat(closingCash), expectedCash,
      totalSales, totalTransactions: shiftTxns.length, status: 'Closed'
    });
    setClosingShift(null);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Clock size={28} /> Shift Management</h1>
        {!myActiveShift && hasPermission('pos_shifts', 'create') && (
          <button className="btn btn-primary" onClick={() => setShowOpen(true)}><Clock size={18} /> Open Register</button>
        )}
      </div>

      {/* Active Shift Banner */}
      {myActiveShift && (
        <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.786rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', fontWeight: 700, marginBottom: 4 }}>● Register Open</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{myActiveShift.cashier}</div>
            <div style={{ fontSize: '0.857rem', color: '#9ca3af' }}>Clock In: {myActiveShift.clockIn} • Opening Cash: Rs.{myActiveShift.openingCash?.toLocaleString()}</div>
          </div>
          <button className="btn btn-danger" onClick={() => startClose(myActiveShift)}>Close Register</button>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Clock size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Today's Shifts</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{todayShifts.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><DollarSign size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Today's Sales</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{todaySales.toLocaleString()}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><ArrowRightLeft size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Open Registers</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{shifts.filter(s => s.status === 'Open').length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertCircle size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Cash Discrepancies</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{shifts.filter(s => s.status === 'Closed' && s.closingCash != null && Math.abs(s.closingCash - s.expectedCash) > 5).length}</div></div>
        </div>
      </div>

      {/* Shift History */}
      <div className="table-container">
        <div className="table-toolbar"><h3 style={{ fontSize: '1rem' }}>Shift History</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Cashier</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Opening</th><th>Closing</th><th>Expected</th><th>Variance</th><th>Sales</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {paged.map(shift => {
              const variance = shift.closingCash != null && shift.expectedCash != null ? shift.closingCash - shift.expectedCash : null;
              return (
                <tr key={shift.id}>
                  <td style={{ fontWeight: 600 }}>{shift.cashier}</td>
                  <td className="text-muted">{shift.date}</td>
                  <td>{shift.clockIn}</td>
                  <td>{shift.clockOut || <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active</span>}</td>
                  <td>Rs.{shift.openingCash}</td>
                  <td>{shift.closingCash != null ? `Rs.${shift.closingCash.toLocaleString()}` : '—'}</td>
                  <td>{shift.expectedCash != null ? `Rs.${shift.expectedCash.toLocaleString()}` : '—'}</td>
                  <td>
                    {variance != null ? (
                      <span style={{ fontWeight: 700, color: Math.abs(variance) <= 5 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(2)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>Rs.{shift.totalSales?.toLocaleString() || 0}</td>
                  <td><span className={`badge ${shift.status === 'Open' ? 'badge-success' : 'badge-grey'}`}>{shift.status}</span></td>
                  <td>
                    {shift.status === 'Open' && shift.cashierId === user?.id && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => startClose(shift)}>Close</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="table-pagination">
            <span>{shifts.length} shifts</span>
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

      {/* Open Register Modal */}
      {showOpen && (
        <div className="modal-overlay" onClick={() => setShowOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header"><h2>Open Register</h2><button className="modal-close" onClick={() => setShowOpen(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Opening Cash Amount (Rs.)</label>
                <input type="number" className="form-control" value={openingCash} onChange={e => setOpeningCash(e.target.value)} placeholder="200.00" />
              </div>
              <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Cashier</div>
                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                <div className="text-sm text-muted" style={{ marginTop: 4 }}>Date: {today}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={openRegister}><CheckCircle size={16} /> Open Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Register Modal */}
      {closingShift && (
        <div className="modal-overlay" onClick={() => setClosingShift(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header"><h2>Close Register</h2><button className="modal-close" onClick={() => setClosingShift(null)}>×</button></div>
            <div className="modal-body">
              <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="text-sm text-muted">Cashier</span><span style={{ fontWeight: 600 }}>{closingShift.cashier}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="text-sm text-muted">Shift Start</span><span style={{ fontWeight: 600 }}>{closingShift.clockIn}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-sm text-muted">Opening Cash</span><span style={{ fontWeight: 600 }}>Rs.{closingShift.openingCash}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Actual Cash in Drawer (Rs.)</label>
                <input type="number" className="form-control" value={closingCash} onChange={e => setClosingCash(e.target.value)} placeholder="Count and enter cash" style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', padding: '14px' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setClosingShift(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={closeRegister} disabled={!closingCash}>Close Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
