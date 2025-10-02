# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Send to Approver" Button Issues

#### Issue: Button redirects to home page even when there's an error
**Symptoms:**
- User clicks "Send to Approver"
- Error occurs (invalid email, network issue, etc.)
- User is redirected to home page instead of seeing error

**Root Cause:**
- Error is not properly thrown from `handleSaveCorporate`
- Success modal timeout still executes after error
- Calling code doesn't catch the error

**Solution:**
1. Ensure `throw err;` is present in catch block of `handleSaveCorporate`
2. Remove any `setTimeout` that redirects after success modal
3. Verify error is caught in `ECommercialTermsForm` and shows error modal

**Code Check:**
```typescript
// In handleSaveCorporate - should have:
catch (err) {
  console.error('Error sending email:', err);
  setErrorModalContent(`Failed to send: ${err.message}`);
  setIsErrorModalVisible(true);
  throw err; // This is crucial
}

// In ECommercialTermsForm - should have:
catch (error) {
  setValidationErrorMessage(error.message);
  setShowValidationError(true);
  // No throw error; here
}
```

#### Issue: Error modal shows but user still gets redirected
**Symptoms:**
- Error modal appears
- User sees error message
- But still gets redirected after a few seconds

**Root Cause:**
- Success modal timeout is still running
- Multiple error handling mechanisms conflict

**Solution:**
1. Remove `setTimeout` from success modal setup
2. Ensure only one error handling path executes
3. Check for race conditions in async operations

### 2. Copy Link Issues

#### Issue: Copy Link always shows "first approver" regardless of status
**Symptoms:**
- Corporate is in "Pending 2nd Approval" status
- Copy Link modal shows "first approver" in description
- Generated URL uses `mode=approve` instead of `mode=approve-second`

**Root Cause:**
- `getApprovalMode` function not implemented
- Hardcoded `formMode=approve` in URL
- Status mapping logic missing

**Solution:**
1. Implement `getApprovalMode` function:
```typescript
const getApprovalMode = (status: string): string => {
  switch (status) {
    case 'Pending 2nd Approval':
      return 'approve-second';
    case 'Pending 1st Approval':
    default:
      return 'approve';
  }
};
```

2. Update URL generation:
```typescript
const mode = getApprovalMode(corporate.status);
const approvalLink = `http://localhost:3000/corporate/${corporate.id}?mode=${mode}&step=2`;
```

3. Update modal description:
```typescript
Copy this link and share it with the {mode === 'approve-second' ? 'second' : 'first'} approver
```

#### Issue: Copy Link URL format is incorrect
**Symptoms:**
- Generated URL doesn't match expected format
- Link doesn't work when clicked
- Wrong port or path in URL

**Root Cause:**
- Using old URL format
- Hardcoded localhost:3002 instead of localhost:3000
- Missing proper query parameters

**Solution:**
Use correct URL format:
```typescript
// Wrong:
`localhost:3002/?role=client&page=Approver%20Corporate&corporateId=${id}&formMode=approve`

// Correct:
`http://localhost:3000/corporate/${id}?mode=${mode}&step=2`
```

### 3. Email Sending Issues

#### Issue: "Failed to send for approval" error
**Symptoms:**
- Error message: "Failed to send for approval: [error details]"
- Corporate data is saved but email not sent

**Common Causes:**
1. **Invalid email address**
   - Check primary contact email format
   - Ensure email is not empty or "N/A"

2. **Missing contact information**
   - Verify corporate has contacts
   - Check contact array is not empty

3. **Backend configuration issues**
   - RESEND_API_KEY not set
   - SENDER_EMAIL not configured
   - Email service down

**Solution:**
1. **For invalid email:**
   - Update contact information
   - Use valid email format
   - Ensure email is not empty

2. **For missing contacts:**
   - Add contact information to corporate
   - Verify contact data is saved

3. **For configuration issues:**
   - Check backend environment variables
   - Verify email service is running
   - Check network connectivity

#### Issue: Email sent but status not updated
**Symptoms:**
- Email appears to send successfully
- Corporate status remains unchanged
- No status update in investigation log

**Root Cause:**
- Backend status update fails
- Database transaction issues
- Status update logic not executed

**Solution:**
1. Check backend logs for status update errors
2. Verify database connection
3. Check investigation log for status updates
3. Manually update status if needed

### 4. Status-Related Issues

#### Issue: Wrong approval mode for corporate status
**Symptoms:**
- Corporate in "Pending 2nd Approval" but shows first approval form
- Corporate in "Pending 1st Approval" but shows second approval form

**Root Cause:**
- Status mapping logic incorrect
- Mode parameter not passed correctly
- Status not updated properly

**Solution:**
1. Verify status mapping:
   - `Pending 1st Approval` → `mode=approve`
   - `Pending 2nd Approval` → `mode=approve-second`

2. Check URL parameters:
   - Ensure `mode` parameter is correct
   - Verify `step=2` is included

3. Update status properly:
   - First approval → `Pending 2nd Approval`
   - Second approval → `Cooling Period`

### 5. UI/UX Issues

#### Issue: Error modal doesn't appear
**Symptoms:**
- Error occurs but no modal shows
- User doesn't see error message
- Silent failure

**Root Cause:**
- Modal state not set correctly
- Error message not set
- Modal component not rendered

**Solution:**
1. Check modal state:
```typescript
const [showValidationError, setShowValidationError] = useState(false);
const [validationErrorMessage, setValidationErrorMessage] = useState('');
```

2. Ensure error modal is rendered:
```typescript
<ErrorMessageModal
  isOpen={showValidationError}
  onClose={() => setShowValidationError(false)}
  message={validationErrorMessage}
/>
```

3. Set error state correctly:
```typescript
setValidationErrorMessage(error.message);
setShowValidationError(true);
```

#### Issue: Success modal shows but no redirect
**Symptoms:**
- Success modal appears
- User sees success message
- But no redirect happens

**Root Cause:**
- Redirect logic removed or commented out
- Success modal timeout not set
- Router not working

**Solution:**
1. Add redirect after success:
```typescript
setTimeout(() => {
  router.push('/?page=CRT Corporate');
}, 2000);
```

2. Or redirect immediately:
```typescript
router.push('/?page=CRT Corporate');
```

## Debugging Steps

### 1. Check Browser Console
- Look for JavaScript errors
- Check network requests
- Verify API responses

### 2. Check Backend Logs
- Look for error messages
- Check database operations
- Verify email service status

### 3. Test Individual Components
- Test error handling in isolation
- Verify modal states
- Check URL generation

### 4. Verify Data Flow
- Check form data is correct
- Verify API calls are made
- Ensure responses are handled

## Prevention Tips

### 1. Always Test Error Scenarios
- Test with invalid data
- Test with network failures
- Test with missing configuration

### 2. Use Consistent Error Handling
- Follow established patterns
- Use error modals consistently
- Log errors for debugging

### 3. Validate Data Before Sending
- Check required fields
- Validate email formats
- Ensure data integrity

### 4. Provide Clear Error Messages
- Use user-friendly language
- Include actionable steps
- Avoid technical jargon

## Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for error messages in console and backend
2. **Verify configuration** - Ensure all environment variables are set
3. **Test with valid data** - Make sure the issue isn't data-related
4. **Check network connectivity** - Ensure services can communicate
5. **Contact support** - Provide error messages and steps to reproduce
