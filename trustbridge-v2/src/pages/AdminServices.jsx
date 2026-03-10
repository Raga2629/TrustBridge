import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminServices.css';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || 
                         (filter === 'VERIFIED' && service.isVerified) ||
                         (filter === 'PENDING' && !service.isVerified);
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      'Plumbing': '🔧',
      'Electrical': '⚡',
      'Cleaning': '🧹',
      'Medical': '🏥',
      'Education': '📚',
      'Rentals': '🏠',
      'Grocery': '🛒',
      'Repairs': '🔨'
    };
    return icons[category] || '🏪';
  };

  if (loading) {
    return (
      <div className="admin-services-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-services-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ← Back
            </button>
            <div className="header-text">
              <h1>🏪 Manage Services</h1>
              <p>View and verify all services</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-number">{services.length}</span>
              <span className="stat-label">Total Services</span>
            </div>
            <div className="stat-badge verified">
              <span className="stat-number">{services.filter(s => s.isVerified).length}</span>
              <span className="stat-label">Verified</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All Services
            </button>
            <button
              className={`filter-tab ${filter === 'VERIFIED' ? 'active' : ''}`}
              onClick={() => setFilter('VERIFIED')}
            >
              Verified
            </button>
            <button
              className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No services found</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'Services will appear here'}</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <div className="category-icon">
                    {getCategoryIcon(service.category)}
                  </div>
                  <span className={`status-badge ${service.isVerified ? 'verified' : 'pending'}`}>
                    {service.isVerified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>

                <div className="service-content">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-location">📍 {service.area}, {service.city}</p>
                  
                  {service.description && (
                    <p className="service-description">
                      {service.description.substring(0, 100)}
                      {service.description.length > 100 ? '...' : ''}
                    </p>
                  )}

                  <div className="service-meta">
                    <div className="meta-item">
                      <span className="meta-label">Rating:</span>
                      <span className="meta-value">⭐ {service.rating || 0}/5</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reviews:</span>
                      <span className="meta-value">{service.totalReviews || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="service-actions">
                  <button 
                    className="btn-view"
                    onClick={() => navigate(`/services/${service._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
