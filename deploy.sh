#!/bin/bash
# Deployment Script for MCP Server
# Usage: ./deploy.sh [environment] [tag]

set -e

ENVIRONMENT=${1:-staging}
TAG=${2:-latest}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Deploying MCP Server to $ENVIRONMENT with tag $TAG"

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📋 Loading environment configuration for $ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | xargs)
else
    echo "⚠️  No environment file found for $ENVIRONMENT, using defaults"
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Check if image exists
if ! docker image inspect ultimate-mcp-server:$TAG > /dev/null 2>&1; then
    echo "❌ Image ultimate-mcp-server:$TAG not found"
    echo "🔨 Building image..."
    docker build -t ultimate-mcp-server:$TAG .
fi

# Health check before deployment
echo "🏥 Running health checks..."
docker run --rm ultimate-mcp-server:$TAG node -e "console.log('Image health check passed')"

# Deploy
echo "📦 Deploying to $ENVIRONMENT..."

# Set environment variables for docker-compose
export ENVIRONMENT=$ENVIRONMENT
export IMAGE_TAG=$TAG

# Stop existing containers
docker-compose down --remove-orphans

# Start new deployment
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to start..."
sleep 30

# Verify deployment
HEALTH_URL="http://localhost:${HEALTH_PORT:-3003}/health"
if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "✅ Deployment successful! Application is healthy at $HEALTH_URL"
else
    echo "❌ Deployment failed! Health check failed"
    echo "📋 Recent logs:"
    docker-compose logs --tail=20
    exit 1
fi

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
echo "🔗 MCP WebSocket: ws://localhost:${MCP_PORT:-3002}/mcp"
echo "🔗 Health Check: $HEALTH_URL"