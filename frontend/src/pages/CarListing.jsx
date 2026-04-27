import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import CarCard from '../components/CarCard'
import CarFilters from '../components/CarFilters'

const styles = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#202124',
  },
  count: {
    fontSize: '0.9rem',
    color: '#5f6368',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1.5px solid #dadce0',
    backgroundColor: '#fff',
    color: '#202124',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

export default function CarListing() {
  const [cars, setCars] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const { isAuthenticated } = useAuth()
  const PAGE_SIZE = 12

  const fetchCars = useCallback(async (activeFilters, activePage) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: activePage, size: PAGE_SIZE, ...activeFilters }
      const { data } = await api.get('/cars', { params })
      if (data.content !== undefined) {
        setCars(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        setCars(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setTotalElements(Array.isArray(data) ? data.length : 0)
      }
    } catch (err) {
      setError('Failed to load cars. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await api.get('/favorites')
      const ids = new Set((Array.isArray(data) ? data : data.content || []).map(c => c.id))
      setFavorites(ids)
    } catch {
      // silently fail
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCars(filters, page)
  }, [filters, page, fetchCars])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(0)
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(0)
  }

  const handleFavoriteToggle = (carId, newState) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (newState) next.add(carId)
      else next.delete(carId)
      return next
    })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    const start = Math.max(0, page - 2)
    const end = Math.min(totalPages - 1, page + 2)
    for (let i = start; i <= end; i++) pages.push(i)

    return (
      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          ‹
        </button>
        {start > 0 && (
          <>
            <button style={styles.pageBtn} onClick={() => setPage(0)}>1</button>
            {start > 1 && <span style={{ color: '#5f6368' }}>…</span>}
          </>
        )}
        {pages.map(p => (
          <button
            key={p}
            style={{
              ...styles.pageBtn,
              backgroundColor: p === page ? '#1a73e8' : '#fff',
              color: p === page ? '#fff' : '#202124',
              borderColor: p === page ? '#1a73e8' : '#dadce0',
            }}
            onClick={() => setPage(p)}
          >
            {p + 1}
          </button>
        ))}
        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span style={{ color: '#5f6368' }}>…</span>}
            <button style={styles.pageBtn} onClick={() => setPage(totalPages - 1)}>{totalPages}</button>
          </>
        )}
        <button
          style={styles.pageBtn}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
        >
          ›
        </button>
      </div>
    )
  }

  return (
    <div className="container page">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Browse Cars</h1>
          {!loading && (
            <p style={styles.count}>
              {totalElements > 0 ? `${totalElements} car${totalElements !== 1 ? 's' : ''} found` : ''}
            </p>
          )}
        </div>
      </div>

      <div style={styles.layout}>
        <CarFilters onApply={handleApplyFilters} onClear={handleClearFilters} />

        <div>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading cars...</span>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
              <h3>No cars found</h3>
              <p>Try adjusting your filters or clear them to see all listings.</p>
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                {cars.map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isFavorited={favorites.has(car.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
