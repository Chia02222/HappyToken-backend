# Environment Configuration

Document all required environment variables with descriptions, defaults, and examples.

| Name | Required | Default | Example | Description |
|------|----------|---------|---------|-------------|
| PORT | no | 3001 | 3001 | API port |
| DATABASE_URL | yes | - | postgres://... | Postgres/Neon connection |
| FRONTEND_BASE_URL | yes | - | https://app.example.com | Used for PDF generation links |

Store secrets outside VCS. Prefer `.env.local` for local dev.
