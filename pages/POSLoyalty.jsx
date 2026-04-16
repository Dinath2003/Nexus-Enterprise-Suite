import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Heart, Search, Star, Award, Gift, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const TIERS = [
  { name: 'Bronze', min: 0, color: '#CD7F32', bg: 'rgba(205,127,50,0.1)' },
  { name: 'Silver', min: 1000, color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)' },
  { name: 'Gold', min: 2500, color: '#FFD700', bg: 'rgba(255,215,0,0.1)' },
  { name: 'Platinum', min: 5000, color: '#E5E4E2', bg: 'rgba(229,228,226,0.2)' },
];

export default function POSLoyalty() {
  const { customers, updateCustomer, addCustomer, posTransactions } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [showDetail, setShowDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const filtered = customers
    .filter(c => tierFilter === 'All' || c.loyaltyTier === tierFilter)
    .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalMembers = customers.length;
  const totalPoints = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
  const platinumCount = customers.filter(c => c.loyaltyTier === 'Platinum').length;

  const getCustomerTransactions = (name) => posTransactions.filter(t => t.customerName === name);
  const getTierInfo = (tier) => TIERS.find(t => t.name === tier) || TIERS[0];

  const handleAddMember = () => {
    addCustomer({ ...form, loyaltyPoints: 0, loyaltyTier: 'Bronze', totalSpent: 0, joinDate: new Date().toISOString().split('T')[0] });
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', address: '' });
  };

  const redeemPoints = (customer, points) => {
    if (points > customer.loyaltyPoints) return;
    updateCustomer(customer.id, { loyaltyPoints: customer.loyaltyPoints - points });
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Heart size={28} /> Customer Loyalty</h1>
        {hasPermission('pos_loyalty', 'create') && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Member</button>
        )}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Heart size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Total Members</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalMembers}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Star size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Total Points</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalPoints.toLocaleString()}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Award size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Platinum Members</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{platinumCount}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><Gift size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Avg Spend</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{customers.length > 0 ? Math.round(customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length).toLocaleString() : 0}</div></div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {TIERS.map(tier => {
          const count = customers.filter(c => c.loyaltyTier === tier.name).length;
          return (
            <div key={tier.name} onClick={() => setTierFilter(tier.name === tierFilter ? 'All' : tier.name)} style={{ background: tier.bg, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', border: tierFilter === tier.name ? `2px solid ${tier.color}` : '2px solid transparent', transition: 'all 0.2s', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>
                {tier.name === 'Bronze' ? '🥉' : tier.name === 'Silver' ? '🥈' : tier.name === 'Gold' ? '🥇' : '💎'}
              </div>
              <div style={{ fontWeight: 700, color: tier.color === '#C0C0C0' ? '#888' : tier.color, fontSize: '0.929rem' }}>{tier.name}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 2 }}>{count}</div>
              <div className="text-xs text-muted">{tier.min.toLocaleString()}+ pts</div>
            </div>
          );
        })}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search by name, email, or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        <table className="data-table">
          <thead><tr><th>Member</th><th>Tier</th><th>Points</th><th>Total Spent</th><th>Member Since</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.map(c => {
              const tier = getTierInfo(c.loyaltyTier);
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.714rem', fontWeight: 700 }}>
                        {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="text-xs text-muted">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 50, background: tier.bg, fontWeight: 700, fontSize: '0.786rem', color: tier.color === '#C0C0C0' ? '#888' : tier.color }}>
                      {c.loyaltyTier === 'Bronze' ? '🥉' : c.loyaltyTier === 'Silver' ? '🥈' : c.loyaltyTier === 'Gold' ? '🥇' : '💎'} {c.loyaltyTier}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{(c.loyaltyPoints || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>Rs.{(c.totalSpent || 0).toLocaleString()}</td>
                  <td className="text-muted">{c.joinDate}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(c)}><Eye size={15} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="table-pagination">
            <span>{filtered.length} members</span>
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

      {/* Add Member Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Loyalty Member" footer={
        <><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddMember}>Add Member</button></>
      }>
        <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name} size="lg">
        {showDetail && (() => {
          const tier = getTierInfo(showDetail.loyaltyTier);
          const txns = getCustomerTransactions(showDetail.name);
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: tier.bg, borderRadius: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                  {showDetail.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{showDetail.name}</div>
                  <div className="text-sm text-muted">{showDetail.email} • {showDetail.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 50, fontWeight: 700, fontSize: '0.929rem', color: tier.color === '#C0C0C0' ? '#666' : tier.color, border: `2px solid ${tier.color}` }}>
                    {showDetail.loyaltyTier === 'Bronze' ? '🥉' : showDetail.loyaltyTier === 'Silver' ? '🥈' : showDetail.loyaltyTier === 'Gold' ? '🥇' : '💎'} {showDetail.loyaltyTier}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', marginTop: 4 }}>{(showDetail.loyaltyPoints || 0).toLocaleString()} pts</div>
                </div>
              </div>

              <div className="grid grid-3" style={{ marginBottom: 20 }}>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                  <div className="text-sm text-muted">Total Spent</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-success)' }}>Rs.{(showDetail.totalSpent || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                  <div className="text-sm text-muted">Transactions</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{txns.length}</div>
                </div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                  <div className="text-sm text-muted">Member Since</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{showDetail.joinDate}</div>
                </div>
              </div>

              {showDetail.notes && <div style={{ marginBottom: 16 }}><span className="text-sm text-muted">Notes: </span><span className="text-sm">{showDetail.notes}</span></div>}

              <h4 style={{ marginBottom: 8 }}>Purchase History</h4>
              {txns.length === 0 ? <div className="text-sm text-muted" style={{ padding: 20, textAlign: 'center' }}>No POS transactions found</div> : (
                <table className="data-table">
                  <thead><tr><th>Receipt</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th></tr></thead>
                  <tbody>
                    {txns.slice(0, 10).map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.receiptNumber}</td>
                        <td className="text-muted">{t.date}</td>
                        <td>{t.items?.length} items</td>
                        <td style={{ fontWeight: 700 }}>Rs.{t.total?.toFixed(2)}</td>
                        <td><span className="badge badge-grey">{t.paymentMethod}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
