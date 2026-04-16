import { useData } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler);

export default function Revenue() {
  const { invoices, expenses, products, orders } = useData();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyRevenue = Array(6).fill(0);
  const monthlyExpenses = Array(6).fill(0);
  const monthlyProfit = Array(6).fill(0);

  invoices.filter(i => i.status === 'Paid').forEach(inv => {
    const m = parseInt(inv.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyRevenue[m] += inv.total;
  });

  expenses.filter(e => e.status === 'Approved').forEach(exp => {
    const m = parseInt(exp.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyExpenses[m] += exp.amount;
  });

  months.forEach((_, i) => { monthlyProfit[i] = monthlyRevenue[i] - monthlyExpenses[i]; });

  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0);
  const totalExpensesAmt = monthlyExpenses.reduce((a, b) => a + b, 0);
  const totalProfit = totalRevenue - totalExpensesAmt;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

  // Revenue by product category
  const categoryRevenue = {};
  invoices.filter(i => i.status === 'Paid').forEach(inv => {
    inv.items?.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || 'Other';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + it.price * it.quantity;
    });
  });

  const revenueVsExpenseData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: monthlyRevenue,
        backgroundColor: 'rgba(245, 20, 31, 0.85)',
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        borderRadius: 6,
        barThickness: 24,
      }
    ]
  };

  const profitTrendData = {
    labels: months,
    datasets: [{
      label: 'Net Profit',
      data: monthlyProfit,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: monthlyProfit.map(p => p >= 0 ? '#10b981' : '#ef4444'),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, family: 'Inter' } } },
      tooltip: { backgroundColor: '#1a1a1a', cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 12, family: 'Inter' }, callback: v => 'Rs.' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K') } }
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><DollarSign size={28} /> Revenue</h1>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><DollarSign size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="kpi-trend up"><TrendingUp size={14} /> YTD</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><TrendingDown size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Expenses</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalExpensesAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><TrendingUp size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Net Profit</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem', color: totalProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              ${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Percent size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Profit Margin</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{profitMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Revenue vs Expenses</h3></div>
          <div className="chart-container" style={{ height: 300 }}>
            <Bar data={revenueVsExpenseData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Net Profit Trend</h3></div>
          <div className="chart-container" style={{ height: 300 }}>
            <Line data={profitTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3>Monthly Breakdown</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th><th>Margin</th></tr>
              </thead>
              <tbody>
                {months.map((m, i) => {
                  const margin = monthlyRevenue[i] > 0 ? ((monthlyProfit[i] / monthlyRevenue[i]) * 100) : 0;
                  return (
                    <tr key={m}>
                      <td style={{ fontWeight: 600 }}>{m} 2026</td>
                      <td style={{ fontWeight: 600 }}>Rs.{monthlyRevenue[i].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="text-muted">Rs.{monthlyExpenses[i].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td style={{ fontWeight: 600, color: monthlyProfit[i] >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        ${monthlyProfit[i].toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className={`progress-fill ${margin >= 0 ? 'green' : ''}`} style={{ width: `${Math.min(Math.abs(margin), 100)}%`, background: margin < 0 ? 'var(--color-danger)' : undefined }} />
                          </div>
                          <span className="text-sm">{margin.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Revenue by Category</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {Object.entries(categoryRevenue).sort(([, a], [, b]) => b - a).map(([cat, rev], i) => {
              const pct = totalRevenue > 0 ? (rev / totalRevenue * 100) : 0;
              return (
                <div key={cat} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.929rem' }}>{cat}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.929rem' }}>Rs.{rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
