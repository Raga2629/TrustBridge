import './TrustBadge.css';

/**
 * TrustBadge — drop anywhere to show a user's trust level.
 *
 * Props:
 *   score      {number}  0–100
 *   showScore  {boolean} show numeric score (default true)
 *   size       'sm' | 'md' | 'lg'  (default 'md')
 */
export default function TrustBadge({ score = 0, showScore = true, size = 'md' }) {
  const getConfig = (s) => {
    if (s >= 70) return { level: 'High',   icon: '🛡️', color: '#16a34a', bg: '#dcfce7', border: '#86efac' };
    if (s >= 40) return { level: 'Medium', icon: '⚡', color: '#b45309', bg: '#fef9c3', border: '#fde047' };
    return           { level: 'Low',    icon: '⚠️', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' };
  };

  const cfg = getConfig(score);

  // Circular progress arc
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div
      className={`tb-badge tb-${size}`}
      style={{ background: cfg.bg, borderColor: cfg.border }}
      title={`Trust Score: ${score}/100 — ${cfg.level}`}
    >
      {/* Mini ring */}
      <svg className="tb-ring" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth="3"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>

      <span className="tb-icon">{cfg.icon}</span>

      <div className="tb-text">
        <span className="tb-level" style={{ color: cfg.color }}>{cfg.level}</span>
        {showScore && <span className="tb-score">{score}/100</span>}
      </div>
    </div>
  );
}
