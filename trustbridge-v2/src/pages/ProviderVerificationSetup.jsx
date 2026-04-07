import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneVerification from './PhoneVerification';
import '../styles/ProviderVerificationSetup.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProviderVerificationSetup() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({ phone: false, identity: false });

  // Identity state
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');
  const [identityResult, setIdentityResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check if already verified on mount
  useEffect(() => {
    axios.get(`${API}/api/identity-verification/status`, { headers })
      .then(res => {
        if (res.data?.verificationStatus === 'verified') {
          setCompletedSteps({ phone: true, identity: true });
          setStep(3);
        }
      })
      .catch(() => {});
  }, []);

  // Camera handlers
  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setIdentityError('Camera access denied.');
      setCameraOpen(false);
    }
  };

  const captureSelfie = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
    }, 'image/jpeg');
    stopCamera();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleIdentitySubmit = async () => {
    setIdentityError('');
    if (!idFile) return setIdentityError('Upload your Government ID.');
    if (!selfieBlob) return setIdentityError('Capture a selfie.');

    const formData = new FormData();
    formData.append('idImage', idFile);
    formData.append('selfieImage', selfieBlob, 'selfie.jpg');
    setIdentityLoading(true);
    try {
      const res = await axios.post(`${API}/api/identity-verification/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setIdentityResult(res.data);
      if (res.data.verificationStatus === 'verified') {
        setCompletedSteps(s => ({ ...s, identity: true }));
        setTimeout(() => setStep(3), 1200);
      }
    } catch (err) {
      setIdentityError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIdentityLoading(false);
    }
  };

  return (
    <div className="pvs-container">
      <div className="pvs-card">
        {/* Header */}
        <div className="pvs-header">
          <h2>🏪 Provider Verification</h2>
          <p>Complete these steps to start posting services on TrustBridge.</p>
        </div>

        {/* Stepper */}
        <div className="pvs-stepper">
          {[
            { num: 1, label: 'Phone', icon: '📱' },
            { num: 2, label: 'Identity', icon: '🪪' },
            { num: 3, label: 'Ready', icon: '🎉' }
          ].map((s, i) => (
            <div key={s.num} className="pvs-step-wrapper">
              <div className={`pvs-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
                <span className="pvs-step-icon">{step > s.num ? '✅' : s.icon}</span>
                <span className="pvs-step-label">{s.label}</span>
              </div>
              {i < 2 && <div className={`pvs-connector ${step > s.num ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Phone — uses the reusable PhoneVerification component */}
        {step === 1 && (
          <div className="pvs-body">
            <h3 className="pvs-step-title">📱 Verify Your Phone Number</h3>
            <p className="pvs-step-desc">We'll send a one-time code to confirm your number.</p>
            <PhoneVerification
              embedded={true}
              onVerified={() => {
                setCompletedSteps(s => ({ ...s, phone: true }));
                setStep(2);
              }}
            />
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <div className="pvs-body">
            <h3 className="pvs-step-title">🪪 Verify Your Identity</h3>
            <p className="pvs-step-desc">Upload your Government ID and take a live selfie.</p>

            <div className="pvs-id-section">
              <label className="pvs-label">Government ID (Aadhaar / Passport / DL)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="pvs-file-input"
                onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setIdFile(f);
                  setIdPreview(URL.createObjectURL(f));
                }}
              />
              {idPreview && (
                <div className="pvs-preview">
                  <img src={idPreview} alt="ID" />
                  <span className="pvs-check">✓ ID uploaded</span>
                </div>
              )}
            </div>

            <div className="pvs-selfie-section">
              <label className="pvs-label">Live Selfie</label>
              {!cameraOpen && !selfiePreview && (
                <button className="pvs-btn pvs-btn-secondary" onClick={openCamera}>
                  📷 Open Camera
                </button>
              )}
              {cameraOpen && (
                <div className="pvs-camera">
                  <video ref={videoRef} autoPlay playsInline className="pvs-video" />
                  <div className="pvs-camera-btns">
                    <button className="pvs-btn pvs-btn-primary" onClick={captureSelfie}>📸 Capture</button>
                    <button className="pvs-btn pvs-btn-danger" onClick={stopCamera}>Cancel</button>
                  </div>
                </div>
              )}
              {selfiePreview && (
                <div className="pvs-preview">
                  <img src={selfiePreview} alt="Selfie" />
                  <span className="pvs-check">✓ Selfie captured</span>
                  <button className="pvs-btn pvs-btn-ghost pvs-retake" onClick={openCamera}>Retake</button>
                </div>
              )}
            </div>

            {identityError && <p className="pvs-error">{identityError}</p>}

            {identityResult && (
              <div className={`pvs-result ${identityResult.verificationStatus}`}>
                <span>{identityResult.verificationStatus === 'verified' ? '✅' : '❌'}</span>
                <span>{identityResult.message}</span>
                <span>Match: <strong>{identityResult.matchScore}%</strong></span>
              </div>
            )}

            <button
              className="pvs-btn pvs-btn-primary"
              onClick={handleIdentitySubmit}
              disabled={identityLoading}
            >
              {identityLoading ? 'Verifying...' : 'Submit for Verification'}
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="pvs-body pvs-done">
            <div className="pvs-done-icon">🎉</div>
            <h3>You're Verified!</h3>
            <p>Both your phone and identity have been verified. You can now post services on TrustBridge.</p>
            <div className="pvs-done-checks">
              <div className="pvs-done-item">✅ Phone Verified</div>
              <div className="pvs-done-item">✅ Identity Verified</div>
            </div>
            <button
              className="pvs-btn pvs-btn-primary"
              onClick={() => navigate('/provider/dashboard')}
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
