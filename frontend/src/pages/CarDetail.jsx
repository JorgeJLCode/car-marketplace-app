import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { API_URL } from '../config';
import { getCarImageUrl } from '../utils/carImages';
import './CarDetail.css';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fallbackImage = "/default_car.png";
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleImageError = (e) => {
    if (e.currentTarget.src.endsWith(fallbackImage)) return;
    e.currentTarget.src = fallbackImage;
  };

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Car not found');
          }
          throw new Error('Failed to fetch car details');
        }
        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-btn">Return to Catalog</button>
      </div>
    );
  }

  if (!car) return null;

  const isFav = isFavorite(car.id);

  const handleFavoriteClick = async () => {
    if (!user) {
      /**
       * REDIRECT CON QUERY PARAM:
       * Incluimos la URL actual (/cars/:id) en el param "redirect" para que
       * tras el login, AuthContext devuelva al usuario directamente a este
       * detalle de coche en lugar de ir al Home.
       */
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    await toggleFavorite(car);
  };

  return (
    <div className="car-detail-container">
      <div className="detail-header">
        <Link to="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Inventory
        </Link>
      </div>

      <div className="detail-content">
        <div className="detail-image-section">
          <div className="main-image-container">
            <img
              src={getCarImageUrl(car)}
              alt={`${car.brand} ${car.model}`}
              className="detail-main-image"
              onError={handleImageError}
            />
            <div className="detail-price-badge">${car.price?.toLocaleString() || '0'}</div>
            
            <button 
              className={`detail-favorite-btn ${isFav ? 'active' : ''}`} 
              onClick={handleFavoriteClick}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" height="28" 
                viewBox="0 0 24 24" 
                fill={isFav ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="detail-info-section">
          <div className="info-header">
            <span className="brand-tag">{car.brand}</span>
            <h1 className="car-title">{car.brand} {car.model}</h1>
            <p className="car-subtitle">{car.year} • {car.mileage?.toLocaleString() || '0'} km</p>
          </div>

          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Year</span>
              <span className="spec-value">{car.year}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Kilometers</span>
              <span className="spec-value">{car.mileage?.toLocaleString() || '0'} km</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Condition</span>
              <span className="spec-value">Excellent</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Availability</span>
              <span className="spec-value text-success">In Stock</span>
            </div>
          </div>

          <div className="action-section">
            <button className="primary-btn">Schedule Test Drive</button>
            <button className="secondary-btn">Contact Dealer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
