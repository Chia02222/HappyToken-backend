# API Documentation

## Overview
This document describes the complete API endpoints for the HappyToken Backend system, including corporate management, approval workflows, email notifications, and database operations.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.happietoken.com`

## Authentication
All endpoints require proper authentication. Include authentication headers as needed.

## API Structure
The API is built with Elysia framework and includes the following modules:
- **Corporate Management**: CRUD operations for corporate accounts
- **Contact Management**: Managing corporate contacts
- **Subsidiary Management**: Managing corporate subsidiaries
- **Email Services**: Resend integration for notifications
- **Database Operations**: Seeding and maintenance
- **PDF Generation**: Corporate agreement PDFs

## Core API Endpoints

### Health & Status
- `GET /` - API status check
- `GET /health` - Health check with database connectivity

### Corporate Management Endpoints

#### 1. List All Corporates
**Endpoint**: `GET /corporates`

**Description**: Retrieves all corporate accounts.

**Response**:
```json
[
  {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "company_name": "Example Corp",
    "reg_number": "123456-X",
    "status": "Draft",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 2. Get Corporate by ID
**Endpoint**: `GET /corporates/:id`

**Description**: Retrieves a specific corporate by UUID.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "company_name": "Example Corp",
  "reg_number": "123456-X",
  "status": "Pending 1st Approval",
  "contacts": [...],
  "subsidiaries": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 3. Create Corporate
**Endpoint**: `POST /corporates`

**Description**: Creates a new corporate account with contacts and subsidiaries.

**Request Body**:
```json
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

**Response**: Created corporate object with UUID.

#### 4. Update Corporate
**Endpoint**: `PUT /corporates/:id`

**Description**: Updates an existing corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**: Same structure as create, with fields to update.

**Response**: Updated corporate object.

#### 5. Delete Corporate
**Endpoint**: `DELETE /corporates/:id`

**Description**: Deletes a corporate account and all related data.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "success": true,
  "message": "Corporate deleted successfully"
}
```

#### 6. Update Corporate Status
**Endpoint**: `PUT /corporates/:id/status`

**Description**: Updates the status of a corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**:
```json
{
  "status": "Pending 1st Approval",
  "note": "Status updated with reason"
}
```

**Response**: Updated corporate object.

#### 7. Generate Corporate PDF
**Endpoint**: `GET /corporates/:id/pdf`

**Description**: Generates and downloads the corporate agreement PDF.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**: PDF file download

**Requirements**: `FRONTEND_BASE_URL` environment variable must be configured.

#### 8. Add Investigation Log
**Endpoint**: `POST /corporates/:id/investigation-logs`

**Description**: Adds an investigation log entry for a corporate.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "note": "Investigation note",
  "from_status": "Draft",
  "to_status": "Pending 1st Approval",
  "amendment_data": {}
}
```

**Response**: Created investigation log object.

### Amendment Request Endpoints

#### 1. Create Amendment Request
**Endpoint**: `POST /corporates/:id/amendment-requests`

**Description**: Creates a new amendment request for a corporate.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**: Amendment request data

**Response**: Created amendment request object.

#### 2. Update Amendment Status
**Endpoint**: `PATCH /corporates/:id/amendment-requests/:amendmentId`

**Description**: Updates the status of an amendment request.

**Parameters**:
- `id` (string, required): Corporate UUID
- `amendmentId` (string, required): Amendment request UUID

**Request Body**:
```json
{
  "status": "approved",
  "reviewNotes": "Amendment approved with notes"
}
```

**Response**: Updated amendment request object.

#### 3. Get Amendment Requests
**Endpoint**: `GET /corporates/amendment-requests?corporateId=...`

**Description**: Retrieves amendment requests, optionally filtered by corporate ID.

**Query Parameters**:
- `corporateId` (string, optional): Filter by corporate UUID

**Response**: Array of amendment request objects.

#### 4. Get Corporate Amendment Requests
**Endpoint**: `GET /corporates/:id/amendment-requests`

**Description**: Retrieves amendment requests for a specific corporate.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**: Array of amendment request objects.

#### 5. Get Amendment by ID
**Endpoint**: `GET /corporates/amendment-requests/:amendmentId`

**Description**: Retrieves a specific amendment request.

**Parameters**:
- `amendmentId` (string, required): Amendment request UUID

**Response**: Amendment request object.

### Email & Notification Endpoints

#### 1. Send E-Commercial Terms Link
**Endpoint**: `POST /corporates/:id/resend-link`

**Description**: Sends an approval link email to the specified approver and updates the corporate status accordingly.

**Parameters**:
- `id` (string, required): Corporate UUID
- `approver` (query parameter, optional): `'first'` or `'second'` (defaults to `'first'`)

**Request Example**:
```bash
# Send to first approver
POST /corporates/123e4567-e89b-12d3-a456-426614174000/resend-link

# Send to second approver
POST /corporates/123e4567-e89b-12d3-a456-426614174000/resend-link?approver=second
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Failed to send e-Commercial link: [error details]"
}
```

**Status Updates**:
- When `approver=first`: Corporate status → `'Pending 1st Approval'`
- When `approver=second`: Corporate status → `'Pending 2nd Approval'`

**Email Content**:
- **First Approver**: Email sent to primary contact with approval link
- **Second Approver**: Email sent to secondary approver with approval link
- **Link Format**: `http://localhost:3000/corporate/{id}?mode={mode}&step=2`
  - `mode=approve` for first approver
  - `mode=approve-second` for second approver

