# Corporate Account System - Backend API

A NestJS backend API for the Corporate Account System, built with Kysely and Neon PostgreSQL.

## Features

- ✅ NestJS framework with TypeScript
- ✅ Kysely query builder with Neon PostgreSQL dialect
- ✅ Database migrations
- ✅ CRUD operations for corporate accounts
- ✅ Seed data functionality
- ✅ Health check endpoint

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL database (or any PostgreSQL database)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/corporate_account_system
   NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Application Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

5. **Seed the database (optional):**
   ```bash
   curl -X POST http://localhost:3001/seed
   ```

## API Endpoints

## API Endpoints

This section details the available API endpoints, including their HTTP methods, paths, descriptions, and expected request/response bodies.

### Health Check

-   **`GET /health`**
    -   **Description**: Checks the application and database health.
    -   **Response**:
        ```json
        {
            "status": "healthy" | "unhealthy",
            "database": "connected" | "disconnected",
            "error": "string" (optional),
            "timestamp": "string" (ISO 8601 format)
        }
        ```

### Corporate Accounts

-   **`GET /corporates`**
    -   **Description**: Retrieves a list of all corporate accounts.
    -   **Response**: `Corporate[]` (array of Corporate objects)
        ```json
        [
            {
                "id": "string",
                "company_name": "string",
                "reg_number": "string",
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
                "agreement_from": "string | null",
                "agreement_to": "string | null",
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
                "cooling_period_start": "string | null",
                "cooling_period_end": "string | null",
                "created_at": "string",
                "updated_at": "string"
            }
        ]
        ```

-   **`GET /corporates/:id`**
    -   **Description**: Retrieves a single corporate account by its ID, including related contacts, subsidiaries, and investigation logs.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Response**: `Corporate` object with nested `contacts`, `subsidiaries`, and `investigation_log`.
        ```json
        {
            "id": "string",
            "company_name": "string",
            "reg_number": "string",
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
            "agreement_from": "string | null",
            "agreement_to": "string | null",
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
            "cooling_period_start": "string | null",
            "cooling_period_end": "string | null",
            "created_at": "string",
            "updated_at": "string",
            "contacts": [
                {
                    "id": "string",
                    "corporate_id": "string",
                    "salutation": "string",
                    "first_name": "string",
                    "last_name": "string",
                    "contact_number": "string",
                    "email": "string",
                    "company_role": "string",
                    "system_role": "string",
                    "created_at": "string",
                    "updated_at": "string"
                }
            ],
            "subsidiaries": [
                {
                    "id": "string",
                    "corporate_id": "string",
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
                    "created_at": "string",
                    "updated_at": "string"
                }
            ],
            "investigation_log": [
                {
                    "id": "string",
                    "corporate_id": "string",
                    "timestamp": "string",
                    "note": "string | null",
                    "from_status": "CorporateStatus | null",
                    "to_status": "CorporateStatus | null",
                    "created_at": "string"
                }
            ]
        }
        ```

-   **`POST /corporates`**
    -   **Description**: Creates a new corporate account with optional related contacts and subsidiaries.
    -   **Request Body**: `CreateCorporateWithRelationsDto`
        ```json
        {
            "company_name": "string",
            "reg_number": "string",
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
            "agreement_from": "string | null",
            "agreement_to": "string | null",
            "credit_limit": "string",
            "credit_terms": "string",
            "transaction_fee": "string",
            "late_payment_interest": "string",
            "white_labeling_fee": "string",
            "custom_feature_fee": "string",
            "agreed_to_generic_terms": "boolean",
            "agreed_to_commercial_terms": "boolean",
            "first_approval_confirmation": "boolean",
            "second_approval_confirmation": "boolean",
            "contacts": [
                {
                    "corporate_id": "string",
                    "salutation": "string",
                    "first_name": "string",
                    "last_name": "string",
                    "contact_number": "string",
                    "email": "string",
                    "company_role": "string",
                    "system_role": "string"
                }
            ],
            "subsidiaries": [
                {
                    "corporate_id": "string",
                    "company_name": "string",
                    "reg_number": "string",
                    "office_address1": "string",
                    "office_address2": "string | null",
                    "postcode": "string",
                    "city": "string",
                    "state": "string",
                    "country": "string",
                    "website": "string | null",
                    "account_note": "string | null"
                }
            ],
            "secondary_approver": {
                "use_existing_contact": "boolean",
                "selected_contact_id": "string",
                "salutation": "string",
                "first_name": "string",
                "last_name": "string",
                "company_role": "string",
                "system_role": "string",
                "email": "string",
                "contact_number": "string"
            }
        }
        ```
    -   **Response**: The newly created `Corporate` object.

