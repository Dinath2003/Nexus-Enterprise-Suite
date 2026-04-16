import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardCheck, Search, Filter, Download, ChevronLeft, ChevronRight, Eye, AlertTriangle, Info, Activity } from 'lucide-react';

const actionColors = {
  CREATE: 'badge-success',
  UPDATE: 'badge-info',
  DELETE: 'badge-danger',
  LOGIN: 'badge-grey',
  APPROVE: 'badge-success',
  EXPORT: 'badge-info',
};

const actionIcons = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  LOGIN: '🔑',
  APPROVE: '✅',
  EXPORT: '📥',
};

export default function Audit() {
  const { auditLog, invoices, expenses, income, orders } = useData();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const modules = ['All', ...new Set(auditLog.map(a => a.module))];
  const actions = ['All', ...new Set(auditLog.map(a => a.action))];

  const filtered = auditLog
    .filter(a => moduleFilter === 'All' || a.module === moduleFilter)
    .filter(a => actionFilter === 'All' || a.action === actionFilter)
    .filter(a => a.description?.toLowerCase().includes(search.toLowerCase()) || a.user?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Audit summary stats
  const totalActions = auditLog.length;
  const createActions = auditLog.filter(a => a.action === 'CREATE').length;
  const updateActions = auditLog.filter(a => a.action === 'UPDATE').length;
  const deleteActions = auditLog.filter(a => a.action === 'DELETE').length;

  // Flagged items for auditing
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const pendingExpenses = expenses.filter(e => e.status === 'Pending');
  const pendingIncome = income.filter(i => i.status === 'Pending');
  const largeTransactions = [...invoices.filter(i => i.total > 5000), ...expenses.filter(e => e.amount > 5000)];

  // Activity by module
  const moduleActivity = {};
  auditLog.forEach(a => {
    moduleActivity[a.module] = (moduleActivity[a.module] || 0) + 1;
  });

  if (!isAdmin()) {
    return (
      <div className="animate-in">
        <div className="page-header"><h1><ClipboardCheck size={28} /> Audit Trail</h1></div>
        <div className="card"><div className="card-body">
          <div className="empty-state">
            <ClipboardCheck size={48} />
            <h3>Access Restricted</h3>
            <p>Only administrators and authorized accountants can view the audit trail.</p>
          </div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><ClipboardCheck size={28} /> Audit Trail</h1>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Activity size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Actions</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{totalActions}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Info size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Creates</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{createActions}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow"><Eye size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Updates</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{updateActions}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Deletes</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{deleteActions}</div>
          </div>
        </div>
      </div>

      {/* Audit Flags */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} /> Overdue Invoices</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {overdueInvoices.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-grey)', fontSize: '0.857rem' }}>✅ No overdue invoices</div>
            ) : (
              overdueInvoices.slice(0, 5).map(inv => (
                <div key={inv.id} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 600, fontSize: '0.857rem' }}>{inv.invoiceNumber}</div><div className="text-xs text-muted">{inv.customer?.name}</div></div>
                  <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.857rem' }}>Rs.{inv.total?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} /> Pending Approvals</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {pendingExpenses.length === 0 && pendingIncome.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-grey)', fontSize: '0.857rem' }}>✅ No pending approvals</div>
            ) : (
              <>
                {pendingExpenses.slice(0, 3).map(exp => (
                  <div key={exp.id} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 600, fontSize: '0.857rem' }}>Expense: {exp.category}</div><div className="text-xs text-muted">{exp.description}</div></div>
                    <span style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.857rem' }}>Rs.{exp.amount?.toLocaleString()}</span>
                  </div>
                ))}
                {pendingIncome.slice(0, 2).map(inc => (
                  <div key={inc.id} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 600, fontSize: '0.857rem' }}>Income: {inc.source}</div><div className="text-xs text-muted">{inc.description}</div></div>
                    <span style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.857rem' }}>Rs.{inc.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} /> Activity by Module</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {Object.entries(moduleActivity).sort(([,a],[,b]) => b - a).slice(0, 6).map(([mod, count]) => (
              <div key={mod} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, fontSize: '0.857rem' }}>{mod}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ width: 60 }}>
                    <div className="progress-fill" style={{ width: `${(count / totalActions * 100)}%` }} />
                  </div>
                  <span className="text-sm" style={{ fontWeight: 600, minWidth: 20 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input placeholder="Search audit log..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select className="form-control form-select" value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.857rem' }}>
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="form-control form-select" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.857rem' }}>
              {actions.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th></th><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP Address</th></tr>
          </thead>
          <tbody>
            {paged.map(entry => (
              <tr key={entry.id}>
                <td style={{ fontSize: '1.1rem', width: 40 }}>{actionIcons[entry.action] || '📋'}</td>
                <td className="text-muted" style={{ fontSize: '0.786rem', whiteSpace: 'nowrap' }}>
                  {entry.timestamp?.replace('T', ' ')}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: entry.userId === 'system' ? 'var(--color-grey)' : 'var(--color-dark)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.643rem', fontWeight: 700
                    }}>
                      {entry.user === 'System' ? 'SY' : entry.user?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.857rem' }}>{entry.user}</span>
                  </div>
                </td>
                <td><span className={`badge ${actionColors[entry.action] || 'badge-grey'}`}>{entry.action}</span></td>
                <td><span className="badge badge-grey">{entry.module}</span></td>
                <td style={{ fontSize: '0.857rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</td>
                <td className="text-muted" style={{ fontSize: '0.786rem', fontFamily: 'monospace' }}>{entry.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-pagination">
          <span>Showing {Math.min(((page - 1) * perPage) + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="table-pagination-btns">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
