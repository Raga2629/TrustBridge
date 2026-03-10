import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/AdminOCRVerification.css';

const AdminOCRVerification = () => {
  const { type, id } = useParams(); // type: 'provider' or 'resident'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerificationData();
  }, [type, id]);

  const fetchVerificationData = async () => {
    try {
      const { data: response } = await axios.get(`/ocr-verification/status/${type}/${id}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this verification?')) return;

    setActionLoading(true);
    try {
      await axios.put(`/admin/${type}s/${id}/verify`, {
        action: 'APPROVE'
      });
      alert('Verification approved successfully!');
      navigate(`/admin/${type}s`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await axios.put(`/admin/${type}s/${id}/verify`, {
        action: 'REJECT',
        reason
      });
      alert('Verification rejected');
      navigate(`/admin/${type}s`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading verification data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-container">
        <h2>Verification data not found</h2>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  const isProvider = type === 'provider';
  const verification = data.verificationDetails;

  return (
    <div className="admin-ocr-verification">
      <div className="verification-header">
        <h1>
          {isProvider ? 'Service Provider' : 'Local Resident'} Verification
        </h1>
        {getStatusBadge(data.verificationStatus)}
      </div>

      {/* Verification Score */}
      <div className="score-card">
        <div className="score-circle" style={{ borderColor: getScoreColor(data.verificationScore) }}>
          <div className="score-value" style={{ color: getScoreColor(data.verificationScore) }}>
            {data.verificationScore}
          </div>
          <div className="score-label">Verification Score</div>
        </div>
        <div className="score-details">
          <div className="score-item">
            <span className="label">Status:</span>
            <span className="value">{data.verificationStatus}</span>
          </div>
          <div className="score-item">
            <span className="label">Verified:</span>
            <span className="value">{data.proofVerified ? 'Yes' : 'No'}</span>
          </div>
          {data.verifiedAt && (
            <div className="score-item">
              <span className="label">Verified At:</span>
              <span className="value">{new Date(data.verifiedAt).toLocaleString()}</span>
            </div>
          )}
          {data.rejectionReason && (
            <div className="score-item rejection">
              <span className="label">Rejection Reason:</span>
              <span className="value">{data.rejectionReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* OCR Extracted Data */}
      {data.ocrData && (
        <div className="section-card">
          <h2>📄 OCR Extracted Data</h2>
          
          {isProvider ? (
            <>
              <div className="data-section">
                <h3>Aadhaar Document</h3>
                <div className="data-grid">
                  <div className="data-item">
                    <span className="label">Name:</span>
                    <span className="value">{data.ocrData.aadhaarExtracted?.name || 'Not extracted'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Aadhaar Number:</span>
                    <span className="value">{data.ocrData.aadhaarExtracted?.aadhaarNumber || 'Not extracted'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Address:</span>
                    <span className="value">{data.ocrData.aadhaarExtracted?.address || 'Not extracted'}</span>
                  </div>
                </div>
                <div className="ocr-text-preview">
                  <strong>Full OCR Text:</strong>
                  <pre>{data.ocrData.aadhaarText}</pre>
                </div>
              </div>

              <div className="data-section">
                <h3>Business Document</h3>
                <div className="data-grid">
                  <div className="data-item">
                    <span className="label">Business Name:</span>
                    <span className="value">{data.ocrData.businessExtracted?.businessName || 'Not extracted'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">GST Number:</span>
                    <span className="value">{data.ocrData.businessExtracted?.gstNumber || 'Not extracted'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Registration:</span>
                    <span className="value">{data.ocrData.businessExtracted?.registrationNumber || 'Not extracted'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Phone:</span>
                    <span className="value">{data.ocrData.businessExtracted?.phone || 'Not extracted'}</span>
                  </div>
                </div>
                <div className="ocr-text-preview">
                  <strong>Full OCR Text:</strong>
                  <pre>{data.ocrData.businessText}</pre>
                </div>
              </div>
            </>
          ) : (
            <div className="data-section">
              <h3>Document Data</h3>
              <div className="data-grid">
                <div className="data-item">
                  <span className="label">Name:</span>
                  <span className="value">{data.ocrData.extractedFields?.name || 'Not extracted'}</span>
                </div>
                <div className="data-item">
                  <span className="label">Aadhaar Number:</span>
                  <span className="value">{data.ocrData.extractedFields?.aadhaarNumber || 'Not extracted'}</span>
                </div>
                <div className="data-item">
                  <span className="label">Address:</span>
                  <span className="value">{data.ocrData.extractedFields?.address || 'Not extracted'}</span>
                </div>
                <div className="data-item">
                  <span className="label">Phone:</span>
                  <span className="value">{data.ocrData.extractedFields?.phone || 'Not extracted'}</span>
                </div>
              </div>
              <div className="ocr-text-preview">
                <strong>Full OCR Text:</strong>
                <pre>{data.ocrData.ocrText}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Results */}
      {verification && (
        <div className="section-card">
          <h2>✅ Verification Results</h2>
          
          {isProvider && verification.aadhaarVerification && (
            <div className="verification-result">
              <h3>Aadhaar Verification</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Status:</span>
                  <span className={`value ${verification.aadhaarVerification.verification_status.toLowerCase()}`}>
                    {verification.aadhaarVerification.verification_status}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Confidence:</span>
                  <span className="value">{verification.aadhaarVerification.confidence_score}</span>
                </div>
                <div className="result-item">
                  <span className="label">Risk Level:</span>
                  <span className="value">{verification.aadhaarVerification.risk_level}</span>
                </div>
                <div className="result-item full-width">
                  <span className="label">Explanation:</span>
                  <span className="value">{verification.aadhaarVerification.explanation}</span>
                </div>
                {verification.aadhaarVerification.mismatch_fields?.length > 0 && (
                  <div className="result-item full-width">
                    <span className="label">Mismatched Fields:</span>
                    <span className="value error">{verification.aadhaarVerification.mismatch_fields.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isProvider && verification.businessVerification && (
            <div className="verification-result">
              <h3>Business Document Verification</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Status:</span>
                  <span className={`value ${verification.businessVerification.verification_status.toLowerCase()}`}>
                    {verification.businessVerification.verification_status}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Confidence:</span>
                  <span className="value">{verification.businessVerification.confidence_score}</span>
                </div>
                <div className="result-item">
                  <span className="label">Risk Level:</span>
                  <span className="value">{verification.businessVerification.risk_level}</span>
                </div>
                <div className="result-item full-width">
                  <span className="label">Explanation:</span>
                  <span className="value">{verification.businessVerification.explanation}</span>
                </div>
                {verification.businessVerification.mismatch_fields?.length > 0 && (
                  <div className="result-item full-width">
                    <span className="label">Mismatched Fields:</span>
                    <span className="value error">{verification.businessVerification.mismatch_fields.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isProvider && verification.verification && (
            <div className="verification-result">
              <h3>Document Verification</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Status:</span>
                  <span className={`value ${verification.verification.verification_status.toLowerCase()}`}>
                    {verification.verification.verification_status}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Confidence:</span>
                  <span className="value">{verification.verification.confidence_score}</span>
                </div>
                <div className="result-item">
                  <span className="label">Risk Level:</span>
                  <span className="value">{verification.verification.risk_level}</span>
                </div>
                <div className="result-item full-width">
                  <span className="label">Explanation:</span>
                  <span className="value">{verification.verification.explanation}</span>
                </div>
                {verification.verification.mismatch_fields?.length > 0 && (
                  <div className="result-item full-width">
                    <span className="label">Mismatched Fields:</span>
                    <span className="value error">{verification.verification.mismatch_fields.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="validation-badges">
            {isProvider && (
              <>
                <div className={`badge ${verification.aadhaarValid ? 'success' : 'error'}`}>
                  {verification.aadhaarValid ? '✓' : '✗'} Aadhaar Format
                </div>
                <div className={`badge ${verification.gstValid ? 'success' : 'error'}`}>
                  {verification.gstValid ? '✓' : '✗'} GST Format
                </div>
              </>
            )}
            {!isProvider && (
              <div className={`badge ${verification.aadhaarValid ? 'success' : 'error'}`}>
                {verification.aadhaarValid ? '✓' : '✗'} Aadhaar Format
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {data.verificationStatus === 'PENDING' && (
        <div className="admin-actions">
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="btn-approve"
          >
            {actionLoading ? 'Processing...' : '✓ Approve Verification'}
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="btn-reject"
          >
            {actionLoading ? 'Processing...' : '✗ Reject Verification'}
          </button>
        </div>
      )}

      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to List
        </button>
      </div>
    </div>
  );
};

export default AdminOCRVerification;
