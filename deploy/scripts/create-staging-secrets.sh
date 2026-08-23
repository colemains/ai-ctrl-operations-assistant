#!/bin/bash
set -e

NAMESPACE="ai-ctrl-staging"

echo "Creating secrets for AI CTRL Assistant - Staging"

# Create namespace if it doesn't exist
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Database credentials
kubectl create secret generic ai-ctrl-db-credentials \
  -n ${NAMESPACE} \
  --from-literal=postgres-password='CHANGE_ME_POSTGRES_ADMIN' \
  --from-literal=password='CHANGE_ME_DB_PASSWORD' \
  --dry-run=client -o yaml | kubectl apply -f -

# Redis credentials
kubectl create secret generic ai-ctrl-redis-credentials \
  -n ${NAMESPACE} \
  --from-literal=password='CHANGE_ME_REDIS_PASSWORD' \
  --dry-run=client -o yaml | kubectl apply -f -

# API tokens (READ-only)
kubectl create secret generic ai-ctrl-api-tokens \
  -n ${NAMESPACE} \
  --from-literal=SMC_API_TOKEN='CHANGE_ME_SMC_TOKEN' \
  --from-literal=ELASTIC_API_KEY='CHANGE_ME_ELASTIC_KEY' \
  --from-literal=OPENWEBUI_API_TOKEN='CHANGE_ME_OPENWEBUI_TOKEN' \
  --from-literal=CONFLUENCE_API_TOKEN='CHANGE_ME_CONFLUENCE_TOKEN' \
  --from-literal=ALERTS_API_TOKEN='CHANGE_ME_ALERTS_TOKEN' \
  --from-literal=ANTHROPIC_API_KEY='CHANGE_ME_ANTHROPIC_KEY' \
  --from-literal=WORKOS_API_KEY='CHANGE_ME_WORKOS_KEY' \
  --from-literal=WORKOS_CLIENT_ID='CHANGE_ME_WORKOS_CLIENT' \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secrets created in namespace: ${NAMESPACE}"
echo "⚠️  Remember to update the CHANGE_ME_ values with real credentials!"
