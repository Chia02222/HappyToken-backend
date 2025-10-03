# Developer Guide - HappyToken Backend

## 📖 Overview

This guide provides essential information for developers working on the HappyToken corporate account management system.

## 🏗️ Architecture

### Core Services

#### **CorporateService** (`backend/src/modules/corporate/corporate.service.ts`)
Main service for managing corporate accounts and their lifecycle.

**Key Business Rules:**
- Corporate approval requires 2 approvers (primary and secondary)
- Status flow: `Draft` → `Pending 1st Approval` → `Pending 2nd Approval` → `Cooling Period` → `Approved`
- Amendment requests can be made from any approved status
- Investigation logs track all status changes for audit trail

**Important Methods:**

1. **`create()`** - Creates new corporate with related entities
   - Inserts corporate record with 'Draft' status
   - Creates associated contacts (primary contact required)
   - Creates associated subsidiaries (if any)
   - Handles secondary approver setup (existing contact or new)
   - Links secondary approver to corporate record
   
   **Note:** Secondary approver can be existing contact (`use_existing_contact = true`) or new contact (automatically created)

2. **`update()`** - Updates existing corporate
   - Updates corporate base data
   - Handles contact CRUD operations
   - Handles subsidiary CRUD operations
   - Updates secondary approver if changed
   - **Important:** Investigation logs are NEVER deleted (audit compliance)

3. **`updateStatus()`** - Updates status and creates audit log
   - Every status change is logged with timestamp
   - Logs include actor, action, and optional notes
   - Used for audit trail and timeline display
   
   **Status Transition Rules:**
   - `Draft` → `Pending 1st Approval` (sent to first approver)
   - `Pending 1st Approval` → `Pending 2nd Approval` (first approver approves)
   - `Pending 2nd Approval` → `Cooling Period` (second approver approves)
   - `Cooling Period` → `Approved` (after 14 days, automatic via cron)
   - Any status → `Amendment Requested` (amendment submitted)
   - `Amendment Requested` → Previous Status (amendment approved/declined)

4. **`createAmendmentRequest()`** - Creates amendment request
   - Compares current data with proposed changes
   - Stores only changed fields (not full data)
   - Updates status to 'Amendment Requested'
   - Creates investigation log with change details
   - Notifies CRT team via email
   
   **Important:** Original data remains unchanged until amendment approved

5. **`handleCoolingPeriodCompletion()`** - Automated cron job
   - **Runs:** Every day at midnight (Asia/Kuala_Lumpur timezone)
   - Finds all corporates in 'Cooling Period' status
   - Checks if `updated_at` is more than 14 days ago
   - Updates status to 'Approved'
   - Sends welcome emails to both approvers
   - **Error Handling:** Email failures don't block status update

#### **ResendService** (`backend/src/modules/resend/resend.service.ts`)
Handles all email notifications in the corporate approval workflow.

**Email Types:**

1. **Approval Request** (`sendEcommericialTermlink`)
   - Sent to first or second approver
   - Includes approval link with mode parameter
   - Attached PDF if available
   
2. **Amendment Notification** (`sendAmendmentRequestToCRT`)
   - Sent to CRT team
   - Includes amendment details and review link
   
3. **Welcome Email** (`sendWelcomeEmail`)
   - Sent after cooling period completes
   - Sent to both approvers

**Important Business Rules:**
- Email failures should prevent status progression
- Always validate recipient email before sending
- Use corporate UUID for all links (not numeric ID)
- Sanitize all input data

## 🎯 Frontend - Key Components

### **Corporate Form Page** (`src/app/corporate/[id]/page.tsx`)

Main page for corporate form with complex validation and email logic.

**Form Workflow:**
1. Validate form data based on current step
2. Process form data based on mode
3. Save corporate data to database
4. Send appropriate emails:
   - `'save'`: No email sent
   - `'sent'`: Send to first approver (status → Pending 1st Approval)
   - `'submit'` (approve mode): Send to second approver (status → Pending 2nd Approval)
   - `'submit'` (approve-second mode): Complete approval (status → Cooling Period)

**Important Email Logic:**
- First approval: Email sent to primary contact
- Second approval: Email sent to secondary approver
- Email failures prevent status progression (throws error)
- Success modal shown after email sent successfully

**Error Handling:**
- Validation errors: Show modal with field to scroll to
- API errors: Show modal with error message
- Email errors: Show modal, prevent redirect

### **E-Commercial Terms Form** (`src/components/forms/ECommercialTermsForm.tsx`)

Handles the second step of corporate form (commercial terms and approvals).

**Form Modes:**
- `'new'`: Creating new corporate (full edit mode)
- `'edit'`: Editing existing corporate (full edit mode)
- `'approve'`: First approver reviewing (read-only + approval section)
- `'approve-second'`: Second approver reviewing (read-only + secondary approval section)

**Key Features:**
- Timeline display with investigation logs
- Amendment request tracking
- Dual approval workflow
- Terms & conditions modals
- Print/PDF generation

