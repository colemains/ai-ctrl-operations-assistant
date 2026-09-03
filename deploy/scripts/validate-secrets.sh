#!/bin/bash
set -e

echo "================================================"
echo "AI CTRL Secrets Validation"
echo "================================================"
echo ""

ENV_FILE="${1:-.env.staging}"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERROR: Environment file not found: $ENV_FILE"
    echo ""
    echo "Create it from template:"
    echo "  cp .env.staging.template .env.staging"
    exit 1
fi

echo "✅ Found environment file: $ENV_FILE"
echo ""

# Check for unreplaced placeholders
PLACEHOLDERS=$(grep -c "REPLACE_ME_" "$ENV_FILE" || true)

if [ "$PLACEHOLDERS" -gt 0 ]; then
    echo "⚠️  WARNING: Found $PLACEHOLDERS unreplaced placeholders:"
    echo ""
    grep "REPLACE_ME_" "$ENV_FILE" | sed 's/^/  /'
    echo ""
    echo "Replace these values with real credentials before deploying."
    exit 1
else
    echo "✅ No placeholders found - all secrets configured"
fi

echo ""
echo "Validating required variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "SMC_API_TOKEN"
    "ELASTIC_API_KEY"
    "OPENWEBUI_API_TOKEN"
    "CONFLUENCE_API_TOKEN"
    "ALERTS_API_TOKEN"
    "AZURE_AD_CLIENT_ID"
    "AZURE_AD_CLIENT_SECRET"
    "ANTHROPIC_API_KEY"
)

MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$VAR=" "$ENV_FILE"; then
        echo "❌ Missing: $VAR"
        MISSING=$((MISSING + 1))
    else
        echo "✅ Found: $VAR"
    fi
done

echo ""
if [ $MISSING -gt 0 ]; then
    echo "❌ Validation failed: $MISSING required variables missing"
    exit 1
else
    echo "✅ All required secrets configured"
    echo ""
    echo "Ready to deploy to staging!"
fi
