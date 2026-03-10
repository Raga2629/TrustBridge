import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Services.css';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/services');
      // Filter to show only current provider's services
      const myServices = data.filter(s => s.provider._id === JSON.parse(localStorage.getItem('user'))._id);
      setServices(myServices);
    } catch (err) {
      console.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    
    try {
      await axios.delete(`/services/${id}`);
      fetchServices();
      alert('Service deleted');
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>My Services</h1>
        <Link to="/provider/add-service" className="action-btn">Add New Service</Link>
      </div>

      <div className="services-grid">
        {services.length === 0 ? (
          <p className="no-services">No services yet. Add your first service!</p>
        ) : (
          services.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                {service.isVerified && <span className="verified-badge">✓ Verified</span>}
              </div>
              <p className="service-category">{service.category}</p>
              <p className="service-description">{service.description}</p>
              <div className="service-rating">
                <span>⭐ {service.averageRating.toFixed(1)}</span>
                <span>({service.totalReviews} reviews)</span>
              </div>
              <div className="booking-actions">
                <Link to={`/services/${service._id}`} className="btn-view">
                  View
                </Link>
                <button onClick={() => handleDelete(service._id)} className="btn-cancel">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProviderServices;
