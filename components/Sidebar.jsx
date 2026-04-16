import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Receipt,
  TrendingUp, DollarSign, CreditCard, Users, Shield, Store,
  LogOut, Monitor, Wallet, Landmark, ClipboardCheck, RotateCcw,
  Clock, Heart, Warehouse, Truck, ArrowRightLeft, ClipboardList,
  Building2, AlertTriangle, FileBarChart, Settings2, Gift
} from 'lucide-react';

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
    ]
  },
  {
    title: 'Point of Sale',
    items: [
      { to: '/pos', icon: Monitor, label: 'Sales Terminal', module: 'pos' },
      { to: '/pos-returns', icon: RotateCcw, label: 'Returns & Exchanges', module: 'pos_returns' },
      { to: '/pos-shifts', icon: Clock, label: 'Shift Management', module: 'pos_shifts' },
      { to: '/pos-loyalty', icon: Heart, label: 'Customer Loyalty', module: 'pos_loyalty' },
    ]
  },
  {
    title: 'Sales & Commerce',
    items: [
      { to: '/store', icon: Store, label: 'Online Store', module: 'store' },
      { to: '/products', icon: Package, label: 'Products', module: 'products' },
      { to: '/orders', icon: ShoppingCart, label: 'Orders', module: 'orders' },
      { to: '/quotations', icon: FileText, label: 'Quotations', module: 'quotations' },
      { to: '/invoices', icon: Receipt, label: 'Invoices', module: 'invoices' },
    ]
  },
  {
    title: 'Warehouse & Supply',
    items: [
      { to: '/warehouse', icon: Warehouse, label: 'Inventory', module: 'warehouse' },
      { to: '/inbound', icon: Truck, label: 'Inbound (GRN)', module: 'inbound' },
      { to: '/stock-transfers', icon: ArrowRightLeft, label: 'Stock Transfers', module: 'transfers' },
      { to: '/pick-pack', icon: ClipboardList, label: 'Pick & Pack', module: 'pickpack' },
      { to: '/cycle-count', icon: ClipboardCheck, label: 'Cycle Count', module: 'cyclecount' },
      { to: '/suppliers', icon: Building2, label: 'Suppliers', module: 'suppliers' },
      { to: '/purchase-orders', icon: FileText, label: 'Purchase Orders', module: 'purchase_orders' },
      { to: '/low-stock', icon: AlertTriangle, label: 'Low Stock Alerts', module: 'low_stock' },
    ]
  },
  {
    title: 'Finance & Accounting',
    items: [
      { to: '/income', icon: Wallet, label: 'Income', module: 'income' },
      { to: '/expenses', icon: CreditCard, label: 'Expenses', module: 'expenses' },
      { to: '/sales', icon: TrendingUp, label: 'Sales Monitor', module: 'sales' },
      { to: '/revenue', icon: DollarSign, label: 'Revenue', module: 'revenue' },
      { to: '/finance', icon: Landmark, label: 'Financial Reports', module: 'finance' },
      { to: '/audit', icon: ClipboardCheck, label: 'Audit Trail', module: 'audit' },
      { to: '/reports', icon: FileBarChart, label: 'Reports Center', module: 'reports' },
    ]
  },
  {
    title: 'CRM',
    items: [
      { to: '/crm', icon: Users, label: 'Customer Directory', module: 'crm' },
      { to: '/promotions', icon: Gift, label: 'Promotions', module: 'promotions' },
    ]
  },
  {
    title: 'Organization',
    items: [
      { to: '/employees', icon: Users, label: 'Employees', module: 'employees' },
      { to: '/roles', icon: Shield, label: 'Roles & Access', module: 'roles' },
      { to: '/settings', icon: Settings2, label: 'Settings', module: 'settings' },
    ]
  }
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">E</div>
          <div className="sidebar-logo-text">
            ERP<span>Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(item =>
              hasPermission(item.module, 'view')
            );
            if (visibleItems.length === 0) return null;

            return (
              <div className="sidebar-section" key={section.title}>
                <div className="sidebar-section-title">{section.title}</div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => window.innerWidth < 768 && onToggle?.()}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.avatar || 'U'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="btn-ghost btn-icon" onClick={handleLogout} title="Logout" style={{ color: '#9ca3af' }}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