#### 2. Send Amendment Request Email
**Endpoint**: `POST /corporates/:id/send-amendment-email`

**Description**: Sends an amendment request email to the corporate.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "success": true,
  "message": "Amendment request email sent successfully"
}
```

#### 3. Send Amendment Rejection Email
**Endpoint**: `POST /corporates/:id/send-amend-reject-email`

**Description**: Sends an amendment rejection email to the corporate.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**:
```json
{
  "note": "Optional rejection reason"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Amendment rejection email sent successfully"
}
```

#### 4. Complete Cooling Period
**Endpoint**: `POST /corporates/:id/complete-cooling-period`

**Description**: Manually completes the cooling period for a corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "success": true,
  "message": "Cooling period completed"
}
```

#### 5. Update Pinned Status
**Endpoint**: `PUT /corporates/:id/pinned`

**Description**: Updates the pinned status of a corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**:
```json
{
  "pinned": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pinned status updated"
}
```

### Contact Management Endpoints

#### 1. List All Contacts
**Endpoint**: `GET /contacts`

**Description**: Retrieves all contacts across all corporates.

**Response**: Array of contact objects.

#### 2. Get Contact by ID
**Endpoint**: `GET /contacts/:uuid`

**Description**: Retrieves a specific contact by UUID.

**Parameters**:
- `uuid` (string, required): Contact UUID

**Response**: Contact object.

#### 3. Add Contact to Corporate
**Endpoint**: `POST /contacts/:corporateUuid`

**Description**: Adds a new contact to a corporate account.

**Parameters**:
- `corporateUuid` (string, required): Corporate UUID

**Request Body**:
```json
{
  "salutation": "Mr",
  "first_name": "John",
  "last_name": "Doe",
  "contact_number": "0123456789",
  "email": "john@example.com",
  "company_role": "CEO",
  "system_role": "primary_contact"
}
```

**Response**: Created contact object.

#### 4. Update Contact
**Endpoint**: `PUT /contacts/:uuid`

**Description**: Updates an existing contact.

**Parameters**:
- `uuid` (string, required): Contact UUID

**Request Body**: Same as add contact.

**Response**: Updated contact object.

#### 5. Delete Contact
**Endpoint**: `DELETE /contacts/:uuid`

**Description**: Deletes a contact.

**Parameters**:
- `uuid` (string, required): Contact UUID

**Response**:
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

### Subsidiary Management Endpoints

#### 1. List All Subsidiaries
**Endpoint**: `GET /subsidiaries`

**Description**: Retrieves all subsidiaries across all corporates.

**Response**: Array of subsidiary objects.

#### 2. Get Subsidiary by ID
**Endpoint**: `GET /subsidiaries/:uuid`

