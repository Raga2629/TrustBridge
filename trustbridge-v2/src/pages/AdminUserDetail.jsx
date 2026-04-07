import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminUserDetail.css';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!window.confirm('Verify this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/admin/users/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User verified successfully!');
      fetchUser();
    } catch (error) {
      alert('Failed to verify user');
    }
  };

  const getRoleDisplay = (role) => {
    const roles = {
      USER: 'Newcomer',
      PROVIDER: 'Service Provider',
      LOCAL_RESIDENT: 'Local Resident',
      ADMIN: 'Administrator'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: '#dc2626',
      PROVIDER: '#2563eb',
      USER: '#059669',
      LOCAL_RESIDENT: '#7c3aed'
    };
    return colors[role] || '#6b7280';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="admin-user-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-user-detail-page">
        <div className="error-container">
          <h2>User not found</h2>
          <button onClick={() => navigate('/admin/users')} className="btn-back">
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-detail-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
          <h1>User Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div 
              className="profile-avatar-large"
              style={{ background: getRoleColor(user.role) }}
            >
              {getInitials(user.name)}
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <span 
              className="profile-role-badge"
              style={{ backgroundColor: getRoleColor(user.role) }}
            >
              {getRoleDisplay(user.role)}
            </span>
            <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
              {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
            </span>
          </div>

          {/* Details Grid */}
          <div className="profile-details-grid">
            <div className="detail-card">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <span className="detail-label">EMAIL</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">📞</div>
              <div className="detail-content">
                <span className="detail-label">PHONE</span>
                <span className="detail-value">{user.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <span className="detail-label">CITY</span>
                <span className="detail-value">{user.city || 'Not set'}</span>
              </div>
            </div>

            {user.area && (
              <div className="detail-card">
                <div className="detail-icon">🏘️</div>
                <div className="detail-content">
                  <span className="detail-label">AREA</span>
                  <span className="detail-value">{user.area}</span>
                </div>
              </div>
            )}

            <div className="detail-card">
              <div className="detail-icon">🎭</div>
              <div className="detail-content">
                <span className="detail-label">ACCOUNT TYPE</span>
                <span className="detail-value">{getRoleDisplay(user.role)}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">{user.isVerified ? '✅' : '⏳'}</div>
              <div className="detail-content">
                <span className="detail-label">STATUS</span>
                <span className="detail-value">
                  {user.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="account-info-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account ID</span>
                <span className="info-value">{user._id?.substring(0, 12)}...</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {!user.isVerified && (
            <div className="admin-actions">
              <button className="btn-verify" onClick={handleVerifyUser}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify User
              </button>
              <button className="btn-reject">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Suspend Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
