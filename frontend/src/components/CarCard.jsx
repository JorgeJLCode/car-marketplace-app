import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { getCarImageUrl } from '../utils/carImages';
import './CarCard.css';

const CarCard = ({ car }) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (!user) {
      /**
       * REDIRECT CON QUERY PARAM:
       * Guardamos la URL actual en el param "redirect" para que tras
       * hacer login, AuthContext pueda devolver al usuario a esta misma
       * página en lugar de ir siempre al Home.
       */
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    await toggleFavorite(car);
  };

  const isFav = isFavorite(car.id);

  return (
    <div className="car-card">
      <div className="car-card-image-container">
        <img src={getCarImageUrl(car)} alt={`${car.brand} ${car.model}`} className="car-card-image" />
        <div className="car-card-price">${car.price?.toLocaleString() || '0'}</div>
        
        <button 
          className={`favorite-toggle-btn ${isFav ? 'active' : ''}`} 
          onClick={handleFavoriteClick}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" 
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
      <div className="car-card-content">
        <div className="car-card-header">
          <h3>{car.brand} {car.model}</h3>
          <span className="car-card-year">{car.year}</span>
        </div>
        <div className="car-card-details">
          <div className="car-detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>{car.mileage?.toLocaleString() || '0'} km</span>
          </div>
          <div className="car-detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>Great Deal</span>
          </div>
        </div>
        <Link to={`/cars/${car.id}`} className="car-card-button">View Details</Link>
      </div>
    </div>
  );
};

export default CarCard;
