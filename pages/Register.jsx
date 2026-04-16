import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = register(form);
    if (result.success) {
      navigate('/store');
    } else {
      setError(result.error);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">E</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ERP<span style={{ color: 'var(--color-primary)' }}>Suite</span>
          </div>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up to start ordering products online</p>

        {error && (
          <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.857rem', marginBottom: '16px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" placeholder="+1-555-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-control" placeholder="Your delivery address" value={form.address} onChange={e => update('address', e.target.value)} style={{ minHeight: '70px' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '8px' }}>
            <UserPlus size={18} /> Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
