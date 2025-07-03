#!/bin/bash

# Bitmap BRC-420 Indexer Setup Script for Umbrel

set -e

echo "🚀 Setting up Bitmap BRC-420 Indexer for Umbrel..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Configuration
REPO_URL="https://github.com/switch-900/Bitmap-BRC420-Indexer.git"
APP_DIR="Bitmap-BRC420-Indexer"
UMBREL_APPS_DIR="$HOME/umbrel/apps"

# Functions
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is required but not installed."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed."
        exit 1
    fi
    
    echo "✅ Dependencies satisfied"
}

clone_repository() {
    echo "📥 Cloning repository..."
    
    if [ -d "$APP_DIR" ]; then
        echo "📁 Directory $APP_DIR already exists, pulling latest changes..."
        cd "$APP_DIR"
        git pull origin main
        cd ..
    else
        git clone "$REPO_URL" "$APP_DIR"
    fi
    
    echo "✅ Repository cloned/updated"
}

build_docker_image() {
    echo "🐳 Building Docker image..."
    
    cd "$APP_DIR"
    chmod +x build-docker.sh
    ./build-docker.sh
    cd ..
    
    echo "✅ Docker image built successfully"
}

setup_umbrel_app() {
    echo "📋 Setting up Umbrel app configuration..."
    
    # Create Umbrel apps directory if it doesn't exist
    mkdir -p "$UMBREL_APPS_DIR"
    
    # Copy Umbrel configuration
    cp -r "$APP_DIR/umbrel" "$UMBREL_APPS_DIR/$APP_DIR"
    
    echo "✅ Umbrel app configuration copied"
}

show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Add this app store to your Umbrel:"
    echo "   - Go to Umbrel Settings > App Store"
    echo "   - Add community app store: file://$UMBREL_APPS_DIR"
    echo ""
    echo "2. Ensure dependencies are installed:"
    echo "   - Bitcoin Core app"
    echo "   - Ordinals app"
    echo "   - Mempool app (optional but recommended)"
    echo ""
    echo "3. Install the Bitmap420 Indexer app from your community store"
    echo ""
    echo "4. Access the app at: http://umbrel.local:8080"
    echo ""
    echo "📚 For more information, see: $APP_DIR/umbrel/README.md"
}

main() {
    check_dependencies
    clone_repository
    build_docker_image
    setup_umbrel_app
    show_next_steps
}

# Run main function
main "$@"
