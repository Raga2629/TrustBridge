import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p className="dashboard-subtitle">Manage your account information</p>
      </div>

      <div className="form-card">
        <div className="profile-info">
          <div className="profile-avatar">
            <span className="avatar-initial">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            
            <div className="detail-row">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            
            <div className="detail-row">
              <label>Phone</label>
              <p>{user.phone || 'Not provided'}</p>
            </div>
            
            <div className="detail-row">
              <label>City</label>
              <p>{user.city || 'Not set'}</p>
            </div>
            
            <div className="detail-row">
              <label>Account Type</label>
              <p>{user.role === 'USER' ? 'Newcomer' : user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
