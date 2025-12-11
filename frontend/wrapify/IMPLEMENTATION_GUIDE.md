# Wrapify Implementation Guide

This guide provides step-by-step instructions for implementing the remaining features of Wrapify.

## Current Status

- ✅ Step 1: Setup React project
- ✅ Step 2: Integrate Spotify API
- ⏳ Step 3: Build statistics calculation
- ⏳ Step 4: Create visualization components
- ⏳ Step 5: Add share functionality
- ⏳ Step 6: Implement theme system
- ⏳ Step 7: Polish design and animations

---

## Step 3: Build Statistics Calculation

### Overview
Implement the `calculateStatistics` function to process Spotify data and generate meaningful statistics.

### Files to Modify
- `src/utils/statistics.ts`

### Implementation Steps

#### 3.1: Update Type Definitions
Convert Spotify API types to internal Track format:

```typescript
import type { SpotifyTrack, SpotifyArtist, SpotifyTopTracksResponse, SpotifyTopArtistsResponse } from '../services/spotify/types';

export function convertSpotifyTrack(spotifyTrack: SpotifyTrack): Track {
  return {
    id: spotifyTrack.id,
    name: spotifyTrack.name,
    artist: spotifyTrack.artists.map(a => a.name).join(', '),
    album: spotifyTrack.album.name,
    duration: spotifyTrack.duration_ms,
    playCount: 1, // Will be calculated from top tracks position
  };
}
```

#### 3.2: Implement calculateStatistics Function

```typescript
export function calculateStatistics(
  topTracks: SpotifyTrack[],
  topArtists: SpotifyArtist[],
  recentlyPlayed?: SpotifyPlayHistory[]
): Statistics {
  // Calculate total play time
  const totalPlayTime = topTracks.reduce((sum, track) => sum + track.duration_ms, 0);
  
  // Get unique artists
  const uniqueArtists = new Set(topArtists.map(artist => artist.id));
  
  // Process top tracks
  const processedTracks: Track[] = topTracks.map((track, index) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    duration: track.duration_ms,
    playCount: topTracks.length - index, // Estimate based on position
  }));
  
  // Process top artists
  const processedArtists = topArtists.map((artist, index) => ({
    name: artist.name,
    playCount: topArtists.length - index, // Estimate based on position
  }));
  
  // Extract genres from artists
  const genreMap = new Map<string, number>();
  topArtists.forEach(artist => {
    artist.genres?.forEach(genre => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });
  
  const topGenres = Array.from(genreMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalTracks: topTracks.length,
    totalArtists: uniqueArtists.size,
    totalPlayTime: Math.floor(totalPlayTime / 1000), // Convert to seconds
    topTracks: processedTracks,
    topArtists: processedArtists,
    topGenres,
  };
}
```

#### 3.3: Add Helper Functions

```typescript
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPlayTime(ms: number): string {
  return formatDuration(Math.floor(ms / 1000));
}
```

---

## Step 4: Create Visualization Components

### Overview
Build Chart.js components to visualize music statistics.

### Files to Create
- `src/components/Visualizations/TopTracksChart.tsx`
- `src/components/Visualizations/TopArtistsChart.tsx`
- `src/components/Visualizations/ListeningTimeChart.tsx`
- `src/components/Visualizations/GenreChart.tsx`

### Implementation Steps

#### 4.1: Setup Chart.js Configuration

Create `src/components/Visualizations/chartConfig.ts`:

```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const chartColors = {
  primary: '#1db954',
  secondary: '#1ed760',
  accent: '#191414',
  background: '#121212',
  text: '#ffffff',
};
```

#### 4.2: Create Top Tracks Chart Component

```typescript
// src/components/Visualizations/TopTracksChart.tsx
import { Bar } from 'react-chartjs-2';
import { chartColors } from './chartConfig';

interface TopTracksChartProps {
  tracks: Array<{ name: string; artist: string; playCount?: number }>;
  limit?: number;
}

export function TopTracksChart({ tracks, limit = 10 }: TopTracksChartProps) {
  const topTracks = tracks.slice(0, limit);
  
  const data = {
    labels: topTracks.map(t => t.name),
    datasets: [{
      label: 'Plays',
      data: topTracks.map(t => t.playCount || 0),
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary,
      borderWidth: 1,
    }],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Tracks', color: chartColors.text },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: chartColors.text } },
      x: { ticks: { color: chartColors.text } },
    },
  };
  
  return <Bar data={data} options={options} />;
}
```

