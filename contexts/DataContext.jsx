import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

/* ============== SEED DATA ============== */
const SEED_PRODUCTS = [
  { id: 'prod_001', name: 'Professional Laptop', sku: 'LAP-001', category: 'Electronics', price: 389990, cost: 255000, stock: 45, reorderPoint: 10, location: 'A-01-01', warehouseZone: 'Zone A', description: 'High-performance laptop for professionals', image: '💻' },
  { id: 'prod_002', name: 'Wireless Mouse', sku: 'MOU-001', category: 'Accessories', price: 14990, cost: 5400, stock: 200, reorderPoint: 50, location: 'B-02-03', warehouseZone: 'Zone B', description: 'Ergonomic wireless mouse with precision tracking', image: '🖱️' },
  { id: 'prod_003', name: 'Mechanical Keyboard', sku: 'KEY-001', category: 'Accessories', price: 38990, cost: 16500, stock: 120, reorderPoint: 30, location: 'B-02-04', warehouseZone: 'Zone B', description: 'RGB mechanical keyboard with cherry switches', image: '⌨️' },
  { id: 'prod_004', name: '4K Monitor 27"', sku: 'MON-001', category: 'Electronics', price: 149990, cost: 84000, stock: 30, reorderPoint: 8, location: 'A-01-02', warehouseZone: 'Zone A', description: '27-inch 4K UHD display with HDR support', image: '🖥️' },
  { id: 'prod_005', name: 'USB-C Hub', sku: 'HUB-001', category: 'Accessories', price: 23990, cost: 8400, stock: 180, reorderPoint: 40, location: 'B-03-01', warehouseZone: 'Zone B', description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card', image: '🔌' },
  { id: 'prod_006', name: 'Noise-Canceling Headphones', sku: 'AUD-001', category: 'Audio', price: 104990, cost: 45000, stock: 65, reorderPoint: 15, location: 'C-01-01', warehouseZone: 'Zone C', description: 'Premium noise-canceling over-ear headphones', image: '🎧' },
  { id: 'prod_007', name: 'Webcam HD 1080p', sku: 'CAM-001', category: 'Electronics', price: 26990, cost: 10500, stock: 95, reorderPoint: 20, location: 'A-02-01', warehouseZone: 'Zone A', description: 'Full HD webcam with auto-focus and mic', image: '📷' },
  { id: 'prod_008', name: 'Standing Desk', sku: 'DSK-001', category: 'Furniture', price: 179990, cost: 96000, stock: 15, reorderPoint: 5, location: 'D-01-01', warehouseZone: 'Zone D', description: 'Electric adjustable standing desk 60"', image: '🪑' },
  { id: 'prod_009', name: 'Desk Lamp LED', sku: 'LMP-001', category: 'Furniture', price: 20990, cost: 6600, stock: 85, reorderPoint: 20, location: 'D-01-02', warehouseZone: 'Zone D', description: 'Adjustable LED desk lamp with USB charging', image: '💡' },
  { id: 'prod_010', name: 'External SSD 1TB', sku: 'SSD-001', category: 'Storage', price: 32990, cost: 16500, stock: 110, reorderPoint: 25, location: 'A-03-01', warehouseZone: 'Zone A', description: 'Portable 1TB SSD with USB 3.2', image: '💾' },
  { id: 'prod_011', name: 'Wireless Charger', sku: 'CHG-001', category: 'Accessories', price: 11990, cost: 3600, stock: 250, reorderPoint: 60, location: 'B-04-01', warehouseZone: 'Zone B', description: 'Fast wireless charging pad 15W', image: '🔋' },
  { id: 'prod_012', name: 'Office Chair Ergonomic', sku: 'CHR-001', category: 'Furniture', price: 134990, cost: 63000, stock: 20, reorderPoint: 5, location: 'D-02-01', warehouseZone: 'Zone D', description: 'Ergonomic mesh office chair with lumbar support', image: '🪑' },
];

const CUSTOMERS = [
  { id: 'cust_001', name: 'Acme Corporation', email: 'orders@acme.com', phone: '+94-11-2345678', address: '123 Galle Road, Colombo 03', loyaltyPoints: 2500, loyaltyTier: 'Gold', totalSpent: 4620000, joinDate: '2024-03-15', notes: 'Preferred client — large orders quarterly' },
  { id: 'cust_002', name: 'TechStart Inc', email: 'buy@techstart.io', phone: '+94-11-2345679', address: '456 Duplication Road, Colombo 04', loyaltyPoints: 1200, loyaltyTier: 'Silver', totalSpent: 2460000, joinDate: '2024-06-20', notes: 'Startup — growth potential' },
  { id: 'cust_003', name: 'Global Solutions Ltd', email: 'procurement@globalsol.com', phone: '+94-11-2345680', address: '789 Bauddhaloka Mawatha, Colombo 07', loyaltyPoints: 4800, loyaltyTier: 'Platinum', totalSpent: 9600000, joinDate: '2023-11-01', notes: 'Enterprise client — NET 30 terms' },
  { id: 'cust_004', name: 'Design Studio Pro', email: 'admin@designstudio.com', phone: '+94-11-2345681', address: '321 Havelock Road, Colombo 05', loyaltyPoints: 800, loyaltyTier: 'Bronze', totalSpent: 1350000, joinDate: '2025-01-10', notes: '' },
  { id: 'cust_005', name: 'Summit Enterprises', email: 'orders@summit.biz', phone: '+94-11-2345682', address: '555 R A De Mel Mawatha, Colombo 03', loyaltyPoints: 1800, loyaltyTier: 'Silver', totalSpent: 3360000, joinDate: '2024-08-05', notes: 'Bi-monthly orders' },
];

const SUPPLIERS = [
  { id: 'sup_001', name: 'TechDist Global', contact: 'John Blake', email: 'sales@techdist.com', phone: '+1-555-9001', address: '100 Supply Chain Dr, Shenzhen', leadTime: 14, paymentTerms: 'NET 30', rating: 4.5, status: 'Active', categories: ['Electronics', 'Storage'] },
  { id: 'sup_002', name: 'PeripheralPro Inc', contact: 'Maria Santos', email: 'orders@peripheralpro.com', phone: '+1-555-9002', address: '200 Accessory Ave, Taipei', leadTime: 10, paymentTerms: 'NET 15', rating: 4.2, status: 'Active', categories: ['Accessories', 'Audio'] },
  { id: 'sup_003', name: 'FurniCraft Co', contact: 'David Muller', email: 'supply@furnicraft.com', phone: '+1-555-9003', address: '300 Woodwork St, Portland', leadTime: 21, paymentTerms: 'NET 45', rating: 3.8, status: 'Active', categories: ['Furniture'] },
  { id: 'sup_004', name: 'ChipSource Ltd', contact: 'Yuki Tanaka', email: 'bulk@chipsource.jp', phone: '+1-555-9004', address: '400 Silicon Rd, Tokyo', leadTime: 7, paymentTerms: 'Prepaid', rating: 4.8, status: 'Active', categories: ['Electronics', 'Accessories'] },
];

const DEFAULT_SETTINGS = {
  companyName: 'ERPSuite',
  companyAddress: '100 Galle Road, Colombo 03, Sri Lanka',
  companyPhone: '+94-11-2345000',
  companyEmail: 'info@erpsuite.lk',
  taxRate: 10,
  taxInclusive: false,
  currency: 'LKR',
  currencySymbol: 'Rs.',
  defaultReorderPoint: 20,
  loyaltyPointsPerDollar: 1,
  loyaltyRedemptionRate: 0.01,
};

/* ============== GENERATORS ============== */
function generateOrders() {
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const orders = [];
  for (let i = 1; i <= 25; i++) {
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = []; const usedProducts = new Set();
    for (let j = 0; j < numItems; j++) {
      let prod; do { prod = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]; } while (usedProducts.has(prod.id));
      usedProducts.add(prod.id);
      items.push({ productId: prod.id, productName: prod.name, quantity: Math.floor(Math.random() * 5) + 1, price: prod.price, image: prod.image });
    }
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const month = Math.floor(Math.random() * 6); const day = Math.floor(Math.random() * 28) + 1;
    orders.push({ id: `ord_${String(i).padStart(3, '0')}`, orderNumber: `ORD-2026-${String(i).padStart(4, '0')}`, customer, items, total: Math.round(total * 100) / 100, status: statuses[Math.floor(Math.random() * statuses.length)], date: `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, notes: '', createdBy: 'usr_002' });
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
}

function generateInvoices(orders) {
  const invoices = [];
  orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped').forEach((order, i) => {
    const tax = Math.round(order.total * 0.1 * 100) / 100;
    invoices.push({ id: `inv_${String(i + 1).padStart(3, '0')}`, invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`, orderId: order.id, customer: order.customer, items: order.items.map(it => ({ ...it, tax: Math.round(it.price * it.quantity * 0.1 * 100) / 100, discount: 0 })), subtotal: order.total, tax, discount: 0, total: Math.round((order.total + tax) * 100) / 100, status: ['Paid', 'Sent', 'Overdue'][Math.floor(Math.random() * 3)], date: order.date, dueDate: order.date.replace(/(\d{2})$/, d => String(Math.min(28, parseInt(d) + 30)).padStart(2, '0')), notes: 'Thank you for your business!', createdBy: 'usr_003' });
  });
  return invoices;
}

