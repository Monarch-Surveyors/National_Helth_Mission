#!/bin/bash
# Deployment script for National Health Mission

# Exit on any error
set -e

echo "Starting deployment process..."

# Pull the latest changes from the production branch
echo "Pulling latest changes from git..."
git checkout production
git pull origin production

# Build and start the docker containers
echo "Building and starting Docker containers..."
docker compose build
docker compose up -d

# Output status
echo "Deployment successful! Containers are running."
docker compose ps

