import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminServiceVerification.css';

function AdminServiceVerification() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [filter]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/providers');
      
      // Filter based on verification status
      const filtered = filter === 'PENDING' 
        ? response.data.filter(p => p.verificationStatus === 'PENDING')
        : response.data.filter(p => p.verificationStatus === 'APPROVED');
      
      setProviders(filtered);
    } catch (error) {
      console.error('Error loading providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (providerId) => {
    // Navigate to OCR verification page
    navigate(`/admin/verification/provider/${providerId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusBadge = (status) => {
    const colors = {
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      PENDING: '#f59e0b',
      SUSPENDED: '#6b7280'
    };
    return (
      <span className="status-badge" style={{ backgroundColor: colors[status] || '#6b7280' }}>
        {status}
      </span>
    );
  };

  return (
    <div className="admin-service-page">
      <div className="admin-service-container">
        <div className="page-header">
          <div>
            <h2 className="page-title">🔍 OCR Service Provider Verification</h2>
            <p className="page-subtitle">AI-powered document verification with OCR</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
            ← Back
          </button>
        </div>

        <div className="filter-tabs">
          <button 
            className={`tab-pill ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pending Verification
          </button>
          <button 
            className={`tab-pill ${filter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setFilter('APPROVED')}
          >
            Approved
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <h3>No {filter.toLowerCase()} providers found</h3>
            <p>Providers will appear here when they upload verification documents</p>
          </div>
        ) : (
          <div className="services-list">
            {providers.map(provider => (
              <div key={provider._id} className="service-list-card ocr-card">
                <div className="provider-header">
                  <div className="service-info">
                    <h3>{provider.businessName || provider.user?.name}</h3>
                    <p>📧 {provider.user?.email}</p>
                    <p>📞 {provider.user?.phone}</p>
                    {provider.businessAddress && (
                      <p>📍 {provider.businessAddress}</p>
                    )}
                  </div>
                  <div className="verification-badge">
                    {getStatusBadge(provider.verificationStatus)}
                  </div>
                </div>

                <div className="provider-details">
                  <div className="detail-row">
                    <span className="label">Verification Score:</span>
                    <span 
                      className="score-value" 
                      style={{ color: getScoreColor(provider.verificationScore || 0) }}
                    >
                      {provider.verificationScore || 0}/100
                    </span>
                  </div>
                  
                  {provider.ocrData && (
                    <div className="ocr-preview">
                      <div className="ocr-item">
                        <span className="ocr-label">Aadhaar:</span>
                        <span className="ocr-value">
                          {provider.ocrData.aadhaarExtracted?.aadhaarNumber || 'Not extracted'}
                        </span>
                      </div>
                      <div className="ocr-item">
                        <span className="ocr-label">GST:</span>
                        <span className="ocr-value">
                          {provider.ocrData.businessExtracted?.gstNumber || 'Not extracted'}
                        </span>
                      </div>
                    </div>
                  )}

                  {provider.verifiedAt && (
                    <div className="detail-row">
                      <span className="label">Verified:</span>
                      <span className="value">
                        {new Date(provider.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="service-actions">
                  <button 
                    className="btn-verify-service"
                    onClick={() => handleVerifyClick(provider._id)}
                  >
                    {provider.verificationStatus === 'PENDING' ? '🔍 Review with OCR' : '👁️ View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServiceVerification;
