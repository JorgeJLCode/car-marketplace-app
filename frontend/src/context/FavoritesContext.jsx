import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (car) => {
    if (!token) return false;

    const isFavorite = favorites.some(fav => fav.car.id === car.id);

    try {
      if (isFavorite) {
        // Remove favorite
        const response = await fetch(`/api/favorites/${car.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setFavorites(prev => prev.filter(fav => fav.car.id !== car.id));
          return true;
        }
      } else {
        // Add favorite
        const response = await fetch(`/api/favorites/${car.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const newFavorite = await response.json();
          setFavorites(prev => [...prev, newFavorite]);
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    return false;
  };

  const isFavorite = (carId) => {
    return favorites.some(fav => fav.car.id === carId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);