-   **`PUT /corporates/:id`**
    -   **Description**: Updates an existing corporate account.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Request Body**: `UpdateCorporateDto` (Partial `Corporate` object with optional nested updates for contacts and subsidiaries)
        ```json
        {
            "company_name": "string" (optional),
            "reg_number": "string" (optional),
            "status": "CorporateStatus" (optional),
            // ... other corporate fields (optional)
            "contacts": [
                {
                    "id": "string" (optional, for existing contact),
                    "corporate_id": "string",
                    "salutation": "string",
                    "first_name": "string",
                    "last_name": "string",
                    "contact_number": "string",
                    "email": "string",
                    "company_role": "string",
                    "system_role": "string"
                }
            ],
            "subsidiaries": [
                {
                    "id": "string" (optional, for existing subsidiary),
                    "corporate_id": "string",
                    "company_name": "string",
                    "reg_number": "string",
                    "office_address1": "string",
                    "office_address2": "string | null",
                    "postcode": "string",
                    "city": "string",
                    "state": "string",
                    "country": "string",
                    "website": "string | null",
                    "account_note": "string | null"
                }
            ],
            "contactIdsToDelete": ["string"],
            "subsidiaryIdsToDelete": ["string"],
            "secondary_approver": {
                "use_existing_contact": "boolean",
                "selected_contact_id": "string",
                "salutation": "string",
                "first_name": "string",
                "last_name": "string",
                "company_role": "string",
                "system_role": "string",
                "email": "string",
                "contact_number": "string"
            }
        }
        ```
    -   **Response**: The updated `Corporate` object.

-   **`DELETE /corporates/:id`**
    -   **Description**: Deletes a corporate account by ID, including all related contacts, subsidiaries, and investigation logs.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Response**:
        ```json
        {
            "success": "boolean"
        }
        ```

-   **`POST /corporates/:id/investigation-logs`**
    -   **Description**: Adds an investigation log entry to a corporate account.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Request Body**: `Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>`
        ```json
        {
            "timestamp": "string" (ISO 8601 format),
            "note": "string | null",
            "from_status": "CorporateStatus | null",
            "to_status": "CorporateStatus | null"
        }
        ```
    -   **Response**: The newly created `InvestigationLogTable` object.

-   **`PUT /corporates/:id/status`**
    -   **Description**: Updates the status of a corporate account and optionally adds an investigation log entry.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Request Body**:
        ```json
        {
            "status": "CorporateStatus",
            "note": "string" (optional)
        }
        ```
    -   **Response**: The updated `Corporate` object.

-   **`POST /corporates/:id/resend-link`**
    -   **Description**: Resends the registration link for a corporate account and updates its status to 'Pending 1st Approval'.
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Response**:
        ```json
        {
            "success": "boolean",
            "message": "string"
        }
        ```

-   **`POST /corporates/:id/complete-cooling-period`**
    -   **Description**: Manually completes the cooling period for a corporate account, potentially updating its status based on internal logic (e.g., fraud check).
    -   **Parameters**:
        -   `id`: `string` (Corporate ID)
    -   **Response**: The updated `Corporate` object.

### Corporate Contacts

-   **`POST /contacts/:corporateId`**
    -   **Description**: Adds a new contact to a specific corporate account.
    -   **Parameters**:
        -   `corporateId`: `string` (Corporate ID)
    -   **Request Body**: `Omit<CreateContactDto, 'corporate_id'>`
        ```json
        {
            "salutation": "string",
            "first_name": "string",
            "last_name": "string",
            "contact_number": "string",
            "email": "string",
            "company_role": "string",
            "system_role": "string"
        }
        ```
    -   **Response**: The newly created `Contact` object.

-   **`PUT /contacts/:id`**
    -   **Description**: Updates an existing contact by ID.
    -   **Parameters**:
        -   `id`: `string` (Contact ID)
    -   **Request Body**: `UpdateContactDto` (Partial `Contact` object)
        ```json
        {
            "id": "string" (optional),
            "salutation": "string" (optional),
            "first_name": "string" (optional),
            "last_name": "string" (optional),
            "contact_number": "string" (optional),
            "email": "string" (optional),
            "company_role": "string" (optional),
            "system_role": "string" (optional)
        }
        ```
    -   **Response**: The updated `Contact` object.

