import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_URL } from '../config';
import Toast from '../components/Toast';
import './AdminPanel.css';

/**
 * AdminPanel — Panel de administración para gestionar el inventario de vehículos.
 *
 * UX Decisions:
 *   - Tabla paginada (10 coches/página) para no saturar la vista con datos.
 *   - Barra de búsqueda integrada para filtrar rápidamente por marca o modelo.
 *   - Las acciones de crear/editar navegan a una página dedicada (/admin/cars/new
 *     y /admin/cars/edit/:id) en vez de un modal, para mejor experiencia móvil
 *     y permitir uso del botón "Atrás" del navegador.
 *   - Eliminar usa window.confirm como protección contra clics accidentales
 *     y muestra un toast de confirmación tras la acción.
 *   - Los toasts (notificaciones efímeras) dan feedback inmediato sin
 *     interrumpir el flujo de trabajo del administrador.
 */

const PAGE_SIZE = 10;

const AdminPanel = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toast, setToast] = useState(null);

  // UX: Redirect non-admin users immediately to prevent unauthorized access
  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  /**
   * UX: Check for toast messages passed via navigate() state.
   * This is how AdminCarForm communicates success back to this page
   * after creating or editing a vehicle.
   */
  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      // Clear the state so the toast doesn't reappear on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchCars = useCallback(async (page = 0, query = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', PAGE_SIZE);
      if (query.trim()) params.append('q', query.trim());

      const response = await fetch(`${API_URL}/api/cars?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();
      setCars(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCars(0, '');
  }, [fetchCars]);

  // ── Search handler ────────────────────────────────────────────────────
  /**
   * UX: La búsqueda resetea la página a 0 para mostrar resultados
   * desde el principio. Se activa con el botón "Search" o Enter.
   */
  const handleSearch = (e) => {
    e?.preventDefault();
    setCurrentPage(0);
    fetchCars(0, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchCars(0, '');
  };

  // ── Pagination handler ────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    fetchCars(newPage, searchQuery);
  };

  // ── Delete handler ────────────────────────────────────────────────────
  /**
   * UX: Usamos window.confirm como barrera mínima antes de una acción destructiva.
   * Tras confirmar, mostramos un toast de éxito para que el admin sepa que
   * la operación se completó correctamente.
   */
  const handleDelete = async (car) => {
    if (!window.confirm(`Are you sure you want to delete "${car.brand} ${car.model}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/cars/${car.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete car');

      setToast({
        message: `"${car.brand} ${car.model}" deleted successfully`,
        type: 'success'
      });
      fetchCars(currentPage, searchQuery);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // ── Guard: not logged in ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="admin-container empty-state">
        <h2>Admin Access Required</h2>
        <p>Please log in with an administrator account.</p>
        <button onClick={() => navigate('/login')} className="primary-btn">Log In</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="admin-header">
        <div>
          <h1>Inventory Management</h1>
          <p className="admin-subtitle">{totalElements} vehicles total</p>
        </div>
        {/* UX: Bright CTA button to make the primary action (adding) obvious */}
        <Link to="/admin/cars/new" className="primary-btn add-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Vehicle
        </Link>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      {/* UX: Search bar is placed right above the table for quick access.
           It sends the query param "q" which the backend matches against
           brand and model fields. */}
      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand or model..."
            className="search-input"
          />
          {searchQuery && (
            <button type="button" onClick={handleClearSearch} className="search-clear-btn" title="Clear search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="search-btn">Search</button>
      </form>

      {error && <div className="admin-error">{error}</div>}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="table-container">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading inventory...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Kilometers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td>{car.id}</td>
                  <td><span className="brand-badge">{car.brand}</span></td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>${car.price?.toLocaleString() || '0'}</td>
                  <td>{car.mileage?.toLocaleString() || '0'} km</td>
                  <td className="actions-cell">
                    {/* UX: Edit navigates to a dedicated form page for better usability */}
                    <Link to={`/admin/cars/edit/${car.id}`} className="action-btn edit-btn" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                    {/* UX: Delete stays inline — it's a quick destructive action that
                         benefits from a confirmation dialog rather than a page navigation */}
                    <button onClick={() => handleDelete(car)} className="action-btn delete-btn" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    {searchQuery ? 'No vehicles match your search.' : 'No vehicles in inventory.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {/* UX: Pagination only appears when there are multiple pages,
           avoiding visual clutter for small inventories */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Prev
          </button>
          <div className="page-info">
            Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
          </div>
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}

      {/* ── Toast Notifications ────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
