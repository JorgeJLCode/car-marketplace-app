import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const CAR_PLACEHOLDER = 'https://via.placeholder.com/800x450?text=No+Image'

const styles = {
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '1.5rem',
    color: '#1a73e8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    padding: '0.4rem 0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #e8eaed',
  },
  imageWrapper: {
    width: '100%',
    maxHeight: '450px',
    overflow: 'hidden',
    backgroundColor: '#f1f3f4',
  },
  image: {
    width: '100%',
    height: '450px',
    objectFit: 'cover',
  },
  body: {
    padding: '2rem',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  titleSection: {},
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#202124',
    marginBottom: '0.25rem',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a73e8',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  specCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '0.875rem 1rem',
    border: '1px solid #e8eaed',
  },
  specLabel: {
    fontSize: '0.75rem',
    color: '#5f6368',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
  },
  specValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#202124',
  },
  description: {
    borderTop: '1px solid #e8eaed',
    paddingTop: '1.5rem',
    marginTop: '0.5rem',
  },
  descTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#202124',
    marginBottom: '0.75rem',
  },
  descText: {
    color: '#5f6368',
    lineHeight: '1.7',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function formatMileage(mileage) {
  if (!mileage && mileage !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US').format(mileage) + ' miles'
}

export default function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [car, setCar] = useState(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/cars/${id}`)
        setCar(data)
      } catch {
        setError('Car not found or failed to load.')
      } finally {
        setLoading(false)
      }
    }

    const checkFavorite = async () => {
      if (!isAuthenticated) return
      try {
        const { data } = await api.get('/favorites')
        const favs = Array.isArray(data) ? data : data.content || []
        setIsFavorited(favs.some(c => c.id === Number(id)))
      } catch {
        // silently fail
      }
    }

    fetchCar()
    checkFavorite()
  }, [id, isAuthenticated])

  const handleFavoriteToggle = async () => {
    if (favLoading) return
    setFavLoading(true)
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`)
        setIsFavorited(false)
      } else {
        await api.post(`/favorites/${id}`)
        setIsFavorited(true)
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err)
    } finally {
      setFavLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading car details...</span>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container page">
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div className="alert alert-error">{error || 'Car not found.'}</div>
      </div>
    )
  }

  return (
    <div className="container page">
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back to listings</button>

      <div style={styles.card}>
        <div style={styles.imageWrapper}>
          <img
            src={car.imageUrl || CAR_PLACEHOLDER}
            alt={`${car.year} ${car.make} ${car.model}`}
            style={styles.image}
            onError={e => { e.target.src = CAR_PLACEHOLDER }}
          />
        </div>

        <div style={styles.body}>
          <div style={styles.topRow}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>{car.year} {car.make} {car.model}</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
              <div style={styles.price}>{formatPrice(car.price)}</div>
              <div style={styles.actions}>
                {isAuthenticated && (
                  <button
                    className={`btn ${isFavorited ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={handleFavoriteToggle}
                    disabled={favLoading}
                  >
                    {favLoading ? '...' : isFavorited ? '💔 Remove Favorite' : '❤️ Add to Favorites'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={styles.specsGrid}>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Make</div>
              <div style={styles.specValue}>{car.make || 'N/A'}</div>
            </div>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Model</div>
              <div style={styles.specValue}>{car.model || 'N/A'}</div>
            </div>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Year</div>
              <div style={styles.specValue}>{car.year || 'N/A'}</div>
            </div>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Mileage</div>
              <div style={styles.specValue}>{formatMileage(car.mileage)}</div>
            </div>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Fuel Type</div>
              <div style={styles.specValue}>{car.fuelType || 'N/A'}</div>
            </div>
            <div style={styles.specCard}>
              <div style={styles.specLabel}>Transmission</div>
              <div style={styles.specValue}>{car.transmission || 'N/A'}</div>
            </div>
          </div>

          {car.description && (
            <div style={styles.description}>
              <h3 style={styles.descTitle}>Description</h3>
              <p style={styles.descText}>{car.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
