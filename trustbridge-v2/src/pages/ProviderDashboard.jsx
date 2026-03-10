import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ProviderDashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, servicesRes, bookingsRes] = await Promise.all([
        axios.get('/provider/stats'),
        axios.get('/provider/services'),
        axios.get('/bookings/provider')
      ]);
      
      setStats(statsRes.data);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/bookings/${id}/status`, { status });
      fetchData();
      alert(`Booking ${status.toLowerCase()}`);
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await axios.delete(`/provider/services/${id}`);
      fetchData();
      alert('Service deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Welcome back, {user.name} 👋</h1>
            <p className="welcome-subtitle">Service Provider Dashboard</p>
          </div>
          <div className="verification-badge">
            {user.isVerified ? (
              <span className="badge-verified">✓ Verified Provider</span>
            ) : (
              <span className="badge-pending">⏳ Verification Pending</span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.overview.totalServices}</h3>
                <p>Total Services</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{stats.overview.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.overview.averageRating}</h3>
                <p>Average Rating</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💯</div>
              <div className="stat-content">
                <h3>{stats.provider.trustScore}</h3>
                <p>Trust Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/provider/add-service" className="action-btn primary">
              ➕ Add New Service
            </Link>
            <button onClick={() => setActiveTab('services')} className="action-btn secondary">
              📋 Manage Services
            </button>
            <button onClick={() => setActiveTab('bookings')} className="action-btn secondary">
              📅 View Bookings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'bookings' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({stats?.bookings.pending || 0} pending)
          </button>
          <button 
            className={activeTab === 'services' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('services')}
          >
            My Services ({services.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
          <div className="tab-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Booking Status</h3>
                <div className="status-list">
                  <div className="status-item">
                    <span className="status-label">Pending</span>
                    <span className="status-value pending">{stats.bookings.pending}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Accepted</span>
                    <span className="status-value accepted">{stats.bookings.accepted}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Completed</span>
                    <span className="status-value completed">{stats.bookings.completed}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Rejected</span>
                    <span className="status-value rejected">{stats.bookings.rejected}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Recent Activity</h3>
                <div className="activity-item">
                  <span className="activity-icon">📊</span>
                  <div>
                    <p className="activity-title">Bookings (Last 7 days)</p>
                    <p className="activity-value">{stats.overview.recentBookings} new bookings</p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">⭐</span>
                  <div>
                    <p className="activity-title">Total Reviews</p>
                    <p className="activity-value">{stats.overview.totalReviews} reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="tab-content">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>📭 No bookings yet</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <h4>{booking.service?.name}</h4>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-details">
                      <p><strong>Customer:</strong> {booking.user?.name}</p>
                      <p><strong>Phone:</strong> {booking.user?.phone}</p>
                      <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {booking.bookingTime}</p>
                    </div>
                    
                    {booking.status === 'Pending' && (
                      <div className="booking-actions">
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'Accepted')}
                          className="btn-accept"
                        >
                          ✓ Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'Rejected')}
                          className="btn-reject"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    
                    {booking.status === 'Accepted' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                        className="btn-complete"
                      >
                        ✓ Mark as Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="tab-content">
            {services.length === 0 ? (
              <div className="empty-state">
                <p>📦 No services yet</p>
                <Link to="/provider/add-service" className="action-btn primary">
                  Add Your First Service
                </Link>
              </div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h4>{service.name}</h4>
                      <span className="service-category">{service.category}</span>
                    </div>
                    <p className="service-description">{service.description}</p>
                    <div className="service-meta">
                      <span>📍 {service.area}, {service.city}</span>
                      <span>⭐ {service.rating.toFixed(1)} ({service.totalReviews} reviews)</span>
                    </div>
                    <div className="service-stats">
                      <span>📅 {service.bookingCount || 0} bookings</span>
                      <span>💬 {service.reviewCount || 0} reviews</span>
                    </div>
                    <div className="service-actions">
                      <Link to={`/services/${service._id}`} className="btn-view">
                        View
                      </Link>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
