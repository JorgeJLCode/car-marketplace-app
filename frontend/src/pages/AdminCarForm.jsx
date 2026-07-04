import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { getCarImageUrl } from '../utils/carImages';
import './AdminCarForm.css';

/**
 * AdminCarForm — Página dedicada para crear o editar un vehículo.
 *
 * UX Decision: Usamos una página completa en lugar de un modal porque:
 *   1. Da más espacio al formulario, mejorando la experiencia en móviles.
 *   2. Tiene su propia URL (/admin/cars/new o /admin/cars/edit/:id),
 *      lo que permite compartir enlaces y usar el botón "Atrás" del navegador.
 *   3. Evita problemas de foco y accesibilidad típicos de los modales.
 *
 * El componente detecta automáticamente si estamos en modo "crear" o "editar"
 * comprobando si existe un parámetro :id en la URL.
 */
const AdminCarForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const isEditing = !!id;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState('');
  const [fetching, setFetching] = useState(isEditing); // solo carga datos si estamos editando
  const [error, setError] = useState('');

  // UX: Redirigir si el usuario no es admin (protección de ruta a nivel de componente)
  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Cargar datos del coche si estamos en modo edición
  useEffect(() => {
    if (!isEditing) return;

    const fetchCar = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars/${id}`);
        if (!response.ok) throw new Error('Vehicle not found');
        const data = await response.json();
        setFormData({
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || '',
          price: data.price || '',
          mileage: data.mileage || '',
          imageUrl: data.imageUrl || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchCar();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'imageUrl') {
      setImageUploadMessage('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setImageUploadMessage('');
    setUploadingImage(true);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/uploads/cars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.imageUrl || '' }));
      setImageUploadMessage('Image uploaded');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación explícita Frontend
    const parsedYear = parseInt(formData.year);
    const parsedPrice = parseFloat(formData.price);
    const parsedMileage = parseInt(formData.mileage);

    if (parsedYear < 1886 || parsedYear > new Date().getFullYear() + 1) {
      setError('Por favor, introduce un año válido (mayor a 1886).');
      return;
    }
    if (parsedPrice <= 0) {
      setError('El precio debe ser mayor a 0.');
      return;
    }
    if (parsedMileage < 0) {
      setError('El kilometraje no puede ser negativo.');
      return;
    }

    setLoading(true);

    const url = isEditing ? `${API_URL}/api/cars/${id}` : `${API_URL}/api/cars`;
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
          mileage: parseInt(formData.mileage),
          imageUrl: formData.imageUrl.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to ${isEditing ? 'update' : 'create'} vehicle`);
      }

      /**
       * UX Decision: Tras guardar, redirigimos al panel admin con un mensaje
       * de feedback usando navigate state. Esto permite que el AdminPanel
       * muestre un toast de confirmación sin necesidad de un estado global.
       */
      navigate('/admin', {
        state: {
          toast: {
            message: isEditing
              ? `"${formData.brand} ${formData.model}" updated successfully`
              : `"${formData.brand} ${formData.model}" created successfully`,
            type: 'success'
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="car-form-container empty-state">
        <h2>Admin Access Required</h2>
        <p>Please log in with an administrator account.</p>
        <button onClick={() => navigate('/login')} className="primary-btn">Log In</button>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="car-form-container">
        <div className="form-loading">
          <div className="spinner"></div>
          <p>Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  const imagePreviewUrl = formData.imageUrl
    ? getCarImageUrl({ imageUrl: formData.imageUrl })
    : '';

  return (
    <div className="car-form-container">
      {/* UX: Breadcrumb-style header helps the user understand where they are */}
      <div className="form-page-header">
        <button onClick={() => navigate('/admin')} className="back-to-admin">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Inventory
        </button>
        <h1>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
        <p className="form-page-subtitle">
          {isEditing
            ? 'Update the details of this vehicle below.'
            : 'Fill in the details to add a new vehicle to your inventory.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="car-form-card">
        <div className="form-section">
          <h3 className="form-section-title">Vehicle Information</h3>

          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="e.g. Toyota"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="e.g. Corolla"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1886"
                max="2026"
                placeholder="e.g. 2023"
              />
            </div>
            <div className="form-group">
            <label htmlFor="mileage">Kilometers</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 25000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="e.g. 29999.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/car.jpg or /uploads/cars/image.png"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUpload">Upload Image</label>
            <div className="upload-control">
              <input
                type="file"
                id="imageUpload"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage || loading}
              />
              {(uploadingImage || imageUploadMessage) && (
                <span className="upload-status">
                  {uploadingImage ? 'Uploading...' : imageUploadMessage}
                </span>
              )}
            </div>
          </div>

          {imagePreviewUrl && (
            <div className="image-preview">
              <img src={imagePreviewUrl} alt="Vehicle preview" />
            </div>
          )}
        </div>

        {/* UX: Two clearly distinct actions — cancel (secondary) and save (primary) */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading || uploadingImage}>
            {loading
              ? (isEditing ? 'Saving...' : 'Creating...')
              : (isEditing ? 'Save Changes' : 'Create Vehicle')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCarForm;
