import { useState, useEffect } from 'react';
import axios from 'axios';
import TrustBadge from '../components/TrustBadge';
import '../styles/TrustScorePage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MILESTONES = [
  { score: 5,  label: 'Account Created',       icon: '👤', done: (s) => s >= 5  },
  { score: 15, label: 'Phone Verified (+10)',   icon: '📱', done: (s) => s >= 15 },
  { score: 35, label: 'Identity Verified (+20)',icon: '🪪', done: (s) => s >= 35 },
  { score: 45, label: 'Location Verified (+10)',icon: '📍', done: (s) => s >= 45 },
  { score: 55, label: 'First Review (+10)',     icon: '⭐', done: (s) => s >= 55 },
  { score: 70, label: 'Booking Completed (+15)',icon: '✅', done: (s) => s >= 70 },
  { score: 100,label: 'Full Trust Achieved',   icon: '🏆', done: (s) => s >= 100 }
];

const HOW_TO_EARN = [
  { action: 'Verify your identity (ID + Selfie)', points: '+20', icon: '🪪', path: '/identity-verification' },
  { action: 'Verify your phone number',           points: '+10', icon: '📱', path: '/phone-verification' },
  { action: 'Verify business location',           points: '+10', icon: '📍', path: '/provider/location-verification' },
  { action: 'Post a genuine review',              points: '+10', icon: '⭐', path: '/services' },
  { action: 'Complete a booking',                 points: '+15', icon: '✅', path: '/my-bookings' }
];

const HOW_TO_LOSE = [
  { action: 'Receive a community report', points: '-20', icon: '🚩' },
  { action: 'Spam review detected',       points: '-30', icon: '🤖' }
];

export default function TrustScorePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/api/trust/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load trust score.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ts-loading">Loading trust score...</div>;
  if (error)   return <div className="ts-error">{error}</div>;

  const { trustScore, trustLevel, breakdown } = data;

  // Gauge arc
  const radius = 70;
  const circumference = Math.PI * radius; // half circle
  const progress = (trustScore / 100) * circumference;

  const levelColors = { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444' };
  const arcColor = levelColors[trustLevel] || '#6366f1';

  return (
    <div className="ts-container">
      <div className="ts-card ts-main-card">
        {/* Gauge */}
        <div className="ts-gauge-wrapper">
          <svg viewBox="0 0 180 100" className="ts-gauge-svg">
            {/* Background arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 170 90"
              fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 170 90"
              fill="none"
              stroke={arcColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`}
            />
          </svg>
          <div className="ts-gauge-center">
            <span className="ts-score-num" style={{ color: arcColor }}>{trustScore}</span>
            <span className="ts-score-label">/ 100</span>
          </div>
        </div>

        <TrustBadge score={trustScore} size="lg" />

        <p className="ts-breakdown-desc">{breakdown.description}</p>

        {/* Level zones */}
        <div className="ts-zones">
          {[
            { label: 'Low',    range: '0–39',  color: '#ef4444', bg: '#fee2e2' },
            { label: 'Medium', range: '40–69', color: '#f59e0b', bg: '#fef9c3' },
            { label: 'High',   range: '70–100',color: '#22c55e', bg: '#dcfce7' }
          ].map(z => (
            <div
              key={z.label}
              className={`ts-zone ${trustLevel === z.label ? 'ts-zone-active' : ''}`}
              style={{ background: z.bg, borderColor: z.color }}
            >
              <span style={{ color: z.color, fontWeight: 700 }}>{z.label}</span>
              <span className="ts-zone-range">{z.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="ts-card">
        <h3 className="ts-section-title">🏁 Your Progress</h3>
        <div className="ts-milestones">
          {MILESTONES.map((m, i) => {
            const done = m.done(trustScore);
            return (
              <div key={i} className={`ts-milestone ${done ? 'done' : ''}`}>
                <div className="ts-milestone-icon">{done ? '✅' : m.icon}</div>
                <div className="ts-milestone-info">
                  <span className="ts-milestone-label">{m.label}</span>
                  <span className="ts-milestone-score">Score needed: {m.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="ts-card">
        <h3 className="ts-section-title">📈 How to Increase Your Score</h3>
        <div className="ts-action-list">
          {HOW_TO_EARN.map((item, i) => (
            <a key={i} href={item.path} className="ts-action-item ts-earn">
              <span className="ts-action-icon">{item.icon}</span>
              <span className="ts-action-label">{item.action}</span>
              <span className="ts-action-points ts-earn-pts">{item.points}</span>
            </a>
          ))}
        </div>
      </div>

      {/* How to lose */}
      <div className="ts-card">
        <h3 className="ts-section-title">📉 What Reduces Your Score</h3>
        <div className="ts-action-list">
          {HOW_TO_LOSE.map((item, i) => (
            <div key={i} className="ts-action-item ts-lose">
              <span className="ts-action-icon">{item.icon}</span>
              <span className="ts-action-label">{item.action}</span>
              <span className="ts-action-points ts-lose-pts">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
