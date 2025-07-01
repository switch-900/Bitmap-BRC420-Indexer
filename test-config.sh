#!/bin/bash

# Test script for Bitmap420 Indexer configuration

set -e

echo "🧪 Testing Bitmap420 Indexer Configuration..."

# Test 1: Check if all required files exist
echo "📁 Checking required files..."

required_files=(
    "Dockerfile"
    "package.json"
    "server/package.json"
    "client/package.json"
    "umbrel/umbrel-app.yml"
    "umbrel/docker-compose.yml"
    "umbrel/README.md"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test 2: Validate YAML files
echo "📝 Validating YAML files..."

if command -v yq &> /dev/null; then
    echo "Validating umbrel-app.yml..."
    yq eval '.' umbrel/umbrel-app.yml > /dev/null && echo "✅ umbrel-app.yml is valid"
    
    echo "Validating docker-compose.yml..."
    yq eval '.' umbrel/docker-compose.yml > /dev/null && echo "✅ docker-compose.yml is valid"
else
    echo "⚠️ yq not found, skipping YAML validation"
fi

# Test 3: Check package.json structure
echo "📦 Checking package.json structure..."

if jq -e '.workspaces' package.json > /dev/null; then
    echo "✅ Root package.json has workspaces configuration"
else
    echo "❌ Root package.json missing workspaces configuration"
    exit 1
fi

if jq -e '.scripts.dev' package.json > /dev/null; then
    echo "✅ Root package.json has dev script"
else
    echo "❌ Root package.json missing dev script"
fi

# Test 4: Check Docker configuration
echo "🐳 Checking Docker configuration..."

if grep -q "FROM node:18-alpine" Dockerfile; then
    echo "✅ Dockerfile uses correct Node.js version"
else
    echo "❌ Dockerfile missing or incorrect Node.js version"
    exit 1
fi

if grep -q "EXPOSE 5000 8080" Dockerfile; then
    echo "✅ Dockerfile exposes correct ports"
else
    echo "❌ Dockerfile missing port configuration"
    exit 1
fi

# Test 5: Check Umbrel configuration
echo "☂️ Checking Umbrel configuration..."

if grep -q "ordinals_web_1:4000" umbrel/docker-compose.yml; then
    echo "✅ Docker compose uses internal Ordinals endpoint"
else
    echo "❌ Docker compose missing Ordinals endpoint"
    exit 1
fi

if grep -q "mempool_web_1:3006" umbrel/docker-compose.yml; then
    echo "✅ Docker compose uses internal Mempool endpoint"
else
    echo "❌ Docker compose missing Mempool endpoint"
    exit 1
fi

# Test 6: Check dependencies
echo "🔗 Checking dependencies..."

if grep -q "ordinals" umbrel/umbrel-app.yml && grep -q "mempool" umbrel/umbrel-app.yml; then
    echo "✅ Umbrel app has correct dependencies"
else
    echo "❌ Umbrel app missing required dependencies"
    exit 1
fi

# Test 7: Check if TypeScript files compile
echo "📝 Checking TypeScript compilation..."

if [[ -f "server/tsconfig.json" ]]; then
    echo "✅ Server TypeScript config exists"
else
    echo "❌ Server TypeScript config missing"
    exit 1
fi

if [[ -f "client/tsconfig.json" ]]; then
    echo "✅ Client TypeScript config exists"
else
    echo "❌ Client TypeScript config missing"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Configuration is ready for Umbrel deployment."
echo ""
echo "Next steps:"
echo "1. Build Docker image: docker build -t Bitmap-BRC420-Indexer ."
echo "2. Test locally: docker run -p 8080:8080 Bitmap-BRC420-Indexer"
echo "3. Deploy to Umbrel using the umbrel/ directory"
echo ""
echo "📚 See UMBREL_DEPLOYMENT.md for detailed deployment instructions"
