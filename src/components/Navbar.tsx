import { useState } from 'react';
import type { User } from '../types/bucket';

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  user: User | null;
  onLogout: () => void;
}

const getCleanDisplayName = (u: User | null): string => {
  if (!u) return '';
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
  return 'Explorer';
};

export default function Navbar({ currentRoute, setRoute, user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null; // Don't show navbar if user is not logged in

  const displayName = getCleanDisplayName(user);

  const handleNavClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    setRoute(route);
    setIsMenuOpen(false); // Close mobile menu on click
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={(e) => handleNavClick(e, 'dashboard')}>
          <div className="navbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="navbar-brand-text">DreamQuest</span>
        </div>

        {/* Links Navigation */}
        <div className={`navbar-links ${isMenuOpen ? 'navbar-links-open' : ''}`}>
          <a
            href="#dashboard"
            onClick={(e) => handleNavClick(e, 'dashboard')}
            className={`navbar-link ${currentRoute === 'dashboard' ? 'navbar-link-active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Dashboard
          </a>

          <a
            href="#create"
            onClick={(e) => handleNavClick(e, 'create')}
            className={`navbar-link ${currentRoute === 'create' ? 'navbar-link-active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Dream
          </a>

          <a
            href="#profile"
            onClick={(e) => handleNavClick(e, 'profile')}
            className={`navbar-link ${currentRoute === 'profile' ? 'navbar-link-active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </a>
        </div>

        {/* User Info, Logout & Hamburger Toggle */}
        <div className="navbar-user-section">
          <div className="navbar-user-info" onClick={(e) => handleNavClick(e, 'profile')}>
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
              alt={displayName}
              className="navbar-avatar"
            />
            <span className="navbar-username">{displayName}</span>
          </div>

          <button
            className="btn btn-secondary navbar-logout-btn"
            onClick={onLogout}
            title="Log out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Exit</span>
          </button>

          {/* Hamburger Trigger for Mobile */}
          <button
            className="navbar-hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
