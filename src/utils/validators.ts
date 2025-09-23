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


