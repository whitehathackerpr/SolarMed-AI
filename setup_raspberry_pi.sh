#!/bin/bash

# Setup script for SolarMed AI on Raspberry Pi
# This script installs all dependencies and sets up the application

echo "Setting up SolarMed AI on Raspberry Pi..."

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker and Docker Compose
echo "Installing Docker and Docker Compose..."
curl -sSL https://get.docker.com | sh
sudo apt-get install -y libffi-dev libssl-dev
sudo apt-get install -y python3 python3-pip
sudo pip3 install docker-compose

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Create data directories
echo "Creating data directories..."
mkdir -p uploads/images uploads/voice

# Copy environment files
echo "Setting up environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start the application
echo "Building and starting SolarMed AI..."
docker-compose up -d

echo "SolarMed AI setup complete!"
echo "The application should be running at http://localhost:5173"
echo "The API is available at http://localhost:8000"
echo "API documentation is available at http://localhost:8000/docs"
