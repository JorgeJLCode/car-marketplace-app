import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const styles = {
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #dadce0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    fontSize: '1.25rem',
    color: '#1a73e8',
    textDecoration: 'none',
  },
  brandIcon: {
    fontSize: '1.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  navLink: {
    padding: '0.4rem 0.875rem',
    borderRadius: '6px',
    color: '#5f6368',
    fontWeight: '500',
    fontSize: '0.9375rem',
    textDecoration: 'none',
    transition: 'background-color 0.15s, color 0.15s',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  username: {
    fontSize: '0.9rem',
    color: '#5f6368',
    fontWeight: '500',
  },
  adminBadge: {
    fontSize: '0.7rem',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>🚗</span>
          Car Marketplace
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
            onMouseEnter={e => { e.target.style.backgroundColor = '#f1f3f4'; e.target.style.color = '#1a73e8' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#5f6368' }}
          >
            Browse Cars
          </Link>

          {isAuthenticated && (
            <Link
              to="/favorites"
              style={styles.navLink}
              onMouseEnter={e => { e.target.style.backgroundColor = '#f1f3f4'; e.target.style.color = '#1a73e8' }}
              onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#5f6368' }}
            >
              ❤️ Favorites
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              style={{ ...styles.navLink, color: '#1a73e8' }}
              onMouseEnter={e => { e.target.style.backgroundColor = '#e8f0fe' }}
              onMouseLeave={e => { e.target.style.backgroundColor = 'transparent' }}
            >
              ⚙️ Admin Panel
            </Link>
          )}
        </div>

        <div style={styles.actions}>
          {isAuthenticated ? (
            <>
              <span style={styles.username}>
                👤 {user?.username}
                {isAdmin && <span style={{ ...styles.adminBadge, marginLeft: '0.4rem' }}>Admin</span>}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
