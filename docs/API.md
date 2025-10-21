# API Reference

Base URL: `http://localhost:3001`

## Overview
This is a comprehensive reference for the HappyToken Backend API. For detailed documentation with examples, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md).

## Health & Status
- `GET /` - API status check
- `GET /health` - Health check with database connectivity

## Corporate Management
- `GET /corporates` - List all corporates
- `GET /corporates/:id` - Get corporate by UUID
- `POST /corporates` - Create corporate with contacts and subsidiaries
- `PUT /corporates/:id` - Update corporate
- `DELETE /corporates/:id` - Delete corporate and children
- `PUT /corporates/:id/status` - Update corporate status
- `GET /corporates/:id/pdf` - Generate corporate agreement PDF
- `POST /corporates/:id/investigation-logs` - Add investigation log
- `PUT /corporates/:id/pinned` - Update pinned status

## Amendment Requests
- `POST /corporates/:id/amendment-requests` - Create amendment request
- `PATCH /corporates/:id/amendment-requests/:amendmentId` - Update amendment status
- `GET /corporates/amendment-requests?corporateId=...` - Get amendment requests
- `GET /corporates/:id/amendment-requests` - Get corporate amendment requests
- `GET /corporates/amendment-requests/:amendmentId` - Get amendment by ID

## Email & Notifications
- `POST /corporates/:id/resend-link?approver=first|second` - Send approval link
- `POST /corporates/:id/send-amendment-email` - Send amendment request email
- `POST /corporates/:id/send-amend-reject-email` - Send amendment rejection email
- `POST /corporates/:id/complete-cooling-period` - Complete cooling period

## Contact Management
- `GET /contacts` - List all contacts
- `GET /contacts/:uuid` - Get contact by UUID
- `POST /contacts/:corporateUuid` - Add contact to corporate
- `PUT /contacts/:uuid` - Update contact
- `DELETE /contacts/:uuid` - Delete contact

## Subsidiary Management
- `GET /subsidiaries` - List all subsidiaries
- `GET /subsidiaries/:uuid` - Get subsidiary by UUID
- `POST /subsidiaries/:corporateUuid` - Add subsidiary to corporate
- `PUT /subsidiaries/:uuid` - Update subsidiary
- `DELETE /subsidiaries/:uuid` - Delete subsidiary

## Email Service
- `GET /resend` - Resend service status
- `POST /resend/send-custom-email` - Send custom email

## Database Management
- `GET /seed` - Seed service status
- `POST /seed` - Seed database with initial data

## Request/Response Examples

### Create Corporate
```json
POST /corporates
{
  "company_name": "Example Corp",
  "reg_number": "123456-X",
  "office_address1": "123 Main St",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "country": "Malaysia",
  "contacts": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company_role": "CEO",
      "system_role": "primary_contact"
    }
  ],
  "subsidiaries": [
    {
      "company_name": "Sub Corp",
      "reg_number": "789012-Y"
    }
  ]
}
```

### Update Status
```json
PUT /corporates/:id/status
{
  "status": "Pending 1st Approval",
  "note": "Status updated with reason"
}
```

### Investigation Log
```json
POST /corporates/:id/investigation-logs
{
  "timestamp": "2024-01-01T00:00:00Z",
  "note": "Investigation note",
  "from_status": "Draft",
  "to_status": "Pending 1st Approval",
  "amendment_data": {}
}
```

### Amendment Status Update
```json
PATCH /corporates/:id/amendment-requests/:amendmentId
{
  "status": "approved",
  "reviewNotes": "Amendment approved with notes"
}
```

## Status Codes
- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request (validation errors)
- `404` Not Found
- `409` Conflict
- `500` Internal Server Error

## Environment Variables
- `DATABASE_URL` - Database connection string
- `RESEND_API_KEY` - Resend email service API key
- `SENDER_EMAIL` - Email address for sending notifications
- `FRONTEND_BASE_URL` - Frontend URL for PDF generation
