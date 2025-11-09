# Black Hole Simulation

A real-time physics simulation of particles orbiting a black hole, featuring gravitational effects, accretion disk visualization, and particle dynamics.

## Features

- **Gravitational Physics**: Realistic gravitational force calculations
- **Particle System**: Dynamic particles with orbital mechanics
- **Visual Effects**: 
  - Accretion disk with glowing effects
  - Event horizon visualization
  - Color-coded particles based on distance
  - Particle lifetime and fade effects
- **Interactive**: Real-time simulation with smooth 60 FPS rendering

## Requirements

- C++17 compatible compiler (GCC, Clang, or MSVC)
- CMake 3.10 or higher
- SFML 2.5 or higher

## Installation

### macOS

```bash
# Install SFML using Homebrew
brew install sfml

# Build the project
mkdir build
cd build
cmake ..
make

# Run the simulation
./bin/BlackHoleSimulation
```

### Linux (Ubuntu/Debian)

```bash
# Install SFML
sudo apt-get install libsfml-dev

# Build the project
mkdir build
cd build
cmake ..
make

# Run the simulation
./bin/BlackHoleSimulation
```

### Windows

1. Download SFML from https://www.sfml-dev.org/download.php
2. Extract SFML to a directory (e.g., `C:\SFML`)
3. Set the `SFML_ROOT` environment variable or configure CMake:
   ```bash
   mkdir build
   cd build
   cmake -DSFML_ROOT=C:/SFML ..
   cmake --build . --config Release
   ```
4. Run the executable from `build/bin/Release/`

## Controls

- **ESC**: Exit the simulation
- **Close Window**: Click the X button

## How It Works

The simulation uses Newtonian gravity to calculate the force between particles and the black hole:

```
F = G * M * m / r²
```

Where:
- `G` is the gravitational constant (scaled for visualization)
- `M` is the black hole mass
- `m` is the particle mass
- `r` is the distance between them

Particles are spawned in a ring around the black hole with orbital velocities. As they orbit, they experience gravitational acceleration, creating elliptical and hyperbolic orbits. Particles that get too close to the event horizon are removed from the simulation.

## Customization

You can modify these constants in `main.cpp` to change the simulation behavior:

- `G`: Gravitational constant (affects strength of gravity)
- `BLACK_HOLE_MASS`: Mass of the black hole
- `BLACK_HOLE_RADIUS`: Visual size of the black hole
- `EVENT_HORIZON_RADIUS`: Radius of the event horizon
- Particle spawn parameters in `spawnParticle()`

## Future Enhancements

- Relativistic effects (time dilation, light bending)
- Multiple black holes
- Collision detection between particles
- Interactive controls (zoom, pause, speed adjustment)
- Save/load simulation states
- 3D visualization

