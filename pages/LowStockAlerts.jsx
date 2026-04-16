import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LowStockAlerts() {
  const { products } = useData();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('urgency');

  const lowStockItems = products.filter(p => p.stock <= (p.reorderPoint || 20)).map(p => {
    const deficit = (p.reorderPoint || 20) - p.stock;
    const suggestedQty = Math.max(deficit * 2, p.reorderPoint || 20);
    return { ...p, deficit, suggestedQty, urgency: p.stock === 0 ? 3 : p.stock <= (p.reorderPoint || 20) / 2 ? 2 : 1 };
  });

  const sorted = [...lowStockItems].sort((a, b) => sortBy === 'urgency' ? b.urgency - a.urgency : sortBy === 'stock' ? a.stock - b.stock : a.name.localeCompare(b.name));
  const outOfStock = lowStockItems.filter(p => p.stock === 0).length;
  const critical = lowStockItems.filter(p => p.urgency >= 2).length;
  const totalDeficit = lowStockItems.reduce((s, p) => s + p.deficit, 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><AlertTriangle size={28} /> Low Stock Alerts</h1>
        <button className="btn btn-primary" onClick={() => navigate('/purchase-orders')}><ShoppingCart size={18} /> Create Purchase Order</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon red"><AlertTriangle size={22} /></div><div className="kpi-info"><div className="kpi-label">Out of Stock</div><div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--color-danger)' }}>{outOfStock}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><TrendingDown size={22} /></div><div className="kpi-info"><div className="kpi-label">Critical Low</div><div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--color-warning)' }}>{critical}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon blue"><AlertTriangle size={22} /></div><div className="kpi-info"><div className="kpi-label">Total Deficit</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalDeficit} units</div></div></div>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h3>All Stock Levels Normal</h3>
          <p className="text-muted">No products are below their reorder point.</p>
        </div></div>
      ) : (
        <>
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <span className="text-sm text-muted" style={{ marginRight: 8 }}>Sort by:</span>
            {[{ key: 'urgency', label: 'Urgency' }, { key: 'stock', label: 'Stock Level' }, { key: 'name', label: 'Name' }].map(opt => (
              <button key={opt.key} className={`btn btn-sm ${sortBy === opt.key ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setSortBy(opt.key)}>{opt.label}</button>
            ))}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th></th><th>Product</th><th>SKU</th><th>Location</th><th className="text-right">Current</th><th className="text-right">Reorder Pt</th><th className="text-right">Deficit</th><th className="text-right">Suggest Order</th><th>Urgency</th></tr></thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id} style={{ background: p.urgency === 3 ? 'rgba(239,68,68,0.04)' : p.urgency === 2 ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                    <td style={{ fontSize: '1.3rem', width: 40 }}>{p.image}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted" style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                    <td><span className="badge badge-grey">{p.location}</span></td>
                    <td className="text-right" style={{ fontWeight: 800, color: p.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{p.stock}</td>
                    <td className="text-right text-muted">{p.reorderPoint || 20}</td>
                    <td className="text-right" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-{p.deficit}</td>
                    <td className="text-right" style={{ fontWeight: 600, color: 'var(--color-info)' }}>{p.suggestedQty}</td>
                    <td>
                      <span className={`badge ${p.urgency === 3 ? 'badge-danger' : p.urgency === 2 ? 'badge-warning' : 'badge-info'}`}>
                        {p.urgency === 3 ? '🔴 Out of Stock' : p.urgency === 2 ? '🟡 Critical' : '🔵 Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
