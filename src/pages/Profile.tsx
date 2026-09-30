import { useState, useEffect } from 'react';
import type { User, BucketItem } from '../types/bucket';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { AVATAR_ARCHETYPES } from '../utils/sampleData';

interface ProfileProps {
  user: User | null;
  items: BucketItem[];
  onUpdateProfile: (updatedUser: User) => void;
}

const getCleanDisplayName = (u: User | null): string => {
  if (!u) return 'Explorer';
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
  const [isAvatarTrayOpen, setIsAvatarTrayOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [username, setUsername] = useState(getCleanDisplayName(user));
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState('Global Wayfarer');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || AVATAR_ARCHETYPES[0].url
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeItems = items;

  const total = activeItems.length;
  const completed = activeItems.filter((i) => i.completed).length;
  const inProgress = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const urgentHighCount = activeItems.filter((i) => !i.completed && (i.priority || '').toUpperCase() === 'HIGH').length;
  const mediumCount = activeItems.filter((i) => !i.completed && (i.priority || '').toUpperCase() === 'MEDIUM').length;
  const lowCount = activeItems.filter((i) => !i.completed && (i.priority || '').toUpperCase() === 'LOW').length;

  const categoryCounts = activeItems.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category?.trim() || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  useEffect(() => {
    if (user) {
      setUsername(getCleanDisplayName(user));
      if (user.bio !== undefined) setBio(user.bio);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  // Query Cognito attributes
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
        console.warn('Could not fetch Cognito attributes:', err);
      }
    };

    loadAttributes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectAvatar = async (url: string) => {
    setAvatarUrl(url);
    if (user) {
      onUpdateProfile({
        ...user,
        avatarUrl: url,
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide a valid explorer handle.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      try {
        await updateUserAttributes({
          userAttributes: {
            preferred_username: username.trim(),
          },
        });
      } catch (attrErr) {
        console.warn('Cognito update attribute notice:', attrErr);
      }

      if (user) {
        onUpdateProfile({
          ...user,
          username: username.trim(),
          preferred_username: username.trim(),
          bio: bio.trim(),
          avatarUrl,
        });
      }

      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = getCleanDisplayName(user);
  const email = user?.email || 'No email registered';
  const memberSince = user?.joinedDate || 'Recently';
  const completedItems = activeItems.filter((i) => i.completed);

  return (
    <div className="page-wrapper fade-in">
      {/* Top Archival Dossier Card */}
      <section className="dq-card" style={{ padding: '2rem 2.5rem', position: 'relative' }}>
        <div className="dq-ambient-aura" />
        <div style={{ position: 'absolute', left: '-3rem', bottom: '-3rem', width: '16rem', height: '16rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 219, 207, 0.3) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* Avatar & User Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              {/* Main Profile Avatar with trigger */}
              <div
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setIsAvatarTrayOpen(!isAvatarTrayOpen)}
                title="Click to choose archival portrait archetype"
              >
                <div style={{ width: '112px', height: '112px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--surface-container-lowest)', boxShadow: 'var(--shadow-lg)' }}>
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  aria-label="Update Portrait"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>photo_camera</span>
                </button>
              </div>

              {/* Name, Handle & Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '38rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 className="font-headline-md" style={{ color: 'var(--primary)' }}>
                    {displayName}
                  </h1>
                  <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>
                    @{username.toLowerCase().replace(/\s+/g, '_')}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, backgroundColor: 'var(--primary-container)', color: 'var(--on-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Explorer
                  </span>
                </div>

                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
                  {bio || 'Documenting life aspirations, expeditions, and quiet personal triumphs.'}
                </p>

                {/* Metadata Badges */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--primary)' }}>calendar_today</span>
                    Member since {memberSince}
                  </span>
                  {email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>mail</span>
                      {email}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--outline)' }}>location_on</span>
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-dq-primary"
                onClick={() => setIsEditModalOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                <span>Edit Profile Info</span>
              </button>
            </div>
          </div>

          {/* Avatar Selector Tray (Collapsible Drawer) */}
          {isAvatarTrayOpen && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1.25rem',
                backgroundColor: 'var(--surface-container-low)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.5rem',
                border: '1px solid rgba(216, 228, 220, 0.8)',
              }}
              className="fade-in"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 className="font-title-lg" style={{ color: 'var(--primary)' }}>
                    Archival Expedition Portraits
                  </h2>
                  <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    Select an authenticated field avatar archetype from the naturalist archives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarTrayOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                {AVATAR_ARCHETYPES.map((archetype) => {
                  const isSelected = avatarUrl === archetype.url;
                  return (
                    <div
                      key={archetype.id}
                      onClick={() => handleSelectAvatar(archetype.url)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isSelected ? 'var(--surface-container-lowest)' : 'transparent',
                        border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: isSelected ? '2px solid var(--primary)' : '2px solid var(--outline-variant)',
                        }}
                      >
                        <img
                          src={archetype.url}
                          alt={archetype.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span
                        className="font-label-sm"
                        style={{
                          color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)',
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'center',
                        }}
                      >
                        {archetype.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Explorer Lifetime Analytics & Milestone Breakdown */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* 3 Stat Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <div className="dq-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Dreams Realized
              </span>
              <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>task_alt</span>
              </span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span className="font-display" style={{ color: 'var(--primary)', lineHeight: 1, fontSize: '42px' }}>{completed}</span>
                <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>/ {total} registered</span>
              </div>
              <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>Completed ambitions archived</p>
            </div>
          </div>

          <div className="dq-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Horizons
              </span>
              <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>explore</span>
              </span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span className="font-display" style={{ color: 'var(--secondary)', lineHeight: 1, fontSize: '42px' }}>{inProgress}</span>
                <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>in progress</span>
              </div>
              <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>Expeditions in active flight</p>
            </div>
          </div>

          <div className="dq-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Success Rate
              </span>
              <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--surface-container-high)', color: 'var(--primary)', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>insights</span>
              </span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span className="font-display" style={{ color: 'var(--primary)', lineHeight: 1, fontSize: '42px' }}>{completionRate}%</span>
                <span className="font-label-sm" style={{ color: 'var(--secondary)', fontWeight: 700 }}>{completed} of {total}</span>
              </div>
              <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>Completion index of set goals</p>
            </div>
          </div>
        </div>

        {/* Domain Ledger & Priority Urgency Radar */}
        <div className="dq-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="font-title-lg" style={{ color: 'var(--primary)' }}>Domain Ledger</h2>
              <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
                {total} Total Ambitions
              </span>
            </div>

            {/* Real Segmented Bar Chart */}
            {categoryEntries.length > 0 ? (
              <>
                <div style={{ width: '100%', height: '10px', borderRadius: '9999px', backgroundColor: 'var(--surface-container-highest)', overflow: 'hidden', display: 'flex', margin: '0.75rem 0 1rem' }}>
                  {categoryEntries.map((c, idx) => {
                    const colors = [
                      'var(--primary)',
                      'var(--secondary)',
                      'var(--on-tertiary-container)',
                      'var(--primary-fixed-dim)',
                      'var(--outline-variant)',
                    ];
                    return (
                      <div
                        key={c.category}
                        style={{ height: '100%', width: `${c.percentage}%`, backgroundColor: colors[idx % colors.length] }}
                        title={`${c.category} ${c.percentage}%`}
                      />
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {categoryEntries.map((c, idx) => {
                    const colors = [
                      'var(--primary)',
                      'var(--secondary)',
                      'var(--on-tertiary-container)',
                      'var(--primary-fixed-dim)',
                      'var(--outline-variant)',
                    ];
                    return (
                      <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="font-body-sm">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
                          {c.category}
                        </span>
                        <span className="font-label-md" style={{ fontWeight: 600, color: colors[idx % colors.length] }}>
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', margin: '1rem 0' }}>
                No categories recorded yet. Add goals in your ledger to analyze domain allocations.
              </p>
            )}
          </div>

          {/* Priority Urgency Radar */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}
          >
            <div>
              <span className="font-label-sm" style={{ color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Urgent / High</span>
              <span className="font-title-md" style={{ display: 'block', color: 'var(--secondary)' }}>{urgentHighCount} Active</span>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--outline-variant)' }} />
            <div>
              <span className="font-label-sm" style={{ color: 'var(--on-tertiary-container)', fontWeight: 700, textTransform: 'uppercase' }}>Medium</span>
              <span className="font-title-md" style={{ display: 'block', color: 'var(--on-tertiary-container)' }}>{mediumCount} In Flight</span>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--outline-variant)' }} />
            <div>
              <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Steady / Low</span>
              <span className="font-title-md" style={{ display: 'block', color: 'var(--primary)' }}>{lowCount} Horizon</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Vault of Realized Dreams (Timeline Section) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '24px' }}>workspace_premium</span>
              <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', fontWeight: 700 }}>
                Physical Ledger Records
              </span>
            </div>
            <h2 className="font-headline-md" style={{ color: 'var(--primary)' }}>
              The Vault of Realized Dreams
            </h2>
          </div>
          <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', maxWidth: '24rem' }}>
            Archived triumphs sealed with golden wax stamps, preserved reflections, and milestone artifacts.
          </p>
        </div>

        {/* Real Timeline Cards */}
        {completedItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedItems.map((item) => (
              <article key={item.id} className="dq-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary-fixed)' }}>check_circle</span>
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="dq-badge-category">{item.category || 'General'}</span>
                      {item.targetDate && (
                        <span className="font-label-sm" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified</span>
                          {new Date(item.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-sm" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <blockquote style={{ margin: '0.5rem 0', padding: '0.75rem 1rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', fontStyle: 'italic', color: 'var(--on-surface)', lineHeight: 1.5 }} className="font-body-sm">
                        “{item.description}”
                      </blockquote>
                    )}
                    {item.targetDate && (
                      <span className="font-label-md" style={{ color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>event_available</span>
                        Accomplished: {new Date(item.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dq-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--outline)', marginBottom: '0.5rem' }}>
              lock_clock
            </span>
            <h3 className="font-title-lg" style={{ color: 'var(--primary)' }}>
              No Realized Dreams Yet
            </h3>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '420px', margin: '0.35rem auto' }}>
              When you achieve and mark aspirations complete in your ledger, their archived certificates and field reflections will be preserved here.
            </p>
          </div>
        )}
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(3, 37, 29, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          className="fade-in"
        >
          <div className="dq-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 className="font-headline-sm" style={{ color: 'var(--primary)' }}>
                Edit Explorer Profile
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div className="dq-form-group">
                <label className="dq-form-label">Explorer Handle</label>
                <input
                  type="text"
                  className="dq-input-text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  required
                />
              </div>

              <div className="dq-form-group">
                <label className="dq-form-label">Field Station Location</label>
                <input
                  type="text"
                  className="dq-input-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Boulder, Colorado"
                />
              </div>

              <div className="dq-form-group">
                <label className="dq-form-label">Personal Monograph Bio</label>
                <textarea
                  rows={3}
                  className="dq-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your fellow wayfarers about your journeys..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-dq-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-dq-primary"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
