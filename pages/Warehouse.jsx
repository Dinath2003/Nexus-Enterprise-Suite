import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Package, Search, Edit2, AlertTriangle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Warehouse() {
  const { products, updateProduct } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const zones = ['All', ...new Set(products.map(p => p.warehouseZone).filter(Boolean))];
  const filtered = products
    .filter(p => zoneFilter === 'All' || p.warehouseZone === zoneFilter)
    .filter(p => statusFilter === 'All' || (statusFilter === 'Low Stock' && p.stock <= (p.reorderPoint || 20)) || (statusFilter === 'In Stock' && p.stock > (p.reorderPoint || 20)) || (statusFilter === 'Out of Stock' && p.stock === 0))
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalSkus = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.reorderPoint || 20)).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const inventoryValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
  const totalCapacity = products.reduce((s, p) => s + (p.reorderPoint || 20) * 5, 0);
  const capacityPct = totalCapacity > 0 ? Math.min(100, (totalStock / totalCapacity) * 100) : 0;

  const saveStock = () => {
    if (editingStock && newStock !== '') {
      updateProduct(editingStock, { stock: parseInt(newStock) });
    }
    setEditingStock(null);
  };

  const getStockStatus = (p) => {
    if (p.stock === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (p.stock <= (p.reorderPoint || 20)) return { label: 'Low Stock', cls: 'badge-warning' };
    return { label: 'Available', cls: 'badge-success' };
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1><Package size={28} /> Inventory Overview</h1></div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Package size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Total SKUs</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalSkus}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Package size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Total Units</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalStock.toLocaleString()}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><AlertTriangle size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Low Stock</div><div className="kpi-value" style={{ fontSize: '1.4rem', color: lowStock > 0 ? 'var(--color-warning)' : 'inherit' }}>{lowStock}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><Package size={22} /></div>
          <div className="kpi-info"><div className="kpi-label">Inventory Value</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{inventoryValue.toLocaleString()}</div></div>
        </div>
      </div>

      {/* Capacity Gauge & Zone Map */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Warehouse Capacity</h3></div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 16px' }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-grey-light)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={capacityPct > 85 ? 'var(--color-danger)' : capacityPct > 60 ? 'var(--color-warning)' : 'var(--color-success)'} strokeWidth="3" strokeDasharray={`${capacityPct}, 100`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.5rem' }}>{capacityPct.toFixed(0)}%</div>
            </div>
            <div className="text-sm text-muted">{totalStock.toLocaleString()} units in warehouse</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3><MapPin size={16} /> Warehouse Zones</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(zone => {
              const zoneProducts = products.filter(p => p.warehouseZone === zone);
              const zoneStock = zoneProducts.reduce((s, p) => s + p.stock, 0);
              const zoneLow = zoneProducts.filter(p => p.stock <= (p.reorderPoint || 20) && p.stock > 0).length;
              return (
                <div key={zone} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.929rem' }}>{zone} <span className="text-xs text-muted">({zoneProducts.length} SKUs)</span></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {zoneLow > 0 && <span className="badge badge-warning">{zoneLow} low</span>}
                    <span style={{ fontWeight: 700 }}>{zoneStock} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search"><Search /><input placeholder="Search by name or SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select className="form-control form-select" value={zoneFilter} onChange={e => { setZoneFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.857rem' }}>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th></th><th>Product</th><th>SKU</th><th>Location</th><th>Zone</th><th>Stock</th><th>Reorder Pt</th><th>Value</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {paged.map(p => {
              const status = getStockStatus(p);
              return (
                <tr key={p.id}>
                  <td style={{ fontSize: '1.3rem', width: 40 }}>{p.image}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                  <td><span className="badge badge-grey"><MapPin size={10} /> {p.location || '—'}</span></td>
                  <td className="text-muted">{p.warehouseZone || '—'}</td>
                  <td>
                    {editingStock === p.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} style={{ width: 60, padding: '4px 6px', border: '1px solid var(--color-primary)', borderRadius: 4, textAlign: 'center' }} autoFocus onKeyDown={e => e.key === 'Enter' && saveStock()} />
                        <button style={{ border: 'none', background: 'var(--color-success)', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }} onClick={saveStock}>✓</button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 700, color: p.stock <= (p.reorderPoint || 20) ? 'var(--color-danger)' : 'inherit' }}>{p.stock}</span>
                    )}
                  </td>
                  <td className="text-muted">{p.reorderPoint || 20}</td>
                  <td style={{ fontWeight: 500 }}>Rs.{(p.cost * p.stock).toLocaleString()}</td>
                  <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                  <td>
                    {hasPermission('warehouse', 'edit') && editingStock !== p.id && (
                      <button className="btn btn-ghost btn-icon" onClick={() => { setEditingStock(p.id); setNewStock(p.stock.toString()); }}><Edit2 size={14} /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="table-pagination">
            <span>{filtered.length} products</span>
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
    </div>
  );
}
