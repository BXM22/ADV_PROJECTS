// Statistics calculation utilities
import type { SpotifyTrack, SpotifyArtist, SpotifyTopTracksResponse, SpotifyTopArtistsResponse } from '../services/spotify/types';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  playCount?: number;
  duration?: number;
}

export interface Statistics {
  totalTracks: number;
  totalArtists: number;
  totalPlayTime: number;
  topTracks: Track[];
  topArtists: { name: string; playCount: number }[];
  topGenres: { name: string; count: number }[];
}

/**
 * Calculates comprehensive statistics from Spotify top tracks and artists data
 * @param topTracks - Array of user's top Spotify tracks
 * @param topArtists - Array of user's top Spotify artists
 * @returns Statistics object containing processed music data
 */
export function calculateStatistics(
  topTracks: SpotifyTrack[],
  topArtists: SpotifyArtist[]
): Statistics {
  // Calculate total play time by summing all track durations in milliseconds
  const totalPlayTime = topTracks.reduce((sum, track) => sum + track.duration_ms, 0);
  
  // Get unique artists by creating a Set of artist IDs to count distinct artists
  const uniqueArtists = new Set(topArtists.map(artist => artist.id));
  
  // Process top tracks: convert Spotify track format to our Track interface
  const processedTracks: Track[] = topTracks.map((track, index) => ({
    id: track.id, // Store the unique Spotify track ID
    name: track.name, // Store the track name
    artist: track.artists.map(a => a.name).join(', '), // Join multiple artists with commas
    album: track.album.name, // Extract album name from nested album object
    duration: track.duration_ms, // Store duration in milliseconds
    playCount: topTracks.length - index, // Estimate play count based on position (higher = more plays)
  }));
  
  // Process top artists: convert to simplified format with estimated play counts
  const processedArtists = topArtists.map((artist, index) => ({
    name: artist.name, // Store artist name
    playCount: topArtists.length - index, // Estimate play count based on ranking position
  }));
  
  // Extract genres from artists and count occurrences
  const genreMap = new Map<string, number>(); // Map to track genre frequency
  topArtists.forEach(artist => {
    // For each artist, iterate through their genres (if they exist)
    artist.genres?.forEach(genre => {
      // Increment count for this genre, or initialize to 1 if first occurrence
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });
  
  // Convert genre map to array, sort by count (descending), and take top 10
  const topGenres = Array.from(genreMap.entries())
    .map(([name, count]) => ({ name, count })) // Convert [genre, count] tuples to objects
    .sort((a, b) => b.count - a.count) // Sort descending by count
    .slice(0, 10); // Take only the top 10 genres
  
  // Return the complete statistics object
  return {
    totalTracks: topTracks.length, // Total number of tracks
    totalArtists: uniqueArtists.size, // Count of unique artists
    totalPlayTime: Math.floor(totalPlayTime / 1000), // Convert milliseconds to seconds
    topTracks: processedTracks, // Processed track data
    topArtists: processedArtists, // Processed artist data
    topGenres, // Top 10 genres sorted by frequency
  };
}

export function convertSpotifyTrack(spotifyTrack: SpotifyTrack): Track {
  // Returns a Track object with the converted data
  return {
    // Extract the unique Spotify track ID and assign it to our Track's id field
    id: spotifyTrack.id,
    
    // Copy the track name directly from Spotify's track object
    name: spotifyTrack.name,
    
    // Convert the array of artist objects into a comma-separated string
    // Maps each artist object to just its name, then joins them with ', '
    // Example: [{name: "Artist1"}, {name: "Artist2"}] → "Artist1, Artist2"
    artist: spotifyTrack.artists.map(a => a.name).join(', '),
    
    // Extract the album name from the nested album object
    album: spotifyTrack.album.name,
    
    // Convert duration from milliseconds (Spotify format) to our duration field
    // Spotify provides duration_ms, we store it as-is for later formatting
    duration: spotifyTrack.duration_ms,
    
    // Set a default play count of 1 (placeholder)
    // This will be calculated more accurately based on the track's position in top tracks
    playCount: 1, // Will be calculated from top tracks position
  };
}

export function formatDuration(duration: number): string {
  // Formats duration in milliseconds to a human-readable string
  // Converts milliseconds to minutes and seconds
  // Example: 120000 → "2:00"
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPlayCount(playCount: number): string {
  // Formats play count to a human-readable string
  // Converts play count to a string with commas
  // Example: 1000 → "1,000"
  return formatDuration(Math.floor(playCount / 1000));
}