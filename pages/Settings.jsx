import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Settings2, Save } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { updateSettings(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Settings2 size={28} /> System Settings</h1>
        <button className="btn btn-primary" onClick={handleSave}><Save size={18} /> {saved ? 'Saved ✓' : 'Save Changes'}</button>
      </div>

      <div className="grid grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3>🏢 Company Information</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Company Name</label><input className="form-control" value={form.companyName || ''} onChange={e => update('companyName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.companyAddress || ''} onChange={e => update('companyAddress', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.companyPhone || ''} onChange={e => update('companyPhone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.companyEmail || ''} onChange={e => update('companyEmail', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>💰 Tax & Currency</h3></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">Tax Rate (%)</label><input type="number" className="form-control" value={form.taxRate || 0} onChange={e => update('taxRate', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label className="form-label">Tax Mode</label><select className="form-control form-select" value={form.taxInclusive ? 'inclusive' : 'exclusive'} onChange={e => update('taxInclusive', e.target.value === 'inclusive')}><option value="exclusive">Exclusive (add to price)</option><option value="inclusive">Inclusive (included in price)</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Currency</label><select className="form-control form-select" value={form.currency || 'USD'} onChange={e => update('currency', e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>AUD</option><option>CAD</option><option>JPY</option><option>LKR</option></select></div>
              <div className="form-group"><label className="form-label">Currency Symbol</label><input className="form-control" value={form.currencySymbol || 'Rs.'} onChange={e => update('currencySymbol', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>📦 Inventory Settings</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Default Reorder Point</label><input type="number" className="form-control" value={form.defaultReorderPoint || 20} onChange={e => update('defaultReorderPoint', parseInt(e.target.value) || 0)} /><p className="text-xs text-muted" style={{ marginTop: 4 }}>Default stock level at which low stock alerts trigger</p></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>⭐ Loyalty Program</h3></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">Points per $1 Spent</label><input type="number" className="form-control" value={form.loyaltyPointsPerDollar || 1} onChange={e => update('loyaltyPointsPerDollar', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label className="form-label">Redemption Rate ($ per point)</label><input type="number" step={0.001} className="form-control" value={form.loyaltyRedemptionRate || 0.01} onChange={e => update('loyaltyRedemptionRate', parseFloat(e.target.value) || 0)} /></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><h3>🖨️ Hardware Integration</h3></div>
          <div className="card-body">
            <div className="grid grid-3">
              {[
                { name: 'Receipt Printer', status: 'Connected', desc: 'Epson TM-T88V', icon: '🖨️' },
                { name: 'Barcode Scanner', status: 'Connected', desc: 'Symbol LS2208', icon: '📱' },
                { name: 'Cash Drawer', status: 'Connected', desc: 'APG Vasario', icon: '🗄️' },
              ].map((hw, i) => (
                <div key={i} style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '2rem' }}>{hw.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.929rem' }}>{hw.name}</div>
                    <div className="text-xs text-muted">{hw.desc}</div>
                    <span className="badge badge-success" style={{ marginTop: 4 }}>{hw.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
