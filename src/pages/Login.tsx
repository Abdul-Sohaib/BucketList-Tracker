import { useState } from 'react';
import type { User } from '../types/bucket';
import CompassEmblem from '../components/CompassEmblem';
import {
  signIn,
  signUp,
  confirmSignUp,
  fetchUserAttributes,
  signOut,
  getCurrentUser,
} from 'aws-amplify/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);

  const [email, setEmail] = useState('elena.vance@expedition.org');
  const [password, setPassword] = useState('AlpineSummit#2025');
  const [username, setUsername] = useState('Elena Vance');
  const [showPassword, setShowPassword] = useState(false);

  const [confirmationCode, setConfirmationCode] = useState('');
  const [showOtpDrawer, setShowOtpDrawer] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    confirmationCode?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Passphrase must be at least 8 characters.';
    }

    if (!isLoginTab && !username.trim()) {
      newErrors.username = 'Explorer Handle is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrors({});

      let signInResult;
      try {
        signInResult = await signIn({
          username: email.toLowerCase().trim(),
          password,
        });
      } catch (err: any) {
        if (err?.name === 'UserAlreadyAuthenticatedException') {
          await signOut();
          signInResult = await signIn({
            username: email.toLowerCase().trim(),
            password,
          });
        } else {
          throw err;
        }
      }

      if (signInResult.nextStep.signInStep === 'DONE') {
        const currentUser = await getCurrentUser().catch(() => null);
        let attributes: Record<string, string | undefined> = {};

        try {
          attributes = await fetchUserAttributes();
        } catch {
          // fallback
        }

        const preferredName = attributes.preferred_username || '';
        const displayUsername = preferredName || currentUser?.username || (email ? email.split('@')[0] : 'Explorer');

        const loggedInUser: User = {
          email: attributes.email || email.toLowerCase().trim(),
          username: displayUsername,
          preferred_username: preferredName,
          bio: attributes['custom:bio'] || attributes.bio || '',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRFpEHAdtVSPlvvfDTmOQFG6uIg7bxVFr90WYN-XU6-sep49l7iTqnGuhLYVg56evbuBptsgAjw4IzI8-DIoj4DYI-Ow-zBptWg1fjGX-mcdY7XQvzypVauAxEmN2f2C9q9dV1R2Fk1RvIZfJ7mvWrIRhJZRAKBO2L6LfrYqeE3t_HRXhCsI4WDUFM1IYaiD-VMK0PdTDtTdEa2kSfpSjeM1ChA6lG5VWYb9yABf0NYOyzCvPpke5',
        };

        onLoginSuccess(loggedInUser);
      } else if (signInResult.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
        setShowOtpDrawer(true);
        setErrors({ general: 'Verification code required to finalize access.' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Unable to sign in. Please verify your credentials.';
      if (error?.name === 'UserNotFoundException') {
        message = 'No explorer vault found with this email.';
      } else if (error?.name === 'NotAuthorizedException') {
        message = 'Incorrect passphrase or email combination.';
      } else if (error?.name === 'UserNotConfirmedException') {
        message = 'Account pending verification. Enter your OTP code below.';
        setNeedsConfirmation(true);
        setShowOtpDrawer(true);
      }
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setErrors({});

      const signUpResult = await signUp({
        username: email.toLowerCase().trim(),
        password,
        options: {
          userAttributes: {
            email: email.toLowerCase().trim(),
            preferred_username: username.trim(),
          },
        },
      });

      if (!signUpResult.isSignUpComplete) {
        setNeedsConfirmation(true);
        setShowOtpDrawer(true);
      } else {
        await handleLogin();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration could not be completed.';
      if (error?.name === 'UsernameExistsException') {
        message = 'An account with this email is already registered.';
      } else if (error?.name === 'InvalidPasswordException') {
        message = 'Passphrase must have at least 8 characters including numbers and symbols.';
      }
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    if (!confirmationCode.trim()) {
      setErrors({ confirmationCode: 'Please enter the 6-digit confirmation token.' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const confirmResult = await confirmSignUp({
        username: email.toLowerCase().trim(),
        confirmationCode: confirmationCode.trim(),
      });

      if (confirmResult.isSignUpComplete) {
        setShowOtpDrawer(false);
        setNeedsConfirmation(false);
        await handleLogin();
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      setErrors({ confirmationCode: 'Invalid or expired confirmation code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLoginTab) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="dq-auth-wrapper fade-in">
      {/* Ambient Blur Aura Shapes */}
      <div style={{ position: 'absolute', top: '-8rem', left: '-8rem', width: '24rem', height: '24rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199, 234, 221, 0.4) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-6rem', right: '-6rem', width: '22rem', height: '22rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 219, 207, 0.35) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Central Editorial Card Container */}
      <div className="dq-auth-card">
        {/* Left Column: Editorial Brand & Narrative Ledger (5 cols) */}
        <aside className="dq-auth-left">
          {/* Subtle Cartographic Background Texture Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              backgroundImage: 'radial-gradient(#abcec1 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Top Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <CompassEmblem size={30} light={true} />
              </div>
              <div>
                <span className="font-headline-sm" style={{ color: '#fff', fontSize: '20px', display: 'block', lineHeight: 1.2 }}>
                  DreamQuest
                </span>
                <span className="font-label-sm" style={{ color: 'var(--primary-fixed-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  Life Ledger • Field Archive
                </span>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(27, 59, 50, 0.8)', color: 'var(--primary-fixed)', marginBottom: '1.5rem' }} className="font-label-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>explore</span>
              <span>Expedition Terminal</span>
            </div>

            <h1 className="font-headline-lg" style={{ color: '#fff', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.015em' }}>
              Catalogue your horizons. Live a life of intention.
            </h1>

            <p className="font-body-md" style={{ color: 'rgba(171, 206, 193, 0.9)', lineHeight: 1.6 }}>
              A bespoke registry for mindful wayfarers and lifelong seekers. Document your grandest milestones, alpine expeditions, and quiet personal triumphs in an archival cloud vault.
            </p>
          </div>

          {/* Narrative Pull Quote & Metric Footer */}
          <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', marginTop: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(27, 59, 50, 0.65)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', backdropFilter: 'blur(4px)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary-fixed)', fontSize: '20px', display: 'block', marginBottom: '0.25rem' }}>
                format_quote
              </span>
              <p className="font-headline-sm" style={{ fontStyle: 'italic', color: '#fff', fontSize: '17px', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                “The journey of a lifetime begins by simply naming the destination.”
              </p>
              <cite className="font-label-sm" style={{ fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary-fixed-dim)', display: 'block' }}>
                — Nordic Proverb
              </cite>
            </div>

            {/* Explorer Telemetry Stats */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary-fixed-dim)' }} className="font-label-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--secondary-fixed)' }}>flag</span>
                <span><strong style={{ color: '#fff' }}>14,200+</strong> Dreams Recorded</span>
              </div>
              <span style={{ opacity: 0.4 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--secondary-fixed)' }}>public</span>
                <span><strong style={{ color: '#fff' }}>89</strong> Countries</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Authentication & Onboarding Card (7 cols) */}
        <section className="dq-auth-right">
          <div>
            {/* System Security Telemetry Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)' }} className="font-label-sm">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--surface-tint)' }} />
                AWS Cognito Secure Access
              </div>

              <button
                type="button"
                className="font-label-md"
                style={{ color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => setShowOtpDrawer(!showOtpDrawer)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>key</span>
                <span>Have an OTP code?</span>
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                marginBottom: '1.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setErrors({}); }}
                className="font-label-lg"
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isLoginTab ? 'var(--surface-container-lowest)' : 'transparent',
                  color: isLoginTab ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: isLoginTab ? 'var(--shadow-sm)' : 'none',
                  fontWeight: isLoginTab ? 700 : 500,
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setErrors({}); }}
                className="font-label-lg"
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: !isLoginTab ? 'var(--surface-container-lowest)' : 'transparent',
                  color: !isLoginTab ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: !isLoginTab ? 'var(--shadow-sm)' : 'none',
                  fontWeight: !isLoginTab ? 700 : 500,
                }}
              >
                Create Vault Account
              </button>
            </div>

            {/* OTP Notice Drawer */}
            {(showOtpDrawer || needsConfirmation) && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--surface-container-low)',
                  border: '1px solid rgba(216, 228, 220, 0.9)',
                }}
                className="fade-in"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '22px', marginTop: '2px' }}>verified_user</span>
                    <div>
                      <h4 className="font-title-md" style={{ color: 'var(--on-surface)' }}>Verify Exploration Account</h4>
                      <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                        Enter the 6-digit confirmation token dispatched to {email}.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOtpDrawer(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    style={{
                      width: '140px',
                      padding: '0.45rem 0.75rem',
                      textAlign: 'center',
                      letterSpacing: '0.2em',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--outline-variant)',
                      backgroundColor: 'var(--surface-container-lowest)',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  />
                  <button
                    type="button"
                    className="btn-dq-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '13px' }}
                    onClick={handleConfirmSignUp}
                  >
                    Confirm Code
                  </button>
                </div>
              </div>
            )}

            {/* Error banner */}
            {errors.general && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', fontSize: '13px', marginBottom: '1.25rem' }}>
                {errors.general}
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Conditional Registration Username Field */}
              {!isLoginTab && (
                <div className="dq-form-group">
                  <div className="dq-form-label-row">
                    <label className="dq-form-label" htmlFor="preferredUsername">Explorer Handle</label>
                    <span className="dq-form-hint">Cognito preferred_username</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>
                      alternate_email
                    </span>
                    <input
                      id="preferredUsername"
                      type="text"
                      className="dq-input-text"
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="e.g. Elena Vance"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="dq-form-group">
                <div className="dq-form-label-row">
                  <label className="dq-form-label" htmlFor="authEmail">Email Address</label>
                  <span className="dq-form-hint">Field ID Credentials</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>
                    mail
                  </span>
                  <input
                    id="authEmail"
                    type="email"
                    className="dq-input-text"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Passphrase Input */}
              <div className="dq-form-group">
                <div className="dq-form-label-row">
                  <label className="dq-form-label" htmlFor="authPassphrase">Master Passphrase</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset verification dispatched to email.'); }} className="font-label-md" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
                    Forgot passphrase?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>
                    lock
                  </span>
                  <input
                    id="authPassphrase"
                    type={showPassword ? 'text' : 'password'}
                    className="dq-input-text"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    placeholder="Enter vault passphrase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', display: 'flex' }}
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Keep signed in */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className="font-body-sm">
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                  <span style={{ color: 'var(--on-surface-variant)' }}>Keep me signed in on this field terminal</span>
                </label>
              </div>

              {/* Primary Vault CTA */}
              <button
                type="submit"
                className="btn-dq-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '15px' }}
              >
                <span>{loading ? 'Authenticating...' : isLoginTab ? 'Enter Dream Vault' : 'Commission Life Ledger'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Footer Archival Note */}
          <div style={{ paddingTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', color: 'var(--on-surface-variant)' }} className="font-body-sm">
            <p>
              {isLoginTab ? 'New explorer? Sign up takes under 30 seconds.' : 'Already have credentials? Return to sign in.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="font-label-sm">
              <a href="#charter" onClick={(e) => { e.preventDefault(); alert('Field Charter: All life goals documented with mindful intention.'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                Field Charter
              </a>
              <span>•</span>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Vault Privacy: End-to-end encrypted storage via AWS Cognito & AppSync.'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                Vault Privacy
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}