import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: ''
  });

  // Check admin role
  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
      // In a real app we might redirect, but for testing we'll allow it if they just want to see the UI.
      // navigate('/');
    }
  }, [user, navigate]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cars?size=100'); // Fetch more for admin table
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();
      setCars(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCars();
     
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete car');
      
      setCars(cars.filter(car => car.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: '',
        price: '',
        mileage: ''
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEditing = !!editingCar;
    const url = isEditing ? `/api/cars/${editingCar.id}` : '/api/cars';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to ${isEditing ? 'update' : 'create'} car`);
      }
      
      setShowModal(false);
       
    fetchCars(); // Reload table
    } catch (err) {
      alert(err.message);
    }
  };

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
      <div className="admin-header">
        <h1>Inventory Management</h1>
        <button onClick={() => openModal()} className="primary-btn add-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Vehicle
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

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
                <th>Mileage</th>
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
                  <td>${car.price.toLocaleString()}</td>
                  <td>{car.mileage.toLocaleString()} mi</td>
                  <td className="actions-cell">
                    <button onClick={() => openModal(car)} className="action-btn edit-btn" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(car.id)} className="action-btn delete-btn" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">No vehicles in inventory.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={() => setShowModal(false)} className="close-modal-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required placeholder="e.g. Toyota" />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" name="model" value={formData.model} onChange={handleInputChange} required placeholder="e.g. Corolla" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} required min="1886" />
                </div>
                <div className="form-group">
                  <label>Mileage</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} required min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="primary-btn">{editingCar ? 'Save Changes' : 'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
