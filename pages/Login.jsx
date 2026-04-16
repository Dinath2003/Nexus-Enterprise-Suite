import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      if (result.user.type === 'customer' || result.user.role === 'Customer') {
        navigate('/store');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">E</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ERP<span style={{ color: 'var(--color-primary)' }}>Suite</span>
          </div>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.857rem', marginBottom: '16px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '8px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{
          marginTop: '24px', padding: '14px', background: 'var(--color-grey-lightest)',
          borderRadius: '8px', fontSize: '0.786rem', color: 'var(--color-grey)'
        }}>
          <strong style={{ color: 'var(--color-dark)' }}>Demo Credentials:</strong><br />
          Admin: admin@erp.com / admin123<br />
          Sales: sarah@erp.com / pass123
        </div>
      </div>
    </div>
  );
}
