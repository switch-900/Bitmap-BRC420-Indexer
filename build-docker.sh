#!/bin/bash

# Build script for Bitmap BRC-420 Indexer Docker image

set -e

# Configuration
IMAGE_NAME="ghcr.io/switch-900/Bitmap-BRC420-Indexer"
VERSION=${1:-"latest"}

echo "Building Bitmap BRC-420 Indexer Docker image..."
echo "Image: $IMAGE_NAME:$VERSION"

# Build the Docker image
docker build -t "$IMAGE_NAME:$VERSION" .

# Tag as latest if version is specified
if [ "$VERSION" != "latest" ]; then
    docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest"
fi

echo "Build completed successfully!"
echo "To push the image, run:"
echo "  docker push $IMAGE_NAME:$VERSION"
if [ "$VERSION" != "latest" ]; then
    echo "  docker push $IMAGE_NAME:latest"
fi
