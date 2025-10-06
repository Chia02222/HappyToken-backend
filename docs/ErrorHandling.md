# Error Handling

## Principles
- Map domain errors to correct HTTP status codes
- Never leak internal error details or stack traces in responses
- Log actionable details with correlation IDs if available

## Response Shape
```json
{
  "message": "Human-readable summary",
  "code": "OPTIONAL_ERROR_CODE",
  "details": "optional developer hint"
}
```

## Patterns
- Validation errors via Zod pipe → 400
- Not found → 404
- Conflict/duplicate → 409
- Unexpected → 500 (with safe message)
