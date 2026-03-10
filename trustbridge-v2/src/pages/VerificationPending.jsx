import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const VerificationPending = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card verification-card">
        <div className="verification-icon">⏳</div>
        <h2>Verification Under Review</h2>
        <p className="verification-message">
          Thank you for registering as a Local Resident!
        </p>
        <p className="verification-details">
          Our admin team is reviewing your application and proof documents. 
          You will receive an email once your account is approved.
        </p>
        <p className="verification-note">
          This usually takes 24-48 hours.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerificationPending;
