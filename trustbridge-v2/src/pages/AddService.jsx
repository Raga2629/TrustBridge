import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Form.css';

const AddService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Medical',
    subcategory: '',
    description: '',
    address: '',
    area: '',
    city: 'Hyderabad',
    contactPhone: '',
    contactEmail: '',
    workingHours: '',
    serviceImage: null,
    businessProof: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Medical', 'Grocery', 'Food', 'Education', 'HomeServices', 
    'Shopping', 'Beauty', 'Transport', 'Temples', 
    'Rentals', 'Repairs', 'BankATMs', 'PG', 'Gym/Fitness'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.category || !formData.description || 
        !formData.address || !formData.area || !formData.city ||
        !formData.contactPhone || !formData.contactEmail ||
        !formData.serviceImage || !formData.businessProof) {
      setError('Please provide all required fields including contact phone, email, service image, and business proof');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('category', formData.category);
      if (formData.subcategory) submitData.append('subcategory', formData.subcategory.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('address', formData.address.trim());
      submitData.append('area', formData.area.trim());
      submitData.append('city', formData.city.trim());
      submitData.append('contactPhone', formData.contactPhone.trim());
      submitData.append('contactEmail', formData.contactEmail.trim());
      if (formData.workingHours) submitData.append('workingHours', formData.workingHours.trim());
      submitData.append('serviceImage', formData.serviceImage);
      submitData.append('businessProof', formData.businessProof);
      
      // Default location coordinates (Bachupally, Hyderabad)
      submitData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [78.3931, 17.4975]
      }));

      console.log('Submitting service with files...');

      const response = await axios.post('/services', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Service created:', response.data);
      alert('Service added successfully! It will be reviewed by admin.');
      navigate('/provider/dashboard');
    } catch (err) {
      console.error('Add service error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1>Add New Service</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Bala Medical Shop"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subcategory (Optional)</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="e.g., Pharmacy, Clinic, etc."
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your service in detail"
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="e.g., Hyderabad"
            />
          </div>

          <div className="form-group">
            <label>Area/Locality *</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              placeholder="e.g., Bachupally, Miyapur, etc."
            />
          </div>

          <div className="form-group">
            <label>Full Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="e.g., Shop No. 5, Main Road, near Bus Stop"
            />
          </div>

          <div className="form-group">
            <label>Working Hours (Optional)</label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              placeholder="e.g., 9:00 AM - 9:00 PM, Mon-Sat"
            />
          </div>

          <div className="form-group">
            <label>Contact Phone *</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              placeholder="e.g., +91 9876543210"
            />
            <small className="field-hint">Required for customers to contact you</small>
          </div>

          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              placeholder="e.g., service@example.com"
            />
            <small className="field-hint">Required for customers to contact you</small>
          </div>

          <div className="form-group">
            <label>Service Image *</label>
            <input
              type="file"
              name="serviceImage"
              onChange={handleFileChange}
              required
              accept="image/*"
            />
            <small className="field-hint">Upload a photo of your shop/hospital/service (Required)</small>
          </div>

          <div className="form-group">
            <label>Business Proof *</label>
            <input
              type="file"
              name="businessProof"
              onChange={handleFileChange}
              required
              accept="image/*,.pdf"
            />
            <small className="field-hint">Upload business license, registration certificate, or GST certificate (Required)</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/provider/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding Service...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;
