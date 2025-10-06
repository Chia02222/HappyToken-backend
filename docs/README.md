# HappyToken Backend Documentation

Backend for managing corporates, contacts, subsidiaries, approvals and amendment workflows.

## Quick Links
- Setup: ./Setup.md 
    — Local install, run commands, and DB setup
- Environment: ./EnvConfig.md 
    — Required environment variables and examples
- Architecture: ./Architecture.md 
    — High-level design, modules, and request flow
- Database: ./Database.md 
    — Schema, migrations, types policy, and performance notes
- API: ./API.md 
    — REST endpoints, params, payloads, and status codes
- Date/Time & Timezone: ./DateTimeTimezone.md 
    — Project rules for dates, timestamps, and MYT handling
- Error Handling: ./ErrorHandling.md 
    — Error shapes, HTTP mapping, and best practices
- Logging: ./Logging.md 
    — Log levels, formats, destinations, and PII policy
- Security: ./Security.md 
    — Secrets, input validation, CORS, dependencies
- Deployment: ./Deployment.md 
    — Build, migrate, start, rollback, and post-deploy checks
- Testing: ./Testing.md 
    — Test structure, commands, CI guidance
- Contributing: ./Contributing.md 
    — Branching, PRs, style, and commit conventions
- Operations Runbook: ./OperationsRunbook.md 
    — Routine ops, incidents, troubleshooting
- Release Notes: ./ReleaseNotes.md 
    — Notable changes per release
- Glossary: ./Glossary.md 
    — Domain terms used in the project

## Tech Stack
- NestJS, Kysely (Neon dialect)
- PostgreSQL/Neon
- Zod for validation

## Purpose
- Single source of truth for corporates and related entities
- Approval workflows (1st and 2nd approver)
- Amendment request lifecycle and logging