function generateQuotations() {
  const statuses = ['Draft', 'Sent', 'Accepted', 'Rejected']; const quotations = [];
  for (let i = 1; i <= 10; i++) {
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const items = []; const usedProducts = new Set();
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      let prod; do { prod = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]; } while (usedProducts.has(prod.id));
      usedProducts.add(prod.id); const qty = Math.floor(Math.random() * 10) + 1;
      items.push({ productId: prod.id, productName: prod.name, quantity: qty, price: prod.price, tax: Math.round(prod.price * qty * 0.1 * 100) / 100, discount: 0, image: prod.image });
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = items.reduce((s, it) => s + it.tax, 0);
    quotations.push({ id: `quot_${String(i).padStart(3, '0')}`, quotationNumber: `QT-2026-${String(i).padStart(4, '0')}`, customer, items, subtotal: Math.round(subtotal * 100) / 100, tax: Math.round(tax * 100) / 100, discount: 0, total: Math.round((subtotal + tax) * 100) / 100, status: statuses[Math.floor(Math.random() * statuses.length)], date: `2026-${String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, validUntil: '2026-06-30', notes: 'Prices valid for 30 days', terms: 'Payment due within 30 days of invoice date.', createdBy: 'usr_005' });
  }
  return quotations;
}

function generateExpenses() {
  const categories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Travel', 'Insurance', 'Maintenance'];
  const expenses = [];
  for (let m = 1; m <= 6; m++) {
    expenses.push({ id: `exp_rent_${m}`, category: 'Rent', description: 'Office rent - monthly', amount: 1500000, date: `2026-${String(m).padStart(2, '0')}-01`, recurring: true, status: 'Approved' });
    expenses.push({ id: `exp_util_${m}`, category: 'Utilities', description: 'Electricity, water, internet', amount: 240000 + Math.floor(Math.random() * 120000), date: `2026-${String(m).padStart(2, '0')}-05`, recurring: true, status: 'Approved' });
    expenses.push({ id: `exp_sal_${m}`, category: 'Salaries', description: 'Monthly payroll', amount: 10500000 + Math.floor(Math.random() * 1500000), date: `2026-${String(m).padStart(2, '0')}-28`, recurring: true, status: 'Approved' });
    for (let j = 0; j < 3; j++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      expenses.push({ id: `exp_${m}_${j}`, category: cat, description: `${cat} expense`, amount: Math.floor(Math.random() * 600000) + 30000, date: `2026-${String(m).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, recurring: false, status: ['Approved', 'Pending'][Math.floor(Math.random() * 2)] });
    }
  }
  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}

