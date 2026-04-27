import { useState, useEffect, useCallback } from 'react';
import CarCard from '../components/CarCard';
import CarFilters from '../components/CarFilters';
import './Home.css';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    q: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: ''
  });

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minYear) params.append('minYear', filters.minYear);
      if (filters.maxYear) params.append('maxYear', filters.maxYear);

      const queryString = params.toString();
      const url = `/api/cars${queryString ? `?${queryString}` : ''}`;

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
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load only, manual apply for subsequent fetches

  const handleApplyFilters = () => {
     
    fetchCars();
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
              filters={filters} 
              setFilters={setFilters} 
              onApply={handleApplyFilters} 
            />
          </div>

          <div className="inventory-main">
            <div className="section-header">
              <h2>Available Vehicles</h2>
              <div className="header-line"></div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading premium vehicles...</p>
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
                  onClick={() => {
                    setFilters({q:'', brand:'', minPrice:'', maxPrice:'', minYear:'', maxYear:''});
                    setTimeout(() => handleApplyFilters(), 0);
                  }}
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
