import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        navigate('/admin/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [statsRes, usersRes, complaintsRes, reviewsRes] = await Promise.all([
        axios.get('/admin/stats', config).catch(() => ({ data: { totalUsers: 0, totalServices: 0, totalBookings: 0, totalComplaints: 0 } })),
        axios.get('/admin/users', config).catch(() => ({ data: [] })),
        axios.get('/admin/complaints', config).catch(() => ({ data: [] })),
        axios.get('/admin/reviews/flagged', config).catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setComplaints(complaintsRes.data);
      setFlaggedReviews(reviewsRes.data);
      setError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
      // Set default values on error
      setStats({ totalUsers: 0, totalServices: 0, totalBookings: 0, totalComplaints: 0 });
      setUsers([]);
      setComplaints([]);
      setFlaggedReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/admin/users/${userId}/verify`);
      fetchData();
      alert('User verified successfully');
    } catch (err) {
      alert('Failed to verify user');
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      await axios.put(`/admin/complaints/${complaintId}/resolve`);
      fetchData();
      alert('Complaint resolved');
    } catch (err) {
      alert('Failed to resolve complaint');
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await axios.put(`/admin/reviews/${reviewId}/approve`);
      fetchData();
      alert('Review approved successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleRemoveSpamFlag = async (reviewId) => {
    try {
      await axios.put(`/admin/reviews/${reviewId}/remove-spam-flag`);
      fetchData();
      alert('Spam flag removed');
    } catch (err) {
      alert('Failed to remove spam flag');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await axios.delete(`/admin/reviews/${reviewId}`);
      fetchData();
      alert('Review deleted successfully');
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Admin Dashboard 🛡️</h1>
            <p className="welcome-subtitle">System Management & Moderation</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.overview?.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.overview?.totalServices || 0}</h3>
                <p>Total Services</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{stats.overview?.totalBookings || 0}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{stats.overview?.totalComplaints || 0}</h3>
                <p>Total Complaints</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'stats' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button 
            className={activeTab === 'reviews' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('reviews')}
          >
            Flagged Reviews ({flaggedReviews.length})
          </button>
          <button 
            className={activeTab === 'service-verification' ? 'tab-active' : 'tab-inactive'}
            onClick={() => navigate('/admin/service-verification')}
          >
            Service Verification
          </button>
          <button 
            className={activeTab === 'residents' ? 'tab-active' : 'tab-inactive'}
            onClick={() => navigate('/admin/residents')}
          >
            Resident Verification
          </button>
          <button 
            className={activeTab === 'complaints' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('complaints')}
          >
            Complaints ({complaints.filter(c => c.status === 'Pending').length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && stats && (
          <div className="tab-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Users by Role</h3>
                <div className="stats-list">
                  {stats.users?.byRole?.map(item => (
                    <div key={item._id} className="stats-item">
                      <span className="stats-label">{item._id}</span>
                      <span className="stats-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h3>Verification Status</h3>
                <div className="stats-list">
                  <div className="stats-item">
                    <span className="stats-label">Verified Users</span>
                    <span className="stats-value verified">{stats.users?.verified || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Unverified Users</span>
                    <span className="stats-value unverified">{stats.users?.unverified || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Verified Services</span>
                    <span className="stats-value verified">{stats.services?.verified || 0}</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-label">Unverified Services</span>
                    <span className="stats-value unverified">{stats.services?.unverified || 0}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Services by Category</h3>
                <div className="stats-list">
                  {stats.services?.byCategory?.map(item => (
                    <div key={item._id} className="stats-item">
                      <span className="stats-label">{item._id}</span>
                      <span className="stats-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
            {flaggedReviews.length === 0 ? (
              <div className="empty-state">
                <p>✅ No flagged reviews</p>
              </div>
            ) : (
              <div className="reviews-grid">
                {flaggedReviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div>
                        <h4>{review.service?.name}</h4>
                        <p className="review-user">By: {review.user?.name}</p>
                      </div>
                      <div className="review-badges">
                        {review.isSpamDetected && (
                          <span className="badge-spam">🚫 Spam Detected</span>
                        )}
                        {!review.isApproved && !review.isSpamDetected && (
                          <span className="badge-pending">⏳ Pending Approval</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)} ({review.rating}/5)
                    </div>
                    
                    <p className="review-comment">{review.comment}</p>
                    
                    <div className="review-meta">
                      <span>📧 {review.user?.email}</span>
                      <span>📅 {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="review-actions">
                      {review.isSpamDetected && (
                        <button 
                          onClick={() => handleRemoveSpamFlag(review._id)}
                          className="btn-warning"
                        >
                          Remove Spam Flag
                        </button>
                      )}
                      {!review.isApproved && !review.isSpamDetected && (
                        <button 
                          onClick={() => handleApproveReview(review._id)}
                          className="btn-approve"
                        >
                          ✓ Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="tab-content">
            {complaints.length === 0 ? (
              <div className="empty-state">
                <p>✅ No complaints</p>
              </div>
            ) : (
              <div className="complaints-grid">
                {complaints.map(complaint => (
                  <div key={complaint._id} className="complaint-card">
                    <div className="complaint-header">
                      <h4>{complaint.reportedType} Complaint</h4>
                      <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="complaint-details">
                      <p><strong>Reported by:</strong> {complaint.user?.name}</p>
                      <p><strong>Email:</strong> {complaint.user?.email}</p>
                      <p><strong>Reason:</strong> {complaint.reason}</p>
                      <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    {complaint.status === 'Pending' && (
                      <button 
                        onClick={() => handleResolveComplaint(complaint._id)}
                        className="btn-resolve"
                      >
                        ✓ Resolve
                      </button>
                    )}
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

export default AdminDashboard;
