import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is loaded
  if (!user) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p className="dashboard-subtitle">What would you like to do today?</p>
      </div>

      <div className="dashboard-main-actions">
        <Link 
          to="/services" 
          className="main-action-card"
        >
          <div className="action-icon">🔍</div>
          <h2>Browse Services</h2>
          <p>Find trusted local services near you</p>
        </Link>

        <Link to="/secure-chat" className="main-action-card">
          <div className="action-icon">💬</div>
          <h2>Chat with Locals</h2>
          <p>Get help from verified local residents</p>
        </Link>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📍 Your Location</h3>
          <p>{user.city || 'Not set'}</p>
        </div>
        <div className="info-card">
          <h3>👤 Account Type</h3>
          <p>Newcomer</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
