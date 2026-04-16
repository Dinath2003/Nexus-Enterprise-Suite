import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ALL_MODULES = ['dashboard','products','orders','quotations','invoices','sales','revenue','expenses','income','finance','audit','pos','pos_returns','pos_shifts','pos_loyalty','warehouse','inbound','transfers','pickpack','cyclecount','suppliers','purchase_orders','low_stock','reports','settings','employees','roles','store','crm','promotions'];
const ALL_TRUE = ALL_MODULES.reduce((a, m) => ({ ...a, [m]: { view: true, create: true, edit: true, delete: true } }), {});
const ALL_FALSE = ALL_MODULES.reduce((a, m) => ({ ...a, [m]: { view: false, create: false, edit: false, delete: false } }), {});
const viewOnly = (modules) => { const p = { ...ALL_FALSE }; modules.forEach(m => { p[m] = { view: true, create: false, edit: false, delete: false }; }); return p; };

const DEFAULT_ADMIN = { id: 'usr_001', name: 'Admin User', email: 'admin@erp.com', role: 'Admin', department: 'Management', avatar: 'AU', type: 'employee' };

const DEFAULT_USERS = [
  { ...DEFAULT_ADMIN, password: 'admin123' },
  { id: 'usr_002', name: 'Sarah Johnson', email: 'sarah@erp.com', password: 'pass123', role: 'Sales Manager', department: 'Sales', avatar: 'SJ', type: 'employee' },
  { id: 'usr_003', name: 'Mike Chen', email: 'mike@erp.com', password: 'pass123', role: 'Accountant', department: 'Finance', avatar: 'MC', type: 'employee' },
  { id: 'usr_004', name: 'Emily Davis', email: 'emily@erp.com', password: 'pass123', role: 'HR Manager', department: 'Human Resources', avatar: 'ED', type: 'employee' },
  { id: 'usr_005', name: 'James Wilson', email: 'james@erp.com', password: 'pass123', role: 'Sales Rep', department: 'Sales', avatar: 'JW', type: 'employee' },
  { id: 'usr_006', name: 'Tom Richards', email: 'tom@erp.com', password: 'pass123', role: 'Warehouse Staff', department: 'Operations', avatar: 'TR', type: 'employee' },
  { id: 'usr_007', name: 'Anna Martinez', email: 'anna@erp.com', password: 'pass123', role: 'Cashier', department: 'Sales', avatar: 'AM', type: 'employee' },
];

