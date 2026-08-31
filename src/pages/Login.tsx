import { useState } from 'react';
import type { User } from '../types/bucket';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string; general?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!isLoginTab && !username.trim()) {
      newErrors.username = 'Username is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLoginTab) {
      // Simulate Login
      // Seed a default user session
      const loggedUser: User = {
        email: email.toLowerCase(),
        username: email.split('@')[0],
        bio: 'Explorer of life, collector of experiences. Let\'s check off this list!',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      };
      
      // If mock user login with credentials
      if (email.toLowerCase() === 'explorer@dreamquest.com') {
        loggedUser.username = 'DreamExplorer';
        loggedUser.bio = 'Seeking adventures around the globe. Life is short, let\'s explore!';
      }
      
      onLoginSuccess(loggedUser);
    } else {
      // Simulate Register
      const newUser: User = {
        email: email.toLowerCase(),
        username: username.trim(),
        bio: 'Just joined the quest! Tracking my life goals and bucket list items.',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
      };
      onLoginSuccess(newUser);
    }
  };

  const handleFillDemo = () => {
    setEmail('explorer@dreamquest.com');
    setPassword('password123');
    setIsLoginTab(true);
    setErrors({});
  };

  return (
    <div className="login-container fade-in">
      <div className="login-brand-header">
        <div className="login-logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="login-brand-title">DreamQuest</h1>
        <p className="login-brand-subtitle">Track your life goals, build your legacy.</p>
      </div>

      <div className="glass-panel login-card">
        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${isLoginTab ? 'login-active-tab' : ''}`}
            onClick={() => {
              setIsLoginTab(true);
              setErrors({});
            }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${!isLoginTab ? 'login-active-tab' : ''}`}
            onClick={() => {
              setIsLoginTab(false);
              setErrors({});
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g. DreamExplorer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="text"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            {isLoginTab ? 'Enter DreamQuest' : 'Create Account'}
          </button>
        </form>

        {isLoginTab && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>OR</span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>
            </div>
            <button className="btn btn-secondary login-demo-btn" onClick={handleFillDemo}>
              ⚡ Quick Demo Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
