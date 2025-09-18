#!/bin/bash

# Deploy to Production Environment
set -e

echo "🚀 Starting deployment to Production..."

# Check if required environment variables are set
if [ -z "$GCP_PROJECT_ID_PRODUCTION" ]; then
    echo "❌ Error: GCP_PROJECT_ID_PRODUCTION environment variable is not set"
    exit 1
fi

# Set variables
PROJECT_ID=$GCP_PROJECT_ID_PRODUCTION
SERVICE_NAME="smart-trace-production"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/smart-trace-production"

echo "📦 Building Docker image for production..."
docker build -f docker/Dockerfile.production -t $IMAGE_NAME:latest .

echo "🏷️ Tagging image..."
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$(git rev-parse --short HEAD)

echo "🔐 Authenticating with Google Cloud..."
gcloud auth configure-docker

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$(git rev-parse --short HEAD)

echo "🚀 Deploying to Cloud Run (Blue-Green deployment)..."
# Deploy new revision without traffic
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 80 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 20 \
    --min-instances 1 \
    --set-env-vars VITE_APP_ENV=production \
    --no-traffic \
    --project $PROJECT_ID

echo "🔍 Performing health check on new revision..."
sleep 30

# Get the new revision URL for health check
NEW_REVISION=$(gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --limit=1 --format="value(metadata.name)" --project $PROJECT_ID)
NEW_URL=$(gcloud run revisions describe $NEW_REVISION --region=$REGION --format="value(status.url)" --project $PROJECT_ID)

echo "Testing new revision: $NEW_URL"
if curl -f "$NEW_URL/health"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed! Aborting deployment."
    exit 1
fi

echo "🔄 Switching traffic to new revision..."
gcloud run services update-traffic $SERVICE_NAME \
    --to-latest \
    --region $REGION \
    --project $PROJECT_ID

echo "✅ Production deployment completed successfully!"
echo "🌐 Service URL: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app"
