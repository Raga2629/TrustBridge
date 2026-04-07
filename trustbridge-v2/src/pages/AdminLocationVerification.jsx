import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import '../styles/AdminLocationVerification.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLocationVerification() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/provider/location/admin/all?status=${filter}`, { headers });
      setRecords(res.data);
    } catch {
      setMessage('Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [filter]);

  const handleAction = async (id, status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      return setMessage('Please enter a rejection reason.');
    }
    setActionLoading(true);
    setMessage('');
    try {
      await axios.put(`${API}/api/provider/location/admin/${id}`, { status, rejectionReason }, { headers });
      setMessage(`Location ${status} successfully.`);
      setSelected(null);
      setRejectionReason('');
      fetchRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s) => {
    const map = {
      pending: { bg: '#fef9c3', color: '#92400e', label: 'Pending' },
      verified: { bg: '#dcfce7', color: '#166534', label: 'Verified' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' }
    };
    const c = map[s] || map.pending;
    return <span className="alv-badge" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
  };

  return (
    <div className="alv-container">
      <div className="alv-header">
        <h2>📍 Location Verifications</h2>
        <div className="alv-filters">
          {['pending', 'verified', 'rejected'].map(s => (
            <button
              key={s}
              className={`alv-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="alv-message">{message}</div>}

      {loading ? (
        <div className="alv-loading">Loading...</div>
      ) : records.length === 0 ? (
        <div className="alv-empty">No {filter} location records found.</div>
      ) : (
        <div className="alv-grid">
          {records.map(rec => (
            <div key={rec._id} className="alv-card" onClick={() => { setSelected(rec); setRejectionReason(''); setMessage(''); }}>
              <div className="alv-card-top">
                <div>
                  <p className="alv-business">{rec.providerId?.businessName || 'Unknown Business'}</p>
                  <p className="alv-user">{rec.userId?.name} — {rec.userId?.email}</p>
                </div>
                {statusBadge(rec.verificationStatus)}
              </div>
              <p className="alv-address">📍 {rec.address}, {rec.city}</p>
              <p className="alv-coords">GPS: {rec.latitude?.toFixed(5)}, {rec.longitude?.toFixed(5)}</p>
              <p className="alv-date">Submitted: {new Date(rec.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="alv-modal-overlay" onClick={() => setSelected(null)}>
          <div className="alv-modal" onClick={e => e.stopPropagation()}>
            <button className="alv-modal-close" onClick={() => setSelected(null)}>✕</button>
            <h3>Review Location</h3>
            <p><strong>Business:</strong> {selected.providerId?.businessName}</p>
            <p><strong>Provider:</strong> {selected.userId?.name} ({selected.userId?.email})</p>
            <p><strong>Address:</strong> {selected.address}, {selected.city}, {selected.state} {selected.pincode}</p>
            <p><strong>GPS:</strong> {selected.latitude}, {selected.longitude}</p>
            {statusBadge(selected.verificationStatus)}

            {/* Mini map */}
            <div className="alv-mini-map">
              <MapContainer
                center={[selected.latitude, selected.longitude]}
                zoom={15}
                style={{ height: '220px', width: '100%', borderRadius: '10px' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selected.latitude, selected.longitude]}>
                  <Popup>{selected.address}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {selected.addressProof && (
              <p className="alv-proof-link">
                📎 <a href={`${API}/uploads/${selected.addressProof}`} target="_blank" rel="noreferrer">View Address Proof</a>
              </p>
            )}

            {selected.verificationStatus === 'pending' && (
              <div className="alv-actions">
                <div className="alv-rejection-input">
                  <input
                    type="text"
                    placeholder="Rejection reason (required to reject)"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="alv-input"
                  />
                </div>
                <div className="alv-action-btns">
                  <button
                    className="alv-btn alv-btn-approve"
                    onClick={() => handleAction(selected._id, 'verified')}
                    disabled={actionLoading}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="alv-btn alv-btn-reject"
                    onClick={() => handleAction(selected._id, 'rejected')}
                    disabled={actionLoading}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
