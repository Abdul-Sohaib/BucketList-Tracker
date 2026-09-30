import { useState } from 'react';
import type { User } from '../types/bucket';
import CompassEmblem from './CompassEmblem';

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  user: User | null;
  onLogout: () => void;
}

const getCleanDisplayName = (u: User | null): string => {
  if (!u) return 'Elena Vance';
  if (u.preferred_username && u.preferred_username.trim()) {
    return u.preferred_username.trim();
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.username || '');
  if (u.username && !isUuid) {
    return u.username.trim();
  }
  if (u.email) {
    return u.email.split('@')[0];
  }
  return 'Elena Vance';
};

export default function Navbar({ currentRoute, setRoute, user, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const displayName = getCleanDisplayName(user);
  const avatarUrl = user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRFpEHAdtVSPlvvfDTmOQFG6uIg7bxVFr90WYN-XU6-sep49l7iTqnGuhLYVg56evbuBptsgAjw4IzI8-DIoj4DYI-Ow-zBptWg1fjGX-mcdY7XQvzypVauAxEmN2f2C9q9dV1R2Fk1RvIZfJ7mvWrIRhJZRAKBO2L6LfrYqeE3t_HRXhCsI4WDUFM1IYaiD-VMK0PdTDtTdEa2kSfpSjeM1ChA6lG5VWYb9yABf0NYOyzCvPpke5';

  const handleNav = (route: string) => {
    setRoute(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="dq-header">
        <div className="dq-header-container">
          {/* Brand Logo & Editorial Title */}
          <div className="dq-brand" onClick={() => handleNav('dashboard')}>
            <CompassEmblem size={32} />
            <div className="dq-brand-info">
              <span className="dq-brand-title">DreamQuest</span>
              <span className="dq-brand-subtitle">Life Journey &amp; Vault</span>
            </div>
          </div>

          {/* Desktop Navigation Pills */}
          <nav className="dq-nav-pills" aria-label="Main Navigation">
            <a
              href="#dashboard"
              onClick={(e) => { e.preventDefault(); handleNav('dashboard'); }}
              className={`dq-nav-item ${currentRoute === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </a>
            <a
              href="#create"
              onClick={(e) => { e.preventDefault(); handleNav('create'); }}
              className={`dq-nav-item ${currentRoute === 'create' ? 'active' : ''}`}
            >
              Add Dream
            </a>
            <a
              href="#profile"
              onClick={(e) => { e.preventDefault(); handleNav('profile'); }}
              className={`dq-nav-item ${currentRoute === 'profile' ? 'active' : ''}`}
            >
              Profile &amp; Vault
            </a>
          </nav>

          {/* Header Right Actions */}
          <div className="dq-header-actions">

            {/* Profile Avatar Pill */}
            <div
              className="dq-user-profile-badge"
              onClick={() => handleNav('profile')}
              title="View Explorer Dossier"
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="dq-avatar-img"
              />
              <div className="dq-user-meta">
                <span className="dq-user-name">{displayName}</span>
                <span className="dq-user-rank">Master Voyager</span>
              </div>
            </div>

            {/* Exit / Logout Action */}
            <button
              type="button"
              className="dq-exit-btn"
              onClick={onLogout}
              title="Exit Ledger Terminal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              <span>Exit</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className="dq-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="dq-mobile-drawer">
          <a
            href="#dashboard"
            onClick={(e) => { e.preventDefault(); handleNav('dashboard'); }}
            className={`dq-nav-item ${currentRoute === 'dashboard' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
            Dashboard
          </a>
          <a
            href="#create"
            onClick={(e) => { e.preventDefault(); handleNav('create'); }}
            className={`dq-nav-item ${currentRoute === 'create' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            Add Dream
          </a>
          <a
            href="#profile"
            onClick={(e) => { e.preventDefault(); handleNav('profile'); }}
            className={`dq-nav-item ${currentRoute === 'profile' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_circle</span>
            Profile &amp; Vault
          </a>
          <button
            type="button"
            className="dq-nav-item"
            style={{ color: 'var(--error)', marginTop: '0.5rem', justifyContent: 'flex-start', width: '100%', background: 'transparent', border: 'none' }}
            onClick={onLogout}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            Exit Terminal
          </button>
        </div>
      )}
    </>
  );
}
