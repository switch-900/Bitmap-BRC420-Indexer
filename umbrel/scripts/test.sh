#!/bin/bash

# Test script for Bitmap420 Indexer
echo "🧪 Testing Bitmap420 Indexer installation..."

# Wait for service to be ready
echo "⏳ Waiting for service to start..."
sleep 10

# Check health endpoint
echo "🏥 Checking health endpoint..."
if curl -s -f "http://localhost:8080/health" > /dev/null; then
    echo "✅ Health endpoint is responding"
    
    # Get health status
    HEALTH_STATUS=$(curl -s "http://localhost:8080/health" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    echo "   Status: $HEALTH_STATUS"
else
    echo "❌ Health endpoint is not responding"
    exit 1
fi

# Check API endpoints
echo "🔌 Testing API endpoints..."

# Test deploys endpoint
if curl -s -f "http://localhost:8080/api/deploys?limit=1" > /dev/null; then
    echo "✅ Deploys API is working"
else
    echo "⚠️  Deploys API is not ready yet (this is normal during initial indexing)"
fi

# Test bitmaps endpoint  
if curl -s -f "http://localhost:8080/api/bitmaps?limit=1" > /dev/null; then
    echo "✅ Bitmaps API is working"
else
    echo "⚠️  Bitmaps API is not ready yet (this is normal during initial indexing)"
fi

# Test parcels endpoint
if curl -s -f "http://localhost:8080/api/parcels?limit=1" > /dev/null; then
    echo "✅ Parcels API is working"
else
    echo "⚠️  Parcels API is not ready yet (this is normal during initial indexing)"
fi

# Check if web interface is accessible
echo "🌐 Testing web interface..."
if curl -s -f "http://localhost:8080/" > /dev/null; then
    echo "✅ Web interface is accessible"
else
    echo "❌ Web interface is not accessible"
    exit 1
fi

echo ""
echo "🎉 Installation test completed!"
echo "📱 Web interface: http://localhost:8080"
echo "🔗 API documentation: http://localhost:8080/api"
echo ""
echo "Note: The indexer may take some time to fully sync. Check the logs for progress."
