//Imported libraries

#include <SFML/Graphics.hpp>
#include <SFML/Window/Event.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <cmath>
#include <vector>
#include <random>
#include <cstdint>
#include <optional>

//defined constants
const int WINDOW_WIDTH = 1200;
const int WINDOW_HEIGHT = 800;
const float G = 1000.0f; // Gravitational constant (scaled for visualization)
const float BLACK_HOLE_MASS = 50000.0f;
const float BLACK_HOLE_RADIUS = 30.0f;
const float EVENT_HORIZON_RADIUS = 50.0f;

struct Particle {
    sf::Vector2f position;
    sf::Vector2f velocity;
    float mass;
    sf::Color color;
    float lifetime;
    float maxLifetime;
    
    Particle(sf::Vector2f pos, sf::Vector2f vel, float m, sf::Color c, float life) 
        : position(pos), velocity(vel), mass(m), color(c), lifetime(life), maxLifetime(life) {}
};

class BlackHoleSimulation {
private:
    sf::Vector2f blackHolePos;
    std::vector<Particle> particles;
    std::mt19937 rng;
    std::uniform_real_distribution<float> angleDist;
    std::uniform_real_distribution<float> speedDist;
    std::uniform_real_distribution<float> massDist;
    
public:
    BlackHoleSimulation() 
        : blackHolePos(WINDOW_WIDTH / 2.0f, WINDOW_HEIGHT / 2.0f),
          rng(std::random_device{}()),
          angleDist(0.0f, 2.0f * M_PI),
          speedDist(50.0f, 200.0f),
          massDist(1.0f, 5.0f) {
        // Initialize with some particles
        for (int i = 0; i < 100; i++) {
            spawnParticle();
        }
    }
    
    void spawnParticle() {
        // Spawn particles in a ring around the black hole
        float angle = angleDist(rng);
        float distance = 200.0f + (rng() % 300);
        float speed = speedDist(rng);
        float mass = massDist(rng);
        
        sf::Vector2f pos = blackHolePos + sf::Vector2f(
            cos(angle) * distance,
            sin(angle) * distance
        );
        
        // Calculate orbital velocity (tangential to position)
        sf::Vector2f direction(-sin(angle), cos(angle));
        sf::Vector2f vel = direction * speed;
        
        // Add some radial component for interesting orbits
        sf::Vector2f radialDir = sf::Vector2f(cos(angle), sin(angle));
        vel += radialDir * (speedDist(rng) * 0.3f - 30.0f);
        
        // Color based on distance
        float dist = sqrt((pos.x - blackHolePos.x) * (pos.x - blackHolePos.x) + 
                         (pos.y - blackHolePos.y) * (pos.y - blackHolePos.y));
        float hue = (dist / 500.0f) * 360.0f;
        sf::Color color = hsvToRgb(hue, 0.8f, 1.0f);
        
        particles.emplace_back(pos, vel, mass, color, 1000.0f);
    }
    
    sf::Color hsvToRgb(float h, float s, float v) {
        int i = static_cast<int>(h / 60.0f) % 6;
        float f = (h / 60.0f) - i;
        float p = v * (1.0f - s);
        float q = v * (1.0f - s * f);
        float t = v * (1.0f - s * (1.0f - f));
        
        sf::Color color;
        switch (i) {
            case 0: color = sf::Color(v * 255, t * 255, p * 255); break;
            case 1: color = sf::Color(q * 255, v * 255, p * 255); break;
            case 2: color = sf::Color(p * 255, v * 255, t * 255); break;
            case 3: color = sf::Color(p * 255, q * 255, v * 255); break;
            case 4: color = sf::Color(t * 255, p * 255, v * 255); break;
            case 5: color = sf::Color(v * 255, p * 255, q * 255); break;
        }
        return color;
    }
    
