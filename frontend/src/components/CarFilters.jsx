import React, { useState } from 'react'

const FUEL_TYPES = ['', 'Gasoline', 'Diesel', 'Electric', 'Hybrid']
const TRANSMISSIONS = ['', 'Manual', 'Automatic']

const styles = {
  sidebar: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e8eaed',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  header: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#202124',
    borderBottom: '1px solid #e8eaed',
    paddingBottom: '0.75rem',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#5f6368',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.4rem',
    display: 'block',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
}

const emptyFilters = {
  keyword: '',
  make: '',
  yearMin: '',
  yearMax: '',
  priceMin: '',
  priceMax: '',
  fuelType: '',
  transmission: '',
}

export default function CarFilters({ onApply, onClear }) {
  const [filters, setFilters] = useState(emptyFilters)

  const handleChange = (field) => (e) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleApply = () => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    )
    onApply(cleaned)
  }

  const handleClear = () => {
    setFilters(emptyFilters)
    onClear()
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>🔍 Filter Cars</div>

      <div>
        <span style={styles.sectionLabel}>Keyword</span>
        <input
          className="form-control"
          type="text"
          placeholder="Search make, model..."
          value={filters.keyword}
          onChange={handleChange('keyword')}
        />
      </div>

      <div>
        <span style={styles.sectionLabel}>Make</span>
        <input
          className="form-control"
          type="text"
          placeholder="e.g. Toyota"
          value={filters.make}
          onChange={handleChange('make')}
        />
      </div>

      <div>
        <span style={styles.sectionLabel}>Year Range</span>
        <div style={styles.row}>
          <input
            className="form-control"
            type="number"
            placeholder="Min"
            value={filters.yearMin}
            onChange={handleChange('yearMin')}
            min="1900"
            max="2100"
          />
          <input
            className="form-control"
            type="number"
            placeholder="Max"
            value={filters.yearMax}
            onChange={handleChange('yearMax')}
            min="1900"
            max="2100"
          />
        </div>
      </div>

      <div>
        <span style={styles.sectionLabel}>Price Range ($)</span>
        <div style={styles.row}>
          <input
            className="form-control"
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={handleChange('priceMin')}
            min="0"
          />
          <input
            className="form-control"
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={handleChange('priceMax')}
            min="0"
          />
        </div>
      </div>

      <div>
        <span style={styles.sectionLabel}>Fuel Type</span>
        <select
          className="form-control"
          value={filters.fuelType}
          onChange={handleChange('fuelType')}
        >
          {FUEL_TYPES.map(ft => (
            <option key={ft} value={ft}>{ft || 'All'}</option>
          ))}
        </select>
      </div>

      <div>
        <span style={styles.sectionLabel}>Transmission</span>
        <select
          className="form-control"
          value={filters.transmission}
          onChange={handleChange('transmission')}
        >
          {TRANSMISSIONS.map(t => (
            <option key={t} value={t}>{t || 'All'}</option>
          ))}
        </select>
      </div>

      <div style={styles.actions}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApply}>
          Apply Filters
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          Clear
        </button>
      </div>
    </aside>
  )
}
