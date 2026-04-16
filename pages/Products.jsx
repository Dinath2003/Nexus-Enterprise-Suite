import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Package, Plus, Search, Edit2, Trash2, Grid, List } from 'lucide-react';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [form, setForm] = useState({ name: '', sku: '', category: 'Electronics', price: '', cost: '', stock: '', description: '', image: '📦' });

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const emojis = ['💻', '🖱️', '⌨️', '🖥️', '🔌', '🎧', '📷', '🪑', '💡', '💾', '🔋', '📦', '📱', '🎮', '🖨️'];

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', sku: '', category: 'Electronics', price: '', cost: '', stock: '', description: '', image: '📦' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, cost: p.cost, stock: p.stock, description: p.description, image: p.image });
    setShowModal(true);
  };

  const handleSave = () => {
    const data = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost), stock: parseInt(form.stock) };
    if (editing) {
      updateProduct(editing.id, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><Package size={28} /> Products</h1>
        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-grey-lighter)', borderRadius: 8, padding: 3 }}>
            <button className={`btn-icon ${viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')} style={{ borderRadius: 6 }}><Grid size={16} /></button>
            <button className={`btn-icon ${viewMode === 'list' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setViewMode('list')} style={{ borderRadius: 6 }}><List size={16} /></button>
          </div>
          {hasPermission('products', 'create') && (
            <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Product</button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="table-search">
          <Search />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control form-select" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>{filtered.length} products</span>
      </div>

      {viewMode === 'grid' ? (
        <div className="store-grid">
          {filtered.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-card-img">
                <span>{product.image}</span>
                {product.stock < 10 && <span className="product-card-badge"><span className="badge badge-danger">Low Stock</span></span>}
              </div>
              <div className="product-card-body">
                <div className="product-card-category">{product.category}</div>
                <div className="product-card-name">{product.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="product-card-price">Rs.{product.price}</div>
                  <div className="text-xs text-muted">{product.stock} in stock</div>
                </div>
              </div>
              {hasPermission('products', 'edit') && (
                <div className="product-card-footer">
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(product)}><Edit2 size={14} /> Edit</button>
                  {hasPermission('products', 'delete') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: '1.5rem' }}>{p.image}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="text-muted">{p.sku}</td>
                  <td><span className="badge badge-grey">{p.category}</span></td>
                  <td style={{ fontWeight: 600 }}>Rs.{p.price}</td>
                  <td className="text-muted">Rs.{p.cost}</td>
                  <td>
                    <span className={`badge ${p.stock < 10 ? 'badge-danger' : p.stock < 30 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      {hasPermission('products', 'edit') && <button className="btn btn-ghost btn-icon" onClick={() => openEdit(p)}><Edit2 size={15} /></button>}
                      {hasPermission('products', 'delete') && <button className="btn btn-ghost btn-icon" onClick={() => { if (confirm('Delete?')) deleteProduct(p.id); }} style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'Add Product'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Product'}</button>
        </>
      }>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {emojis.map(em => (
              <button key={em} type="button" onClick={() => update('image', em)} style={{
                width: 40, height: 40, fontSize: '1.3rem', border: form.image === em ? '2px solid var(--color-primary)' : '1px solid var(--color-grey-light)',
                borderRadius: 8, background: form.image === em ? 'var(--color-primary-light)' : 'var(--color-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{em}</button>
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter product name" />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-control" value={form.sku} onChange={e => update('sku', e.target.value)} placeholder="PRD-001" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control form-select" value={form.category} onChange={e => update('category', e.target.value)}>
            <option>Electronics</option><option>Accessories</option><option>Audio</option><option>Furniture</option><option>Storage</option><option>Software</option><option>Other</option>
          </select>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input type="number" className="form-control" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Cost ($)</label>
            <input type="number" className="form-control" value={form.cost} onChange={e => update('cost', e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input type="number" className="form-control" value={form.stock} onChange={e => update('stock', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Product description..." />
        </div>
      </Modal>
    </div>
  );
}