    void update(float dt) {
        // Update particles
        for (auto& particle : particles) {
            // Calculate gravitational force
            sf::Vector2f toBlackHole = blackHolePos - particle.position;
            float distance = sqrt(toBlackHole.x * toBlackHole.x + toBlackHole.y * toBlackHole.y);
            
            if (distance < 0.1f) distance = 0.1f; // Avoid division by zero
            
            // Gravitational acceleration
            float forceMagnitude = (G * BLACK_HOLE_MASS) / (distance * distance);
            sf::Vector2f acceleration = (toBlackHole / distance) * forceMagnitude;
            
            // Update velocity
            particle.velocity += acceleration * dt;
            
            // Update position
            particle.position += particle.velocity * dt;
            
            // Update lifetime
            particle.lifetime -= dt;
            
            // Check if particle is inside event horizon
            if (distance < EVENT_HORIZON_RADIUS) {
                particle.lifetime = 0;
            }
        }
        
        // Remove dead particles and spawn new ones
        particles.erase(
            std::remove_if(particles.begin(), particles.end(),
                [](const Particle& p) { return p.lifetime <= 0; }),
            particles.end()
        );
        
        // Spawn new particles occasionally
        if (particles.size() < 100 && rng() % 60 == 0) {
            spawnParticle();
        }
    }
    
    void draw(sf::RenderWindow& window) {
        // Draw accretion disk (glowing effect)
        for (int i = 0; i < 3; i++) {
            float radius = EVENT_HORIZON_RADIUS + i * 10.0f;
            sf::CircleShape disk(radius);
            disk.setPosition(blackHolePos - sf::Vector2f(radius, radius));
            disk.setFillColor(sf::Color(100 + i * 20, 50 + i * 10, 150 + i * 30, 100));
            window.draw(disk);
        }
        
        // Draw event horizon
        sf::CircleShape eventHorizon(EVENT_HORIZON_RADIUS);
        eventHorizon.setPosition(blackHolePos - sf::Vector2f(EVENT_HORIZON_RADIUS, EVENT_HORIZON_RADIUS));
        eventHorizon.setFillColor(sf::Color::Black);
        window.draw(eventHorizon);
        
        // Draw black hole (slightly smaller)
        sf::CircleShape blackHole(BLACK_HOLE_RADIUS);
        blackHole.setPosition(blackHolePos - sf::Vector2f(BLACK_HOLE_RADIUS, BLACK_HOLE_RADIUS));
        blackHole.setFillColor(sf::Color(20, 20, 30));
        window.draw(blackHole);
        
        // Draw particles
        for (const auto& particle : particles) {
            float alpha = (particle.lifetime / particle.maxLifetime) * 255.0f;
            sf::Color drawColor = particle.color;
            drawColor.a = static_cast<std::uint8_t>(alpha);
            
            float size = 2.0f + particle.mass;
            sf::CircleShape particleShape(size);
            particleShape.setPosition(particle.position - sf::Vector2f(size, size));
            particleShape.setFillColor(drawColor);
            window.draw(particleShape);
        }
    }
    
    int getParticleCount() const { return particles.size(); }
};

int main() {
    sf::RenderWindow window(sf::VideoMode(sf::Vector2u(WINDOW_WIDTH, WINDOW_HEIGHT)), 
                           "Black Hole Simulation");
    window.setFramerateLimit(60);
    
    BlackHoleSimulation simulation;
    sf::Clock clock;
    sf::Font font;
    
    // Try to load a font (optional - for particle count display)
    // If font loading fails, we'll just skip text rendering
    
    while (window.isOpen()) {
        while (std::optional<sf::Event> event = window.pollEvent()) {
            if (event->is<sf::Event::Closed>()) {
                window.close();
            }
            if (const auto* keyPressed = event->getIf<sf::Event::KeyPressed>()) {
                if (keyPressed->code == sf::Keyboard::Key::Escape) {
                    window.close();
                }
            }
        }
        
        float dt = clock.restart().asSeconds();
        if (dt > 0.1f) dt = 0.1f; // Cap delta time for stability
        
        simulation.update(dt);
        
        window.clear(sf::Color(5, 5, 15)); // Dark space background
        simulation.draw(window);
        window.display();
    }
    
    return 0;
}

