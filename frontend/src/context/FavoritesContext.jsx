import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

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
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (car) => {
    if (!token) return false;

    const alreadyFavorite = favorites.some(fav => fav.car.id === car.id);

    /**
     * OPTIMISTIC UI:
     * Actualizamos el estado local INMEDIATAMENTE antes de esperar la respuesta
     * de la API. Esto hace que el botón ❤️ responda al instante, sin lag,
     * dando una sensación de fluidez y rapidez a la interfaz.
     *
     * Si la petición falla, revertimos el estado al valor anterior usando
     * la variable `previousFavorites` como snapshot de respaldo.
     */
    const previousFavorites = favorites; // snapshot for rollback

    if (alreadyFavorite) {
      // Optimistic remove — quitar del array inmediatamente
      setFavorites(prev => prev.filter(fav => fav.car.id !== car.id));
    } else {
      // Optimistic add — crear un objeto temporal con la estructura esperada
      const optimisticEntry = { favoriteId: `temp-${car.id}`, car, addedAt: new Date().toISOString() };
      setFavorites(prev => [...prev, optimisticEntry]);
    }

    try {
      const method = alreadyFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/api/favorites/${car.id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        /**
         * ROLLBACK:
         * La API devolvió un error, así que revertimos el estado al snapshot
         * guardado antes del cambio optimista. El usuario verá que el corazón
         * vuelve a su estado anterior, indicando que algo falló.
         */
        console.error('Favorite toggle failed, reverting optimistic update');
        setFavorites(previousFavorites);
        return false;
      }

      // Si fue un POST exitoso, reemplazamos la entrada temporal con la real del servidor
      if (!alreadyFavorite && response.ok) {
        const newFavorite = await response.json();
        setFavorites(prev =>
          prev.map(fav => fav.favoriteId === `temp-${car.id}` ? newFavorite : fav)
        );
      }

      return true;
    } catch (error) {
      // Error de red — revertir igual
      console.error('Network error toggling favorite, reverting:', error);
      setFavorites(previousFavorites);
      return false;
    }
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
