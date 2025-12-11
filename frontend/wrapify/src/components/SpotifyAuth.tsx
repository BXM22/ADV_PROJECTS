// Spotify Authentication Component

import { useEffect } from 'react';
import { useSpotify } from '../hooks/useSpotify';
import { exchangeCodeForToken } from '../services/spotify';

export function SpotifyAuth() {
  const { isAuthenticated, isLoading, user, login, logout, error } = useSpotify();

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      exchangeCodeForToken(code)
        .then(() => {
          // Clean up URL and reload to show authenticated state
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        })
        .catch((err) => {
          console.error('Failed to exchange token:', err);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="spotify-auth">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="spotify-auth">
        <div className="auth-info">
          {user.images && user.images[0] && (
            <img 
              src={user.images[0].url} 
              alt={user.display_name}
              className="user-avatar"
            />
          )}
          <div>
            <h3>Welcome, {user.display_name}!</h3>
            {user.email && <p>{user.email}</p>}
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="spotify-auth">
      <h2>Connect with Spotify</h2>
      <p>Sign in with Spotify to view your music statistics</p>
      {error && <p className="error">{error}</p>}
      <button onClick={login} className="spotify-login-btn">
        Login with Spotify
      </button>
    </div>
  );
}

