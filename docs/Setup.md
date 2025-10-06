# Setup

## Prerequisites
- Node.js (LTS)
- pnpm or npm
- PostgreSQL (or Neon)
- Environment variables (see EnvConfig.md)

## Install
```bash
cd backend
pnpm install
# or
npm install
```

## Development
```bash
pnpm run start:dev
```

## Production
```bash
pnpm run build
pnpm run start:prod
```

## Database
- Configure `DATABASE_URL` in `.env`
- Run migrations via scripts in `backend/src/migrations` (see Database.md)

## Frontend (later integration)
This repo includes a Next.js frontend. To run it:
```bash
cd ..  # project root if needed
pnpm install
pnpm run dev
```
