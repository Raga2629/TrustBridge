import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminReports.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const REASON_LABELS = {
  fake_service: '🚫 Fake Service',
  scam: '💸 Scam',
  wrong_info: '📋 Wrong Info',
  closed_business: '🔒 Closed',
  inappropriate: '⚠️ Inappropriate',
  other: '📝 Other'
};

const STATUS_CONFIG = {
  pending: { bg: '#fef9c3', color: '#92400e', label: 'Pending' },
  reviewed: { bg: '#dbeafe', color: '#1e40af', label: 'Reviewed' },
  dismissed: { bg: '#f1f5f9', color: '#64748b', label: 'Dismissed' },
  action_taken: { bg: '#dcfce7', color: '#166534', label: 'Action Taken' }
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [serviceAction, setServiceAction] = useState('none');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/reports/admin/all?status=${filter}&page=${page}&limit=15`,
        { headers }
      );
      setReports(res.data.reports);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setMessage({ text: 'Failed to load reports.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filter, page]);

  const handleReview = async (reportId, status) => {
    if (!status) return;
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await axios.put(
        `${API}/api/reports/admin/${reportId}`,
        { status, adminNote, serviceAction },
        { headers }
      );
      setMessage({ text: `Report marked as "${status}"`, type: 'success' });
      setSelected(null);
      setAdminNote('');
      setServiceAction('none');
      fetchReports();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Action failed.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (serviceId, action) => {
    setActionLoading(true);
    try {
      const res = await axios.put(
        `${API}/api/reports/admin/service/${serviceId}/action`,
        { action },
        { headers }
      );
      setMessage({ text: res.data.message, type: 'success' });
      setSelected(null);
      fetchReports();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Action failed.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const Badge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span className="ar-badge" style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    );
  };

  const ServiceStatusBadge = ({ service }) => {
    const isActive = service?.verified || service?.isVerified;
    return (
      <span className="ar-badge" style={{
        background: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#166534' : '#991b1b'
      }}>
        {isActive ? '✅ Active' : '🚫 Suspended'}
      </span>
    );
  };

  return (
    <div className="ar-container">
      {/* Header */}
      <div className="ar-header">
        <div>
          <h2 className="ar-title">🚩 Community Reports</h2>
          <p className="ar-subtitle">{total} report{total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="ar-filters">
          {['pending', 'reviewed', 'action_taken', 'dismissed'].map(s => (
            <button
              key={s}
              className={`ar-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => { setFilter(s); setPage(1); }}
            >
              {STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`ar-message ar-message-${message.type}`}>{message.text}</div>
      )}

      {/* Table */}
      {loading ? (
        <div className="ar-loading">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="ar-empty">No {filter} reports found.</div>
      ) : (
        <>
          <div className="ar-table-wrapper">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Reported By</th>
                  <th>Reason</th>
                  <th>Service Status</th>
                  <th>Report Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} className="ar-row">
                    <td>
                      <p className="ar-service-name">{r.serviceId?.name || 'Deleted Service'}</p>
                      <p className="ar-service-meta">{r.serviceId?.category} · {r.serviceId?.area}</p>
                    </td>
                    <td>
                      <p className="ar-user-name">{r.userId?.name}</p>
                      <p className="ar-user-email">{r.userId?.email}</p>
                    </td>
                    <td>
                      <span className="ar-reason-tag">{REASON_LABELS[r.reason] || r.reason}</span>
                    </td>
                    <td><ServiceStatusBadge service={r.serviceId} /></td>
                    <td><Badge status={r.status} /></td>
                    <td className="ar-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="ar-view-btn"
                        onClick={() => { setSelected(r); setAdminNote(r.adminNote || ''); setServiceAction('none'); }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="ar-pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="ar-page-btn">← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="ar-page-btn">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="ar-overlay" onClick={() => setSelected(null)}>
          <div className="ar-modal" onClick={e => e.stopPropagation()}>
            <button className="ar-modal-close" onClick={() => setSelected(null)}>✕</button>
            <h3 className="ar-modal-title">Report Details</h3>

            <div className="ar-detail-grid">
              <div className="ar-detail-item">
                <span className="ar-detail-label">Service</span>
                <span className="ar-detail-value">{selected.serviceId?.name}</span>
              </div>
              <div className="ar-detail-item">
                <span className="ar-detail-label">Category</span>
                <span className="ar-detail-value">{selected.serviceId?.category} · {selected.serviceId?.area}</span>
              </div>
              <div className="ar-detail-item">
                <span className="ar-detail-label">Reported By</span>
                <span className="ar-detail-value">{selected.userId?.name} ({selected.userId?.email})</span>
              </div>
              <div className="ar-detail-item">
                <span className="ar-detail-label">Reason</span>
                <span className="ar-detail-value">{REASON_LABELS[selected.reason]}</span>
              </div>
              {selected.description && (
                <div className="ar-detail-item ar-detail-full">
                  <span className="ar-detail-label">Description</span>
                  <span className="ar-detail-value">{selected.description}</span>
                </div>
              )}
              <div className="ar-detail-item">
                <span className="ar-detail-label">Service Status</span>
                <ServiceStatusBadge service={selected.serviceId} />
              </div>
              <div className="ar-detail-item">
                <span className="ar-detail-label">Report Status</span>
                <Badge status={selected.status} />
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className="ar-modal-actions">
                <div className="ar-field">
                  <label>Admin Note</label>
                  <textarea
                    className="ar-textarea"
                    placeholder="Add a note about this decision..."
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="ar-field">
                  <label>Service Action</label>
                  <select
                    className="ar-select"
                    value={serviceAction}
                    onChange={e => setServiceAction(e.target.value)}
                  >
                    <option value="none">No action on service</option>
                    <option value="suspend">Suspend service</option>
                    <option value="restore">Restore service</option>
                  </select>
                </div>

                <div className="ar-modal-btns">
                  <button
                    className="ar-btn ar-btn-dismiss"
                    onClick={() => handleReview(selected._id, 'dismissed')}
                    disabled={actionLoading}
                  >
                    Dismiss
                  </button>
                  <button
                    className="ar-btn ar-btn-review"
                    onClick={() => handleReview(selected._id, 'reviewed')}
                    disabled={actionLoading}
                  >
                    Mark Reviewed
                  </button>
                  <button
                    className="ar-btn ar-btn-action"
                    onClick={() => handleReview(selected._id, 'action_taken')}
                    disabled={actionLoading}
                  >
                    Action Taken
                  </button>
                </div>

                <div className="ar-bulk-section">
                  <p className="ar-bulk-label">Bulk actions for this service:</p>
                  <div className="ar-bulk-btns">
                    <button
                      className="ar-btn ar-btn-suspend"
                      onClick={() => handleBulkAction(selected.serviceId?._id, 'suspend')}
                      disabled={actionLoading}
                    >
                      🚫 Suspend Service
                    </button>
                    <button
                      className="ar-btn ar-btn-restore"
                      onClick={() => handleBulkAction(selected.serviceId?._id, 'restore')}
                      disabled={actionLoading}
                    >
                      ✅ Restore Service
                    </button>
                    <button
                      className="ar-btn ar-btn-dismiss"
                      onClick={() => handleBulkAction(selected.serviceId?._id, 'dismiss_all')}
                      disabled={actionLoading}
                    >
                      Dismiss All Reports
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
