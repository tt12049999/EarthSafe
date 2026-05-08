#!/bin/bash
# EarthSafe — Google Cloud Run deployment script
#
# Prerequisites:
#   1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. Run: gcloud auth login
#   3. Fill in PROJECT_ID below (your GCP project ID)
#
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh

set -e

# ── EDIT THIS ─────────────────────────────────────────────────────────────────
PROJECT_ID="YOUR_GCP_PROJECT_ID"   # e.g. earthsafe-418
REGION="us-central1"
# ─────────────────────────────────────────────────────────────────────────────

IMAGE_API="gcr.io/${PROJECT_ID}/earthsafe-api"
IMAGE_APP="gcr.io/${PROJECT_ID}/earthsafe-app"

echo "==> Setting GCP project: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

echo "==> Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  --quiet

echo "==> Configuring Docker auth..."
gcloud auth configure-docker --quiet

echo ""
echo "==> Building + pushing API image..."
docker build -f Dockerfile.api -t "${IMAGE_API}" .
docker push "${IMAGE_API}"

echo ""
echo "==> Deploying Flask API to Cloud Run..."
gcloud run deploy earthsafe-api \
  --image "${IMAGE_API}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --quiet

API_URL=$(gcloud run services describe earthsafe-api \
  --region "${REGION}" --format "value(status.url)")
echo ""
echo "✅ API live at: ${API_URL}"
echo "   Test: curl ${API_URL}/health"

echo ""
echo "==> Building + pushing Streamlit image..."
docker build -f Dockerfile.app -t "${IMAGE_APP}" .
docker push "${IMAGE_APP}"

echo ""
echo "==> Deploying Streamlit App to Cloud Run..."
gcloud run deploy earthsafe-app \
  --image "${IMAGE_APP}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8501 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --quiet

APP_URL=$(gcloud run services describe earthsafe-app \
  --region "${REGION}" --format "value(status.url)")
echo ""
echo "✅ App live at: ${APP_URL}"
echo ""
echo "========================================"
echo "  EarthSafe deployment complete!"
echo "  API : ${API_URL}"
echo "  App : ${APP_URL}"
echo "========================================"
echo ""
echo "Remember to update README.md and final slides with these URLs."