**Business Logic:**
- Secondary approver can be existing contact or new contact
- Form is read-only in cooling period or approved/rejected status
- Approve/Reject buttons hidden when amendment requested
- Timeline shows all status changes and amendments

### **Amendment Request Modal** (`src/components/modals/AmendRequestModal.tsx`)

Displays notification when corporate has pending amendment request.

**Business Rules:**
- Auto-shows when status is 'Amendment Requested'
- Only shown on corporate detail page (not on E-Commercial Terms form)
- Shows timestamp, submitter info, and "View Amendment" button

**Navigation:**
- For approvers: Redirects to read-only amendment view
- For CRT users: Redirects to full amendment review page

## 🛠️ Utilities

### **Error Handler** (`src/utils/errorHandler.ts`)

Centralized error handling utility.

**Features:**
- Consistent error logging
- User-friendly error messages
- API error handling
- Error context tracking

**Usage:**
```typescript
const errorMessage = errorHandler.handleApiError(error as Error, { 
  component: 'ComponentName', 
  action: 'actionName' 
});
logError('Error message', { error: errorMessage }, 'ComponentName');
```

### **Logger** (`src/utils/logger.ts`)

Centralized logging utility.

**Log Levels:**
- `DEBUG`: Development debugging
- `INFO`: General information
- `WARN`: Warning messages
- `ERROR`: Error messages

**Usage:**
```typescript
logInfo('Action completed', { data }, 'ComponentName');
logError('Action failed', { error }, 'ComponentName');
```

### **Corporate Save Handler** (`src/utils/corporateSaveHandler.ts`)

Orchestrates corporate save logic with validation, data processing, and email sending.

**Process:**
1. Validate corporate form data
2. Process secondary approver
3. Prepare data for submission
4. Determine approver type
5. Send appropriate emails

## 🔐 Database Schema

### **Primary Keys**
- All tables use `uuid` as primary key (not numeric `id`)
- UUIDs are generated via `gen_random_uuid()`

### **Key Tables**

1. **corporates** - Main corporate account data
   - `uuid` (PK)
   - `status` - Current approval status
   - `secondary_approver_uuid` (FK to contacts)
   - `pinned` - Featured/pinned status

2. **contacts** - Corporate contact persons
   - `uuid` (PK)
   - `corporate_uuid` (FK to corporates)
   - `system_role` - 'secondary_approver' for secondary approvers

3. **subsidiaries** - Corporate subsidiaries
   - `uuid` (PK)
   - `corporate_uuid` (FK to corporates)

4. **investigation_logs** - Audit trail of all changes
   - `uuid` (PK) - Also serves as amendment ID
   - `corporate_uuid` (FK to corporates)
   - `from_status` - Previous status
   - `to_status` - New status
   - `note` - Change details
   - `changed_fields` - Amendment changes (JSON)

### **Important Relationships**

- Corporate → Contacts (1:M)
- Corporate → Subsidiaries (1:M)
- Corporate → Investigation Logs (1:M)
- Corporate → Secondary Approver (1:1 via secondary_approver_uuid)

## 🚀 Common Development Tasks

### Adding a New Status
1. Update `CorporateStatus` type in `backend/src/database/types.ts`
2. Update status transition logic in `CorporateService.updateStatus()`
3. Update frontend status badge in `src/components/common/StatusBadge.tsx`
4. Update timeline generation in `ECommercialTermsForm.tsx`

### Adding a New Email Template
1. Add method to `ResendService`
2. Create HTML email template
3. Configure sender email and recipients
4. Add error handling for email failures
5. Test with Resend API

### Modifying Approval Workflow
1. Update status transition rules in `CorporateService`
2. Update form mode logic in `src/app/corporate/[id]/page.tsx`
3. Update email sending logic in `handleSaveCorporate()`
4. Update timeline display in `ECommercialTermsForm.tsx`
5. Test entire workflow end-to-end

## ⚠️ Important Considerations

### Security
- Always validate email addresses before sending
- Sanitize all user input
- Use parameterized queries (Kysely handles this)
- Never expose API keys in frontend code

### Performance
- Database indexes on frequently queried fields
- Batch operations where possible
- Lazy load heavy components
- Optimize PDF generation

### Audit Compliance
- Never delete investigation logs
- Always log status changes
- Include timestamp and actor info
- Preserve data integrity

### Error Handling
- Email failures should prevent status progression
- Show user-friendly error messages
- Log all errors for debugging
- Don't expose sensitive information

## 📚 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Database Setup**: See `backend/DATABASE_SETUP.md`
- **Error Handling**: See `ERROR_HANDLING_PATTERNS.md`
- **Testing Guide**: See `TESTING_GUIDE.md`
- **Troubleshooting**: See `TROUBLESHOOTING_GUIDE.md`

## 🤝 Contributing

When adding new features:
1. Follow existing code patterns
2. Add appropriate comments for complex logic
3. Update this guide if adding major features
4. Test thoroughly before committing
5. Update API documentation

## 📞 Support

For questions or issues, contact the development team or refer to the troubleshooting guide.

