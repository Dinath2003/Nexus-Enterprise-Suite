import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TrendingUp, Package, Users, Calendar } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

export default function Sales() {
  const { orders, products, employees } = useData();
  const [period, setPeriod] = useState('monthly');

  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped');
  const totalSales = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0;

  // Products sold
  const productSales = {};
  deliveredOrders.forEach(o => {
    o.items?.forEach(it => {
      if (!productSales[it.productId]) {
        productSales[it.productId] = { name: it.productName, image: it.image, quantity: 0, revenue: 0 };
      }
      productSales[it.productId].quantity += it.quantity;
      productSales[it.productId].revenue += it.price * it.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  // Monthly sales
  const monthlySales = Array(6).fill(0);
  const monthlyOrders = Array(6).fill(0);
  deliveredOrders.forEach(o => {
    const m = parseInt(o.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) {
      monthlySales[m] += o.total;
      monthlyOrders[m]++;
    }
  });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const salesChartData = {
    labels: months,
    datasets: [{
      label: 'Sales Revenue',
      data: monthlySales,
      backgroundColor: months.map((_, i) => i === 3 ? '#f5141f' : 'rgba(245, 20, 31, 0.2)'),
      borderColor: '#f5141f',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 36,
    }]
  };

  const ordersChartData = {
    labels: months,
    datasets: [{
      label: 'Orders',
      data: monthlyOrders,
      borderColor: '#1a1a1a',
      backgroundColor: 'rgba(0,0,0,0.05)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1a1a1a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }]
  };

  // Category breakdown
  const categorySales = {};
  deliveredOrders.forEach(o => {
    o.items?.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || 'Other';
      categorySales[cat] = (categorySales[cat] || 0) + it.price * it.quantity;
    });
  });
  const catLabels = Object.keys(categorySales);
  const catValues = Object.values(categorySales);
  const catColors = ['#f5141f', '#1a1a1a', '#6b7280', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  const categoryChartData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: catColors.slice(0, catLabels.length),
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  // Employee performance
  const employeeSales = {};
  orders.forEach(o => {
    const empId = o.createdBy || 'unknown';
    if (!employeeSales[empId]) {
      const emp = employees.find(e => e.userId === empId);
      employeeSales[empId] = { name: emp?.name || 'Unknown', orders: 0, revenue: 0 };
    }
    employeeSales[empId].orders++;
    employeeSales[empId].revenue += o.total;
  });
  const topEmployees = Object.values(employeeSales).sort((a, b) => b.revenue - a.revenue);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1a1a', cornerRadius: 8, padding: 12, titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 12, family: 'Inter' }, callback: v => 'Rs.' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K') } }
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><TrendingUp size={28} /> Sales Monitor</h1>
        <div className="page-header-actions">
          {['monthly', 'quarterly'].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><TrendingUp size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Sales</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Package size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Orders Fulfilled</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{deliveredOrders.length}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Calendar size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Avg Order Value</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>Rs.{avgOrderValue.toFixed(0)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Users size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Products Sold</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{topProducts.reduce((s, p) => s + p.quantity, 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Monthly Sales Revenue</h3></div>
          <div className="chart-container" style={{ height: 280 }}>
            <Bar data={salesChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Orders Trend</h3></div>
          <div className="chart-container" style={{ height: 280 }}>
            <Line data={ordersChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, ticks: { ...chartOptions.scales.y.ticks, callback: v => v } } } }} />
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <div className="card-header"><h3>Sales by Category</h3></div>
          <div className="chart-container" style={{ height: 260 }}>
            <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11, family: 'Inter' } } } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Top Products</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {topProducts.slice(0, 6).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <span style={{ fontSize: '1.3rem' }}>{p.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.857rem' }}>{p.name}</div>
                  <div className="text-xs text-muted">{p.quantity} units sold</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.857rem', color: 'var(--color-primary)' }}>Rs.{p.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Sales by Employee</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {topEmployees.slice(0, 6).map((emp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.714rem', fontWeight: 700 }}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.857rem' }}>{emp.name}</div>
                  <div className="text-xs text-muted">{emp.orders} orders</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.857rem' }}>Rs.{emp.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
