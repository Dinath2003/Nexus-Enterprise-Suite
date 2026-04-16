import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Shield, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const MODULES = ['dashboard','products','orders','quotations','invoices','sales','revenue','expenses','income','finance','audit','pos','pos_returns','pos_shifts','pos_loyalty','warehouse','inbound','transfers','pickpack','cyclecount','suppliers','purchase_orders','low_stock','reports','settings','employees','roles','store','crm','promotions'];
const ACTIONS = ['view', 'create', 'edit', 'delete'];

export default function Roles() {
  const { roles, addRole, updateRole, deleteRole, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '',
    permissions: MODULES.reduce((acc, m) => ({ ...acc, [m]: { view: false, create: false, edit: false, delete: false } }), {})
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', description: '',
      permissions: MODULES.reduce((acc, m) => ({ ...acc, [m]: { view: false, create: false, edit: false, delete: false } }), {})
    });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setForm({ name: role.name, description: role.description, permissions: { ...role.permissions } });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      updateRole(editing.id, { name: form.name, description: form.description, permissions: form.permissions });
    } else {
      addRole({ name: form.name, description: form.description, permissions: form.permissions });
    }
    setShowModal(false);
  };

  const togglePermission = (module, action) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module]?.[action]
        }
      }
    }));
  };

  const toggleAllModule = (module) => {
    const allChecked = ACTIONS.every(a => form.permissions[module]?.[a]);
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: ACTIONS.reduce((acc, a) => ({ ...acc, [a]: !allChecked }), {})
      }
    }));
  };

  if (!isAdmin()) {
    return (
      <div className="animate-in">
        <div className="page-header"><h1><Shield size={28} /> Roles & Access</h1></div>
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <Shield size={48} />
              <h3>Access Restricted</h3>
              <p>Only administrators can manage roles and permissions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Shield size={28} /> Roles & Access</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> New Role</button>
      </div>

      <div className="grid grid-2" style={{ gap: 20 }}>
        {roles.map(role => (
          <div className="card" key={role.id}>
            <div className="card-header">
              <div>
                <h3>{role.name}</h3>
                <span className="text-sm text-muted">{role.description}</span>
              </div>
              <div className="action-cell">
                <button className="btn btn-ghost btn-icon" onClick={() => openEdit(role)}><Edit2 size={15} /></button>
                {role.name !== 'Admin' && (
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => { if (confirm('Delete role?')) deleteRole(role.id); }}><Trash2 size={15} /></button>
                )}
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table" style={{ fontSize: '0.857rem' }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Module</th>
                    {ACTIONS.map(a => <th key={a} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{a}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => (
                    <tr key={mod}>
                      <td style={{ paddingLeft: 20, textTransform: 'capitalize', fontWeight: 500 }}>{mod}</td>
                      {ACTIONS.map(action => (
                        <td key={action} style={{ textAlign: 'center' }}>
                          {role.permissions?.[mod]?.[action] ? (
                            <Check size={16} style={{ color: 'var(--color-success)' }} />
                          ) : (
                            <X size={16} style={{ color: '#d1d5db' }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Role' : 'New Role'} size="lg" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save' : 'Create Role'}</button>
        </>
      }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Warehouse Manager" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-control" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description" />
          </div>
        </div>

        <h4 style={{ marginBottom: 12, marginTop: 8 }}>Permission Matrix</h4>
        <table className="line-items-table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Module</th>
              {ACTIONS.map(a => <th key={a} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{a}</th>)}
              <th style={{ textAlign: 'center' }}>All</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map(mod => (
              <tr key={mod}>
                <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{mod}</td>
                {ACTIONS.map(action => (
                  <td key={action} style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={form.permissions[mod]?.[action] || false} onChange={() => togglePermission(mod, action)} style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleAllModule(mod)} style={{ fontSize: '0.714rem', padding: '4px 8px' }}>
                    {ACTIONS.every(a => form.permissions[mod]?.[a]) ? 'None' : 'All'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
}
