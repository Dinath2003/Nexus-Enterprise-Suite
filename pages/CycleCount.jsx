import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardCheck, Play, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CycleCount() {
  const { products, updateProduct } = useData();
  const { hasPermission } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [zone, setZone] = useState('All');
  const [counts, setCounts] = useState({});
  const [completed, setCompleted] = useState(false);
  const zones = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];

  const zoneProducts = zone === 'All' ? products : products.filter(p => p.warehouseZone === zone);

  const startSession = () => {
    const session = { id: Date.now(), zone, startTime: new Date().toISOString(), products: zoneProducts };
    setActiveSession(session);
    setCounts(zoneProducts.reduce((a, p) => ({ ...a, [p.id]: '' }), {}));
    setCompleted(false);
  };

  const updateCount = (productId, value) => {
    setCounts(prev => ({ ...prev, [productId]: value }));
  };

  const getVariance = (productId) => {
    const counted = parseInt(counts[productId]);
    if (isNaN(counted)) return null;
    const prod = products.find(p => p.id === productId);
    return counted - (prod?.stock || 0);
  };

  const applyAdjustments = () => {
    Object.entries(counts).forEach(([productId, countStr]) => {
      const counted = parseInt(countStr);
      if (!isNaN(counted)) {
        updateProduct(productId, { stock: counted });
      }
    });
    setCompleted(true);
  };

  const discrepancies = activeSession ? zoneProducts.filter(p => {
    const v = getVariance(p.id);
    return v !== null && v !== 0;
  }) : [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><ClipboardCheck size={28} /> Cycle Counting</h1>
        {!activeSession && hasPermission('cyclecount', 'create') && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-control form-select" value={zone} onChange={e => setZone(e.target.value)} style={{ width: 'auto', padding: '8px 30px 8px 12px' }}>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startSession}><Play size={18} /> Start Count</button>
          </div>
        )}
      </div>

      {!activeSession ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <ClipboardCheck size={56} style={{ color: 'var(--color-grey-light)', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>Start a Cycle Count</h3>
            <p className="text-muted" style={{ maxWidth: 400, margin: '0 auto 20px' }}>Select a warehouse zone and start a count session. You'll be able to enter actual counts for each product and compare against system quantities.</p>
            <div className="grid grid-4" style={{ maxWidth: 600, margin: '0 auto' }}>
              {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(z => {
                const count = products.filter(p => p.warehouseZone === z).length;
                return (
                  <div key={z} style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', border: zone === z ? '2px solid var(--color-primary)' : '2px solid transparent' }} onClick={() => setZone(z)}>
                    <div style={{ fontWeight: 700, fontSize: '0.929rem' }}>{z}</div>
                    <div className="text-sm text-muted">{count} SKUs</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : completed ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <CheckCircle size={56} style={{ color: 'var(--color-success)', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8, color: 'var(--color-success)' }}>Count Completed!</h3>
            <p className="text-muted" style={{ marginBottom: 8 }}>Stock levels have been adjusted based on your count.</p>
            {discrepancies.length > 0 && <p style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{discrepancies.length} discrepancies were found and corrected.</p>}
            <button className="btn btn-primary" onClick={() => { setActiveSession(null); setCompleted(false); }} style={{ marginTop: 16 }}>New Count</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', borderRadius: 12, padding: '16px 24px', marginBottom: 20, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.786rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', fontWeight: 700 }}>● Count in Progress</div>
              <div style={{ fontWeight: 700 }}>{zone === 'All' ? 'Full Warehouse' : zone} — {zoneProducts.length} SKUs</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ borderColor: '#555', color: '#aaa' }} onClick={() => { setActiveSession(null); setCounts({}); }}>Cancel</button>
              <button className="btn btn-success" onClick={applyAdjustments}>
                <CheckCircle size={16} /> Apply Adjustments ({Object.values(counts).filter(v => v !== '').length}/{zoneProducts.length})
              </button>
            </div>
          </div>

          {discrepancies.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.857rem' }}>{discrepancies.length} discrepancies detected</span>
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th></th><th>Product</th><th>SKU</th><th>Location</th><th className="text-right">System Qty</th><th className="text-right">Counted Qty</th><th className="text-right">Variance</th></tr></thead>
              <tbody>
                {zoneProducts.map(p => {
                  const variance = getVariance(p.id);
                  return (
                    <tr key={p.id} style={{ background: variance !== null && variance !== 0 ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                      <td style={{ fontSize: '1.3rem', width: 40 }}>{p.image}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="text-muted" style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                      <td><span className="badge badge-grey">{p.location}</span></td>
                      <td className="text-right" style={{ fontWeight: 600 }}>{p.stock}</td>
                      <td className="text-right">
                        <input type="number" value={counts[p.id] || ''} onChange={e => updateCount(p.id, e.target.value)} placeholder="—"
                          style={{ width: 80, padding: '6px 8px', border: `1.5px solid ${variance !== null && variance !== 0 ? 'var(--color-danger)' : 'var(--color-grey-light)'}`, borderRadius: 6, textAlign: 'center', fontWeight: 700, fontSize: '0.929rem' }} />
                      </td>
                      <td className="text-right">
                        {variance !== null ? (
                          <span style={{ fontWeight: 800, color: variance === 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.929rem' }}>
                            {variance > 0 ? '+' : ''}{variance}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
