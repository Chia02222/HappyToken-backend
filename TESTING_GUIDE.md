# Testing Guide for "Send to Approver" Button

## Error Scenarios to Test

### 1. Invalid Email Address
**Test Case**: Corporate with invalid primary contact email
- **Setup**: Create a corporate with email like "invalid-email" or "test@"
- **Expected**: Error modal shows, no redirection occurs
- **Verify**: User stays on the same page, error message is clear

### 2. Missing Contact Information
**Test Case**: Corporate with no contacts or empty contact array
- **Setup**: Corporate with empty contacts array
- **Expected**: Error modal shows "Corporate not found or has no contacts"
- **Verify**: No redirection, user can retry after fixing contact info

### 3. Network/API Errors
**Test Case**: Backend email service is down or returns error
- **Setup**: Mock backend to return error response
- **Expected**: Error modal shows with backend error message
- **Verify**: No redirection, user can retry when service is restored

### 4. Email Service Configuration Issues
**Test Case**: Resend API key missing or invalid
- **Setup**: Backend with missing RESEND_API_KEY
- **Expected**: Error modal shows "Resend API Key or Sender Email is not configured"
- **Verify**: No redirection, clear error message

### 5. Success Scenario (Control Test)
**Test Case**: Valid corporate with valid email
- **Setup**: Corporate with valid primary contact email
- **Expected**: Success modal shows, then redirects to home page
- **Verify**: Proper success flow works as intended

## Manual Testing Steps

1. **Start the application**
2. **Navigate to a corporate form**
3. **Click "Send to Approver" button**
4. **For each error scenario above:**
   - Verify error modal appears
   - Verify no redirection occurs
   - Verify error message is clear and actionable
   - Verify user can close modal and retry

## Automated Testing (Future)

```javascript
// Example test cases for Jest/Testing Library
describe('Send to Approver Error Handling', () => {
  test('shows error modal when email sending fails', async () => {
    // Mock API to return error
    // Click send button
    // Verify error modal appears
    // Verify no navigation occurs
  });
  
  test('prevents redirection on network error', async () => {
    // Mock network failure
    // Click send button
    // Verify user stays on same page
  });
});
```

## Expected Behavior Summary

✅ **Should happen on error:**
- Error modal appears with clear message
- User stays on current page
- Button returns to normal state
- User can retry after fixing issues

❌ **Should NOT happen on error:**
- Automatic redirection to home page
- Success modal appearing
- Silent failures
- Unclear error messages
