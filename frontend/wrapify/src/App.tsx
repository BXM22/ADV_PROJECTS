import { useState } from 'react'
import { SpotifyAuth } from './components/SpotifyAuth'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Wrapify</h1>
        <p>Your Music Statistics Visualization Platform</p>
      </header>
      <SpotifyAuth />
    </div>
  )
}

export default App

