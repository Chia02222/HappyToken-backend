export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple Malaysian phone: digits only, 7-12 length (customize as needed)
export const phoneRegex = /^\d{7,12}$/;

export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function isValidEmail(value: string | undefined | null): boolean {
  if (!value) return false;
  return emailRegex.test(value.trim());
}

export function isValidPhone(value: string | undefined | null): boolean {
  if (!value) return false;
  return phoneRegex.test(value.trim());
}

export function isPositiveNumberString(value: string | undefined | null): boolean {
  if (!value) return false;
  const normalized = value.replace(/,/g, '');
  const num = Number(normalized);
  return !Number.isNaN(num) && num >= 0;
}

export function isValidDateRange(from?: string | null, to?: string | null): boolean {
  if (!from || !to) return false;
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return !Number.isNaN(f) && !Number.isNaN(t) && f <= t;
}

// Utility function to get Malaysia timezone date string for date inputs
export function getMalaysiaDateString(date?: Date): string {
  if (!date) date = new Date();
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
}

// Utility function to handle date input change and prevent timezone conversion
export function handleDateInputChange(value: string): string {
  // If the value is a date string (YYYY-MM-DD), return it as-is
  // This prevents timezone conversion issues
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return value;
}


