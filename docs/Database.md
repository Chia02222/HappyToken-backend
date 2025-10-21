# Database

## Overview
This document provides a quick reference for the HappyToken Backend database. For comprehensive schema documentation, see [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md).

## Engine & Access
- **Engine**: PostgreSQL (Neon compatible)
- **Connection**: Via `DATABASE_URL` environment variable
- **ORM**: Kysely with TypeScript types

## Quick Reference

### Tables
- `corporates` - Main corporate accounts
- `contacts` - Corporate contacts
- `subsidiaries` - Corporate subsidiaries  
- `investigation_logs` - Audit trail and investigation logs

### Key Relationships
- `contacts.corporate_uuid` → `corporates.uuid` (CASCADE DELETE)
- `subsidiaries.corporate_uuid` → `corporates.uuid` (CASCADE DELETE)
- `investigation_logs.corporate_uuid` → `corporates.uuid` (CASCADE DELETE)
- `corporates.secondary_approver_uuid` → `contacts.uuid` (NULL allowed)

### Corporate Status Enum
```
'Draft' | 'Pending 1st Approval' | 'Pending 2nd Approval' | 
'Approved' | 'Rejected' | 'Cooling Period' | 'Expired' | 'Amendment Requested'
```

## Schema Highlights

### Corporates Table
- **Primary Key**: `uuid` (UUID)
- **Unique**: `reg_number` (registration number)
- **Status**: Enum with 8 possible values
- **Addresses**: Official and billing address structures
- **Commercial Terms**: Stored as VARCHAR strings for flexibility
- **Approvals**: Boolean flags for approval workflow
- **Cooling Period**: TIMESTAMP fields for precise timing
- **Secondary Approver**: FK to contacts table

### Contacts Table
- **Primary Key**: `uuid` (UUID)
- **Foreign Key**: `corporate_uuid` → `corporates.uuid`
- **System Roles**: `primary_contact`, `secondary_approver`, etc.
- **Contact Info**: Name, email, phone, company role

### Subsidiaries Table
- **Primary Key**: `uuid` (UUID)
- **Foreign Key**: `corporate_uuid` → `corporates.uuid`
- **Address Structure**: Same as corporate official address
- **Registration**: Company name and registration number

### Investigation Logs Table
- **Primary Key**: `uuid` (UUID)
- **Foreign Key**: `corporate_uuid` → `corporates.uuid`
- **Audit Trail**: Timestamp, status changes, notes
- **Amendment Data**: JSONB for flexible amendment tracking

## Data Types Policy

### Date/Time Handling
- **Pure dates**: `DATE` type (no timezone) - for agreement dates
- **Event timestamps**: `TIMESTAMP WITHOUT TIME ZONE` - for audit logs
- **Cooling periods**: `TIMESTAMP` - for precise timing

### String Storage
- **Commercial terms**: VARCHAR strings (not numeric) for flexibility
- **Addresses**: Standardized structure across all tables
- **Status values**: Application-level enum enforcement

## Migrations

### Location
- `backend/src/migrations/`

### Key Migrations
- `007_change_agreement_dates_to_date` - Converts to DATE type
- `011_add_performance_indexes` - Adds performance indexes
- `012_rename_featured_to_pinned` - Renames featured column

### Migration Strategy
- Run during deployment (before app start)
- Keep migrations idempotent and small
- Use `IF NOT EXISTS` and `IF EXISTS` for safety

## Performance & Indexing

### Key Indexes
- **Primary Keys**: Automatic UUID indexes
- **Foreign Keys**: Indexed for join performance
- **Status Filtering**: `corporates_status_idx`
- **Composite Indexes**: `corporates_status_updated_at_idx`
- **Email Lookups**: `contacts_email_idx`
- **Timestamp Filtering**: `investigation_logs_timestamp_idx`

### Query Optimization
- Status + timestamp combinations are heavily indexed
- Foreign key relationships optimized for joins
- Investigation logs indexed for corporate + status queries

## Seeding & Reset

### Seed Utilities
- Location: `backend/src/seed/`
- Reset helpers: `backend/src/migrations/reset-tables.ts`
- Seed data should be idempotent

### Development
- Use seed utilities for initial data
- Reset utilities for clean development environment
- Test data should be realistic but not production data

## Environment Configuration

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEON_DATABASE_URL` - Alternative Neon connection

### Optional Variables
- Database connection pooling settings
- Migration timeout settings
- Performance tuning parameters

## Monitoring

### Key Metrics
- Table sizes and growth rates
- Index usage and performance
- Foreign key constraint violations
- Migration execution times

### Maintenance
- Regular index maintenance
- Investigation log archival (if needed)
- Performance index optimization
- Database statistics updates

---

*For complete schema documentation with detailed column definitions, relationships, and examples, see [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md).*