const DEFAULT_ROLES = [
  { id: 'role_001', name: 'Admin', description: 'Full system access', permissions: ALL_TRUE },
  { id: 'role_002', name: 'Sales Manager', description: 'Manage sales team and operations', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    quotations: { view: true, create: true, edit: true, delete: true },
    invoices: { view: true, create: true, edit: true, delete: false },
    sales: { view: true, create: true, edit: true, delete: false },
    revenue: { view: true, create: false, edit: false, delete: false },
    expenses: { view: true, create: true, edit: false, delete: false },
    income: { view: true, create: true, edit: false, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    pos: { view: true, create: true, edit: true, delete: false },
    pos_returns: { view: true, create: true, edit: true, delete: false },
    pos_shifts: { view: true, create: true, edit: true, delete: false },
    pos_loyalty: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    employees: { view: true, create: false, edit: false, delete: false },
    store: { view: true, create: true, edit: true, delete: false },
    crm: { view: true, create: true, edit: true, delete: false },
    promotions: { view: true, create: true, edit: true, delete: false },
    low_stock: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_003', name: 'Sales Rep', description: 'Create quotations and manage orders', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    quotations: { view: true, create: true, edit: true, delete: false },
    invoices: { view: true, create: true, edit: false, delete: false },
    sales: { view: true, create: false, edit: false, delete: false },
    pos: { view: true, create: true, edit: false, delete: false },
    pos_returns: { view: true, create: true, edit: false, delete: false },
    pos_loyalty: { view: true, create: false, edit: false, delete: false },
    store: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_004', name: 'Accountant', description: 'Manage finances and reports', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: false, edit: false, delete: false },
    quotations: { view: true, create: false, edit: false, delete: false },
    invoices: { view: true, create: true, edit: true, delete: false },
    sales: { view: true, create: false, edit: false, delete: false },
    revenue: { view: true, create: true, edit: true, delete: false },
    expenses: { view: true, create: true, edit: true, delete: true },
    income: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: false },
    audit: { view: true, create: true, edit: false, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    pos: { view: true, create: true, edit: true, delete: false },
    pos_returns: { view: true, create: true, edit: true, delete: false },
    employees: { view: true, create: false, edit: false, delete: false },
    store: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_005', name: 'HR Manager', description: 'Manage employees and company records', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    revenue: { view: true, create: false, edit: false, delete: false },
    expenses: { view: true, create: true, edit: true, delete: false },
    employees: { view: true, create: true, edit: true, delete: true },
    roles: { view: true, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_006', name: 'Warehouse Staff', description: 'Manage inventory and warehouse operations', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: true, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false },
    inbound: { view: true, create: true, edit: true, delete: false },
    transfers: { view: true, create: true, edit: true, delete: false },
    pickpack: { view: true, create: true, edit: true, delete: false },
    cyclecount: { view: true, create: true, edit: true, delete: false },
    low_stock: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_007', name: 'Cashier', description: 'POS operations', permissions: {
    ...ALL_FALSE,
    dashboard: { view: true, create: false, edit: false, delete: false },
    pos: { view: true, create: true, edit: true, delete: false },
    pos_returns: { view: true, create: true, edit: false, delete: false },
    pos_shifts: { view: true, create: true, edit: true, delete: false },
    pos_loyalty: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    store: { view: true, create: false, edit: false, delete: false },
  }},
  { id: 'role_008', name: 'Customer', description: 'Online store access', permissions: {
    ...ALL_FALSE,
    orders: { view: true, create: true, edit: false, delete: false },
    invoices: { view: true, create: false, edit: false, delete: false },
    store: { view: true, create: true, edit: true, delete: true },
  }},
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsers = localStorage.getItem('erp_users');
    const storedRoles = localStorage.getItem('erp_roles');
    setUsers(storedUsers ? JSON.parse(storedUsers) : (() => { localStorage.setItem('erp_users', JSON.stringify(DEFAULT_USERS)); return DEFAULT_USERS; })());
    setRoles(storedRoles ? JSON.parse(storedRoles) : (() => { localStorage.setItem('erp_roles', JSON.stringify(DEFAULT_ROLES)); return DEFAULT_ROLES; })());
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (email, password) => { const allUsers = JSON.parse(localStorage.getItem('erp_users') || '[]'); const found = allUsers.find(u => u.email === email && u.password === password); if (found) { const { password: _, ...safeUser } = found; setUser(safeUser); localStorage.setItem('erp_user', JSON.stringify(safeUser)); return { success: true, user: safeUser }; } return { success: false, error: 'Invalid email or password' }; };
  const register = (userData) => { const allUsers = JSON.parse(localStorage.getItem('erp_users') || '[]'); if (allUsers.find(u => u.email === userData.email)) return { success: false, error: 'Email already exists' }; const newUser = { id: 'usr_' + Date.now(), name: userData.name, email: userData.email, password: userData.password, role: 'Customer', department: 'External', avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), type: 'customer', phone: userData.phone || '', address: userData.address || '' }; const updated = [...allUsers, newUser]; setUsers(updated); localStorage.setItem('erp_users', JSON.stringify(updated)); const { password: _, ...safeUser } = newUser; setUser(safeUser); localStorage.setItem('erp_user', JSON.stringify(safeUser)); return { success: true, user: safeUser }; };
  const logout = () => { setUser(null); localStorage.removeItem('erp_user'); };
  const hasPermission = (module, action) => { if (!user) return false; const allRoles = JSON.parse(localStorage.getItem('erp_roles') || '[]'); const userRole = allRoles.find(r => r.name === user.role); if (!userRole) return false; return userRole.permissions?.[module]?.[action] || false; };
  const isAdmin = () => user?.role === 'Admin';
  const isCustomer = () => user?.type === 'customer' || user?.role === 'Customer';

  const addRole = (roleData) => { const allRoles = JSON.parse(localStorage.getItem('erp_roles') || '[]'); const newRole = { id: 'role_' + Date.now(), ...roleData }; const updated = [...allRoles, newRole]; setRoles(updated); localStorage.setItem('erp_roles', JSON.stringify(updated)); return newRole; };
  const updateRole = (id, roleData) => { const allRoles = JSON.parse(localStorage.getItem('erp_roles') || '[]'); const updated = allRoles.map(r => r.id === id ? { ...r, ...roleData } : r); setRoles(updated); localStorage.setItem('erp_roles', JSON.stringify(updated)); };
  const deleteRole = (id) => { const allRoles = JSON.parse(localStorage.getItem('erp_roles') || '[]'); const updated = allRoles.filter(r => r.id !== id); setRoles(updated); localStorage.setItem('erp_roles', JSON.stringify(updated)); };

  const addUser = (userData) => { const allUsers = JSON.parse(localStorage.getItem('erp_users') || '[]'); if (allUsers.find(u => u.email === userData.email)) return { success: false, error: 'Email already exists' }; const newUser = { id: 'usr_' + Date.now(), avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), type: 'employee', ...userData }; const updated = [...allUsers, newUser]; setUsers(updated); localStorage.setItem('erp_users', JSON.stringify(updated)); return { success: true, user: newUser }; };
  const updateUser = (id, userData) => { const allUsers = JSON.parse(localStorage.getItem('erp_users') || '[]'); const updated = allUsers.map(u => u.id === id ? { ...u, ...userData } : u); setUsers(updated); localStorage.setItem('erp_users', JSON.stringify(updated)); if (user?.id === id) { const updatedUser = updated.find(u => u.id === id); const { password: _, ...safeUser } = updatedUser; setUser(safeUser); localStorage.setItem('erp_user', JSON.stringify(safeUser)); } };
  const deleteUser = (id) => { const allUsers = JSON.parse(localStorage.getItem('erp_users') || '[]'); const updated = allUsers.filter(u => u.id !== id); setUsers(updated); localStorage.setItem('erp_users', JSON.stringify(updated)); };

  const value = { user, users, roles, loading, login, register, logout, hasPermission, isAdmin, isCustomer, addRole, updateRole, deleteRole, addUser, updateUser, deleteUser, ALL_MODULES };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx; };
