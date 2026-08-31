import { useState, useEffect } from 'react';
import './App.css';
import type { User } from './types/bucket';
import { useBucketList } from './hooks/useBucketList';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateBucket from './pages/CreateBucket';
import EditBucket from './pages/EditBucket';
import Profile from './pages/Profile';

const SESSION_KEY = 'bucketlist_tracker_user_session';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('login');
  const [editId, setEditId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);

  // Core bucket list hook
  const {
    items,
    loading: itemsLoading,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem,
    toggleComplete,
  } = useBucketList();

  // Load user session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error('Error loading session', e);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // Sync state router with URL Hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // If not logged in, redirect to login page regardless of hash
      if (!user && !sessionLoading) {
        setCurrentRoute('login');
        return;
      }

      if (user) {
        if (hash === '#create') {
          setCurrentRoute('create');
        } else if (hash === '#profile') {
          setCurrentRoute('profile');
        } else if (hash.startsWith('#edit/')) {
          const id = hash.replace('#edit/', '');
          setEditId(id);
          setCurrentRoute('edit');
        } else {
          // Default fallback
          setCurrentRoute('dashboard');
          window.location.hash = 'dashboard';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Call once initially when loading is finished
    if (!sessionLoading) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, sessionLoading]);

  // Login handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    } catch (e) {
      console.error('Failed to save session', e);
    }
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
    window.location.hash = 'login';
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to update session', e);
    }
  };

  // Nav routing change helper
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

  const handleEditClick = (id: string) => {
    window.location.hash = `edit/${id}`;
  };

  // Render proper subpage matching route state
  const renderPage = () => {
    if (sessionLoading || itemsLoading) {
      return (
        <div className="app-loading-container">
          <div className="app-spinner"></div>
        </div>
      );
    }

    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
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
        return <CreateBucket onAddItem={addBucketItem} setRoute={setRoute} />;
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
            onUpdateProfile={handleUpdateProfile}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentRoute={currentRoute}
        setRoute={setRoute}
        user={user}
        onLogout={handleLogout}
      />
      <main style={{ flexGrow: 1, paddingTop: '20px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
