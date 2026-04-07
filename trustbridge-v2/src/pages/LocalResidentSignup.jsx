import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Auth.css';

const LocalResidentSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    area: '',
    yearsStaying: '',
    proofDocument: null,
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.city || !formData.area || !formData.yearsStaying) {
      setError('Please provide location details');
      return;
    }

    if (formData.yearsStaying <= 0) {
      setError('Years staying must be greater than 0');
      return;
    }

    if (!formData.proofDocument) {
      setError('Please upload proof document (Aadhaar/Utility Bill)');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to terms and conditions');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Step 1: Creating user account...');
      
      // Step 1: Register user account
      const signupRes = await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'LOCAL_RESIDENT'
      });

      console.log('✅ Step 1 complete: User account created');
      const token = signupRes.data.token;
      const userId = signupRes.data._id;
      localStorage.setItem('token', token);

      console.log('🔄 Step 2: Creating resident profile...');
      
      // Step 2: Register as resident with file upload
      const formDataToSend = new FormData();
      formDataToSend.append('city', formData.city);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('yearsStaying', formData.yearsStaying);
      formDataToSend.append('proofDocument', formData.proofDocument);
      formDataToSend.append('agreeToTerms', formData.agreeToTerms);

      try {
        await axios.post('/residents/register', formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('✅ Step 2 complete: Resident profile created');
        console.log('🎉 Registration successful! Redirecting...');
        
        // Redirect directly to local resident dashboard — no admin approval needed to browse
        navigate('/local-resident/dashboard');
      } catch (residentErr) {
        console.error('❌ Step 2 failed:', residentErr);
        console.error('Resident error response:', residentErr.response?.data);
        
        // Step 2 failed, but user account was created
        // Show specific error from resident registration
        let errorMessage = 'User account created, but resident profile failed. ';
        
        if (residentErr.response?.data?.message) {
          errorMessage += residentErr.response.data.message;
        } else if (residentErr.response?.data?.error) {
          errorMessage += residentErr.response.data.error;
        } else {
          errorMessage += 'Please contact support or try logging in.';
        }
        
        setError(errorMessage);
        setLoading(false);
        
        // Don't throw - we want to show the error message
        return;
      }
    } catch (err) {
      console.error('❌ Step 1 failed:', err);
      console.error('Error response:', err.response);
      
      // Display detailed error message from backend
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Special handling for "User already exists"
      if (errorMessage.includes('already exists') || errorMessage.includes('User already exists')) {
        errorMessage = 'This email is already registered. Please use a different email or login instead.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Local Resident Registration</h2>
        <p className="auth-subtitle">Help newcomers in your area</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-divider">Location Details</div>

          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Hyderabad"
              required
            />
          </div>

          <div className="form-group">
            <label>Area *</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Bachupally"
              required
            />
          </div>

          <div className="form-group">
            <label>Years Staying in Area *</label>
            <input
              type="number"
              name="yearsStaying"
              value={formData.yearsStaying}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Proof Document (Aadhaar/Utility Bill) *</label>
            <input
              type="file"
              name="proofDocument"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            <small>Upload Aadhaar card or utility bill as proof of residence</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <span>I agree to provide accurate information and help newcomers responsibly</span>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Local Resident'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default LocalResidentSignup;
