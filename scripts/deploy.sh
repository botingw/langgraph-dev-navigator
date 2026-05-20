#!/usr/bin/env bash
# Build and deploy the landing page to Cloud Run.
#
# Env vars and secret mounts (NODE_ENV, FRONTEND_URL, DATABASE_URL, ADMIN_PASSWORD)
# are preserved from the prior service revision — to change them, edit the service
# in Console / via `gcloud run services update` separately.
#
# Usage:
#   ./scripts/deploy.sh

set -euo pipefail

PROJECT_ID=plucky-ripsaw-477108-m2
REGION=us-central1
SERVICE_NAME=landing-page
REPO=landing-page
IMAGE=landing
TAG="v$(date -u +%Y%m%d-%H%M%S)"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:${TAG}"

cd "$(dirname "$0")/.."

echo "→ Building ${IMAGE_URI}"
docker build -t "${IMAGE_URI}" .

echo "→ Pushing to Artifact Registry"
docker push "${IMAGE_URI}"

echo "→ Deploying new Cloud Run revision (env + secrets preserved)"
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_URI}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}"

echo ""
echo "→ Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)"
