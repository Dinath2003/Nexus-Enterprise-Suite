import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="header-search">
          <Search />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>
      <div className="header-right">
        <button className="header-icon-btn">
          <Bell size={20} />
          <span className="notif-dot"></span>
        </button>
        <div className="header-avatar" title={user?.name}>
          {user?.avatar || 'U'}
        </div>
      </div>
    </header>
  );
}
