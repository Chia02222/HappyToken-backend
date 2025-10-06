# Security

## Secrets
- Use environment variables or a secret manager
- Never commit secrets to VCS

## Input Validation
- All endpoints validated with Zod schemas in controller pipes

## CORS
- Tighten allowed origins in production

## Authentication/Authorization
- To be integrated; document token validation and roles here when added

## Dependencies
- Keep updated; run `npm audit`/`pnpm audit` periodically

## Data Protection
- Avoid logging PII; redact sensitive data in errors and logs
