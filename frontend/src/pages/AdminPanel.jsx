import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/api'

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid']
const TRANSMISSIONS = ['Manual', 'Automatic']

const emptyForm = {
  make: '', model: '', year: '', price: '', mileage: '',
  fuelType: '', transmission: '', description: '', imageUrl: '',
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#202124',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e8eaed',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.875rem 1rem',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    color: '#5f6368',
    fontWeight: '600',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid #e8eaed',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #f1f3f4',
    color: '#202124',
    verticalAlign: 'middle',
  },
  actionCell: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#202124',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#5f6368',
    lineHeight: 1,
    padding: '0.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 1rem',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  modalFooter: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #e8eaed',
  },
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function CarFormModal({ car, onClose, onSave }) {
  const [form, setForm] = useState(car ? { ...car } : { ...emptyForm })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.make || !form.model || !form.year || !form.price) {
      setError('Make, model, year, and price are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : null,
      }
      if (car?.id) {
        await api.put(`/cars/${car.id}`, payload)
      } else {
        await api.post('/cars', payload)
      }
      onSave()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save car.'
      setError(typeof msg === 'string' ? msg : 'Failed to save car.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{car?.id ? 'Edit Car' : 'Add New Car'}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Make *</label>
              <input className="form-control" type="text" placeholder="e.g. Toyota" value={form.make} onChange={handleChange('make')} />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input className="form-control" type="text" placeholder="e.g. Camry" value={form.model} onChange={handleChange('model')} />
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <input className="form-control" type="number" placeholder="e.g. 2022" value={form.year} onChange={handleChange('year')} min="1900" max="2100" />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input className="form-control" type="number" placeholder="e.g. 25000" value={form.price} onChange={handleChange('price')} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Mileage</label>
              <input className="form-control" type="number" placeholder="e.g. 15000" value={form.mileage} onChange={handleChange('mileage')} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select className="form-control" value={form.fuelType} onChange={handleChange('fuelType')}>
                <option value="">Select fuel type</option>
                {FUEL_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select className="form-control" value={form.transmission} onChange={handleChange('transmission')}>
                <option value="">Select transmission</option>
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={styles.fullWidth}>
              <label className="form-label">Image URL</label>
              <input className="form-control" type="url" placeholder="https://..." value={form.imageUrl} onChange={handleChange('imageUrl')} />
            </div>
            <div className="form-group" style={styles.fullWidth}>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe the car..."
                value={form.description}
                onChange={handleChange('description')}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : car?.id ? 'Save Changes' : 'Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalCar, setModalCar] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 20

  const fetchCars = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/cars', { params: { page, size: pageSize } })
      if (data.content !== undefined) {
        setCars(data.content)
        setTotalPages(data.totalPages)
      } else {
        setCars(Array.isArray(data) ? data : [])
        setTotalPages(1)
      }
    } catch {
      setError('Failed to load cars.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleAdd = () => {
    setModalCar(null)
    setShowModal(true)
  }

  const handleEdit = (car) => {
    setModalCar(car)
    setShowModal(true)
  }

  const handleSave = () => {
    setShowModal(false)
    setSuccessMsg('Car saved successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
    fetchCars()
  }

  const handleDeleteConfirm = (car) => {
    setDeleteConfirm(car)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      await api.delete(`/cars/${deleteConfirm.id}`)
      setDeleteConfirm(null)
      setSuccessMsg('Car deleted successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchCars()
    } catch {
      setError('Failed to delete car.')
      setDeleteConfirm(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="container page">
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Panel</h1>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Car</button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading cars...</span>
        </div>
      ) : cars.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
          <h3>No cars listed yet</h3>
          <p>Add your first car using the button above.</p>
        </div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Make / Model</th>
                  <th style={styles.th}>Year</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Fuel</th>
                  <th style={styles.th}>Trans.</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ ...styles.td, color: '#5f6368', fontSize: '0.8rem' }}>#{car.id}</td>
                    <td style={styles.td}>
                      <strong>{car.make}</strong> {car.model}
                    </td>
                    <td style={styles.td}>{car.year}</td>
                    <td style={styles.td}>{formatPrice(car.price)}</td>
                    <td style={styles.td}>{car.fuelType || '—'}</td>
                    <td style={styles.td}>{car.transmission || '—'}</td>
                    <td style={styles.td}>
                      <div style={styles.actionCell}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(car)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteConfirm(car)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', color: '#5f6368', fontSize: '0.9rem' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <CarFormModal
          car={modalCar}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <h2 style={styles.modalTitle}>Confirm Delete</h2>
            <p style={{ color: '#5f6368', margin: '1rem 0' }}>
              Are you sure you want to delete <strong>{deleteConfirm.year} {deleteConfirm.make} {deleteConfirm.model}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
