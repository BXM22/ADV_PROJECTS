// Spotify API Service

import { getValidAccessToken } from './auth';
import type {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyTopTracksResponse,
  SpotifyTopArtistsResponse,
  SpotifyRecentlyPlayedResponse,
} from './types';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Make authenticated request to Spotify API
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidAccessToken();
  
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be invalid, try refreshing
      const newToken = await getValidAccessToken();
      const retryResponse = await fetch(`${SPOTIFY_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!retryResponse.ok) {
        const error = await retryResponse.json();
        throw new Error(error.error?.message || 'API request failed');
      }
      
      return retryResponse.json();
    }
    
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
}

/**
 * Get current user's profile
 */
export async function getCurrentUser(): Promise<SpotifyUser> {
  return apiRequest<SpotifyUser>('/me');
}

/**
 * Get user's top tracks
 * @param timeRange - 'short_term' (last 4 weeks), 'medium_term' (last 6 months), 'long_term' (all time)
 * @param limit - Number of tracks to return (1-50, default 20)
 * @param offset - Index of first track to return
 */
export async function getTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
): Promise<SpotifyTopTracksResponse> {
  const params = new URLSearchParams({
    time_range: timeRange,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  return apiRequest<SpotifyTopTracksResponse>(`/me/top/tracks?${params.toString()}`);
}

/**
 * Get user's top artists
 * @param timeRange - 'short_term' (last 4 weeks), 'medium_term' (last 6 months), 'long_term' (all time)
 * @param limit - Number of artists to return (1-50, default 20)
 * @param offset - Index of first artist to return
 */
export async function getTopArtists(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20,
  offset: number = 0
): Promise<SpotifyTopArtistsResponse> {
  const params = new URLSearchParams({
    time_range: timeRange,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  return apiRequest<SpotifyTopArtistsResponse>(`/me/top/artists?${params.toString()}`);
}

/**
 * Get user's recently played tracks
 * @param limit - Number of tracks to return (1-50, default 20)
 * @param after - Unix timestamp in milliseconds. Returns all items after this time
 * @param before - Unix timestamp in milliseconds. Returns all items before this time
 */
export async function getRecentlyPlayed(
  limit: number = 20,
  after?: number,
  before?: number
): Promise<SpotifyRecentlyPlayedResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });
  
  if (after) params.append('after', after.toString());
  if (before) params.append('before', before.toString());
  
  return apiRequest<SpotifyRecentlyPlayedResponse>(`/me/player/recently-played?${params.toString()}`);
}

/**
 * Get full track details by ID
 */
export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  return apiRequest<SpotifyTrack>(`/tracks/${trackId}`);
}

/**
 * Get full artist details by ID
 */
export async function getArtist(artistId: string): Promise<SpotifyArtist> {
  return apiRequest<SpotifyArtist>(`/artists/${artistId}`);
}

/**
 * Search for tracks, artists, albums, etc.
 * @param query - Search query
 * @param type - Comma-separated list of item types: album, artist, playlist, track, show, episode
 * @param limit - Number of results (1-50, default 20)
 */
export async function search(
  query: string,
  type: string = 'track,artist,album',
  limit: number = 20
): Promise<any> {
  const params = new URLSearchParams({
    q: query,
    type,
    limit: limit.toString(),
  });
  
  return apiRequest(`/search?${params.toString()}`);
}