-   **`DELETE /contacts/:id`**
    -   **Description**: Deletes a contact by ID.
    -   **Parameters**:
        -   `id`: `string` (Contact ID)
    -   **Response**:
        ```json
        {
            "success": "boolean"
        }
        ```

### Corporate Subsidiaries

-   **`POST /subsidiaries/:corporateId`**
    -   **Description**: Adds a new subsidiary to a specific corporate account.
    -   **Parameters**:
        -   `corporateId`: `string` (Corporate ID)
    -   **Request Body**: `Omit<CreateSubsidiaryDto, 'corporate_id'>`
        ```json
        {
            "company_name": "string",
            "reg_number": "string",
            "office_address1": "string",
            "office_address2": "string | null",
            "postcode": "string",
            "city": "string",
            "state": "string",
            "country": "string",
            "website": "string | null",
            "account_note": "string | null"
        }
        ```
    -   **Response**: The newly created `Subsidiary` object.

-   **`PUT /subsidiaries/:id`**
    -   **Description**: Updates an existing subsidiary by ID.
    -   **Parameters**:
        -   `id`: `string` (Subsidiary ID)
    -   **Request Body**: `UpdateSubsidiaryDto` (Partial `Subsidiary` object)
        ```json
        {
            "id": "string" (optional),
            "company_name": "string" (optional),
            "reg_number": "string" (optional),
            "office_address1": "string" (optional),
            "office_address2": "string | null" (optional),
            "postcode": "string" (optional),
            "city": "string" (optional),
            "state": "string" (optional),
            "country": "string" (optional),
            "website": "string | null" (optional),
            "account_note": "string | null" (optional)
        }
        ```
    -   **Response**: The updated `Subsidiary` object.

-   **`DELETE /subsidiaries/:id`**
    -   **Description**: Deletes a subsidiary by ID.
    -   **Parameters**:
        -   `id`: `string` (Subsidiary ID)
    -   **Response**:
        ```json
        {
            "success": "boolean"
        }
        ```

### Database Seeding

-   **`POST /seed`**
    -   **Description**: Seeds the database with mock data.
    -   **Response**:
        ```json
        {
            "message": "Database seeded successfully"
        }
        ```
## Database Schema

The application uses the following main tables:

- **corporates** - Main corporate account information
- **contacts** - Contact persons for each corporate
- **subsidiaries** - Subsidiary companies
- **investigation_logs** - Status change and investigation history

## Development

- **Build:** `npm run build`
- **Start:** `npm run start`
- **Start (dev):** `npm run start:dev`
- **Lint:** `npm run lint`
- **Test:** `npm run test`

## Migration Commands

- **Run Kysely migrations (creates Kysely metadata tables):** `npm run migrate`
- **Drop all tables (also drops Kysely metadata tables):** `npm run reset:tables`
- **Create business tables via SQL (no Kysely metadata):** `npm run migrate:sql`
- **Populate sample data into Neon:** `npm run migrate:data`

### Recommended flows

1) Use Kysely-managed migrations (includes metadata tables):
   - Ensure DB is empty (or previously migrated by Kysely)
   - Run: `npm run migrate`
   - Optional seed: `npm run migrate:data`

2) Use SQL-only schema (no Kysely metadata tables):
   - Reset/destroy all tables: `npm run reset:tables`
   - Create the four business tables: `npm run migrate:sql`
   - Populate demo data: `npm run migrate:data`

Note: Do not mix flows in one run. If you choose SQL-only, skip `npm run migrate` to avoid recreating Kysely metadata tables `kysely_migration` and `kysely_migration_lock`.

### Verify in Neon

Run these in your SQL console:

- List tables:
  - `select table_name from information_schema.tables where table_schema = 'public' order by table_name;`
- Counts:
  - `select count(*) from corporates;`
  - `select count(*) from contacts;`
  - `select count(*) from subsidiaries;`
  - `select count(*) from investigation_logs;`

## Architecture

- **Database Service:** Handles Kysely database connection
- **Corporate Service:** Business logic for corporate operations
- **Corporate Controller:** HTTP endpoints for corporate operations
- **Seed Service:** Database seeding functionality

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `PORT` | Application port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |