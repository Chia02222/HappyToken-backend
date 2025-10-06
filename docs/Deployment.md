# Deployment

## Environments
- Development (local)
- Staging
- Production

## Pre-deploy Checklist
- All migrations reviewed and tested
- Env vars set in target environment
- Health checks configured

## Steps
1. Build backend
2. Run DB migrations (up to latest)
3. Start application

Example (CI/CD pseudocode):
```bash
pnpm run build
node backend/src/migrations/migrate.js  # or equivalent script
pm2 start dist/main.js  # or your process manager
```

## Rollback Strategy
- Re-deploy previous build
- Run down migrations if schema-breaking

## Post-deploy
- Verify health endpoint
- Tail logs for errors
- Run smoke tests on key endpoints
