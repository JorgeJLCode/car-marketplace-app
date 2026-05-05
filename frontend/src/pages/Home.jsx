import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import CarFilters from '../components/CarFilters';
import SkeletonCard from '../components/SkeletonCard';
import { API_URL } from '../config';
import './Home.css';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * UX DECISION: QUERY PARAMS EN LUGAR DE ESTADO INTERNO
   * Al leer y escribir los filtros directamente en la URL (usando searchParams),
   * logramos que el usuario pueda:
   * 1. Refrescar la página sin perder sus filtros.
   * 2. Copiar y pegar la URL para compartir una búsqueda exacta (ej. /?q=bmw&maxPrice=30000).
   * 3. Usar los botones de "Atrás/Adelante" del navegador para deshacer/rehacer búsquedas.
   */

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      // La URL base más los parámetros actuales
      const queryString = searchParams.toString();
      const url = `${API_URL}/api/cars${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      const data = await response.json();
      setCars(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Al cambiar la URL, automáticamente lanzamos de nuevo la búsqueda
    fetchCars();
  }, [fetchCars]);

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.minYear) params.set('minYear', newFilters.minYear);
    if (newFilters.maxYear) params.set('maxYear', newFilters.maxYear);
    
    // Brand es ahora un array, por lo que usamos append para enviar múltiples
    if (newFilters.brand && newFilters.brand.length > 0) {
      newFilters.brand.forEach(b => params.append('brand', b));
    }
    
    setSearchParams(params);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="gradient-text">Discover Your Dream Ride</h1>
        <p className="hero-subtitle">Explore our premium selection of top-tier vehicles.</p>
      </div>

      <div className="content-section">
        <div className="inventory-layout">
          <div className="inventory-sidebar">
            <CarFilters 
              currentParams={searchParams} 
              onApply={handleApplyFilters} 
            />
          </div>

          <div className="inventory-main">
            <div className="section-header">
              <h2>Available Vehicles</h2>
              <div className="header-line"></div>
            </div>

            {loading ? (
              <div className="cars-grid">
                {/* UX Decision: Mostrar 6 skeletons como placeholder durante la carga */}
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Oops! Something went wrong.</p>
                <span>{error}</span>
              </div>
            ) : cars.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
                <p>No vehicles match your search criteria.</p>
                <button 
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="reset-search-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
