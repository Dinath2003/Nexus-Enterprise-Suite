import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList, CheckSquare, Package, Truck } from 'lucide-react';

export default function PickPack() {
  const { pickLists, updatePickList } = useData();
  const { hasPermission } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = pickLists.filter(p => statusFilter === 'All' || p.status === statusFilter);

  const togglePicked = (pickId, itemIdx) => {
    const pl = pickLists.find(p => p.id === pickId);
    if (!pl) return;
    const items = pl.items.map((it, i) => i === itemIdx ? { ...it, picked: !it.picked } : it);
    const allPicked = items.every(it => it.picked);
    updatePickList(pickId, { items, status: allPicked ? 'Packed' : 'Picking' });
  };

  const markReady = (pickId) => updatePickList(pickId, { status: 'Ready' });

  const priorityColor = { Urgent: 'badge-danger', High: 'badge-warning', Normal: 'badge-grey' };

  return (
    <div className="animate-in">
      <div className="page-header"><h1><ClipboardList size={28} /> Picking & Packing</h1></div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-icon yellow"><ClipboardList size={22} /></div><div className="kpi-info"><div className="kpi-label">Pending</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{pickLists.filter(p => p.status === 'Pending').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon blue"><Package size={22} /></div><div className="kpi-info"><div className="kpi-label">Picking</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{pickLists.filter(p => p.status === 'Picking').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon green"><CheckSquare size={22} /></div><div className="kpi-info"><div className="kpi-label">Packed</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{pickLists.filter(p => p.status === 'Packed').length}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon red"><Truck size={22} /></div><div className="kpi-info"><div className="kpi-label">Ready</div><div className="kpi-value" style={{ fontSize: '1.4rem' }}>{pickLists.filter(p => p.status === 'Ready').length}</div></div></div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {['All', 'Pending', 'Picking', 'Packed', 'Ready'].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 16 }}>
        {filtered.map(pl => (
          <div className="card" key={pl.id}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '0.929rem' }}>{pl.orderNumber}</h3>
                  <span className={`badge ${priorityColor[pl.priority] || 'badge-grey'}`}>{pl.priority}</span>
                </div>
                <div className="text-xs text-muted">{pl.customer?.name} • {pl.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${pl.status === 'Ready' ? 'badge-success' : pl.status === 'Packed' ? 'badge-info' : pl.status === 'Picking' ? 'badge-warning' : 'badge-grey'}`}>{pl.status}</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {pl.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  {hasPermission('pickpack', 'edit') && pl.status !== 'Ready' && (
                    <input type="checkbox" checked={item.picked} onChange={() => togglePicked(pl.id, i)} style={{ width: 18, height: 18, accentColor: 'var(--color-success)', cursor: 'pointer' }} />
                  )}
                  <span style={{ fontSize: '1.2rem' }}>{item.image}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.857rem', textDecoration: item.picked ? 'line-through' : 'none', color: item.picked ? 'var(--color-grey)' : 'inherit' }}>{item.productName}</div>
                    <div className="text-xs text-muted">Loc: {item.location} • Qty: {item.quantity}</div>
                  </div>
                  {item.picked && <CheckSquare size={16} style={{ color: 'var(--color-success)' }} />}
                </div>
              ))}
            </div>
            {pl.status === 'Packed' && hasPermission('pickpack', 'edit') && (
              <div className="card-footer" style={{ textAlign: 'right' }}>
                <button className="btn btn-success btn-sm" onClick={() => markReady(pl.id)}><Truck size={14} /> Mark Ready for Shipment</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
