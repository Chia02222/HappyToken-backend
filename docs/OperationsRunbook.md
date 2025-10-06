# Operations Runbook

## Routine Operations
- Run migrations to latest
- Rotate credentials and update env
- Review logs and error rates

## Health & Monitoring
- Define a health endpoint (e.g., GET /health) and monitor 200 responses
- Collect logs and metrics in centralized tooling

## Incidents
1. Identify scope (single user vs system-wide)
2. Check recent deploys and migrations
3. Inspect logs for error signatures
4. Rollback if needed
5. Communicate status and timeline

## Troubleshooting Guide
- Date shifts: check DateTimeTimezone.md and DB column types
- 500 errors: inspect stack traces in logs; validate env vars
- Migration failures: run down then up; verify DDL permissions

## Data Tasks
- Backfills: write idempotent scripts; run off-peak
- Exports: use read-only connections when possible
