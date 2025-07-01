#!/bin/bash

# Bitmap420 Indexer Setup Script for Umbrel
echo "🚀 Setting up Bitmap420 Indexer..."

# Check if required environment variables are set
if [ -z "$APP_DATA_DIR" ]; then
    echo "❌ APP_DATA_DIR not set. This script should be run within Umbrel environment."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p "$APP_DATA_DIR/data"
mkdir -p "$APP_DATA_DIR/logs"

# Test internal Umbrel service connectivity
echo "� Testing Umbrel internal service connectivity..."

# Test Ordinals service
if curl -s --connect-timeout 5 "http://ordinals_web_1:4000/status" > /dev/null 2>&1; then
    echo "✅ Ordinals service is accessible"
else
    echo "⚠️  Ordinals service is not accessible - indexer will retry automatically"
fi

# Test Mempool service
if curl -s --connect-timeout 5 "http://mempool_web_1:3006/api/blocks/tip/height" > /dev/null 2>&1; then
    echo "✅ Mempool service is accessible"
else
    echo "⚠️  Mempool service is not accessible - indexer will retry automatically"
fi

# All required Umbrel services are available
echo "🏠 Using Umbrel internal services for indexing"

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R 1001:1001 "$APP_DATA_DIR/data" "$APP_DATA_DIR/logs" 2>/dev/null || true

echo "✅ Setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  - Data directory: $APP_DATA_DIR/data"
echo "  - Logs directory: $APP_DATA_DIR/logs"  
echo "  - Ordinals API: http://ordinals_web_1:4000"
echo "  - Mempool API: http://mempool_web_1:3006/api"
echo "  - Web interface will be available on port 8080"
echo ""
echo "🎯 The indexer will start automatically and begin processing from block 792435"
echo "   Check logs for indexing progress and any issues."