function generateEmployees() {
  return [
    { id: 'emp_001', userId: 'usr_001', name: 'Admin User', email: 'admin@erp.com', phone: '+94-77-1001001', department: 'Management', position: 'CEO', salary: 750000, hireDate: '2020-01-15', status: 'Active', performance: 95 },
    { id: 'emp_002', userId: 'usr_002', name: 'Sarah Johnson', email: 'sarah@erp.com', phone: '+94-77-1001002', department: 'Sales', position: 'Sales Manager', salary: 450000, hireDate: '2021-03-20', status: 'Active', performance: 88 },
    { id: 'emp_003', userId: 'usr_003', name: 'Mike Chen', email: 'mike@erp.com', phone: '+94-77-1001003', department: 'Finance', position: 'Senior Accountant', salary: 380000, hireDate: '2021-06-10', status: 'Active', performance: 92 },
    { id: 'emp_004', userId: 'usr_004', name: 'Emily Davis', email: 'emily@erp.com', phone: '+94-77-1001004', department: 'Human Resources', position: 'HR Manager', salary: 420000, hireDate: '2021-02-01', status: 'Active', performance: 90 },
    { id: 'emp_005', userId: 'usr_005', name: 'James Wilson', email: 'james@erp.com', phone: '+94-77-1001005', department: 'Sales', position: 'Sales Representative', salary: 280000, hireDate: '2022-09-15', status: 'Active', performance: 78 },
    { id: 'emp_006', name: 'Lisa Park', email: 'lisa@erp.com', phone: '+94-77-1001006', department: 'Marketing', position: 'Marketing Specialist', salary: 300000, hireDate: '2022-11-01', status: 'Active', performance: 85 },
    { id: 'emp_007', name: 'David Brown', email: 'david@erp.com', phone: '+94-77-1001007', department: 'Engineering', position: 'Software Developer', salary: 520000, hireDate: '2023-01-10', status: 'Active', performance: 91 },
    { id: 'emp_008', name: 'Anna Martinez', email: 'anna@erp.com', phone: '+94-77-1001008', department: 'Sales', position: 'Cashier', salary: 180000, hireDate: '2023-04-15', status: 'Active', performance: 72 },
    { id: 'emp_009', name: 'Tom Richards', email: 'tom@erp.com', phone: '+94-77-1001009', department: 'Operations', position: 'Warehouse Manager', salary: 400000, hireDate: '2022-07-20', status: 'Active', performance: 86 },
    { id: 'emp_010', name: 'Grace Lee', email: 'grace@erp.com', phone: '+94-77-1001010', department: 'Finance', position: 'Junior Accountant', salary: 220000, hireDate: '2024-01-05', status: 'Active', performance: 80 },
    { id: 'emp_011', name: 'Robert Taylor', email: 'robert@erp.com', phone: '+94-77-1001011', department: 'Operations', position: 'Warehouse Staff', salary: 160000, hireDate: '2023-08-20', status: 'Active', performance: 83 },
    { id: 'emp_012', name: 'Nina Patel', email: 'nina@erp.com', phone: '+94-77-1001012', department: 'Marketing', position: 'Content Writer', salary: 200000, hireDate: '2024-03-01', status: 'Active', performance: 76 },
  ];
}

