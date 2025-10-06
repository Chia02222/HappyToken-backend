# API

Base URL: `http://localhost:3001`

## Corporates
- GET `/corporates` → list corporates
- GET `/corporates/:id` → get corporate by uuid
- POST `/corporates` → create corporate
  - Body: CreateCorporateWithRelationsDto (corporate + contacts + subsidiaries + optional secondary_approver)
- PUT `/corporates/:id` → update corporate
  - Body: UpdateCorporateDto
- DELETE `/corporates/:id` → delete corporate and children
- PUT `/corporates/:id/status` → update status
  - Body: `{ status: string, note?: string }`

## PDFs
- GET `/corporates/:id/pdf` → render corporate agreement PDF (requires `FRONTEND_BASE_URL`)

## Investigation Logs
- POST `/corporates/:id/investigation-logs`
  - Body: `timestamp`, `note?`, `from_status?`, `to_status?`, `amendment_data?`

## Amendment Requests
- POST `/corporates/:id/amendment-requests`
- PATCH `/corporates/:id/amendment-requests/:amendmentId`
  - Body: `{ status: 'approved' | 'rejected', reviewNotes?: string }`
- GET `/corporates/amendment-requests?corporateId=...`
- GET `/corporates/:id/amendment-requests`
- GET `/corporates/amendment-requests/:amendmentId`

## Email/Resend
- POST `/corporates/:id/resend-link?approver=first|second`
- POST `/corporates/:id/send-amendment-email`
- POST `/corporates/:id/send-amend-reject-email`

## Pinned
- PUT `/corporates/:id/pinned`
  - Body: `{ pinned: boolean }`

## Status Codes
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request (validation)
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error
