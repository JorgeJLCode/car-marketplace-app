import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import CarCard from '../components/CarCard';
import './Favorites.css';

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();

  if (!user) {
    return (
      <div className="favorites-container empty-state">
        <h2>Authentication Required</h2>
        <p>Please log in to view your favorite vehicles.</p>
        <Link to="/login" className="primary-btn">Log In</Link>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>My Favorites</h1>
        <p>Your personal collection of dream vehicles.</p>
      </div>

      {loading ? (
        <div className="favorites-loading">
          <div className="spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <h2>No favorites yet</h2>
          <p>You haven't added any vehicles to your favorites.</p>
          <Link to="/" className="primary-btn">Browse Vehicles</Link>
        </div>
      ) : (
        <div className="cars-grid">
          {favorites.map((fav) => (
            <CarCard key={fav.car.id} car={fav.car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
