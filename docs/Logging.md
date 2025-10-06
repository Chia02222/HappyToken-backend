# Logging

## Levels
- debug (dev only)
- info (business flow)
- warn (recoverable issues)
- error (failures)

## Format
Prefer structured JSON logs in production:
```json
{"level":"info","module":"CorporateService","action":"update","corporateId":"...","message":"Updated successfully"}
```

## PII Policy
- Do not log emails, phone numbers, or secrets
- Hash identifiers when possible

## Destinations
- Local: stdout
- Production: ship to centralized log platform
