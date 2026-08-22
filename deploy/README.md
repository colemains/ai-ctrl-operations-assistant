# AI CTRL Operations Assistant - Kubernetes Deployment

## Prerequisites

- Kubernetes cluster (1.24+)
- `kubectl` configured
- Helm 3.x installed
- Docker registry access (GHCR)
- Cert-manager installed (for TLS)
- Ingress controller (nginx)

## Quick Start - Staging

```bash
# Build and push images
docker build -f Dockerfile.web -t ghcr.io/expedient/ai-ctrl-assistant-web:staging .
docker build -f Dockerfile.mastra -t ghcr.io/expedient/ai-ctrl-assistant-mastra:staging .

docker push ghcr.io/expedient/ai-ctrl-assistant-web:staging
docker push ghcr.io/expedient/ai-ctrl-assistant-mastra:staging

# Deploy to staging
chmod +x deploy/scripts/install-staging.sh
./deploy/scripts/install-staging.sh