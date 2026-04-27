import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

const CAR_PLACEHOLDER = 'https://via.placeholder.com/400x240?text=No+Image'

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    border: '1px solid #e8eaed',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f1f3f4',
    height: '200px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  favoriteBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    transition: 'transform 0.15s ease, background 0.15s ease',
    zIndex: 1,
  },
  body: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flexGrow: 1,
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#202124',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a73e8',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.3rem 0.5rem',
    marginTop: '0.25rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.8rem',
    color: '#5f6368',
  },
  footer: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid #e8eaed',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function formatMileage(mileage) {
  if (!mileage && mileage !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi'
}

export default function CarCard({ car, isFavorited = false, onFavoriteToggle }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [hovered, setHovered] = React.useState(false)
  const [favLoading, setFavLoading] = React.useState(false)

  const handleCardClick = (e) => {
    if (e.target.closest('[data-fav-btn]')) return
    navigate(`/cars/${car.id}`)
  }

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated || favLoading) return
    setFavLoading(true)
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${car.id}`)
      } else {
        await api.post(`/favorites/${car.id}`)
      }
      onFavoriteToggle && onFavoriteToggle(car.id, !isFavorited)
    } catch (err) {
      console.error('Failed to toggle favorite', err)
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      <div style={styles.imageContainer}>
        <img
          src={car.imageUrl || CAR_PLACEHOLDER}
          alt={`${car.year} ${car.make} ${car.model}`}
          style={{
            ...styles.image,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
          onError={e => { e.target.src = CAR_PLACEHOLDER }}
        />
        {isAuthenticated && (
          <button
            data-fav-btn
            style={{
              ...styles.favoriteBtn,
              opacity: favLoading ? 0.6 : 1,
            }}
            onClick={handleFavoriteClick}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div style={styles.body}>
        <div style={styles.title}>
          {car.year} {car.make} {car.model}
        </div>
        <div style={styles.price}>{formatPrice(car.price)}</div>
        <div style={styles.metaGrid}>
          <span style={styles.metaItem}>🛣️ {formatMileage(car.mileage)}</span>
          <span style={styles.metaItem}>⛽ {car.fuelType || 'N/A'}</span>
          <span style={styles.metaItem}>⚙️ {car.transmission || 'N/A'}</span>
          <span style={styles.metaItem}>📅 {car.year || 'N/A'}</span>
        </div>
      </div>

      <div style={styles.footer}>
        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/cars/${car.id}`) }}>
          View Details →
        </button>
      </div>
    </div>
  )
}