#### 4.3: Create Top Artists Chart Component

```typescript
// src/components/Visualizations/TopArtistsChart.tsx
import { Doughnut } from 'react-chartjs-2';
import { chartColors } from './chartConfig';

interface TopArtistsChartProps {
  artists: Array<{ name: string; playCount?: number }>;
  limit?: number;
}

export function TopArtistsChart({ artists, limit = 10 }: TopArtistsChartProps) {
  const topArtists = artists.slice(0, limit);
  
  const data = {
    labels: topArtists.map(a => a.name),
    datasets: [{
      data: topArtists.map(a => a.playCount || 0),
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        '#1aa34a',
        '#1ed760',
        '#1db954',
      ],
    }],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const, labels: { color: chartColors.text } },
      title: { display: true, text: 'Top Artists', color: chartColors.text },
    },
  };
  
  return <Doughnut data={data} options={options} />;
}
```

#### 4.4: Create Statistics Display Component

```typescript
// src/components/Statistics/StatisticsDisplay.tsx
import { Statistics } from '../../utils/statistics';
import { TopTracksChart } from '../Visualizations/TopTracksChart';
import { TopArtistsChart } from '../Visualizations/TopArtistsChart';
import { formatDuration } from '../../utils/statistics';

interface StatisticsDisplayProps {
  stats: Statistics;
}

export function StatisticsDisplay({ stats }: StatisticsDisplayProps) {
  return (
    <div className="statistics-display">
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Tracks</h3>
          <p>{stats.totalTracks}</p>
        </div>
        <div className="stat-card">
          <h3>Total Artists</h3>
          <p>{stats.totalArtists}</p>
        </div>
        <div className="stat-card">
          <h3>Listening Time</h3>
          <p>{formatDuration(stats.totalPlayTime)}</p>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <TopTracksChart tracks={stats.topTracks} />
        </div>
        <div className="chart-container">
          <TopArtistsChart artists={stats.topArtists} />
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Add Share Functionality

### Overview
Implement sharing capabilities for statistics visualizations.

### Files to Create
- `src/components/Share/ShareButton.tsx`
- `src/components/Share/ShareModal.tsx`
- `src/utils/share.ts`

### Implementation Steps

#### 5.1: Create Share Utility Functions

```typescript
// src/utils/share.ts
export function shareToTwitter(text: string, url: string): void {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(tweetUrl, '_blank', 'width=550,height=420');
}

export function shareToFacebook(url: string): void {
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(fbUrl, '_blank', 'width=550,height=420');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

export function downloadAsImage(elementId: string, filename: string): void {
  // Implementation using html2canvas or similar library
  // This requires installing: npm install html2canvas
}
```

#### 5.2: Create Share Button Component

```typescript
// src/components/Share/ShareButton.tsx
import { useState } from 'react';
import { shareToTwitter, shareToFacebook, copyToClipboard } from '../../utils/share';

interface ShareButtonProps {
  stats: Statistics;
  userName: string;
}

export function ShareButton({ stats, userName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const shareText = `Check out my ${stats.totalTracks} top tracks on Wrapify! 🎵`;
  const shareUrl = window.location.href;
  
  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="share-buttons">
      <button onClick={() => shareToTwitter(shareText, shareUrl)}>
        Share on Twitter
      </button>
      <button onClick={() => shareToFacebook(shareUrl)}>
        Share on Facebook
      </button>
      <button onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
```

---

## Step 6: Implement Theme System

### Overview
Create a theme system with multiple color schemes.

### Files to Create
- `src/themes/themes.ts`
- `src/components/ThemeSelector/ThemeSelector.tsx`
- `src/hooks/useTheme.ts`

### Implementation Steps

#### 6.1: Define Theme Types

```typescript
// src/themes/themes.ts
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'Spotify Dark',
    colors: {
      primary: '#1db954',
      secondary: '#1ed760',
      background: '#121212',
      surface: '#181818',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
    },
  },
  {
    name: 'Spotify Light',
    colors: {
      primary: '#1db954',
      secondary: '#1ed760',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666',
    },
  },
  {
    name: 'Purple',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#e0e0e0',
    },
  },
];

