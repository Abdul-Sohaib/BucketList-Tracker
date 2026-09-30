import { useState, useEffect } from 'react';
import './App.css';

import type { User } from './types/bucket';

import {
  getCurrentUser,
  fetchUserAttributes,
  signOut,
} from 'aws-amplify/auth';

import { useBucketList } from './hooks/useBucketList';

import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateBucket from './pages/CreateBucket';
import EditBucket from './pages/EditBucket';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('login');
  const [editId, setEditId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // --------------------------------------------------
  // Bucket List
  // --------------------------------------------------

  const {
    items,
    loading: itemsLoading,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem,
    toggleComplete,
  } = useBucketList(user !== null && !sessionLoading);

  // --------------------------------------------------
  // Restore Cognito Session
  // --------------------------------------------------

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();

        let attributes: Record<string, string | undefined> = {};

        try {
          attributes = await fetchUserAttributes();
        } catch (attrError) {
          console.warn(
            'Could not fetch user attributes on session restore:',
            attrError
          );
        }

        const email =
          attributes.email ??
          currentUser.signInDetails?.loginId ??
          '';

        const preferred_username =
          attributes.preferred_username ?? '';

        const username =
          preferred_username ||
          (email
            ? email.split('@')[0]
            : 'Explorer');

        const restoredUser: User = {
          email,
          username,
          preferred_username,
          bio: attributes['custom:bio'] || attributes.bio || '',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRFpEHAdtVSPlvvfDTmOQFG6uIg7bxVFr90WYN-XU6-sep49l7iTqnGuhLYVg56evbuBptsgAjw4IzI8-DIoj4DYI-Ow-zBptWg1fjGX-mcdY7XQvzypVauAxEmN2f2C9q9dV1R2Fk1RvIZfJ7mvWrIRhJZRAKBO2L6LfrYqeE3t_HRXhCsI4WDUFM1IYaiD-VMK0PdTDtTdEa2kSfpSjeM1ChA6lG5VWYb9yABf0NYOyzCvPpke5',
        };

        setUser(restoredUser);
      } catch (authError) {
        setUser(null);
      } finally {
        setSessionLoading(false);
      }
    };

    restoreSession();
  }, []);

  // --------------------------------------------------
  // Hash Router
  // --------------------------------------------------

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      // Don't redirect or change routes while session is verifying
      if (sessionLoading) return;

      // Not authenticated
      if (!user) {
        setCurrentRoute('login');

        if (hash !== '#login') {
          window.location.hash = 'login';
        }

        return;
      }

      // Authenticated
      if (hash === '#create') {
        setCurrentRoute('create');
      } else if (hash === '#profile') {
        setCurrentRoute('profile');
      } else if (hash.startsWith('#edit/')) {
        const id = hash.replace('#edit/', '');

        setEditId(id);
        setCurrentRoute('edit');
      } else {
        setCurrentRoute('dashboard');

        if (
          hash !== '#dashboard' &&
          hash !== ''
        ) {
          window.location.hash = 'dashboard';
        }
      }
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    if (!sessionLoading) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, [user, sessionLoading]);

  // --------------------------------------------------
  // Login Success
  // --------------------------------------------------

  const handleLoginSuccess = async (
    loggedInUser: User
  ) => {
    let finalUser = { ...loggedInUser };

    if (!finalUser.preferred_username) {
      try {
        const attributes =
          await fetchUserAttributes();

        if (attributes.preferred_username) {
          finalUser = {
            ...finalUser,
            preferred_username:
              attributes.preferred_username,
            username:
              attributes.preferred_username,
          };
        }
      } catch (e) {
        console.warn(
          'Could not enrich user attributes in handleLoginSuccess:',
          e
        );
      }
    }

    setUser(finalUser);
    setCurrentRoute('dashboard');

    window.location.hash = 'dashboard';
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await signOut();

      setUser(null);
      setEditId(null);
      setCurrentRoute('login');

      window.location.hash = 'login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // --------------------------------------------------
  // Update Profile
  // --------------------------------------------------

  const handleUpdateProfile = (
    updatedUser: User
  ) => {
    setUser(updatedUser);
  };

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const setRoute = (route: string) => {
    if (route === 'dashboard') {
      window.location.hash = 'dashboard';
    } else if (route === 'create') {
      window.location.hash = 'create';
    } else if (route === 'profile') {
      window.location.hash = 'profile';
    } else if (route === 'login') {
      window.location.hash = 'login';
    }
  };

  // --------------------------------------------------
  // Edit Bucket Item
  // --------------------------------------------------

  const handleEditClick = (id: string) => {
    window.location.hash = `edit/${id}`;
  };

  // --------------------------------------------------
  // Render Page
  // --------------------------------------------------

  const renderPage = () => {
    // Checking Cognito session
    if (sessionLoading) {
      return (
        <LoadingSpinner
          fullScreen={true}
          message="Verifying your naturalist field account..."
          submessage="Connecting to DreamQuest archival cloud vault."
        />
      );
    }

    // Not authenticated
    if (!user) {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    // Bucket data loading
    if (itemsLoading) {
      return (
        <LoadingSpinner
          fullScreen={false}
          message="Retrieving your cataloged horizons..."
          submessage="Loading field monograph entries and milestones."
        />
      );
    }

    switch (currentRoute) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            items={items}
            onToggleComplete={toggleComplete}
            onDelete={deleteBucketItem}
            onEdit={handleEditClick}
            setRoute={setRoute}
          />
        );

      case 'create':
        return (
          <CreateBucket
            onAddItem={addBucketItem}
            setRoute={setRoute}
          />
        );

      case 'edit':
        return (
          <EditBucket
            editId={editId}
            items={items}
            onUpdateItem={updateBucketItem}
            setRoute={setRoute}
          />
        );

      case 'profile':
        return (
          <Profile
            user={user}
            items={items}
            onUpdateProfile={
              handleUpdateProfile
            }
          />
        );

      default:
        return (
          <Dashboard
            items={items}
            onToggleComplete={toggleComplete}
            onDelete={deleteBucketItem}
            onEdit={handleEditClick}
            setRoute={setRoute}
          />
        );
    }
  };

  // --------------------------------------------------
  // Application UI
  // --------------------------------------------------

  return (
    <div className="app-container">
      {/* Show Navbar only when logged in */}
      {user && (
        <Navbar
          currentRoute={currentRoute}
          setRoute={setRoute}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main className={user ? 'main-content' : ''}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;