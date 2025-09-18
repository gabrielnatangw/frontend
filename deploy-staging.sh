#!/bin/bash

# Deploy to Staging Environment
set -e

echo "🚀 Starting deployment to Staging..."

# Check if required environment variables are set
if [ -z "$GCP_PROJECT_ID_STAGING" ]; then
    echo "❌ Error: GCP_PROJECT_ID_STAGING environment variable is not set"
    exit 1
fi

# Set variables
PROJECT_ID=$GCP_PROJECT_ID_STAGING
SERVICE_NAME="smart-trace-staging"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/smart-trace-staging"

echo "�� Building Docker image for staging..."
docker build -f docker/Dockerfile.staging -t $IMAGE_NAME:latest .

echo "��️ Tagging image..."
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$(git rev-parse --short HEAD)

echo "�� Authenticating with Google Cloud..."
gcloud auth configure-docker

echo "�� Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$(git rev-parse --short HEAD)

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 80 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars VITE_APP_ENV=staging,VITE_API_URL=https://smart-platform.io:8443/api-v2,VITE_WS_URL=https://smart-platform.io:8443/api-v2/socket.io \
    --project $PROJECT_ID

echo "✅ Staging deployment completed successfully!"
echo "�� Service URL: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app"