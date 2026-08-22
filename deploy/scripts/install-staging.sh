#!/bin/bash
set -e

NAMESPACE="ai-ctrl-staging"
RELEASE_NAME="ai-ctrl-assistant"

echo "🚀 Installing AI CTRL Assistant to staging..."

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Label namespace
kubectl label namespace $NAMESPACE environment=staging --overwrite

# Install or upgrade Helm chart
helm upgrade --install $RELEASE_NAME ./deploy/helm/ai-ctrl-assistant \
  --namespace $NAMESPACE \
  --values ./deploy/helm/ai-ctrl-assistant/values-staging.yaml \
  --wait \
  --timeout 10m

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status:"
echo "  kubectl get pods -n $NAMESPACE"
echo ""
echo "🌐 Access the application:"
echo "  https://ai-assistant-staging.expedient.cloud"