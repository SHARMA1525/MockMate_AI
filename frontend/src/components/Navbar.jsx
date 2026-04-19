import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Bot, User, LogOut } from 'lucide-react';
import './Navbar.css';
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <Bot size={28} className="text-soft-blue" />
          <span className="navbar-logo-text">MockMate</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/history" className={`navbar-link ${isActive('/history') ? 'active' : ''}`}>
                History
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}>
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-dropdown">
              <div className="navbar-user-btn">
                <div className="navbar-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-username">{user.username}</span>
              </div>
              <div className="dropdown-menu">
                {user.role === 'admin' && (
                   <span className="dropdown-item role-badge">Admin</span>
                )}
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
