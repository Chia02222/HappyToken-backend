# Database

## Engine & Access
- PostgreSQL (Neon compatible)
- Connection via `DATABASE_URL`

## Schema Overview
Tables:
- `corporates`
- `contacts`
- `subsidiaries`
- `investigation_logs`

## corporates
Columns (selected):
- `uuid` UUID PK
- `company_name` text (required)
- `reg_number` text (unique)
- `status` enum string: Draft | Pending 1st Approval | Pending 2nd Approval | Approved | Rejected | Cooling Period | Expired | Amendment Requested
- Official address: `office_address1`, `office_address2?`, `postcode`, `city`, `state`, `country`
- Billing address: `billing_same_as_official` boolean, `billing_address1`, `billing_address2`, `billing_postcode`, `billing_city`, `billing_state`, `billing_country`
- Tax: `company_tin`, `sst_number`
- Agreement dates (DATE policy): `agreement_from? (DATE)`, `agreement_to? (DATE)`
- Commercial terms (as strings): `credit_limit`, `credit_terms`, `transaction_fee`, `late_payment_interest`, `white_labeling_fee`, `custom_feature_fee`
- Approvals: `agreed_to_generic_terms` bool, `agreed_to_commercial_terms` bool, `first_approval_confirmation` bool, `second_approval_confirmation?` bool
- Cooling period: `cooling_period_start? (TIMESTAMP)`, `cooling_period_end? (TIMESTAMP)`
- `secondary_approver_uuid?` (UUID FK to contacts)
- `pinned` bool
- `created_at` TIMESTAMP, `updated_at` TIMESTAMP

## contacts
- `uuid` UUID PK
- `corporate_uuid` UUID FK → corporates(uuid) ON DELETE CASCADE
- `salutation`, `first_name`, `last_name`, `contact_number`, `email`, `company_role`, `system_role`
- `created_at`, `updated_at` TIMESTAMP

## subsidiaries
- `uuid` UUID PK
- `corporate_uuid` UUID FK → corporates(uuid) ON DELETE CASCADE
- `company_name`, `reg_number`
- Official address fields (same structure as corporate)
- `website?`, `account_note?`
- `created_at`, `updated_at` TIMESTAMP

## investigation_logs
- `uuid` UUID PK
- `corporate_uuid` UUID FK → corporates(uuid) ON DELETE CASCADE
- `timestamp` TIMESTAMP (event time)
- `note?` text
- `from_status?`, `to_status?` (same enum as corporates.status)
- `amendment_data?` JSON
- `created_at` TIMESTAMP

## Migrations
- Location: `backend/src/migrations`
- Notable:
  - `007_change_agreement_dates_to_date` → converts agreement_* to DATE to avoid timezone shifts
  - `011_add_performance_indexes` → adds indexes (see file for exact columns)

Run strategy: prefer running migrations during deploy step (before app start). Keep them idempotent and small.

## Types Policy
- Pure dates: use `DATE` (no implicit TZ). Returned as strings.
- Event times: use `TIMESTAMP WITHOUT TIME ZONE`.

## Seeding & Reset
- Seed utilities under `backend/src/seed`
- Reset helpers under `backend/src/migrations/reset-tables.ts`

## Performance & Indexing
- Ensure indexes on FK columns and frequently filtered columns (e.g., `corporates.reg_number`, `contacts.corporate_uuid`, `subsidiaries.corporate_uuid`).
