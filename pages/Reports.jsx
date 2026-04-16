import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { FileBarChart, Download } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

export default function Reports() {
  const { invoices, expenses, income, products, orders, posTransactions, employees } = useData();
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-30');

  const inRange = (date) => date >= dateFrom && date <= dateTo;
  const fmt = (n) => 'Rs.' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Sales Report
  const salesInvoices = invoices.filter(i => inRange(i.date));
  const posTxns = posTransactions.filter(t => inRange(t.date));
  const totalSales = salesInvoices.reduce((s, i) => s + i.total, 0) + posTxns.reduce((s, t) => s + t.total, 0);

  // By category
  const catSales = {};
  posTxns.forEach(t => t.items?.forEach(it => { const p = products.find(pr => pr.id === it.productId); if (p) catSales[p.category] = (catSales[p.category] || 0) + it.price * it.quantity; }));

  // By employee
  const empSales = {};
  posTxns.forEach(t => { empSales[t.cashier] = (empSales[t.cashier] || 0) + t.total; });

  // By payment
  const paymentSales = {};
  posTxns.forEach(t => { paymentSales[t.paymentMethod] = (paymentSales[t.paymentMethod] || 0) + t.total; });

  // Inventory Valuation
  const invValuation = products.map(p => ({ ...p, costValue: p.cost * p.stock, retailValue: p.price * p.stock }));
  const totalCostValue = invValuation.reduce((s, p) => s + p.costValue, 0);
  const totalRetailValue = invValuation.reduce((s, p) => s + p.retailValue, 0);

  const exportCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(r => Object.values(r).map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  };

  const chartColors = ['#f5141f', '#1a1a1a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="animate-in">
      <div className="page-header"><h1><FileBarChart size={28} /> Reports Center</h1></div>

      <div className="tabs">
        {[{ key: 'sales', label: 'Sales Report' }, { key: 'inventory', label: 'Inventory Valuation' }, { key: 'waste', label: 'Waste / Shrinkage' }].map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3>Sales Report</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: '0.857rem' }} />
                <span className="text-muted">to</span>
                <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: '0.857rem' }} />
                <button className="btn btn-outline btn-sm" onClick={() => exportCSV(posTxns.map(t => ({ receipt: t.receiptNumber, date: t.date, customer: t.customerName, total: t.total, payment: t.paymentMethod, cashier: t.cashier })), 'sales_report.csv')}><Download size={14} /> CSV</button>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-3" style={{ marginBottom: 20 }}>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <div className="text-sm text-muted">Total Sales</div><div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-success)' }}>{fmt(totalSales)}</div>
                </div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <div className="text-sm text-muted">Invoice Sales</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{fmt(salesInvoices.reduce((s, i) => s + i.total, 0))}</div>
                </div>
                <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <div className="text-sm text-muted">POS Sales</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{fmt(posTxns.reduce((s, t) => s + t.total, 0))}</div>
                </div>
              </div>
              <div className="grid grid-3">
                <div><h4 style={{ marginBottom: 8 }}>By Category</h4><div style={{ height: 220 }}><Doughnut data={{ labels: Object.keys(catSales), datasets: [{ data: Object.values(catSales), backgroundColor: chartColors, borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 10 } } } } }} /></div></div>
                <div><h4 style={{ marginBottom: 8 }}>By Employee</h4>{Object.entries(empSales).sort(([,a],[,b]) => b - a).map(([emp, amt]) => (<div key={emp} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}><span className="text-sm">{emp}</span><span style={{ fontWeight: 700, fontSize: '0.857rem' }}>{fmt(amt)}</span></div>))}</div>
                <div><h4 style={{ marginBottom: 8 }}>By Payment</h4>{Object.entries(paymentSales).sort(([,a],[,b]) => b - a).map(([method, amt]) => (<div key={method} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}><span className="text-sm">{method}</span><span style={{ fontWeight: 700, fontSize: '0.857rem' }}>{fmt(amt)}</span></div>))}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="card-header">
            <h3>Inventory Valuation</h3>
            <button className="btn btn-outline btn-sm" onClick={() => exportCSV(invValuation.map(p => ({ name: p.name, sku: p.sku, stock: p.stock, cost: p.cost, costValue: p.costValue, price: p.price, retailValue: p.retailValue })), 'inventory_valuation.csv')}><Download size={14} /> CSV</button>
          </div>
          <div className="card-body">
            <div className="grid grid-3" style={{ marginBottom: 20 }}>
              <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                <div className="text-sm text-muted">Cost Value</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{fmt(totalCostValue)}</div>
              </div>
              <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                <div className="text-sm text-muted">Retail Value</div><div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-success)' }}>{fmt(totalRetailValue)}</div>
              </div>
              <div style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                <div className="text-sm text-muted">Potential Profit</div><div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-info)' }}>{fmt(totalRetailValue - totalCostValue)}</div>
              </div>
            </div>
            <table className="data-table">
              <thead><tr><th></th><th>Product</th><th>SKU</th><th className="text-right">Stock</th><th className="text-right">Unit Cost</th><th className="text-right">Cost Value</th><th className="text-right">Retail Price</th><th className="text-right">Retail Value</th><th className="text-right">Margin</th></tr></thead>
              <tbody>
                {invValuation.map(p => (
                  <tr key={p.id}><td>{p.image}</td><td style={{ fontWeight: 600 }}>{p.name}</td><td className="text-muted">{p.sku}</td><td className="text-right">{p.stock}</td><td className="text-right">Rs.{p.cost}</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(p.costValue)}</td><td className="text-right">Rs.{p.price}</td><td className="text-right" style={{ fontWeight: 600, color: 'var(--color-success)' }}>{fmt(p.retailValue)}</td><td className="text-right" style={{ fontWeight: 700, color: 'var(--color-info)' }}>{p.price > 0 ? ((1 - p.cost / p.price) * 100).toFixed(0) : 0}%</td></tr>
                ))}
                <tr style={{ background: 'var(--color-grey-lightest)', fontWeight: 700 }}><td colSpan={5}>Totals</td><td className="text-right">{fmt(totalCostValue)}</td><td></td><td className="text-right" style={{ color: 'var(--color-success)' }}>{fmt(totalRetailValue)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'waste' && (
        <div className="card">
          <div className="card-header"><h3>Waste / Shrinkage Report</h3></div>
          <div className="card-body">
            <div className="grid grid-3" style={{ marginBottom: 20 }}>
              {[
                { label: 'Damaged Goods', value: 'Rs.702,000', icon: '📦', desc: 'From GRN inspections' },
                { label: 'Unaccounted Loss', value: 'Rs.336,000', icon: '❓', desc: 'From cycle counts' },
                { label: 'Total Shrinkage', value: 'Rs.1,038,000', icon: '📉', desc: 'Combined losses' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--color-grey-lightest)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{item.icon}</div>
                  <div className="text-sm text-muted">{item.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-danger)' }}>{item.value}</div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
              ))}
            </div>
            <table className="data-table">
              <thead><tr><th>Type</th><th>Product</th><th>Qty Lost</th><th>Value</th><th>Date</th><th>Source</th></tr></thead>
              <tbody>
                {[
                  { type: 'Damaged', product: '4K Monitor 27"', qty: 2, value: 168000, date: '2026-03-15', source: 'GRN-2026-0003' },
                  { type: 'Damaged', product: 'Standing Desk', qty: 1, value: 96000, date: '2026-02-20', source: 'GRN-2026-0001' },
                  { type: 'Shrinkage', product: 'Wireless Mouse', qty: 8, value: 43200, date: '2026-04-01', source: 'Cycle Count' },
                  { type: 'Expired', product: 'Desk Lamp LED', qty: 3, value: 19800, date: '2026-03-28', source: 'Inventory Audit' },
                  { type: 'Shrinkage', product: 'USB-C Hub', qty: 5, value: 42000, date: '2026-03-10', source: 'Cycle Count' },
                ].map((item, i) => (
                  <tr key={i}>
                    <td><span className={`badge ${item.type === 'Damaged' ? 'badge-danger' : item.type === 'Expired' ? 'badge-warning' : 'badge-grey'}`}>{item.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{item.product}</td>
                    <td>{item.qty}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-Rs.{item.value.toLocaleString()}</td>
                    <td className="text-muted">{item.date}</td>
                    <td className="text-muted">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
