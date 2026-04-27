import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-accent">Auto</span>Market
        </Link>

        <div className="navbar-links">
          {user ? (
            <div className="user-menu">
              {(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') && (
                <Link to="/admin" className="nav-link" style={{ marginRight: '10px', color: '#4ade80' }}>
                  Admin Panel
                </Link>
              )}
              <Link to="/favorites" className="nav-link" title="My Favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </Link>
              <span className="user-greeting">Welcome, {user.name || user.email || 'User'}</span>
              <button onClick={logout} className="nav-btn logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
