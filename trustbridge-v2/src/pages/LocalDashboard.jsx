import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../styles/LocalDashboard.css';
import '../styles/Modal.css';

const LocalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchResidentProfile();
  }, [user, navigate]);

  const fetchResidentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const { data } = await axios.get('/residents/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResident(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Set default values if profile doesn't exist yet
      setResident({
        yearsStaying: 0,
        trustScore: 0,
        positiveFeedbackCount: 0,
        complaintsCount: 0,
        verificationStatus: user?.verificationStatus || 'PENDING'
      });
    } finally {
      setLoading(false);
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

  // Extract data with fallbacks
  const trustScore = resident?.trustScore || 0;
  const positiveFeedback = resident?.positiveFeedbackCount || 0;
  const complaints = resident?.complaintsCount || 0;
  const verificationStatus = resident?.verificationStatus || user?.verificationStatus || 'PENDING';
  const yearsStaying = resident?.yearsStaying || 0;
  const userName = user?.name || 'User';
  const userCity = user?.city || resident?.city || 'Not set';
  const userArea = user?.area || resident?.area || 'Not set';

  return (
    <div className="local-dashboard-premium">
      {/* Main Content */}
      <div className="dashboard-content-premium">
        <div className="dashboard-container-premium">
          
          {/* Hero Section */}
          <div className="hero-card-premium">
            <div className="hero-gradient-strip"></div>
            <div className="hero-content-grid">
              <div className="hero-left">
                <h1 className="hero-title">Welcome back, {userName.split(' ')[0]} 👋</h1>
                <p className="hero-subtitle">Helping newcomers in {userArea !== 'Not set' ? userArea : 'your area'}</p>
              </div>
              <div className="hero-right">
                <div className={`status-badge-premium ${verificationStatus.toLowerCase()}`}>
                  {verificationStatus === 'APPROVED' && '✓ Verified Local Resident'}
                  {verificationStatus === 'PENDING' && '⏳ Verification Pending'}
                  {verificationStatus === 'REJECTED' && '✗ Verification Rejected'}
                  {verificationStatus === 'SUSPENDED' && '🚫 Account Suspended'}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid-premium">
            
            {/* Left Column */}
            <div className="grid-left-premium">
              
              {/* Profile Card */}
              <div className="card-premium profile-card-premium">
                <h3 className="card-title-premium">Your Profile</h3>
                <div className="profile-grid-premium">
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">👤</span>
                    <div>
                      <div className="profile-label">Name</div>
                      <div className="profile-value">{userName}</div>
                    </div>
                  </div>
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">📧</span>
                    <div>
                      <div className="profile-label">Email</div>
                      <div className="profile-value">{user?.email || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">📍</span>
                    <div>
                      <div className="profile-label">Area</div>
                      <div className="profile-value">{userArea}</div>
                    </div>
                  </div>
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">🏙</span>
                    <div>
                      <div className="profile-label">City</div>
                      <div className="profile-value">{userCity}</div>
                    </div>
                  </div>
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">📅</span>
                    <div>
                      <div className="profile-label">Years Staying</div>
                      <div className="profile-value">{yearsStaying} years</div>
                    </div>
                  </div>
                  <div className="profile-item-premium">
                    <span className="profile-icon-premium">🎭</span>
                    <div>
                      <div className="profile-label">Role</div>
                      <div className="profile-value">{user?.role || 'User'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="card-premium trust-card-premium">
                <h3 className="card-title-premium">Trust Score</h3>
                <div className="trust-score-display">
                  <div className="trust-number-premium">{trustScore}</div>
                  <div className="trust-subtitle">Community Reputation</div>
                </div>
                <div className="trust-progress-bar">
                  <div 
                    className="trust-progress-fill" 
                    style={{ width: `${Math.min(trustScore, 100)}%` }}
                  ></div>
                </div>
                <div className="trust-stats-premium">
                  <div className="trust-stat-item">
                    <span className="stat-icon">👍</span>
                    <div>
                      <div className="stat-value">{positiveFeedback}</div>
                      <div className="stat-label">Positive Feedback</div>
                    </div>
                  </div>
                  <div className="trust-stat-item">
                    <span className="stat-icon">⚠</span>
                    <div>
                      <div className="stat-value">{complaints}</div>
                      <div className="stat-label">Complaints</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="grid-right-premium">
              
              {/* Quick Actions Card */}
              <div className="card-premium actions-card-premium">
                <h3 className="card-title-premium">Quick Actions</h3>
                <div className="actions-grid-premium">
                  <a 
                    href="/services" 
                    className="action-tile-premium"
                  >
                    <span className="action-icon-premium">🔍</span>
                    <span className="action-text-premium">Explore Services</span>
                    <span className="action-arrow-premium">→</span>
                  </a>
                  <a href="/secure-chat" className="action-tile-premium">
                    <span className="action-icon-premium">💬</span>
                    <span className="action-text-premium">Help Newcomers</span>
                    <span className="action-arrow-premium">→</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LocalDashboard;
