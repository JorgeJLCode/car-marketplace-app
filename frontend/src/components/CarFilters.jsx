import { useState, useEffect } from 'react';
import './CarFilters.css';

const AVAILABLE_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla'
];

const CarFilters = ({ currentParams, onApply }) => {
  // Guardamos un estado "borrador" local para que el usuario pueda escribir
  // y seleccionar sin que la página recargue con cada pulsación de tecla.
  const [draftFilters, setDraftFilters] = useState({
    q: '',
    brand: [],
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: ''
  });

  // Sincronizamos el estado local cuando la URL cambia (ej. al ir Atrás en el navegador)
  useEffect(() => {
    setDraftFilters({
      q: currentParams.get('q') || '',
      brand: currentParams.getAll('brand') || [],
      minPrice: currentParams.get('minPrice') || '',
      maxPrice: currentParams.get('maxPrice') || '',
      minYear: currentParams.get('minYear') || '',
      maxYear: currentParams.get('maxYear') || ''
    });
  }, [currentParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBrandToggle = (brandName) => {
    setDraftFilters(prev => {
      const isSelected = prev.brand.includes(brandName);
      if (isSelected) {
        return { ...prev, brand: prev.brand.filter(b => b !== brandName) };
      } else {
        return { ...prev, brand: [...prev.brand, brandName] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(draftFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      q: '',
      brand: [],
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: ''
    };
    setDraftFilters(emptyFilters);
    onApply(emptyFilters); // Aplicamos vacío de inmediato a la URL
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h3>Filter Inventory</h3>
      </div>
      <form onSubmit={handleSubmit} className="filters-form">
        
        <div className="filter-group">
          <label htmlFor="q">Search</label>
          <input 
            type="text" 
            id="q" 
            name="q" 
            value={draftFilters.q} 
            onChange={handleChange} 
            placeholder="Model or keyword"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Brands (Multi-select)</label>
          <div className="brand-checkboxes">
            {AVAILABLE_BRANDS.map(brand => (
              <label key={brand} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={draftFilters.brand.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                />
                <span className="checkbox-text">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Price Range</label>
          <div className="range-inputs">
            <input 
              type="number" 
              name="minPrice" 
              value={draftFilters.minPrice} 
              onChange={handleChange} 
              placeholder="Min $" 
              className="filter-input half"
            />
            <span className="range-separator">-</span>
            <input 
              type="number" 
              name="maxPrice" 
              value={draftFilters.maxPrice} 
              onChange={handleChange} 
              placeholder="Max $" 
              className="filter-input half"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Year Range</label>
          <div className="range-inputs">
            <input 
              type="number" 
              name="minYear" 
              value={draftFilters.minYear} 
              onChange={handleChange} 
              placeholder="Min" 
              className="filter-input half"
              min="1990"
              max={new Date().getFullYear() + 1}
            />
            <span className="range-separator">-</span>
            <input 
              type="number" 
              name="maxYear" 
              value={draftFilters.maxYear} 
              onChange={handleChange} 
              placeholder="Max" 
              className="filter-input half"
              min="1990"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="apply-btn">Apply Filters</button>
          <button type="button" onClick={handleReset} className="reset-btn">Reset</button>
        </div>
      </form>
    </aside>
  );
};

export default CarFilters;
