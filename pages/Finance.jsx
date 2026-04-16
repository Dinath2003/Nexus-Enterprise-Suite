import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Landmark, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileBarChart } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Finance() {
  const { invoices, expenses, income, orders, employees, posTransactions } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Calculate financials
  const totalIncome = income.filter(i => i.status === 'Received').reduce((s, i) => s + i.amount, 0);
  const invoiceRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const posRevenue = posTransactions.reduce((s, t) => s + t.total, 0);
  const grossRevenue = totalIncome + invoiceRevenue + posRevenue;

  const totalExpensesAmt = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPayroll = employees.filter(e => e.status === 'Active').reduce((s, e) => s + (e.salary || 0), 0) * 6;
  const netProfit = grossRevenue - totalExpensesAmt;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue * 100) : 0;

  // Accounts Receivable
  const accountsReceivable = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((s, i) => s + i.total, 0);
  const accountsOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0);

  // Assets estimation
  const inventoryValue = 0; // Would come from products cost * stock
  const cashOnHand = grossRevenue - totalExpensesAmt + 50000; // starting cash

  // Monthly P&L
  const monthlyRevArr = Array(6).fill(0);
  const monthlyExpArr = Array(6).fill(0);
  invoices.filter(i => i.status === 'Paid').forEach(inv => {
    const m = parseInt(inv.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyRevArr[m] += inv.total;
  });
  income.filter(i => i.status === 'Received').forEach(inc => {
    const m = parseInt(inc.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyRevArr[m] += inc.amount;
  });
  expenses.filter(e => e.status === 'Approved').forEach(exp => {
    const m = parseInt(exp.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyExpArr[m] += exp.amount;
  });

  const plChartData = {
    labels: months,
    datasets: [
      { label: 'Revenue', data: monthlyRevArr, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4, barThickness: 20 },
      { label: 'Expenses', data: monthlyExpArr, backgroundColor: 'rgba(245, 20, 31, 0.7)', borderRadius: 4, barThickness: 20 },
    ]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, family: 'Inter' } } }, tooltip: { backgroundColor: '#1a1a1a', cornerRadius: 8, padding: 12 } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => 'Rs.' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K') } } }
  };

  // Expense by category for P&L
  const expByCategory = {};
  expenses.filter(e => e.status === 'Approved').forEach(e => {
    expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
  });

  // Income by source for P&L
  const incBySource = {};
  income.filter(i => i.status === 'Received').forEach(i => {
    incBySource[i.source] = (incBySource[i.source] || 0) + i.amount;
  });

  const fmt = (n) => 'Rs.' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Landmark size={28} /> Finance</h1>
      </div>

      <div className="tabs">
        {['overview', 'profitloss', 'balancesheet', 'cashflow'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? 'Overview' : tab === 'profitloss' ? 'Profit & Loss' : tab === 'balancesheet' ? 'Balance Sheet' : 'Cash Flow'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <div className="kpi-card">
              <div className="kpi-icon green"><TrendingUp size={22} /></div>
              <div className="kpi-info">
                <div className="kpi-label">Gross Revenue</div>
                <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{fmt(grossRevenue)}</div>
                <div className="kpi-trend up"><ArrowUpRight size={14} /> YTD</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon red"><TrendingDown size={22} /></div>
              <div className="kpi-info">
                <div className="kpi-label">Total Expenses</div>
                <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{fmt(totalExpensesAmt)}</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon blue"><DollarSign size={22} /></div>
              <div className="kpi-info">
                <div className="kpi-label">Net Profit</div>
                <div className="kpi-value" style={{ fontSize: '1.4rem', color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{netProfit >= 0 ? '+' : '-'}{fmt(netProfit)}</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon yellow"><FileBarChart size={22} /></div>
              <div className="kpi-info">
                <div className="kpi-label">Accounts Receivable</div>
                <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{fmt(accountsReceivable)}</div>
                {accountsOverdue > 0 && <div className="kpi-trend down"><ArrowDownRight size={14} /> {fmt(accountsOverdue)} overdue</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-header"><h3>Revenue vs Expenses (Monthly)</h3></div>
              <div className="chart-container" style={{ height: 300 }}>
                <Bar data={plChartData} options={chartOptions} />
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Financial Ratios</h3></div>
              <div className="card-body">
                {[
                  { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, color: profitMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)', pct: Math.abs(profitMargin) },
                  { label: 'Revenue Growth', value: '+18.5%', color: 'var(--color-success)', pct: 18.5 },
                  { label: 'Expense Ratio', value: `${grossRevenue > 0 ? (totalExpensesAmt / grossRevenue * 100).toFixed(1) : 0}%`, color: 'var(--color-warning)', pct: grossRevenue > 0 ? totalExpensesAmt / grossRevenue * 100 : 0 },
                  { label: 'Payroll to Revenue', value: `${grossRevenue > 0 ? (totalPayroll / grossRevenue * 100).toFixed(1) : 0}%`, color: 'var(--color-info)', pct: grossRevenue > 0 ? totalPayroll / grossRevenue * 100 : 0 },
                ].map((ratio, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: '0.929rem' }}>{ratio.label}</span>
                      <span style={{ fontWeight: 700, color: ratio.color }}>{ratio.value}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${Math.min(ratio.pct, 100)}%`, background: ratio.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'profitloss' && (
        <div className="card">
          <div className="card-header"><h3>📊 Profit & Loss Statement — YTD 2026</h3></div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th style={{ paddingLeft: 20 }}>Account</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20, color: 'var(--color-success)' }}>REVENUE</td></tr>
                {Object.entries(incBySource).sort(([,a],[,b]) => b - a).map(([src, amt]) => (
                  <tr key={src}><td style={{ paddingLeft: 36 }}>{src}</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(amt)}</td></tr>
                ))}
                <tr><td style={{ paddingLeft: 36 }}>Invoice Revenue (Paid)</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(invoiceRevenue)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>POS Sales Revenue</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(posRevenue)}</td></tr>
                <tr style={{ background: 'rgba(16,185,129,0.05)' }}><td style={{ paddingLeft: 20, fontWeight: 700 }}>Total Revenue</td><td className="text-right" style={{ fontWeight: 800, color: 'var(--color-success)' }}>{fmt(grossRevenue)}</td></tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20, color: 'var(--color-danger)' }}>EXPENSES</td></tr>
                {Object.entries(expByCategory).sort(([,a],[,b]) => b - a).map(([cat, amt]) => (
                  <tr key={cat}><td style={{ paddingLeft: 36 }}>{cat}</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-danger)' }}>({fmt(amt)})</td></tr>
                ))}
                <tr style={{ background: 'rgba(239,68,68,0.05)' }}><td style={{ paddingLeft: 20, fontWeight: 700 }}>Total Expenses</td><td className="text-right" style={{ fontWeight: 800, color: 'var(--color-danger)' }}>({fmt(totalExpensesAmt)})</td></tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr style={{ background: netProfit >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 800, fontSize: '1.05rem' }}>NET PROFIT / (LOSS)</td>
                  <td className="text-right" style={{ fontWeight: 800, fontSize: '1.15rem', color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {netProfit >= 0 ? '' : '('}{fmt(netProfit)}{netProfit < 0 ? ')' : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'balancesheet' && (
        <div className="card">
          <div className="card-header"><h3>📋 Balance Sheet — As of April 2026</h3></div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr><th style={{ paddingLeft: 20 }}>Account</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20, color: 'var(--color-info)' }}>ASSETS</td></tr>
                <tr><td colSpan={2} style={{ paddingLeft: 24, fontWeight: 600, fontSize: '0.857rem', color: 'var(--color-grey)' }}>Current Assets</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Cash & Cash Equivalents</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(cashOnHand)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Accounts Receivable</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(accountsReceivable)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Inventory</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(45000)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Prepaid Expenses</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(8000)}</td></tr>
                <tr><td colSpan={2} style={{ paddingLeft: 24, fontWeight: 600, fontSize: '0.857rem', color: 'var(--color-grey)' }}>Non-Current Assets</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Equipment & Furniture</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(75000)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Less: Accumulated Depreciation</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-danger)' }}>({fmt(15000)})</td></tr>
                <tr style={{ background: 'rgba(59,130,246,0.05)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 700 }}>Total Assets</td>
                  <td className="text-right" style={{ fontWeight: 800, color: 'var(--color-info)' }}>{fmt(cashOnHand + accountsReceivable + 45000 + 8000 + 75000 - 15000)}</td>
                </tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20, color: 'var(--color-danger)' }}>LIABILITIES</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Accounts Payable</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(12000)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Accrued Expenses</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(5000)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Tax Payable</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(grossRevenue * 0.03)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Long-term Loan</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(50000)}</td></tr>
                <tr style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 700 }}>Total Liabilities</td>
                  <td className="text-right" style={{ fontWeight: 800, color: 'var(--color-danger)' }}>{fmt(12000 + 5000 + grossRevenue * 0.03 + 50000)}</td>
                </tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20, color: 'var(--color-success)' }}>EQUITY</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Owner's Equity</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(100000)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Retained Earnings</td><td className="text-right" style={{ fontWeight: 500 }}>{fmt(netProfit)}</td></tr>
                <tr style={{ background: 'rgba(16,185,129,0.05)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 700 }}>Total Equity</td>
                  <td className="text-right" style={{ fontWeight: 800, color: 'var(--color-success)' }}>{fmt(100000 + netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cashflow' && (
        <div className="card">
          <div className="card-header"><h3>💰 Cash Flow Statement — YTD 2026</h3></div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr><th style={{ paddingLeft: 20 }}>Item</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20 }}>OPERATING ACTIVITIES</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Cash from Sales (Invoices Paid)</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-success)' }}>+{fmt(invoiceRevenue)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Cash from POS Sales</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-success)' }}>+{fmt(posRevenue)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Other Income Received</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-success)' }}>+{fmt(totalIncome)}</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Operating Expenses Paid</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-danger)' }}>({fmt(totalExpensesAmt)})</td></tr>
                <tr style={{ borderTop: '2px solid var(--color-grey-light)' }}>
                  <td style={{ paddingLeft: 24, fontWeight: 700 }}>Net Cash from Operations</td>
                  <td className="text-right" style={{ fontWeight: 800, color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {netProfit >= 0 ? '+' : ''}{fmt(netProfit)}
                  </td>
                </tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20 }}>INVESTING ACTIVITIES</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Equipment Purchases</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-danger)' }}>({fmt(10000)})</td></tr>
                <tr style={{ borderTop: '2px solid var(--color-grey-light)' }}>
                  <td style={{ paddingLeft: 24, fontWeight: 700 }}>Net Cash from Investing</td>
                  <td className="text-right" style={{ fontWeight: 800, color: 'var(--color-danger)' }}>({fmt(10000)})</td>
                </tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr><td colSpan={2} style={{ background: 'var(--color-grey-lightest)', fontWeight: 700, paddingLeft: 20 }}>FINANCING ACTIVITIES</td></tr>
                <tr><td style={{ paddingLeft: 36 }}>Loan Repayments</td><td className="text-right" style={{ fontWeight: 500, color: 'var(--color-danger)' }}>({fmt(6000)})</td></tr>
                <tr style={{ borderTop: '2px solid var(--color-grey-light)' }}>
                  <td style={{ paddingLeft: 24, fontWeight: 700 }}>Net Cash from Financing</td>
                  <td className="text-right" style={{ fontWeight: 800, color: 'var(--color-danger)' }}>({fmt(6000)})</td>
                </tr>

                <tr><td colSpan={2} style={{ height: 12 }}></td></tr>
                <tr style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 800, fontSize: '1.05rem' }}>NET CHANGE IN CASH</td>
                  <td className="text-right" style={{ fontWeight: 800, fontSize: '1.15rem', color: (netProfit - 16000) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {(netProfit - 16000) >= 0 ? '+' : ''}{fmt(netProfit - 16000)}
                  </td>
                </tr>
                <tr><td style={{ paddingLeft: 20, fontWeight: 600 }}>Opening Cash Balance</td><td className="text-right" style={{ fontWeight: 600 }}>{fmt(50000)}</td></tr>
                <tr style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <td style={{ paddingLeft: 20, fontWeight: 800, fontSize: '1.05rem' }}>CLOSING CASH BALANCE</td>
                  <td className="text-right" style={{ fontWeight: 800, fontSize: '1.15rem' }}>{fmt(50000 + netProfit - 16000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
