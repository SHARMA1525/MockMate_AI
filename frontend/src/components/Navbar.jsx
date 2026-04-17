import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <span className="navbar-logo-icon">🎯</span>
          <span className="navbar-logo-text">MockMate <span>AI</span></span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
              >
                History
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Area */}
        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">{user.username}</span>
              {user.role === 'admin' && (
                <span className="navbar-role-badge">Admin</span>
              )}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
