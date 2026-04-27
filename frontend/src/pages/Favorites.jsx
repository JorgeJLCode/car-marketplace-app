import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/api'
import CarCard from '../components/CarCard'

const styles = {
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#202124',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#5f6368',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/favorites')
      setFavorites(Array.isArray(data) ? data : data.content || [])
    } catch {
      setError('Failed to load favorites. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const handleFavoriteToggle = (carId, newState) => {
    if (!newState) {
      setFavorites(prev => prev.filter(c => c.id !== carId))
    }
  }

  return (
    <div className="container page">
      <div style={styles.header}>
        <h1 style={styles.title}>❤️ My Favorites</h1>
        {!loading && favorites.length > 0 && (
          <p style={styles.subtitle}>{favorites.length} saved car{favorites.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading favorites...</span>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💔</div>
          <h3>No favorites yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Browse cars and click the heart icon to save your favorites.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {favorites.map(car => (
            <CarCard
              key={car.id}
              car={car}
              isFavorited={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
