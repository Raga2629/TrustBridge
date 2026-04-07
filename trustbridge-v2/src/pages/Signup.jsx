import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Signup = () => {
  const location = useLocation();
  const preSelectedRole = location.state?.role; // Get role from navigation state
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: preSelectedRole || 'USER' // Use pre-selected role if available
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await register(formData);
      
      // Role-based redirect
      switch (userData.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'PROVIDER':
          // Providers must complete phone + identity verification before dashboard
          navigate('/provider/verify-setup');
          break;
        case 'LOCAL':
          navigate('/local/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join TrustBridge</h1>
        <p className="subtitle">Create your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
            />
          </div>

          {/* Only show role dropdown if role was NOT pre-selected */}
          {!preSelectedRole && (
            <div className="form-group">
              <label>I am a</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="USER">Newcomer (User)</option>
                <option value="LOCAL">Local Resident</option>
                <option value="PROVIDER">Service Provider</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
