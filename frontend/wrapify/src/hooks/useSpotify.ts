// React Hook for Spotify Integration

import { useState, useEffect, useCallback } from 'react';
import {
  initiateAuth,
  isAuthenticated,
  clearTokens,
  getCurrentUser,
  getTopTracks,
  getTopArtists,
  getRecentlyPlayed,
  type SpotifyUser,
  type SpotifyTopTracksResponse,
  type SpotifyTopArtistsResponse,
  type SpotifyRecentlyPlayedResponse,
} from '../services/spotify';

interface UseSpotifyReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: SpotifyUser | null;
  login: () => Promise<void>;
  logout: () => void;
  fetchTopTracks: (timeRange?: 'short_term' | 'medium_term' | 'long_term', limit?: number) => Promise<SpotifyTopTracksResponse | null>;
  fetchTopArtists: (timeRange?: 'short_term' | 'medium_term' | 'long_term', limit?: number) => Promise<SpotifyTopArtistsResponse | null>;
  fetchRecentlyPlayed: (limit?: number) => Promise<SpotifyRecentlyPlayedResponse | null>;
}

export function useSpotify(): UseSpotifyReturn {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        setIsAuthenticatedState(authenticated);
        
        if (authenticated) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check authentication');
        setIsAuthenticatedState(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);
      await initiateAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticatedState(false);
    setUser(null);
    setError(null);
  }, []);

  const fetchTopTracks = useCallback(async (
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) => {
    try {
      setError(null);
      if (!isAuthenticatedState) {
        throw new Error('Not authenticated');
      }
      return await getTopTracks(timeRange, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top tracks');
      return null;
    }
  }, [isAuthenticatedState]);

  const fetchTopArtists = useCallback(async (
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) => {
    try {
      setError(null);
      if (!isAuthenticatedState) {
        throw new Error('Not authenticated');
      }
      return await getTopArtists(timeRange, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top artists');
      return null;
    }
  }, [isAuthenticatedState]);

  const fetchRecentlyPlayed = useCallback(async (limit: number = 20) => {
    try {
      setError(null);
      if (!isAuthenticatedState) {
        throw new Error('Not authenticated');
      }
      return await getRecentlyPlayed(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recently played');
      return null;
    }
  }, [isAuthenticatedState]);

  return {
    isAuthenticated: isAuthenticatedState,
    isLoading,
    error,
    user,
    login,
    logout,
    fetchTopTracks,
    fetchTopArtists,
    fetchRecentlyPlayed,
  };
}

