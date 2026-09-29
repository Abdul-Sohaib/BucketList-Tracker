import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  submessage?: string;
  compact?: boolean;
}

const DYNAMIC_MESSAGES = [
  'Gathering your life aspirations...',
  'Connecting to your personal dream vault...',
  'Curating milestones and moments...',
  'Aligning horizons and adventures...',
  'Polishing your life journey roadmap...',
  'Almost ready to make it happen...',
];

export default function LoadingSpinner({
  fullScreen = false,
  message,
  submessage,
  compact = false,
}: LoadingSpinnerProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (message) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % DYNAMIC_MESSAGES.length);
        setFade(true);
      }, 250);
    }, 2400);

    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DYNAMIC_MESSAGES[msgIndex];

  if (compact) {
    return (
      <div className="dynamic-loader-compact" role="status" aria-label="Loading">
        <div className="loader-compact-ring">
          <div className="loader-compact-dot" />
        </div>
        {activeMessage && <span className="loader-compact-text">{activeMessage}</span>}
      </div>
    );
  }

  return (
    <div
      className={`dynamic-loader-wrapper ${fullScreen ? 'loader-fullscreen' : 'loader-inline'}`}
      role="status"
      aria-label="Loading dream list"
    >
      {/* Ambient background glow aura */}
      <div className="loader-ambient-glow" />

      {/* Dynamic kinetic core & orbital rings */}
      <div className="loader-stage-container">
        <div className="loader-orbit loader-orbit-outer">
          <div className="loader-orbiter orbiter-1" />
        </div>
        <div className="loader-orbit loader-orbit-middle">
          <div className="loader-orbiter orbiter-2" />
        </div>
        <div className="loader-orbit loader-orbit-inner">
          <div className="loader-orbiter orbiter-3" />
        </div>

        {/* Central glowing badge */}
        <div className="loader-central-badge">
          <div className="loader-central-pulse" />
          <svg
            className="loader-central-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </div>

      {/* Dynamic Content Details */}
      <div className="loader-text-area">
        <div className="loader-status-pill">
          <span className="loader-status-dot" />
          <span className="loader-status-tag">Synchronizing</span>
        </div>

        <h3 className={`loader-title ${fade ? 'fade-enter' : 'fade-exit'}`}>
          {activeMessage}
        </h3>

        <p className="loader-subcaption">
          {submessage || 'Every great chapter begins with a bold vision.'}
        </p>

        {/* Kinetic Shimmer Progress Track */}
        <div className="loader-track-bar">
          <div className="loader-track-indicator" />
        </div>
      </div>
    </div>
  );
}