**Description**: Retrieves a specific subsidiary by UUID.

**Parameters**:
- `uuid` (string, required): Subsidiary UUID

**Response**: Subsidiary object.

#### 3. Add Subsidiary to Corporate
**Endpoint**: `POST /subsidiaries/:corporateUuid`

**Description**: Adds a new subsidiary to a corporate account.

**Parameters**:
- `corporateUuid` (string, required): Corporate UUID

**Request Body**:
```json
{
  "company_name": "Subsidiary Corp",
  "reg_number": "789012-Y",
  "office_address1": "456 Sub St",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "country": "Malaysia",
  "website": "https://sub.example.com",
  "account_note": "Subsidiary notes"
}
```

**Response**: Created subsidiary object.

#### 4. Update Subsidiary
**Endpoint**: `PUT /subsidiaries/:uuid`

**Description**: Updates an existing subsidiary.

**Parameters**:
- `uuid` (string, required): Subsidiary UUID

**Request Body**: Same as add subsidiary.

**Response**: Updated subsidiary object.

#### 5. Delete Subsidiary
**Endpoint**: `DELETE /subsidiaries/:uuid`

**Description**: Deletes a subsidiary.

**Parameters**:
- `uuid` (string, required): Subsidiary UUID

**Response**:
```json
{
  "success": true,
  "message": "Subsidiary deleted successfully"
}
```

### Email Service Endpoints

#### 1. Send Custom Email
**Endpoint**: `POST /resend/send-custom-email`

**Description**: Sends a custom email using the Resend service.

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email content</p>"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### Database Management Endpoints

#### 1. Seed Database
**Endpoint**: `POST /seed`

**Description**: Seeds the database with initial data.

**Response**:
```json
{
  "message": "Database seeded successfully"
}
```

#### 2. Get Seed Status
**Endpoint**: `GET /seed`

**Description**: Returns the status of the seed service.

**Response**:
```json
{
  "message": "Seed service is available. Use POST to seed the database."
}
```

## Data Models

### Corporate Status Enum
```typescript
type CorporateStatus = 
  | 'Draft' 
  | 'Pending 1st Approval' 
  | 'Pending 2nd Approval' 
  | 'Approved' 
  | 'Rejected' 
  | 'Cooling Period' 
  | 'Expired'
  | 'Amendment Requested';
```

### Corporate Object Structure
```json
{
  "uuid": "string (UUID)",
  "company_name": "string",
  "reg_number": "string (unique)",
  "status": "CorporateStatus",
  "office_address1": "string",
  "office_address2": "string | null",
  "postcode": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "website": "string | null",
  "account_note": "string | null",
  "billing_same_as_official": "boolean",
  "billing_address1": "string",
  "billing_address2": "string",
  "billing_postcode": "string",
  "billing_city": "string",
  "billing_state": "string",
  "billing_country": "string",
  "company_tin": "string",
  "sst_number": "string",
  "agreement_from": "string (DATE) | null",
  "agreement_to": "string (DATE) | null",
  "credit_limit": "string",
  "credit_terms": "string",
  "transaction_fee": "string",
  "late_payment_interest": "string",
  "white_labeling_fee": "string",
  "custom_feature_fee": "string",
  "agreed_to_generic_terms": "boolean",
  "agreed_to_commercial_terms": "boolean",
  "first_approval_confirmation": "boolean",
  "second_approval_confirmation": "boolean | null",
  "cooling_period_start": "string (TIMESTAMP) | null",
  "cooling_period_end": "string (TIMESTAMP) | null",
  "secondary_approver_uuid": "string (UUID) | null",
  "pinned": "boolean",
  "created_at": "string (TIMESTAMP)",
  "updated_at": "string (TIMESTAMP)"
}
```

### Contact Object Structure
```json
{
  "uuid": "string (UUID)",
  "corporate_uuid": "string (UUID)",
  "salutation": "string",
  "first_name": "string",
  "last_name": "string",
  "contact_number": "string",
  "email": "string",
  "company_role": "string",
  "system_role": "string",
  "created_at": "string (TIMESTAMP)",
  "updated_at": "string (TIMESTAMP)"
}
```

