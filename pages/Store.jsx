import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, ShoppingCart, Plus, Minus, X, Search, CheckCircle } from 'lucide-react';

export default function Store() {
  const { products, cart, addToCart, updateCartItem, removeFromCart, checkout } = useData();
  const { user } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products
    .filter(p => p.stock > 0)
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleCheckout = () => {
    const customerInfo = {
      id: user?.id || 'guest',
      name: user?.name || 'Guest',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    };
    const order = checkout(customerInfo);
    if (order) {
      setCartOpen(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 4000);
    }
  };

  return (
    <div className="animate-in">
      {orderSuccess && (
        <div style={{
          position: 'fixed', top: 20, right: 20, background: 'var(--color-success)',
          color: '#fff', padding: '16px 24px', borderRadius: 12, zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(16,185,129,0.3)',
          animation: 'slideUp 0.3s ease', fontWeight: 600
        }}>
          <CheckCircle size={20} /> Order placed successfully!
        </div>
      )}

      <div className="page-header">
        <h1><ShoppingBag size={28} /> Online Store</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
            <ShoppingCart size={18} /> Cart
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8,
                background: 'var(--color-primary)', color: '#fff',
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.714rem', fontWeight: 700
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="table-search">
          <Search />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${category === c ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="store-grid">
        {filtered.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-card-img">
              <span>{product.image}</span>
              {product.stock < 10 && <span className="product-card-badge"><span className="badge badge-warning">Few left</span></span>}
            </div>
            <div className="product-card-body">
              <div className="product-card-category">{product.category}</div>
              <div className="product-card-name">{product.name}</div>
              <p className="text-sm text-muted" style={{ marginBottom: 10 }}>{product.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="product-card-price">Rs.{product.price}</div>
                <div className="product-card-stock">{product.stock} available</div>
              </div>
            </div>
            <div className="product-card-footer">
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => addToCart(product)}>
                <Plus size={14} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      )}

      {/* Cart Overlay */}
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={20} /> Cart ({cartCount})
          </h3>
          <button className="modal-close" onClick={() => setCartOpen(false)}><X size={18} /></button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <ShoppingCart size={40} />
              <h3>Your cart is empty</h3>
              <p className="text-sm text-muted">Add some products to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.productId}>
                <div className="cart-item-img">{item.image}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="cart-item-price">Rs.{(item.price * item.quantity).toFixed(2)}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateCartItem(item.productId, item.quantity - 1)}><Minus size={12} /></button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.productId, item.quantity + 1)}><Plus size={12} /></button>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => removeFromCart(item.productId)} style={{ color: 'var(--color-danger)' }}>
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>Rs.{cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
