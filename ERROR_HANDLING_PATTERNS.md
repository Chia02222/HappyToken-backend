# Error Handling Patterns

## Overview
This document outlines the error handling patterns used throughout the application, particularly for the "Send to Approver" functionality and Copy Link features.

## Error Handling Architecture

### 1. Async Function Error Propagation
```typescript
// Pattern: Throw errors from async functions to be caught by calling code
async function handleSaveCorporate(formData, action) {
  try {
    // ... business logic
    await sendEmail();
  } catch (err) {
    // Log error for debugging
    console.error('Error sending email:', err);
    
    // Show user-friendly error message
    setErrorModalContent(`Failed to send: ${err.message}`);
    setIsErrorModalVisible(true);
    
    // Re-throw to prevent success flow
    throw err;
  }
}
```

### 2. Component-Level Error Catching
```typescript
// Pattern: Catch errors in UI components and show modals
const handleSendToApprover = async () => {
  try {
    await onSaveCorporate(formData, 'sent');
    // Success: redirect or show success modal
  } catch (error) {
    // Show error modal instead of redirecting
    setValidationErrorMessage(error.message);
    setShowValidationError(true);
    // No throw - error is handled
  }
};
```

### 3. Error Modal Pattern
```typescript
// Pattern: Consistent error modal usage
const [showValidationError, setShowValidationError] = useState(false);
const [validationErrorMessage, setValidationErrorMessage] = useState('');

// Show error modal
setValidationErrorMessage('User-friendly error message');
setShowValidationError(true);
```

## Error Types and Handling

### 1. Network/API Errors
- **Cause**: Backend service unavailable, API key missing
- **Handling**: Show error modal, prevent redirection
- **User Action**: Retry after fixing configuration

### 2. Validation Errors
- **Cause**: Invalid email, missing contact info
- **Handling**: Show specific error message, highlight fields
- **User Action**: Fix data and retry

### 3. Business Logic Errors
- **Cause**: Corporate not found, invalid status
- **Handling**: Show descriptive error, suggest solutions
- **User Action**: Check data integrity, contact support

## Best Practices

### ✅ Do
- Always show user-friendly error messages
- Prevent unwanted redirections on errors
- Log errors for debugging
- Provide actionable error messages
- Use consistent error modal patterns

### ❌ Don't
- Show technical error details to users
- Allow silent failures
- Redirect users on errors
- Throw errors without catching them
- Use generic "Something went wrong" messages

## Error Message Guidelines

### Good Error Messages
- "Failed to send for approval: Primary contact email is missing. Please add a valid email address and try again."
- "Email sending failed: Invalid email configuration. Please check your email settings."

### Bad Error Messages
- "Error: 500"
- "Something went wrong"
- "Failed to send email"

## Error Recovery Patterns

### 1. Retry Pattern
```typescript
// Allow users to retry after fixing issues
const handleRetry = () => {
  setShowValidationError(false);
  // User can try again
};
```

### 2. Fallback Pattern
```typescript
// Provide alternative actions
const handleAlternative = () => {
  // Show manual copy link option
  setShowCopyLinkModal(true);
};
```

## Testing Error Scenarios

### Manual Testing
1. Test with invalid email addresses
2. Test with missing contact information
3. Test with network failures
4. Test with backend service errors

### Automated Testing
```typescript
// Mock error scenarios
test('handles email sending failure', async () => {
  mockSendEmail.mockRejectedValue(new Error('Email service unavailable'));
  
  await user.click(sendButton);
  
  expect(errorModal).toBeVisible();
  expect(redirect).not.toHaveOccurred();
});
```

## Monitoring and Debugging

### Error Logging
```typescript
// Always log errors for debugging
console.error('Error sending email to first approver:', err);
console.error('Failed to send to approver:', error);
```

### Error Tracking
- Use consistent error message formats
- Include relevant context in error logs
- Track error frequency and patterns
- Monitor user recovery actions

## Common Error Scenarios

### 1. "Send to Approver" Button
- **Invalid Email**: Show error modal, prevent redirection
- **Missing Contacts**: Show specific error message
- **Network Error**: Show retry option
- **Success**: Show success modal, then redirect

### 2. Copy Link Feature
- **Invalid Corporate**: Show error modal
- **Missing Status**: Default to first approver mode
- **Success**: Show link in modal

## Error Handling Checklist

- [ ] Error is caught and logged
- [ ] User sees friendly error message
- [ ] No unwanted redirections occur
- [ ] User can retry or take alternative action
- [ ] Error doesn't break the UI
- [ ] Success flow works correctly
