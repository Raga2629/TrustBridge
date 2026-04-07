import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import '../styles/ProviderLocationVerification.css';

// Fix Leaflet default marker icons (Vite/webpack asset issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default center: Hyderabad
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

// Inner component to handle map click events
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function ProviderLocationVerification() {
  const [form, setForm] = useState({ address: '', city: '', state: 'Telangana', pincode: '' });
  const [coords, setCoords] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const mapRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Load existing submission
  useEffect(() => {
    axios.get(`${API}/api/provider/location`, { headers })
      .then(res => {
        if (res.data.submitted) {
          setStatus(res.data);
          setForm({
            address: res.data.address || '',
            city: res.data.city || '',
            state: res.data.state || 'Telangana',
            pincode: res.data.pincode || ''
          });
          if (res.data.latitude && res.data.longitude) {
            const c = { lat: res.data.latitude, lng: res.data.longitude };
            setCoords(c);
            setMapCenter(c);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-detect GPS location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      return setError('Geolocation is not supported by your browser.');
    }
    setDetecting(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const c = { lat: latitude, lng: longitude };
        setCoords(c);
        setMapCenter(c);

        // Reverse geocode using OpenStreetMap Nominatim (free, no key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          setForm(f => ({
            ...f,
            address: data.display_name?.split(',').slice(0, 3).join(',') || f.address,
            city: addr.city || addr.town || addr.village || addr.county || f.city,
            state: addr.state || f.state,
            pincode: addr.postcode || f.pincode
          }));
        } catch {
          // Reverse geocode failed — coords still set, user fills address manually
        }
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setError('Could not detect location. Please allow location access or pin manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapSelect = (c) => {
    setCoords(c);
    setMapCenter(c);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.address.trim() || !form.city.trim()) {
      return setError('Address and city are required.');
    }
    if (!coords) {
      return setError('Please pin your location on the map or use auto-detect.');
    }

    const formData = new FormData();
    formData.append('address', form.address);
    formData.append('city', form.city);
    formData.append('state', form.state);
    formData.append('pincode', form.pincode);
    formData.append('latitude', coords.lat);
    formData.append('longitude', coords.lng);
    if (addressProof) formData.append('addressProof', addressProof);

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/provider/location`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(res.data.message);
      setStatus(res.data.location);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    verified: { color: '#22c55e', bg: '#f0fdf4', icon: '✅', label: 'Verified' },
    pending: { color: '#f59e0b', bg: '#fffbeb', icon: '⏳', label: 'Pending Review' },
    rejected: { color: '#ef4444', bg: '#fff1f2', icon: '❌', label: 'Rejected' },
    not_submitted: { color: '#94a3b8', bg: '#f8fafc', icon: '📍', label: 'Not Submitted' }
  };

  const currentStatus = status?.verificationStatus || 'not_submitted';
  const cfg = statusConfig[currentStatus] || statusConfig.not_submitted;

  return (
    <div className="plv-container">
      <div className="plv-card">
        {/* Header */}
        <div className="plv-header">
          <h2 className="plv-title">📍 Location Verification</h2>
          <p className="plv-subtitle">Verify your business location to earn a verified badge visible to customers.</p>
        </div>

        {/* Status Badge */}
        <div className="plv-status-badge" style={{ background: cfg.bg, borderColor: cfg.color }}>
          <span className="plv-status-icon">{cfg.icon}</span>
          <div>
            <span className="plv-status-label" style={{ color: cfg.color }}>{cfg.label}</span>
            {status?.rejectionReason && (
              <p className="plv-rejection-reason">{status.rejectionReason}</p>
            )}
          </div>
          {currentStatus === 'verified' && (
            <span className="plv-verified-badge">✓ Verified Business</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="plv-form">
          {/* Step 1: Map */}
          <div className="plv-section">
            <div className="plv-section-title">
              <span className="plv-step-num">1</span>
              Pin Your Location on Map
            </div>
            <p className="plv-hint">Click anywhere on the map to drop a pin, or use auto-detect.</p>

            <button
              type="button"
              className="plv-btn plv-btn-detect"
              onClick={detectLocation}
              disabled={detecting}
            >
              {detecting ? '🔄 Detecting...' : '🎯 Auto-Detect My Location'}
            </button>

            <div className="plv-map-wrapper">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={14}
                className="plv-map"
                ref={mapRef}
                key={`${mapCenter.lat}-${mapCenter.lng}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onLocationSelect={handleMapSelect} />
                {coords && <Marker position={[coords.lat, coords.lng]} />}
              </MapContainer>
            </div>

            {coords && (
              <div className="plv-coords-display">
                <span>📌 Lat: <strong>{coords.lat.toFixed(6)}</strong></span>
                <span>Lng: <strong>{coords.lng.toFixed(6)}</strong></span>
              </div>
            )}
          </div>

          {/* Step 2: Address Form */}
          <div className="plv-section">
            <div className="plv-section-title">
              <span className="plv-step-num">2</span>
              Enter Business Address
            </div>

            <div className="plv-field">
              <label>Full Address *</label>
              <textarea
                className="plv-textarea"
                placeholder="Shop No. 12, Main Road, Bachupally..."
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="plv-row">
              <div className="plv-field">
                <label>City *</label>
                <input
                  type="text"
                  className="plv-input"
                  placeholder="Hyderabad"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div className="plv-field">
                <label>State</label>
                <input
                  type="text"
                  className="plv-input"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                />
              </div>
              <div className="plv-field">
                <label>Pincode</label>
                <input
                  type="text"
                  className="plv-input"
                  placeholder="500090"
                  value={form.pincode}
                  onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Address Proof */}
          <div className="plv-section">
            <div className="plv-section-title">
              <span className="plv-step-num">3</span>
              Upload Address Proof <span className="plv-optional">(Optional)</span>
            </div>
            <p className="plv-hint">Utility bill, rent agreement, or any official document showing your address.</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="plv-file-input"
              onChange={e => setAddressProof(e.target.files[0])}
            />
            {addressProof && (
              <p className="plv-file-name">📎 {addressProof.name}</p>
            )}
            {status?.addressProof && !addressProof && (
              <p className="plv-existing-file">
                Previously uploaded: <a href={`${API}${status.addressProof}`} target="_blank" rel="noreferrer">View Document</a>
              </p>
            )}
          </div>

          {error && <div className="plv-error">{error}</div>}
          {success && <div className="plv-success">{success}</div>}

          <button
            type="submit"
            className="plv-btn plv-btn-submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : currentStatus === 'not_submitted' ? 'Submit for Verification' : 'Update & Resubmit'}
          </button>
        </form>
      </div>
    </div>
  );
}
