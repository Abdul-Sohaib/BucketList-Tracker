import { useState } from 'react';

import type { User } from '../types/bucket';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [confirmationCode, setConfirmationCode] = useState('');

  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    confirmationCode?: string;
    general?: string;
  }>({});

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

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
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!isLoginTab && !username.trim()) {
      newErrors.username = 'Username is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

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
        console.log("Signed in:", signInResult);
      } catch (err: any) {
        if (err?.name === 'UserAlreadyAuthenticatedException') {
          // If a session is already active, sign out first and retry
          await signOut();
          signInResult = await signIn({
            username: email.toLowerCase().trim(),
            password,
          });
          console.log("Signed in:", signInResult);
        } else {
          throw err;
        }
      }

      if (signInResult.nextStep.signInStep === 'DONE') {
        const currentUser = await getCurrentUser();
        console.log("Current user:", currentUser.username);

        let attributes: Record<string, string | undefined> = {};
        try {
          attributes = await fetchUserAttributes();
        } catch (attrErr) {
          console.warn('First fetchUserAttributes attempt:', attrErr);
          try {
            await new Promise((r) => setTimeout(r, 200));
            attributes = await fetchUserAttributes();
          } catch (retryErr) {
            console.warn('Retry fetchUserAttributes error:', retryErr);
          }
        }

        const preferredName = attributes.preferred_username || '';
        const displayUsername = preferredName || (email ? email.split('@')[0] : 'Explorer');

        const loggedInUser: User = {
          email: attributes.email || email.toLowerCase().trim(),
          username: displayUsername,
          preferred_username: preferredName,
          bio: 'Explorer of life, collector of experiences. Let\'s check off this list!',
          joinedDate: new Date().toISOString().split('T')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        };

        onLoginSuccess(loggedInUser);
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let message = 'Unable to sign in. Please check your credentials.';

      if (error?.name === 'UserNotFoundException') {
        message = 'No account found with this email.';
      } else if (error?.name === 'NotAuthorizedException') {
        message = 'Incorrect email or password.';
      } else if (error?.name === 'UserNotConfirmedException') {
        message = 'Please verify your email before signing in.';
        setNeedsConfirmation(true);
      } else if (error?.name === 'PasswordResetRequiredException') {
        message = 'Password reset is required for this account.';
      }

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Register
  // --------------------------------------------------

  const handleSignup = async () => {
    try {
      setLoading(true);
      setErrors({});

      const result = await signUp({
        username: email.toLowerCase().trim(),
        password,
        options: {
          userAttributes: {
            email: email.toLowerCase().trim(),
            preferred_username: username.trim(),
          },
        },
      });

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
      } else {
        // Account is already confirmed
        setIsLoginTab(true);
        setNeedsConfirmation(false);

        setErrors({
          general: 'Account created successfully. Please sign in.',
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      let message = 'Unable to create your account. Please try again.';

      if (error?.name === 'UsernameExistsException') {
        message = 'An account with this email already exists.';
      } else if (error?.name === 'InvalidPasswordException') {
        message = 'Password does not meet Cognito requirements.';
      } else if (error?.name === 'InvalidParameterException') {
        message = 'Please check the information you entered.';
      }

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Confirm Email
  // --------------------------------------------------

  const handleConfirmSignup = async () => {
    if (!confirmationCode.trim()) {
      setErrors({
        confirmationCode: 'Please enter the verification code.',
      });

      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await confirmSignUp({
        username: email.toLowerCase().trim(),
        confirmationCode: confirmationCode.trim(),
      });

      if (result.nextStep.signUpStep === 'DONE') {
        setNeedsConfirmation(false);
        setIsLoginTab(true);
        setConfirmationCode('');

        setErrors({
          general:
            'Email verified successfully. You can now sign in.',
        });
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);

      let message = 'Invalid verification code. Please try again.';

      if (error?.name === 'CodeMismatchException') {
        message = 'Incorrect verification code.';
      } else if (error?.name === 'ExpiredCodeException') {
        message = 'This verification code has expired.';
      }

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isLoginTab) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  // --------------------------------------------------
  // Switch Login / Register
  // --------------------------------------------------

  const switchTab = (login: boolean) => {
    setIsLoginTab(login);
    setNeedsConfirmation(false);
    setErrors({});
    setConfirmationCode('');
  };

  // --------------------------------------------------
  // Verification Screen
  // --------------------------------------------------

  if (needsConfirmation) {
    return (
      <div className="login-container fade-in">
        <div className="login-brand-header">
          <div className="login-logo-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="login-brand-title">
            DreamQuest
          </h1>

          <p className="login-brand-subtitle">
            Verify your email to continue your quest.
          </p>
        </div>

        <div className="glass-panel login-card">
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            Verify Your Email
          </h2>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}
          >
            We sent a verification code to
            <br />
            <strong>{email}</strong>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmSignup();
            }}
          >
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="confirmationCode"
              >
                Verification Code
              </label>

              <input
                id="confirmationCode"
                type="text"
                className="form-input"
                placeholder="Enter 6-digit code"
                value={confirmationCode}
                onChange={(e) =>
                  setConfirmationCode(e.target.value)
                }
                maxLength={6}
              />

              {errors.confirmationCode && (
                <span className="form-error">
                  {errors.confirmationCode}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="form-error">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
              }}
            >
              {loading
                ? 'Verifying...'
                : 'Verify Email'}
            </button>
          </form>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setNeedsConfirmation(false);
              setErrors({});
              setConfirmationCode('');
            }}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '12px',
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Login / Register Screen
  // --------------------------------------------------

  return (
    <div className="login-container fade-in">
      <div className="login-brand-header">
        <div className="login-logo-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1 className="login-brand-title">
          DreamQuest
        </h1>

        <p className="login-brand-subtitle">
          Track your life goals, build your legacy.
        </p>
      </div>

      <div className="glass-panel login-card">
        {/* Tabs */}

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${isLoginTab
              ? 'login-active-tab'
              : ''
              }`}
            onClick={() => switchTab(true)}
          >
            Sign In
          </button>

          <button
            type="button"
            className={`login-tab ${!isLoginTab
              ? 'login-active-tab'
              : ''
              }`}
            onClick={() => switchTab(false)}
          >
            Register
          </button>
        </div>

        {/* General Error */}

        {errors.general && (
          <div
            className="form-error"
            style={{
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {errors.general}
          </div>
        )}

        {/* Form */}

        <form onSubmit={handleSubmit}>
          {/* Username - Register Only */}

          {!isLoginTab && (
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="username"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g. DreamExplorer"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

              {errors.username && (
                <span className="form-error">
                  {errors.username}
                </span>
              )}
            </div>
          )}

          {/* Email */}

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="email"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            {errors.email && (
              <span className="form-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="password"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {errors.password && (
              <span className="form-error">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit */}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '10px',
            }}
          >
            {loading
              ? isLoginTab
                ? 'Signing In...'
                : 'Creating Account...'
              : isLoginTab
                ? 'Enter DreamQuest'
                : 'Create Account'}
          </button>
        </form>

        {/* Demo button removed */}

        {isLoginTab && (
          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  height: '1px',
                  flex: 1,
                  backgroundColor:
                    'rgba(255, 255, 255, 0.06)',
                }}
              />

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: '700',
                }}
              >
                SECURED BY COGNITO
              </span>

              <div
                style={{
                  height: '1px',
                  flex: 1,
                  backgroundColor:
                    'rgba(255, 255, 255, 0.06)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}