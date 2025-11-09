cmake_minimum_required(VERSION 3.10)
project(BlackHoleSimulation)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SFML (supports both 2.5 and 3.0)
# Note: SFML 3.0 requires capitalized component names
find_package(SFML COMPONENTS System Window Graphics REQUIRED)

# Add executable
add_executable(${PROJECT_NAME} main.cpp)

# Link SFML libraries
# Note: SFML::Graphics automatically links Window and System
target_link_libraries(${PROJECT_NAME} 
    SFML::Graphics
)

# Set output directory
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

