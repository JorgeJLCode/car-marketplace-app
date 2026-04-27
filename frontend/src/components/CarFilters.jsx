import './CarFilters.css';

const CarFilters = ({ filters, setFilters, onApply }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
  };

  const handleReset = () => {
    setFilters({
      q: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: ''
    });
    // Let the parent know we want to fetch with empty filters immediately, or just let them click apply
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
            value={filters.q} 
            onChange={handleChange} 
            placeholder="Model or keyword"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="brand">Brand</label>
          <select 
            id="brand" 
            name="brand" 
            value={filters.brand} 
            onChange={handleChange}
            className="filter-input"
          >
            <option value="">All Brands</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="Audi">Audi</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range</label>
          <div className="range-inputs">
            <input 
              type="number" 
              name="minPrice" 
              value={filters.minPrice} 
              onChange={handleChange} 
              placeholder="Min $" 
              className="filter-input half"
            />
            <span className="range-separator">-</span>
            <input 
              type="number" 
              name="maxPrice" 
              value={filters.maxPrice} 
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
              value={filters.minYear} 
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
              value={filters.maxYear} 
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
