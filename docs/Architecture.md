# Architecture

## Overview
- Framework: NestJS
- ORM/Query: Kysely + Neon dialect
- Modules: corporates, contacts, subsidiaries, resend, seed

## Request Flow
Client → Controller → Service → DatabaseService/Kysely → Postgres

## Key Design Decisions
- Pure date fields use `DATE` to avoid TZ drift
- Timestamps use `TIMESTAMP WITHOUT TIME ZONE`
- Validation via Zod (pipes in controllers)
