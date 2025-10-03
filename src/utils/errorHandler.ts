/**
 * Centralized error handling utility
 * Replaces console statements with proper error handling
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any; // Allow additional properties
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: Array<{ error: Error; context: ErrorContext; timestamp: Date }> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Log error with context for debugging
   * In production, this should send to error tracking service
   */
  logError(error: Error, context: ErrorContext = {}): void {
    const errorEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    this.errors.push(errorEntry);

    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context.component || 'Unknown'}] ${context.action || 'Action'}:`, error);
    }

    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorEntry);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: Error, context: ErrorContext = {}): string {
    this.logError(error, context);

    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (error.message.includes('403') || error.message.includes('401')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle form validation errors
   */
  handleValidationError(error: Error, field: string): string {
    this.logError(error, { component: 'FormValidation', action: 'validate' });
    
    if (error.message.includes('required')) {
      return `${field} is required.`;
    }
    
    if (error.message.includes('email')) {
      return 'Please enter a valid email address.';
    }
    
    if (error.message.includes('phone')) {
      return 'Please enter a valid phone number.';
    }

    return `Invalid ${field.toLowerCase()}.`;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): Array<{ error: Error; context: ErrorContext; timestamp: Date }> {
    return this.errors.slice(-limit);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  private sendToErrorService(errorEntry: { error: Error; context: ErrorContext; timestamp: Date }): void {
  }
}

export const errorHandler = ErrorHandler.getInstance();

export const logApiError = (error: Error, action: string, component: string = 'API') => {
  errorHandler.logError(error, { component, action });
};

export const logFormError = (error: Error, field: string, component: string = 'Form') => {
  errorHandler.logError(error, { component, action: 'validation' });
};

export const logComponentError = (error: Error, component: string, action: string = 'render') => {
  errorHandler.logError(error, { component, action });
};
