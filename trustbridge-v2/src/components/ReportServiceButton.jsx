import { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportServiceButton.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const REASONS = [
  { value: 'fake_service', label: '🚫 Fake Service', desc: 'This service does not exist' },
  { value: 'scam', label: '💸 Scam / Fraud', desc: 'Trying to cheat customers' },
  { value: 'wrong_info', label: '📋 Wrong Information', desc: 'Address, phone, or details are incorrect' },
  { value: 'closed_business', label: '🔒 Closed Business', desc: 'This business is permanently closed' },
  { value: 'inappropriate', label: '⚠️ Inappropriate Content', desc: 'Offensive or harmful content' },
  { value: 'other', label: '📝 Other', desc: 'Something else is wrong' }
];

export default function ReportServiceButton({ serviceId, serviceName }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [hasReported, setHasReported] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token || !serviceId) return;
    axios.get(`${API}/api/reports/service/${serviceId}/check`, { headers })
      .then(res => {
        setHasReported(res.data.hasReported);
        setTotalReports(res.data.totalReports);
      })
      .catch(() => {});
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return setError('Please select a reason.');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/reports`, { serviceId, reason, description }, { headers });
      setSubmitted(true);
      setHasReported(true);
      setTotalReports(res.data.totalReports);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setDescription('');
    setError('');
    setSubmitted(false);
  };

  return (
    <>
      <button
        className={`rsb-trigger ${hasReported ? 'rsb-reported' : ''}`}
        onClick={() => !hasReported && setOpen(true)}
        title={hasReported ? 'Already reported' : 'Report this service'}
      >
        🚩 {hasReported ? 'Reported' : 'Report'}
      </button>

      {open && (
        <div className="rsb-overlay" onClick={handleClose}>
          <div className="rsb-modal" onClick={e => e.stopPropagation()}>
            <button className="rsb-close" onClick={handleClose}>✕</button>

            {submitted ? (
              <div className="rsb-success">
                <div className="rsb-success-icon">✅</div>
                <h3>Report Submitted</h3>
                <p>Thank you for helping keep TrustBridge safe. Our team will review this report.</p>
                <button className="rsb-btn rsb-btn-primary" onClick={handleClose}>Done</button>
              </div>
            ) : (
              <>
                <div className="rsb-modal-header">
                  <h3>🚩 Report Service</h3>
                  <p className="rsb-service-name">"{serviceName}"</p>
                </div>

                <form onSubmit={handleSubmit} className="rsb-form">
                  <p className="rsb-label">What's wrong with this service?</p>

                  <div className="rsb-reasons">
                    {REASONS.map(r => (
                      <label
                        key={r.value}
                        className={`rsb-reason-card ${reason === r.value ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                        />
                        <div className="rsb-reason-content">
                          <span className="rsb-reason-label">{r.label}</span>
                          <span className="rsb-reason-desc">{r.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="rsb-desc-field">
                    <label>Additional details <span className="rsb-optional">(optional)</span></label>
                    <textarea
                      className="rsb-textarea"
                      placeholder="Describe the issue in more detail..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                    <span className="rsb-char-count">{description.length}/500</span>
                  </div>

                  {error && <p className="rsb-error">{error}</p>}

                  <div className="rsb-actions">
                    <button type="button" className="rsb-btn rsb-btn-ghost" onClick={handleClose}>
                      Cancel
                    </button>
                    <button type="submit" className="rsb-btn rsb-btn-danger" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
