import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: '#dc2626',
      PROVIDER: '#2563eb',
      USER: '#059669',
      LOCAL_RESIDENT: '#7c3aed'
    };
    return colors[role] || '#6b7280';
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

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ← Back
            </button>
            <div className="header-text">
              <h1>👥 Manage Users</h1>
              <p>View and manage all registered users</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            {['ALL', 'PROVIDER', 'USER', 'LOCAL_RESIDENT'].map(role => (
              <button
                key={role}
                className={`filter-tab ${filter === role ? 'active' : ''}`}
                onClick={() => setFilter(role)}
              >
                {role === 'ALL' ? 'All Users' : getRoleDisplay(role)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'Registered users will appear here'}</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-name-cell">
                        <span className="name-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td className="phone-cell">{user.phone || '-'}</td>
                    <td className="location-cell">
                      {user.city ? `${user.area ? user.area + ', ' : ''}${user.city}` : '-'}
                    </td>
                    <td>
                      <span 
                        className="role-badge" 
                        style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                      >
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
                        {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