function generateIncome() {
  const sources = ['Product Sales', 'Service Revenue', 'Consulting Fees', 'Subscription Revenue', 'Licensing Fees', 'Interest Income', 'Commission Income', 'Rental Income'];
  const incomeRecords = [];
  for (let m = 1; m <= 6; m++) {
    incomeRecords.push({ id: `inc_sales_${m}`, source: 'Product Sales', description: 'Monthly product sales revenue', amount: 7500000 + Math.floor(Math.random() * 4500000), date: `2026-${String(m).padStart(2, '0')}-28`, category: 'Operating', recurring: true, status: 'Received', reference: `INV-BATCH-${m}`, account: 'Sales Revenue', taxable: true });
    incomeRecords.push({ id: `inc_svc_${m}`, source: 'Service Revenue', description: 'Technical support and maintenance contracts', amount: 2400000 + Math.floor(Math.random() * 1200000), date: `2026-${String(m).padStart(2, '0')}-15`, category: 'Operating', recurring: true, status: 'Received', reference: `SVC-${m}`, account: 'Service Revenue', taxable: true });
    if (Math.random() > 0.3) incomeRecords.push({ id: `inc_con_${m}`, source: 'Consulting Fees', description: 'IT consulting', amount: 900000 + Math.floor(Math.random() * 2100000), date: `2026-${String(m).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, category: 'Operating', recurring: false, status: Math.random() > 0.2 ? 'Received' : 'Pending', reference: `CON-${m}`, account: 'Consulting Revenue', taxable: true });
  }
  return incomeRecords.sort((a, b) => b.date.localeCompare(a.date));
}

function generateAuditLog() {
  const entries = [
    { action: 'CREATE', module: 'Invoice', description: 'Created invoice INV-2026-0001', user: 'Mike Chen', userId: 'usr_003' },
    { action: 'UPDATE', module: 'Order', description: 'Updated order ORD-2026-0003 status to Shipped', user: 'Sarah Johnson', userId: 'usr_002' },
    { action: 'CREATE', module: 'Quotation', description: 'Created quotation QT-2026-0005', user: 'James Wilson', userId: 'usr_005' },
    { action: 'UPDATE', module: 'Invoice', description: 'Marked invoice INV-2026-0002 as Paid', user: 'Mike Chen', userId: 'usr_003' },
    { action: 'DELETE', module: 'Expense', description: 'Deleted duplicate expense entry', user: 'Admin User', userId: 'usr_001' },
    { action: 'CREATE', module: 'POS', description: 'POS sale completed - $349.99', user: 'Sarah Johnson', userId: 'usr_002' },
    { action: 'APPROVE', module: 'Expense', description: 'Approved marketing expense $1,800', user: 'Admin User', userId: 'usr_001' },
    { action: 'CREATE', module: 'GRN', description: 'Received shipment GRN-0005 from TechDist', user: 'Tom Richards', userId: 'usr_009' },
    { action: 'UPDATE', module: 'Product', description: 'Stock adjusted for Wireless Mouse +50', user: 'Tom Richards', userId: 'usr_009' },
    { action: 'LOGIN', module: 'Auth', description: 'User logged in', user: 'Admin User', userId: 'usr_001' },
  ];
  return entries.map((a, i) => {
    const d = new Date(2026, 3, 15 - Math.floor(Math.random() * 60));
    return { id: `audit_${String(i + 1).padStart(3, '0')}`, ...a, timestamp: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`, ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}` };
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function generatePosTransactions() {
  const txns = []; const payMethods = ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'];
  for (let i = 1; i <= 30; i++) {
    const items = []; const used = new Set();
    for (let j = 0; j < Math.floor(Math.random() * 4) + 1; j++) {
      let p; do { p = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]; } while (used.has(p.id)); used.add(p.id);
      items.push({ productId: p.id, productName: p.name, quantity: Math.floor(Math.random() * 3) + 1, price: p.price, image: p.image });
    }
    const sub = items.reduce((s, it) => s + it.price * it.quantity, 0); const tax = Math.round(sub * 0.1 * 100) / 100;
    const d = new Date(2026, 3, 15 - Math.floor(Math.random() * 30));
    txns.push({ id: `pos_${String(i).padStart(3, '0')}`, receiptNumber: `POS-${String(i).padStart(4, '0')}`, items, subtotal: Math.round(sub * 100) / 100, tax, total: Math.round((sub + tax) * 100) / 100, paymentMethod: payMethods[Math.floor(Math.random() * 4)], cashier: ['Sarah Johnson', 'James Wilson', 'Anna Martinez'][Math.floor(Math.random() * 3)], cashierId: ['usr_002', 'usr_005', 'usr_008'][Math.floor(Math.random() * 3)], date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, time: `${String(Math.floor(Math.random() * 12) + 9).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`, status: 'Completed', customerName: Math.random() > 0.5 ? CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)].name : 'Walk-in Customer' });
  }
  return txns.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
}

function generatePurchaseOrders() {
  const statuses = ['Draft', 'Sent', 'Partially Received', 'Completed'];
  const pos = [];
  for (let i = 1; i <= 8; i++) {
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    const items = []; const used = new Set();
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      let p; do { p = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]; } while (used.has(p.id)); used.add(p.id);
      const qty = Math.floor(Math.random() * 50) + 10;
      items.push({ productId: p.id, productName: p.name, quantity: qty, unitCost: p.cost, total: qty * p.cost, quantityReceived: 0, image: p.image });
    }
    const total = items.reduce((s, it) => s + it.total, 0);
    const m = Math.floor(Math.random() * 4) + 1;
    pos.push({ id: `po_${String(i).padStart(3, '0')}`, poNumber: `PO-2026-${String(i).padStart(4, '0')}`, supplier, items, total: Math.round(total * 100) / 100, status: statuses[Math.floor(Math.random() * statuses.length)], date: `2026-${String(m).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, expectedDate: `2026-${String(m + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, notes: '' });
  }
  return pos.sort((a, b) => b.date.localeCompare(a.date));
}

function generateGRNs() {
  const grns = [];
  const statuses = ['Pending', 'Inspecting', 'Completed'];
  for (let i = 1; i <= 5; i++) {
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    const items = []; const used = new Set();
    for (let j = 0; j < Math.floor(Math.random() * 2) + 1; j++) {
      let p; do { p = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]; } while (used.has(p.id)); used.add(p.id);
      const expected = Math.floor(Math.random() * 30) + 10;
      const received = Math.floor(expected * (0.8 + Math.random() * 0.25));
      items.push({ productId: p.id, productName: p.name, expectedQty: expected, receivedQty: received, damagedQty: Math.floor(Math.random() * 3), image: p.image });
    }
    grns.push({ id: `grn_${String(i).padStart(3, '0')}`, grnNumber: `GRN-2026-${String(i).padStart(4, '0')}`, poNumber: `PO-2026-${String(i).padStart(4, '0')}`, supplier, items, status: statuses[Math.floor(Math.random() * statuses.length)], receivedDate: `2026-${String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, receivedBy: 'Tom Richards', notes: '' });
  }
  return grns.sort((a, b) => b.receivedDate.localeCompare(a.receivedDate));
}

function generateStockTransfers() {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Main Store'];
  const transfers = [];
  for (let i = 1; i <= 6; i++) {
    const prod = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)];
    const from = zones[Math.floor(Math.random() * zones.length)];
    let to; do { to = zones[Math.floor(Math.random() * zones.length)]; } while (to === from);
    transfers.push({ id: `tf_${String(i).padStart(3, '0')}`, transferNumber: `TF-2026-${String(i).padStart(4, '0')}`, productId: prod.id, productName: prod.name, image: prod.image, quantity: Math.floor(Math.random() * 20) + 5, fromZone: from, toZone: to, status: ['Requested', 'In Transit', 'Completed'][Math.floor(Math.random() * 3)], date: `2026-${String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, requestedBy: 'Tom Richards' });
  }
  return transfers.sort((a, b) => b.date.localeCompare(a.date));
}

function generatePickLists(orders) {
  return orders.filter(o => o.status === 'Processing' || o.status === 'Pending').slice(0, 8).map((o, i) => ({
    id: `pick_${String(i + 1).padStart(3, '0')}`, orderNumber: o.orderNumber, orderId: o.id, customer: o.customer,
    items: o.items.map(it => ({ ...it, picked: Math.random() > 0.5, packed: false, location: SEED_PRODUCTS.find(p => p.id === it.productId)?.location || 'A-01-01' })),
    status: ['Pending', 'Picking', 'Packed', 'Ready'][Math.floor(Math.random() * 4)], priority: ['Normal', 'High', 'Urgent'][Math.floor(Math.random() * 3)], assignedTo: 'Robert Taylor', date: o.date
  }));
}

function generateReturns(posTransactions) {
  const reasons = ['Defective', 'Wrong Item', 'Changed Mind', 'Damaged in Transit'];
  return posTransactions.slice(0, 5).map((txn, i) => {
    const returnItem = txn.items[0];
    const refund = Math.round(returnItem.price * returnItem.quantity * 1.1 * 100) / 100;
    return { id: `ret_${String(i + 1).padStart(3, '0')}`, returnNumber: `RET-2026-${String(i + 1).padStart(4, '0')}`, originalReceipt: txn.receiptNumber, originalTransactionId: txn.id, items: [{ ...returnItem, returnQty: returnItem.quantity, reason: reasons[Math.floor(Math.random() * reasons.length)] }], refundAmount: refund, refundMethod: txn.paymentMethod, status: ['Pending', 'Approved', 'Completed'][Math.floor(Math.random() * 3)], date: txn.date, processedBy: txn.cashier, notes: '' };
  });
}

function generateShifts() {
  const shifts = [];
  const cashiers = [{ name: 'Sarah Johnson', id: 'usr_002' }, { name: 'James Wilson', id: 'usr_005' }, { name: 'Anna Martinez', id: 'usr_008' }];
  for (let i = 1; i <= 10; i++) {
    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
    const d = new Date(2026, 3, 15 - Math.floor(Math.random() * 14));
    const startH = Math.floor(Math.random() * 3) + 8;
    const endH = startH + 8;
    const sales = Math.floor(Math.random() * 15) + 5;
    const totalSales = Math.floor(Math.random() * 1500000) + 300000;
    const openingCash = 50000;
    const cashSales = Math.floor(totalSales * 0.4);
    shifts.push({ id: `shift_${String(i).padStart(3, '0')}`, cashier: cashier.name, cashierId: cashier.id, date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, clockIn: `${String(startH).padStart(2, '0')}:00`, clockOut: i <= 2 ? null : `${String(endH).padStart(2, '0')}:00`, openingCash, closingCash: i <= 2 ? null : openingCash + cashSales + Math.floor(Math.random() * 5000) - 2500, expectedCash: openingCash + cashSales, totalSales, totalTransactions: sales, totalReturns: Math.floor(Math.random() * 2), status: i <= 2 ? 'Open' : 'Closed' });
  }
  return shifts.sort((a, b) => b.date.localeCompare(a.date));
}

function generatePromotions() {
  return [
    { id: 'promo_001', name: 'Summer Sale', code: 'SUMMER20', type: 'Percentage', value: 20, minOrder: 30000, maxUses: 500, usedCount: 127, startDate: '2026-04-01', endDate: '2026-06-30', status: 'Active', description: '20% off orders over Rs.30,000', applicableCategories: ['All'] },
    { id: 'promo_002', name: 'New Customer', code: 'WELCOME10', type: 'Percentage', value: 10, minOrder: 0, maxUses: 1000, usedCount: 342, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active', description: '10% off first purchase', applicableCategories: ['All'] },
    { id: 'promo_003', name: 'Electronics BOGO', code: 'ELECBOGO', type: 'BOGO', value: 0, minOrder: 150000, maxUses: 100, usedCount: 23, startDate: '2026-04-15', endDate: '2026-05-15', status: 'Active', description: 'Buy one get one 50% off electronics', applicableCategories: ['Electronics'] },
    { id: 'promo_004', name: 'Flat Rs.15,000 Off', code: 'FLAT15K', type: 'Fixed', value: 15000, minOrder: 90000, maxUses: 200, usedCount: 89, startDate: '2026-03-01', endDate: '2026-04-30', status: 'Active', description: 'Rs.15,000 off orders over Rs.90,000', applicableCategories: ['All'] },
    { id: 'promo_005', name: 'Spring Clearance', code: 'SPRING30', type: 'Percentage', value: 30, minOrder: 15000, maxUses: 300, usedCount: 300, startDate: '2026-02-01', endDate: '2026-03-31', status: 'Expired', description: '30% off clearance items', applicableCategories: ['Furniture', 'Accessories'] },
  ];
}

/* ============== PROVIDER ============== */
export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [income, setIncome] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [posTransactions, setPosTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [pickLists, setPickLists] = useState([]);
  const [returns, setReturns] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [cart, setCart] = useState([]);
  const [posCart, setPosCart] = useState([]);

  useEffect(() => {
    const load = (key, gen) => { const s = localStorage.getItem(`erp_${key}`); if (s) return JSON.parse(s); const d = typeof gen === 'function' ? gen() : gen; localStorage.setItem(`erp_${key}`, JSON.stringify(d)); return d; };
    const prods = load('products', SEED_PRODUCTS);
    const ords = load('orders', generateOrders);
    const posTxns = load('posTransactions', generatePosTransactions);
    setProducts(prods); setOrders(ords);
    setInvoices(load('invoices', () => generateInvoices(ords)));
    setQuotations(load('quotations', generateQuotations));
    setExpenses(load('expenses', generateExpenses));
    setEmployees(load('employees', generateEmployees));
    setCustomers(load('customers', CUSTOMERS));
    setIncome(load('income', generateIncome));
    setAuditLog(load('auditLog', generateAuditLog));
    setPosTransactions(posTxns);
    setSuppliers(load('suppliers', SUPPLIERS));
    setPurchaseOrders(load('purchaseOrders', generatePurchaseOrders));
    setGrns(load('grns', generateGRNs));
    setStockTransfers(load('stockTransfers', generateStockTransfers));
    setPickLists(load('pickLists', () => generatePickLists(ords)));
    setReturns(load('returns', () => generateReturns(posTxns)));
    setShifts(load('shifts', generateShifts));
    setPromotions(load('promotions', generatePromotions));
    setSettings(load('settings', DEFAULT_SETTINGS));
    const c1 = localStorage.getItem('erp_cart'); if (c1) setCart(JSON.parse(c1));
    const c2 = localStorage.getItem('erp_pos_cart'); if (c2) setPosCart(JSON.parse(c2));
  }, []);

  const save = (key, data) => localStorage.setItem(`erp_${key}`, JSON.stringify(data));

  /* --- CRUD helpers --- */
  const crud = (setter, key) => ({
    add: (item, prefix) => { const n = { id: `${prefix}_${Date.now()}`, ...item }; setter(prev => { const u = [n, ...prev]; save(key, u); return u; }); return { id: `${prefix}_${Date.now()}`, ...item }; },
    update: (id, data) => setter(prev => { const u = prev.map(x => x.id === id ? { ...x, ...data } : x); save(key, u); return u; }),
    remove: (id) => setter(prev => { const u = prev.filter(x => x.id !== id); save(key, u); return u; }),
  });

  // --- Products ---
  const addProduct = (p) => { const n = { id: 'prod_' + Date.now(), ...p }; const u = [...products, n]; setProducts(u); save('products', u); return n; };
  const updateProduct = (id, p) => { const u = products.map(x => x.id === id ? { ...x, ...p } : x); setProducts(u); save('products', u); };
  const deleteProduct = (id) => { const u = products.filter(x => x.id !== id); setProducts(u); save('products', u); };

  // --- Orders ---
  const addOrder = (o) => { const n = { id: 'ord_' + Date.now(), orderNumber: `ORD-2026-${String(orders.length + 1).padStart(4, '0')}`, ...o }; const u = [n, ...orders]; setOrders(u); save('orders', u); return n; };
  const updateOrder = (id, o) => { const u = orders.map(x => x.id === id ? { ...x, ...o } : x); setOrders(u); save('orders', u); };
  const deleteOrder = (id) => { const u = orders.filter(x => x.id !== id); setOrders(u); save('orders', u); };

  // --- Invoices ---
  const addInvoice = (inv) => { const n = { id: 'inv_' + Date.now(), invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`, ...inv }; const u = [n, ...invoices]; setInvoices(u); save('invoices', u); return n; };
  const updateInvoice = (id, inv) => { const u = invoices.map(x => x.id === id ? { ...x, ...inv } : x); setInvoices(u); save('invoices', u); };
  const deleteInvoice = (id) => { const u = invoices.filter(x => x.id !== id); setInvoices(u); save('invoices', u); };

  // --- Quotations ---
  const addQuotation = (q) => { const n = { id: 'quot_' + Date.now(), quotationNumber: `QT-2026-${String(quotations.length + 1).padStart(4, '0')}`, ...q }; const u = [n, ...quotations]; setQuotations(u); save('quotations', u); return n; };
  const updateQuotation = (id, q) => { const u = quotations.map(x => x.id === id ? { ...x, ...q } : x); setQuotations(u); save('quotations', u); };
  const deleteQuotation = (id) => { const u = quotations.filter(x => x.id !== id); setQuotations(u); save('quotations', u); };
  const convertQuotationToInvoice = (quotId) => { const q = quotations.find(x => x.id === quotId); if (!q) return null; const inv = addInvoice({ customer: q.customer, items: q.items, subtotal: q.subtotal, tax: q.tax, discount: q.discount, total: q.total, status: 'Draft', date: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: q.notes, createdBy: q.createdBy }); updateQuotation(quotId, { status: 'Accepted' }); return inv; };

  // --- Expenses ---
  const addExpense = (e) => { const n = { id: 'exp_' + Date.now(), ...e }; const u = [n, ...expenses]; setExpenses(u); save('expenses', u); return n; };
  const updateExpense = (id, e) => { const u = expenses.map(x => x.id === id ? { ...x, ...e } : x); setExpenses(u); save('expenses', u); };
  const deleteExpense = (id) => { const u = expenses.filter(x => x.id !== id); setExpenses(u); save('expenses', u); };

  // --- Employees ---
  const addEmployee = (e) => { const n = { id: 'emp_' + Date.now(), ...e }; const u = [...employees, n]; setEmployees(u); save('employees', u); return n; };
  const updateEmployee = (id, e) => { const u = employees.map(x => x.id === id ? { ...x, ...e } : x); setEmployees(u); save('employees', u); };
  const deleteEmployee = (id) => { const u = employees.filter(x => x.id !== id); setEmployees(u); save('employees', u); };

  // --- Customers ---
  const addCustomer = (c) => { const n = { id: 'cust_' + Date.now(), loyaltyPoints: 0, loyaltyTier: 'Bronze', totalSpent: 0, joinDate: new Date().toISOString().split('T')[0], notes: '', ...c }; const u = [...customers, n]; setCustomers(u); save('customers', u); return n; };
  const updateCustomer = (id, c) => { const u = customers.map(x => x.id === id ? { ...x, ...c } : x); setCustomers(u); save('customers', u); };
  const deleteCustomer = (id) => { const u = customers.filter(x => x.id !== id); setCustomers(u); save('customers', u); };

  // --- Income ---
  const addIncome = (inc) => { const n = { id: 'inc_' + Date.now(), ...inc }; const u = [n, ...income]; setIncome(u); save('income', u); return n; };
  const updateIncome = (id, inc) => { const u = income.map(x => x.id === id ? { ...x, ...inc } : x); setIncome(u); save('income', u); };
  const deleteIncome = (id) => { const u = income.filter(x => x.id !== id); setIncome(u); save('income', u); };

  // --- Audit Log ---
  const logAuditAction = (action, module, description, userId, userName) => { const entry = { id: 'audit_' + Date.now(), action, module, description, user: userName || 'System', userId: userId || 'system', timestamp: new Date().toISOString().slice(0, 19), ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1) }; const u = [entry, ...auditLog]; setAuditLog(u); save('auditLog', u); };

  // --- POS Cart ---
  const addPosToCart = (product, qty = 1) => { const existing = posCart.find(c => c.productId === product.id); let u; if (existing) { u = posCart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + qty } : c); } else { u = [...posCart, { productId: product.id, productName: product.name, price: product.price, quantity: qty, image: product.image }]; } setPosCart(u); save('pos_cart', u); };
  const updatePosCartItem = (productId, qty) => { if (qty <= 0) { removePosCartItem(productId); return; } const u = posCart.map(c => c.productId === productId ? { ...c, quantity: qty } : c); setPosCart(u); save('pos_cart', u); };
  const removePosCartItem = (productId) => { const u = posCart.filter(c => c.productId !== productId); setPosCart(u); save('pos_cart', u); };
  const clearPosCart = () => { setPosCart([]); save('pos_cart', []); };
  const completePosTransaction = (paymentMethod, cashierName, cashierId, customerName) => { if (posCart.length === 0) return null; const sub = posCart.reduce((s, c) => s + c.price * c.quantity, 0); const tax = Math.round(sub * 0.1 * 100) / 100; const total = Math.round((sub + tax) * 100) / 100; const now = new Date(); const txn = { id: 'pos_' + Date.now(), receiptNumber: `POS-${String(posTransactions.length + 1).padStart(4, '0')}`, items: [...posCart], subtotal: Math.round(sub * 100) / 100, tax, total, paymentMethod, cashier: cashierName, cashierId, date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, status: 'Completed', customerName: customerName || 'Walk-in Customer' }; const u = [txn, ...posTransactions]; setPosTransactions(u); save('posTransactions', u); posCart.forEach(item => { const prod = products.find(p => p.id === item.productId); if (prod) updateProduct(prod.id, { stock: Math.max(0, prod.stock - item.quantity) }); }); clearPosCart(); return txn; };

  // --- Online Cart ---
  const addToCart = (product, qty = 1) => { const existing = cart.find(c => c.productId === product.id); let u; if (existing) { u = cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + qty } : c); } else { u = [...cart, { productId: product.id, productName: product.name, price: product.price, quantity: qty, image: product.image }]; } setCart(u); save('cart', u); };
  const updateCartItem = (productId, qty) => { if (qty <= 0) { removeFromCart(productId); return; } const u = cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c); setCart(u); save('cart', u); };
  const removeFromCart = (productId) => { const u = cart.filter(c => c.productId !== productId); setCart(u); save('cart', u); };
  const clearCart = () => { setCart([]); save('cart', []); };
  const checkout = (customerInfo) => { if (cart.length === 0) return null; const total = cart.reduce((s, c) => s + c.price * c.quantity, 0); const order = addOrder({ customer: customerInfo, items: cart, total: Math.round(total * 100) / 100, status: 'Pending', date: new Date().toISOString().split('T')[0], notes: '' }); cart.forEach(item => { const prod = products.find(p => p.id === item.productId); if (prod) updateProduct(prod.id, { stock: Math.max(0, prod.stock - item.quantity) }); }); clearCart(); return order; };

  // --- Suppliers ---
  const addSupplier = (s) => { const n = { id: 'sup_' + Date.now(), ...s }; const u = [...suppliers, n]; setSuppliers(u); save('suppliers', u); return n; };
  const updateSupplier = (id, s) => { const u = suppliers.map(x => x.id === id ? { ...x, ...s } : x); setSuppliers(u); save('suppliers', u); };
  const deleteSupplier = (id) => { const u = suppliers.filter(x => x.id !== id); setSuppliers(u); save('suppliers', u); };

  // --- Purchase Orders ---
  const addPurchaseOrder = (po) => { const n = { id: 'po_' + Date.now(), poNumber: `PO-2026-${String(purchaseOrders.length + 1).padStart(4, '0')}`, ...po }; const u = [n, ...purchaseOrders]; setPurchaseOrders(u); save('purchaseOrders', u); return n; };
  const updatePurchaseOrder = (id, po) => { const u = purchaseOrders.map(x => x.id === id ? { ...x, ...po } : x); setPurchaseOrders(u); save('purchaseOrders', u); };
  const deletePurchaseOrder = (id) => { const u = purchaseOrders.filter(x => x.id !== id); setPurchaseOrders(u); save('purchaseOrders', u); };

  // --- GRNs ---
  const addGRN = (grn) => { const n = { id: 'grn_' + Date.now(), grnNumber: `GRN-2026-${String(grns.length + 1).padStart(4, '0')}`, ...grn }; const u = [n, ...grns]; setGrns(u); save('grns', u); return n; };
  const updateGRN = (id, grn) => { const u = grns.map(x => x.id === id ? { ...x, ...grn } : x); setGrns(u); save('grns', u); };

  // --- Stock Transfers ---
  const addStockTransfer = (tf) => { const n = { id: 'tf_' + Date.now(), transferNumber: `TF-2026-${String(stockTransfers.length + 1).padStart(4, '0')}`, ...tf }; const u = [n, ...stockTransfers]; setStockTransfers(u); save('stockTransfers', u); return n; };
  const updateStockTransfer = (id, tf) => { const u = stockTransfers.map(x => x.id === id ? { ...x, ...tf } : x); setStockTransfers(u); save('stockTransfers', u); };

  // --- Pick Lists ---
  const updatePickList = (id, pl) => { const u = pickLists.map(x => x.id === id ? { ...x, ...pl } : x); setPickLists(u); save('pickLists', u); };

  // --- Returns ---
  const addReturn = (r) => { const n = { id: 'ret_' + Date.now(), returnNumber: `RET-2026-${String(returns.length + 1).padStart(4, '0')}`, ...r }; const u = [n, ...returns]; setReturns(u); save('returns', u); return n; };
  const updateReturn = (id, r) => { const u = returns.map(x => x.id === id ? { ...x, ...r } : x); setReturns(u); save('returns', u); };

  // --- Shifts ---
  const addShift = (s) => { const n = { id: 'shift_' + Date.now(), ...s }; const u = [n, ...shifts]; setShifts(u); save('shifts', u); return n; };
  const updateShift = (id, s) => { const u = shifts.map(x => x.id === id ? { ...x, ...s } : x); setShifts(u); save('shifts', u); };

  // --- Promotions ---
  const addPromotion = (p) => { const n = { id: 'promo_' + Date.now(), usedCount: 0, ...p }; const u = [n, ...promotions]; setPromotions(u); save('promotions', u); return n; };
  const updatePromotion = (id, p) => { const u = promotions.map(x => x.id === id ? { ...x, ...p } : x); setPromotions(u); save('promotions', u); };
  const deletePromotion = (id) => { const u = promotions.filter(x => x.id !== id); setPromotions(u); save('promotions', u); };

  // --- Settings ---
  const updateSettings = (s) => { const u = { ...settings, ...s }; setSettings(u); save('settings', u); };

  const value = {
    products, orders, invoices, quotations, expenses, employees, customers, cart,
    income, auditLog, posTransactions, posCart, suppliers, purchaseOrders, grns,
    stockTransfers, pickLists, returns, shifts, promotions, settings,
    addProduct, updateProduct, deleteProduct,
    addOrder, updateOrder, deleteOrder,
    addInvoice, updateInvoice, deleteInvoice,
    addQuotation, updateQuotation, deleteQuotation, convertQuotationToInvoice,
    addExpense, updateExpense, deleteExpense,
    addEmployee, updateEmployee, deleteEmployee,
    addToCart, updateCartItem, removeFromCart, clearCart, checkout,
    addCustomer, updateCustomer, deleteCustomer,
    addIncome, updateIncome, deleteIncome,
    logAuditAction,
    addPosToCart, updatePosCartItem, removePosCartItem, clearPosCart, completePosTransaction,
    addSupplier, updateSupplier, deleteSupplier,
    addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
    addGRN, updateGRN,
    addStockTransfer, updateStockTransfer,
    updatePickList,
    addReturn, updateReturn,
    addShift, updateShift,
    addPromotion, updatePromotion, deletePromotion,
    updateSettings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => { const ctx = useContext(DataContext); if (!ctx) throw new Error('useData must be inside DataProvider'); return ctx; };
