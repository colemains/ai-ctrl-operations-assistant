#!/bin/bash
set -e

NAMESPACE="ai-ctrl-production"
RELEASE_NAME="ai-ctrl-assistant"

echo "🚀 Installing AI CTRL Assistant to PRODUCTION..."
echo "⚠️  This will deploy to PRODUCTION. Press Ctrl+C to cancel, or Enter to continue."
read

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Label namespace
kubectl label namespace $NAMESPACE environment=production --overwrite

# Install or upgrade Helm chart
helm upgrade --install $RELEASE_NAME ./deploy/helm/ai-ctrl-assistant \
  --namespace $NAMESPACE \
  --values ./deploy/helm/ai-ctrl-assistant/values-production.yaml \
  --wait \
  --timeout 15m

echo "✅ Production deployment complete!"
echo ""
echo "📊 Check status:"
echo "  kubectl get pods -n $NAMESPACE"
echo ""
echo "🌐 Access the application:"
echo "  https://ai-assistant.expedient.cloud"