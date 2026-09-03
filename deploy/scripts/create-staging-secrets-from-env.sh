#!/bin/bash
set -e

echo "================================================"
echo "Create Kubernetes Secrets from .env.staging"
echo "================================================"
echo ""

# Load environment file
ENV_FILE=".env.staging"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERROR: $ENV_FILE not found"
    echo ""
    echo "Create it from template:"
    echo "  cp .env.staging.template .env.staging"
    echo "  # Edit .env.staging and replace REPLACE_ME_* values"
    exit 1
fi

echo "✅ Loading secrets from $ENV_FILE"
source "$ENV_FILE"

# Validate no placeholders remain
if grep -q "REPLACE_ME_" "$ENV_FILE"; then
    echo ""
    echo "❌ ERROR: Placeholders still present in $ENV_FILE"
    echo ""
    echo "Run validation first:"
    echo "  ./deploy/scripts/validate-secrets.sh"
    exit 1
fi

echo "✅ Secrets validated"
echo ""

# Create namespace if needed
kubectl create namespace ai-ctrl-staging --dry-run=client -o yaml | kubectl apply -f -

echo "Creating Kubernetes secrets..."
echo ""

# Database credentials
kubectl create secret generic ai-ctrl-db-credentials \
  --namespace=ai-ctrl-staging \
  --from-literal=postgres-password="${DATABASE_URL#*:}" \
  --from-literal=password="${DATABASE_URL#*:}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Created: ai-ctrl-db-credentials"

# Redis credentials
kubectl create secret generic ai-ctrl-redis-credentials \
  --namespace=ai-ctrl-staging \
  --from-literal=password="${REDIS_URL#*:}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Created: ai-ctrl-redis-credentials"

# API tokens
kubectl create secret generic ai-ctrl-api-tokens \
  --namespace=ai-ctrl-staging \
  --from-literal=SMC_API_TOKEN="$SMC_API_TOKEN" \
  --from-literal=ELASTIC_API_KEY="$ELASTIC_API_KEY" \
  --from-literal=OPENWEBUI_API_TOKEN="$OPENWEBUI_API_TOKEN" \
  --from-literal=CONFLUENCE_API_TOKEN="$CONFLUENCE_API_TOKEN" \
  --from-literal=ALERTS_API_TOKEN="$ALERTS_API_TOKEN" \
  --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --from-literal=AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
  --from-literal=AZURE_AD_CLIENT_SECRET="$AZURE_AD_CLIENT_SECRET" \
  --from-literal=AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Created: ai-ctrl-api-tokens"

echo ""
echo "================================================"
echo "✅ All secrets created successfully"
echo "================================================"
echo ""
echo "Verify with:"
echo "  kubectl get secrets -n ai-ctrl-staging"
