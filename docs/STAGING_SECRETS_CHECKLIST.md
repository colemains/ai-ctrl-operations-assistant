# Staging Secrets Checklist

Before deploying to staging, gather these credentials:

## Database Credentials
- [ ] PostgreSQL admin password (strong, random)
- [ ] PostgreSQL user password (strong, random)
- [ ] Redis password (strong, random)

## Integration API Tokens (READ-ONLY)
- [ ] SMC API Token - READ-only scope
- [ ] Elastic API Key - READ-only scope
- [ ] OpenWebUI API Token - READ-only scope
- [ ] Confluence API Token - READ-only scope
- [ ] Alerts API Token - READ-only scope

## AI Provider
- [ ] Anthropic API Key (for Claude)

## Authentication (WorkOS)
- [ ] WorkOS API Key
- [ ] WorkOS Client ID

## Storage Location
Store actual values in:
- [ ] HashiCorp Vault (preferred)
- [ ] AWS Secrets Manager
- [ ] Azure Key Vault
- [ ] 1Password/LastPass (temporary)

## Security Notes
- All API tokens must be READ-ONLY
- Rotate credentials every 90 days
- Never commit real credentials to git
- Use separate credentials for staging vs production
