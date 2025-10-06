# Testing

## Structure
- Unit tests: services and utils (fast, isolated)
- E2E tests: controllers with in-memory or test DB

## Commands
```bash
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## Best Practices
- One assertion per behavior
- Minimal mocking; prefer test DB for integration
- Clean DB between tests

## CI Notes
- Run unit tests in parallel
- Run E2E on every PR to main