export const defaultTheme = themes[0];
```

#### 6.2: Create Theme Hook

```typescript
// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { Theme, themes, defaultTheme } from '../themes/themes';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('wrapify-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });
  
  useEffect(() => {
    localStorage.setItem('wrapify-theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);
  
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };
  
  return { theme, setTheme, themes };
}
```

#### 6.3: Create Theme Selector Component

```typescript
// src/components/ThemeSelector/ThemeSelector.tsx
import { useTheme } from '../../hooks/useTheme';

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
  
  return (
    <div className="theme-selector">
      <label>Theme:</label>
      <select
        value={theme.name}
        onChange={(e) => {
          const selected = themes.find(t => t.name === e.target.value);
          if (selected) setTheme(selected);
        }}
      >
        {themes.map(t => (
          <option key={t.name} value={t.name}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
```

---

## Step 7: Polish Design and Animations

### Overview
Add smooth animations, loading states, and improve overall UI/UX.

### Files to Modify/Create
- `src/App.css` (update)
- `src/index.css` (update)
- `src/components/LoadingSpinner.tsx` (new)

### Implementation Steps

#### 7.1: Add CSS Animations

```css
/* Add to src/index.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}
```

#### 7.2: Create Loading Spinner

```typescript
// src/components/LoadingSpinner.tsx
import './LoadingSpinner.css';

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading your music stats...</p>
    </div>
  );
}
```

#### 7.3: Add Transitions to Components

```typescript
// Update components to include transition classes
<div className="statistics-display fade-in">
  {/* content */}
</div>
```

#### 7.4: Improve Button Styles

```css
/* Add to src/App.css */
button {
  transition: all 0.2s ease;
  cursor: pointer;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(0);
}
```

---

## Integration Steps

### 1. Update App.tsx

```typescript
import { useState, useEffect } from 'react';
import { SpotifyAuth } from './components/SpotifyAuth';
import { StatisticsDisplay } from './components/Statistics/StatisticsDisplay';
import { ShareButton } from './components/Share/ShareButton';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useSpotify } from './hooks/useSpotify';
import { calculateStatistics } from './utils/statistics';
import type { Statistics } from './utils/statistics';
import './App.css';

function App() {
  const { isAuthenticated, user, fetchTopTracks, fetchTopArtists, isLoading } = useSpotify();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !stats) {
      loadStatistics();
    }
  }, [isAuthenticated]);

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const [tracksData, artistsData] = await Promise.all([
        fetchTopTracks('medium_term', 50),
        fetchTopArtists('medium_term', 50),
      ]);

      if (tracksData && artistsData) {
        const calculated = calculateStatistics(
          tracksData.items,
          artistsData.items
        );
        setStats(calculated);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Wrapify</h1>
        <p>Your Music Statistics Visualization Platform</p>
        <ThemeSelector />
      </header>

      {!isAuthenticated ? (
        <SpotifyAuth />
      ) : loadingStats || !stats ? (
        <LoadingSpinner />
      ) : (
        <>
          <StatisticsDisplay stats={stats} />
          {user && <ShareButton stats={stats} userName={user.display_name} />}
        </>
      )}
    </div>
  );
}

export default App;
```

### 2. Install Additional Dependencies

```bash
npm install html2canvas  # For image export functionality
```

### 3. Add CSS Variables for Theming

```css
/* Add to src/index.css */
:root {
  --color-primary: #1db954;
  --color-secondary: #1ed760;
  --color-background: #121212;
  --color-surface: #181818;
  --color-text: #ffffff;
  --color-textSecondary: #b3b3b3;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
}
```

---

## Testing Checklist

- [ ] Statistics calculation works correctly
- [ ] Charts display data properly
- [ ] Share buttons function correctly
- [ ] Theme switching works
- [ ] Animations are smooth
- [ ] Loading states display properly
- [ ] Responsive design works on mobile
- [ ] All Spotify API calls handle errors gracefully

---

## Next Steps After Implementation

1. Add error boundaries for better error handling
2. Implement data caching to reduce API calls
3. Add more chart types (line charts for listening over time)
4. Add export to PDF functionality
5. Add comparison with previous periods
6. Implement offline support with service workers

