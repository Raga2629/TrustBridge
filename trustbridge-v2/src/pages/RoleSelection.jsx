import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  // Hide body scrollbar when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const roles = [
    {
      id: 'USER',
      title: 'Newcomer',
      subtitle: 'New to the city',
      description: 'Find trusted accommodation and connect with local residents for guidance',
      icon: '🌟',
      color: '#667eea',
      features: ['Browse Services', 'Book Accommodation', 'Community Support']
    },
    {
      id: 'LOCAL_RESIDENT',
      title: 'Local Resident',
      subtitle: 'Help newcomers settle',
      description: 'Share your local knowledge and help newcomers feel at home',
      icon: '🏠',
      color: '#f093fb',
      features: ['Offer Guidance', 'Earn Trust Score', 'Build Community']
    },
    {
      id: 'PROVIDER',
      title: 'Service Provider',
      subtitle: 'Offer your services',
      description: 'List your accommodation or services and reach newcomers',
      icon: '💼',
      color: '#4facfe',
      features: ['List Services', 'Manage Bookings', 'Grow Business']
    }
  ];

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role to continue');
      return;
    }
    
    if (selectedRole === 'USER') {
      navigate('/signup/user');
    } else if (selectedRole === 'LOCAL_RESIDENT') {
      navigate('/signup/local-resident');
    } else {
      navigate('/signup', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="role-selection">
      <div className="role-selection-content">
        {/* Main Content */}
        <div className="role-main">
          <div className="role-intro">
            <h1 className="role-title">Join TrustBridge</h1>
            <p className="role-description">
              Choose how you'd like to be part of our community
            </p>
          </div>

          {/* Role Cards */}
          <div className="roles-grid">
            {roles.map(role => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
                style={{ '--card-color': role.color }}
              >
                {selectedRole === role.id && (
                  <div className="selected-badge">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
                
                <div className="role-card-icon">{role.icon}</div>
                <h3 className="role-card-title">{role.title}</h3>
                <p className="role-card-subtitle">{role.subtitle}</p>
                <p className="role-card-description">{role.description}</p>
                
                <ul className="role-features">
                  {role.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="role-card-footer">
                  <span className="select-text">
                    {selectedRole === role.id ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button 
            onClick={handleContinue} 
            className={`btn-continue ${selectedRole ? 'active' : ''}`}
            disabled={!selectedRole}
          >
            {selectedRole ? 'Continue' : 'Select a role to continue'}
            {selectedRole && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="role-footer">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
