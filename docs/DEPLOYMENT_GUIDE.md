# AI CTRL Operations Assistant - Deployment Guide

## Overview

This guide covers deploying the AI CTRL Operations Assistant to staging and production Kubernetes environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Infrastructure Requirements

**Kubernetes Cluster:**
- Kubernetes 1.24+
- Minimum 3 worker nodes
- 8 vCPU, 16GB RAM minimum per node
- 100GB+ storage per node

**Required Add-ons:**
- Ingress controller (nginx-ingress recommended)
- Cert-manager for TLS certificate automation
- Metrics server for HPA
- Storage class with dynamic provisioning

**External Services:**
- Container registry access (Docker Hub, ECR, ACR, or GCR)
- DNS management for ingress hostname
- Secrets management (Vault, AWS Secrets Manager, or Azure Key Vault recommended)

### Access Requirements

- `kubectl` configured with cluster admin access
- `helm` v3.12+ installed locally
- Container registry credentials
- API tokens for integrations (see STAGING_SECRETS_CHECKLIST.md)

### Security Prerequisites

### Authentication (Azure AD / Entra ID)

**Identity Provider:** Microsoft Entra ID (Azure AD)

**Authentication Flow:**
1. User visits `ai-assistant-staging.expedient.cloud`
2. Redirected to Microsoft login
3. User authenticates with Microsoft Authenticator (MFA)
4. Token validated and user session created
5. RBAC enforced based on Azure AD group membership

**Required Azure AD Configuration:**
- App registration in Azure AD
- Redirect URIs configured for staging/production domains
- API permissions: `User.Read`, `GroupMember.Read.All`
- Client secret or certificate for backend authentication

**WorkOS Integration (if used):**
- WorkOS configured with Azure AD as SSO provider
- WorkOS handles authorization layer (role mapping, client scope)
- Users still authenticate via Microsoft Authenticator

---

## Architecture

### Component Overview
┌─────────────────────────────────────────────────────────┐
│ Ingress (HTTPS) │
│ ai-assistant-staging.expedient.cloud │
└────────────────┬────────────────────────────────────────┘
│
┌────────┴────────┐
│ │
┌───────▼──────┐ ┌──────▼────────┐
│ Web (Next) │ │ Mastra (Node) │
│ Port 3000 │ │ Port 8080 │
│ 2-5 replicas│ │ 2-5 replicas │
└───────┬──────┘ └──────┬────────┘
│ │
│ ┌──────┴────────┐
│ │ │
│ ┌─────▼─────┐ ┌─────▼─────┐
│ │PostgreSQL │ │ Redis │
│ │ 5432 │ │ 6379 │
│ │ StatefulSet│ │Deployment │
│ └───────────┘ └───────────┘
│
└──────────────────┐
│
┌──────▼──────┐
│ External │
│ Integrations│
│ (READ-only)│
└─────────────┘

### Resource Distribution

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
|-----------|-------------|-----------|----------------|--------------|---------|
| Web | 250m | 1000m | 512Mi | 2Gi | - |
| Mastra | 500m | 2000m | 1Gi | 4Gi | - |
| PostgreSQL | 250m | 1000m | 512Mi | 2Gi | 10Gi |
| Redis | 100m | 500m | 256Mi | 1Gi | 5Gi |

---

## Staging Deployment

### Step 1: Prepare Cluster

```bash
# Create namespace
kubectl create namespace ai-ctrl-staging

# Verify namespace
kubectl get namespace ai-ctrl-staging