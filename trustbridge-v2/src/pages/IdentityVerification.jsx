import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/IdentityVerification.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function IdentityVerification() {
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [status, setStatus] = useState(null); // existing status from DB
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Load existing status on mount
  useEffect(() => {
    axios.get(`${API}/api/identity-verification/status`, { headers })
      .then(res => setStatus(res.data))
      .catch(() => {});
  }, []);

  // Handle ID file selection
  const handleIdChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
  };

  // Open camera
  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Camera access denied. Please allow camera permission.');
      setCameraOpen(false);
    }
  };

  // Capture selfie from video
  const captureSelfie = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
    }, 'image/jpeg');
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!idFile) return setError('Please upload your Government ID.');
    if (!selfieBlob) return setError('Please capture a selfie.');

    const formData = new FormData();
    formData.append('idImage', idFile);
    formData.append('selfieImage', selfieBlob, 'selfie.jpg');

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/identity-verification/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    verified: '#22c55e',
    rejected: '#ef4444',
    pending: '#f59e0b',
    not_submitted: '#94a3b8'
  };

  return (
    <div className="iv-container">
      <div className="iv-card">
        <h2 className="iv-title">Identity Verification</h2>
        <p className="iv-subtitle">Upload your Government ID and take a live selfie to verify your identity.</p>

        {/* Existing status banner */}
        {status && status.verificationStatus !== 'not_submitted' && (
          <div className="iv-status-banner" style={{ borderColor: statusColor[status.verificationStatus] }}>
            <span className="iv-status-dot" style={{ background: statusColor[status.verificationStatus] }} />
            <span>Status: <strong>{status.verificationStatus?.toUpperCase()}</strong></span>
            {status.matchScore && <span> &mdash; Match Score: <strong>{status.matchScore}%</strong></span>}
            {status.rejectionReason && <p className="iv-rejection">{status.rejectionReason}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="iv-form">
          {/* Step 1: ID Upload */}
          <div className="iv-step">
            <label className="iv-label">Step 1: Upload Government ID (Aadhaar / Passport / Driving License)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleIdChange}
              className="iv-file-input"
            />
            {idPreview && (
              <div className="iv-preview">
                <img src={idPreview} alt="ID Preview" />
                <span className="iv-check">✓ ID uploaded</span>
              </div>
            )}
          </div>

          {/* Step 2: Selfie */}
          <div className="iv-step">
            <label className="iv-label">Step 2: Take a Live Selfie</label>
            {!cameraOpen && !selfiePreview && (
              <button type="button" className="iv-btn iv-btn-secondary" onClick={openCamera}>
                📷 Open Camera
              </button>
            )}
            {cameraOpen && (
              <div className="iv-camera">
                <video ref={videoRef} autoPlay playsInline className="iv-video" />
                <div className="iv-camera-actions">
                  <button type="button" className="iv-btn iv-btn-primary" onClick={captureSelfie}>
                    📸 Capture
                  </button>
                  <button type="button" className="iv-btn iv-btn-danger" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {selfiePreview && (
              <div className="iv-preview">
                <img src={selfiePreview} alt="Selfie Preview" />
                <span className="iv-check">✓ Selfie captured</span>
                <button type="button" className="iv-btn iv-btn-secondary iv-retake" onClick={openCamera}>
                  Retake
                </button>
              </div>
            )}
          </div>

          {error && <p className="iv-error">{error}</p>}

          <button type="submit" className="iv-btn iv-btn-primary iv-submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Submit for Verification'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`iv-result ${result.verificationStatus}`}>
            <div className="iv-result-icon">
              {result.verificationStatus === 'verified' ? '✅' : '❌'}
            </div>
            <h3>{result.message}</h3>
            <p>Match Score: <strong>{result.matchScore}%</strong></p>
            {result.rejectionReason && <p className="iv-rejection">{result.rejectionReason}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
