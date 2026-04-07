import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: 'nasaniragamala@gmail.com',
    password: 'raga@123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Admin login attempt:', formData.email);

    try {
      const userData = await login(formData.email, formData.password);
      console.log('✅ Login successful, user data:', userData);
      
      // Check if user is admin
      if (userData.role !== 'ADMIN') {
        console.log('❌ Not an admin user, role:', userData.role);
        setError('Access denied. Admin credentials required.');
        // Logout the non-admin user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      console.log('✅ Admin verified, redirecting to dashboard...');
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      console.error('❌ Admin login error:', err);
      setError(typeof err === 'string' ? err : 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="admin-badge">🛡️</div>
          <h1>Admin Login</h1>
          <p>Secure access for administrators only</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter admin email"
              autoComplete="email"
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
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
          <p className="admin-note">Admin accounts cannot be created through signup</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
