import { useState, useEffect } from 'react';
import type { User, BucketItem } from '../types/bucket';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';

interface ProfileProps {
  user: User | null;
  items: BucketItem[];
  onUpdateProfile: (updatedUser: User) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80', // Default Explorer Male
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', // Explorer Female
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80', // Corporate / Sleek
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', // Casual Female
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', // Adventurer Male
];

// Helper to extract a friendly display name (never showing raw Cognito UUIDs)
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

export default function Profile({ user, items, onUpdateProfile }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(getCleanDisplayName(user));
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  // Keep state in sync whenever user prop changes
  useEffect(() => {
    if (user) {
      setUsername(getCleanDisplayName(user));
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || AVATAR_OPTIONS[0]);
    }
  }, [user]);

  // Query Cognito attributes directly on component mount to guarantee latest preferred_username
  useEffect(() => {
    let isMounted = true;
    const loadAttributes = async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (isMounted && attrs.preferred_username) {
          const pref = attrs.preferred_username.trim();
          setUsername(pref);
          if (user && user.preferred_username !== pref) {
            onUpdateProfile({
              ...user,
              preferred_username: pref,
              username: pref,
            });
          }
        }
      } catch (err) {
        console.warn('Could not load Cognito user attributes in Profile:', err);
      }
    };

    loadAttributes();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const displayName = getCleanDisplayName(user);

  // Derive stats
  const total = items.length;
  const completed = items.filter(item => item.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by category to find favorite category
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let primaryFocus = 'None';
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    const num = typeof count === 'number' ? count : Number(count) || 0;
    if (num > maxCount) {
      maxCount = num;
      primaryFocus = cat;
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    try {
      try {
        await updateUserAttributes({
          userAttributes: {
            preferred_username: username.trim(),
          },
        });
      } catch (err) {
        console.warn('Could not update preferred_username in Cognito:', err);
      }

      onUpdateProfile({
        ...user,
        username: username.trim(),
        preferred_username: username.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      setIsEditing(false);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    }
  };

  return (
    <div className="profile-container fade-in">
      <div className="profile-grid">
        
        {/* Left Side: Profile Card & Bio */}
        <div className="profile-col-left">
          <div className="glass-panel profile-card-content">
            
            {!isEditing ? (
              // Normal View Mode
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                <img src={user.avatarUrl} alt={displayName} className="profile-large-avatar" />
                <h2 className="profile-name">{displayName}</h2>
                <span className="profile-email">{user.email}</span>
                <span className="profile-joined">Member since {user.joinedDate}</span>
                
                <div className="profile-divider"></div>
                
                <h4 className="profile-section-title" style={{ textAlign: 'center' }}>My Biography</h4>
                <p className="profile-bio-text">{user.bio || "No biography provided yet. Edit your profile to tell your story!"}</p>
                
                <button 
                  className="btn btn-secondary profile-edit-btn" 
                  onClick={() => {
                    setUsername(getCleanDisplayName(user));
                    setBio(user.bio);
                    setAvatarUrl(user.avatarUrl);
                    setIsEditing(true);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            ) : (
              // Edit Form Mode
              <form onSubmit={handleSave} className="profile-form">
                <h3 className="profile-form-title">Edit Settings</h3>
                
                {/* Choose Avatar */}
                <div className="form-group">
                  <label className="form-label">Select Avatar</label>
                  <div className="profile-avatar-selection">
                    {AVATAR_OPTIONS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Avatar Option"
                        onClick={() => setAvatarUrl(url)}
                        className={`profile-avatar-option ${avatarUrl === url ? 'profile-active-avatar' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  {error && <span className="form-error">{error}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bio">Biography</label>
                  <textarea
                    id="bio"
                    className="form-input profile-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your dreams..."
                  />
                </div>

                <div className="profile-form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary profile-form-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(getCleanDisplayName(user));
                      setBio(user.bio);
                      setAvatarUrl(user.avatarUrl);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary profile-form-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Stats Details */}
        <div className="profile-col-right">
          <div className="glass-panel profile-stats-card">
            <h3 className="progress-header" style={{ marginBottom: '24px' }}>Adventure Statistics</h3>
            
            <div className="profile-analytics-grid" style={{ marginBottom: '24px' }}>
              <div className="profile-analytic-box">
                <span className="profile-analytic-label">Dreams Completed</span>
                <span className="profile-analytic-val" style={{ color: 'var(--color-success)' }}>{completed}</span>
              </div>
              <div className="profile-analytic-box">
                <span className="profile-analytic-label">Pending Quests</span>
                <span className="profile-analytic-val" style={{ color: 'var(--color-info)' }}>{active}</span>
              </div>
              <div className="profile-analytic-box">
                <span className="profile-analytic-label">Total Tracked</span>
                <span className="profile-analytic-val">{total}</span>
              </div>
              <div className="profile-analytic-box">
                <span className="profile-analytic-label">Achievement Rate</span>
                <span className="profile-analytic-val" style={{ color: 'var(--color-success)' }}>{completionRate}%</span>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div style={{ marginBottom: '24px' }}>
              <h4 className="profile-section-title" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Primary Focus Category</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.15)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 22 22 22" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>{primaryFocus}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on {maxCount} list item{maxCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', borderLeft: '4px solid var(--color-secondary)', borderRadius: '0 12px 12px 0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', color: '#d1d5db', lineHeight: '1.5' }}>
                "The biggest adventure you can take is to live the life of your dreams."
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>— Oprah Winfrey</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