### Subsidiary Object Structure
```json
{
  "uuid": "string (UUID)",
  "corporate_uuid": "string (UUID)",
  "company_name": "string",
  "reg_number": "string",
  "office_address1": "string",
  "office_address2": "string | null",
  "postcode": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "website": "string | null",
  "account_note": "string | null",
  "created_at": "string (TIMESTAMP)",
  "updated_at": "string (TIMESTAMP)"
}
```

### Investigation Log Object Structure
```json
{
  "uuid": "string (UUID)",
  "corporate_uuid": "string (UUID)",
  "timestamp": "string (TIMESTAMP)",
  "note": "string | null",
  "from_status": "CorporateStatus | null",
  "to_status": "CorporateStatus | null",
  "amendment_data": "object | null",
  "created_at": "string (TIMESTAMP)"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "error": "ValidationError"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Corporate not found",
  "error": "NotFoundError"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "InternalError"
}
```

### Email Service Errors

**Email Configuration Error**:
```json
{
  "success": false,
  "message": "Resend API Key or Sender Email is not configured"
}
```

**Invalid Email Error**:
```json
{
  "success": false,
  "message": "Recipient email not found or is invalid for corporate"
}
```

**Email Sending Error**:
```json
{
  "success": false,
  "message": "Failed to send email: [error details]"
}
```

## Status Workflow

### Corporate Statuses
- `Draft`: Initial state, being edited
- `Pending 1st Approval`: Waiting for first approver
- `Pending 2nd Approval`: Waiting for second approver
- `Approved`: Fully approved
- `Rejected`: Rejected by approver
- `Cooling Period`: Approved, in cooling period
- `Expired`: Expired agreement
- `Amendment Requested`: Amendment requested

### Status Transitions
1. **Draft** → **Pending 1st Approval** (via `POST /corporates/:id/resend-link?approver=first`)
2. **Pending 1st Approval** → **Pending 2nd Approval** (via first approval)
3. **Pending 2nd Approval** → **Cooling Period** (via second approval)
4. **Cooling Period** → **Approved** (via `POST /corporates/:id/complete-cooling-period`)

## Frontend Integration

### JavaScript/TypeScript Usage

```typescript
// Send email to first approver
const response = await fetch('/api/corporates/123/resend-link', {
  method: 'POST'
});

// Send email to second approver
const response = await fetch('/api/corporates/123/resend-link?approver=second', {
  method: 'POST'
});

// Handle response
const data = await response.json();
if (data.success) {
  console.log('Email sent successfully');
} else {
  console.error('Failed to send email:', data.message);
}
```

### React Hook Example

```typescript
const useSendApprovalLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendLink = async (corporateId: string, approver: 'first' | 'second' = 'first') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/corporates/${corporateId}/resend-link?approver=${approver}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendLink, loading, error };
};
```

## Rate Limiting

- **Email Sending**: 10 requests per minute per IP
- **General API**: 100 requests per minute per IP
- **Bulk Operations**: 5 requests per minute per IP

## Environment Variables

### Required Environment Variables
- `RESEND_API_KEY`: Resend email service API key
- `SENDER_EMAIL`: Email address for sending notifications
- `DATABASE_URL`: Database connection string

### Optional Environment Variables
- `API_RATE_LIMIT`: Rate limit per minute (default: 100)
- `EMAIL_RATE_LIMIT`: Email rate limit per minute (default: 10)

## Testing

### Test Endpoints
- **Health Check**: `GET /health`
- **Email Test**: `POST /test/email`
- **Database Test**: `GET /test/database`

### Test Data
Use the following test corporate ID for testing:
- **Test Corporate ID**: `test-corporate-123`
- **Test Email**: `test@example.com`

## Changelog

### Version 1.2.0
- Added support for second approver email sending
- Updated status workflow
- Improved error handling

### Version 1.1.0
- Added corporate status management
- Added contact management endpoints
- Added email notification system

### Version 1.0.0
- Initial API release
- Basic corporate CRUD operations

