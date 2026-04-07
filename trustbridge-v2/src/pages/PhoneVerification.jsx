import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/PhoneVerification.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function PhoneVerification({ onVerified, embedded = false }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'done'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Countdown
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const formatTimer = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setDevOtp('');

    if (!phone.trim()) return setError('Please enter your phone number.');

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/send-otp`, { phoneNumber: phone }, { headers });
      setStep('otp');
      setTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      setSuccess(`OTP sent to ${res.data.phoneNumber}`);
      if (res.data.otp) setDevOtp(res.data.otp);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      const wait = err.response?.data?.waitSeconds;
      setError(msg);
      if (wait) setTimer(wait);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) return setError('Please enter the complete 6-digit OTP.');

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/auth/verify-otp`,
        { phoneNumber: phone, otp: otpValue },
        { headers }
      );
      setVerifiedPhone(res.data.phoneNumber);
      setStep('done');
      onVerified?.(res.data.phoneNumber);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const wrapper = embedded ? 'pv-embedded' : 'pv-container';

  return (
    <div className={wrapper}>
      <div className={embedded ? '' : 'pv-card'}>
        {!embedded && (
          <div className="pv-header">
            <div className="pv-icon">📱</div>
            <h2 className="pv-title">Phone Verification</h2>
          </div>
        )}

        {/* ── Step: Phone ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="pv-form">
            <p className="pv-subtitle">Enter your phone number to receive a 6-digit OTP.</p>
            <div className="pv-input-group">
              <span className="pv-prefix">+91</span>
              <input
                type="tel"
                className="pv-phone-input"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={15}
                autoFocus
              />
            </div>
            {error && <p className="pv-error">{error}</p>}
            <button type="submit" className="pv-btn pv-btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── Step: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="pv-form">
            <p className="pv-subtitle">
              Enter the 6-digit code sent to <strong>{phone}</strong>
            </p>

            {devOtp && (
              <div className="pv-dev-badge">
                🛠 Dev Mode OTP: <strong>{devOtp}</strong>
              </div>
            )}

            {success && <p className="pv-success-msg">{success}</p>}

            <div className="pv-otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`pv-otp-box ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            <div className="pv-timer">
              {timer > 0 ? (
                <span>Resend OTP in <strong>{formatTimer(timer)}</strong></span>
              ) : (
                <button type="button" className="pv-resend-btn" onClick={handleSendOTP} disabled={loading}>
                  Resend OTP
                </button>
              )}
            </div>

            {error && <p className="pv-error">{error}</p>}

            <button type="submit" className="pv-btn pv-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="pv-btn pv-btn-ghost"
              onClick={() => { setStep('phone'); setError(''); setSuccess(''); }}
            >
              Change Number
            </button>
          </form>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className="pv-done">
            <div className="pv-done-icon">✅</div>
            <h3>Phone Verified!</h3>
            <p><strong>{verifiedPhone}</strong> has been successfully verified.</p>
            {!embedded && (
              <button
                className="pv-btn pv-btn-primary"
                onClick={() => window.history.back()}
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
