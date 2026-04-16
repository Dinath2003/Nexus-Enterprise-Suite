import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign, ShoppingCart, Receipt, Users, TrendingUp,
  TrendingDown, ArrowUpRight, Package
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

export default function Dashboard() {
  const { orders, invoices, products, expenses, employees } = useData();
  const { user } = useAuth();

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalOrders = orders.length;

  const monthlyRevenue = Array(6).fill(0);
  const monthlyExpenses = Array(6).fill(0);
  invoices.filter(i => i.status === 'Paid').forEach(inv => {
    const m = parseInt(inv.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyRevenue[m] += inv.total;
  });
  expenses.filter(e => e.status === 'Approved').forEach(exp => {
    const m = parseInt(exp.date?.split('-')[1]) - 1;
    if (m >= 0 && m < 6) monthlyExpenses[m] += exp.amount;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: monthlyRevenue,
        backgroundColor: 'rgba(245, 20, 31, 0.15)',
        borderColor: '#f5141f',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f5141f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderColor: '#1a1a1a',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1a1a1a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      }
    ]
  };

  const categoryMap = {};
  orders.forEach(o => {
    o.items?.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.price * it.quantity;
    });
  });
  const catLabels = Object.keys(categoryMap);
  const catValues = Object.values(categoryMap);
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

  const orderStatusMap = {};
  orders.forEach(o => { orderStatusMap[o.status] = (orderStatusMap[o.status] || 0) + 1; });

  const recentOrders = orders.slice(0, 8);

  const statusColor = (s) => {
    const map = { Pending: 'badge-warning', Processing: 'badge-info', Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger', Paid: 'badge-success', Sent: 'badge-warning', Overdue: 'badge-danger', Draft: 'badge-grey' };
    return map[s] || 'badge-grey';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, family: 'Inter' } } },
      tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 12, family: 'Inter' }, callback: v => 'Rs.' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K') } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11, family: 'Inter' } } },
      tooltip: { backgroundColor: '#1a1a1a', cornerRadius: 8, padding: 12 }
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="text-muted text-sm">Welcome back, {user?.name?.split(' ')[0]} 👋</span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">Rs.{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="kpi-trend up"><TrendingUp size={14} /> +12.5%</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><ShoppingCart size={24} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Orders</div>
            <div className="kpi-value">{totalOrders}</div>
            <div className="kpi-trend up"><TrendingUp size={14} /> {pendingOrders} pending</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Receipt size={24} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Pending Invoices</div>
            <div className="kpi-value">{pendingInvoices}</div>
            <div className="kpi-trend down"><TrendingDown size={14} /> Need attention</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Users size={24} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Active Employees</div>
            <div className="kpi-value">{activeEmployees}</div>
            <div className="kpi-trend up"><ArrowUpRight size={14} /> {employees.length} total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Revenue vs Expenses</h3></div>
          <div className="chart-container" style={{ height: 300 }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Sales by Category</h3></div>
          <div className="chart-container" style={{ height: 300 }}>
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <span className="text-sm text-muted">{orders.length} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                    <td>{order.customer?.name}</td>
                    <td style={{ fontWeight: 600 }}>Rs.{order.total?.toLocaleString()}</td>
                    <td><span className={`badge ${statusColor(order.status)}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Top Products</h3>
            <span className="text-sm text-muted">By sales volume</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {products.slice(0, 6).map((prod, i) => {
              const sold = orders.reduce((s, o) => {
                const item = o.items?.find(it => it.productId === prod.id);
                return s + (item ? item.quantity : 0);
              }, 0);
              return (
                <div key={prod.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px',
                  borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{prod.image}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.929rem' }}>{prod.name}</div>
                    <div className="text-sm text-muted">{prod.category} • {sold} sold</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Rs.{prod.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
