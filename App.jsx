import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Store from './pages/Store';
import Orders from './pages/Orders';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Sales from './pages/Sales';
import Revenue from './pages/Revenue';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Finance from './pages/Finance';
import Audit from './pages/Audit';
import POS from './pages/POS';
import POSReturns from './pages/POSReturns';
import POSShifts from './pages/POSShifts';
import POSLoyalty from './pages/POSLoyalty';
import Warehouse from './pages/Warehouse';
import Inbound from './pages/Inbound';
import StockTransfers from './pages/StockTransfers';
import PickPack from './pages/PickPack';
import CycleCount from './pages/CycleCount';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import LowStockAlerts from './pages/LowStockAlerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CRM from './pages/CRM';
import Promotions from './pages/Promotions';
import Employees from './pages/Employees';
import Roles from './pages/Roles';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children || <Outlet />;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-wrapper">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Overview */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* POS Module */}
            <Route path="/pos" element={<POS />} />
            <Route path="/pos-returns" element={<POSReturns />} />
            <Route path="/pos-shifts" element={<POSShifts />} />
            <Route path="/pos-loyalty" element={<POSLoyalty />} />

            {/* Sales & Commerce */}
            <Route path="/store" element={<Store />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/invoices" element={<Invoices />} />

            {/* Warehouse & Supply Chain */}
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/inbound" element={<Inbound />} />
            <Route path="/stock-transfers" element={<StockTransfers />} />
            <Route path="/pick-pack" element={<PickPack />} />
            <Route path="/cycle-count" element={<CycleCount />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/low-stock" element={<LowStockAlerts />} />

            {/* Finance & Accounting */}
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/reports" element={<Reports />} />

            {/* CRM */}
            <Route path="/crm" element={<CRM />} />
            <Route path="/promotions" element={<Promotions />} />

            {/* Organization */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
