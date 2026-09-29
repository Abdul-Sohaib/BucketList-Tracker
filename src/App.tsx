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
        console.log('User still signed in:', currentUser);

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
          bio: 'Explorer of life, collector of experiences. Let\'s check off this list!',
          joinedDate: new Date()
            .toISOString()
            .split('T')[0],
          avatarUrl:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        };

        setUser(restoredUser);
      } catch (authError) {
        console.log('No user signed in');
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
          message="Verifying your account session..."
          submessage="Connecting to DreamQuest secure vault."
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
          submessage="Retrieving your life goals and achievements."
        />
      );
    }

    switch (currentRoute) {
      case 'dashboard':
        return (
          <Dashboard
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Show Navbar only when logged in */}
      {user && (
        <Navbar
          currentRoute={currentRoute}
          setRoute={setRoute}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main
        style={{
          flexGrow: 1,
          paddingTop: user ? '20px' : '0',
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;