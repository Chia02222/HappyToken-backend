# API Documentation

## Overview
This document describes the API endpoints used for corporate management, approval workflows, and email notifications.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.happietoken.com`

## Authentication
All endpoints require proper authentication. Include authentication headers as needed.

## Corporate Management Endpoints

### 1. Send E-Commercial Terms Link

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

### 2. Submit for First Approval

**Endpoint**: `POST /corporates/:id/submit-for-first-approval`

**Description**: Submits a corporate for first approval (legacy endpoint).

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "success": true,
  "message": "Submitted for first approval"
}
```

### 3. Complete Cooling Period

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

## Corporate CRUD Endpoints

### 1. Get Corporate by ID

**Endpoint**: `GET /corporates/:id`

**Description**: Retrieves a corporate by its UUID.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "company_name": "Example Corp",
  "reg_number": "123456-X",
  "status": "Pending 1st Approval",
  "contacts": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 2. Create Corporate

**Endpoint**: `POST /corporates`

**Description**: Creates a new corporate account.

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
      "company_role": "CEO"
    }
  ]
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "company_name": "Example Corp",
  "status": "Draft",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 3. Update Corporate

**Endpoint**: `PUT /corporates/:id`

**Description**: Updates an existing corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Request Body**: Same as create, with additional fields for updates.

**Response**: Updated corporate object.

### 4. Delete Corporate

**Endpoint**: `DELETE /corporates/:id`

**Description**: Deletes a corporate account.

**Parameters**:
- `id` (string, required): Corporate UUID

**Response**:
```json
{
  "success": true,
  "message": "Corporate deleted successfully"
}
```

## Contact Management Endpoints

### 1. Add Contact

**Endpoint**: `POST /contacts/:corporateId`

**Description**: Adds a new contact to a corporate account.

**Parameters**:
- `corporateId` (string, required): Corporate UUID

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

### 2. Update Contact

**Endpoint**: `PUT /contacts/:id`

**Description**: Updates an existing contact.

**Parameters**:
- `id` (string, required): Contact UUID

**Request Body**: Same as add contact.

**Response**: Updated contact object.

### 3. Delete Contact

**Endpoint**: `DELETE /contacts/:id`

**Description**: Deletes a contact.

**Parameters**:
- `id` (string, required): Contact UUID

**Response**:
```json
{
  "success": true,
  "message": "Contact deleted successfully"
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
