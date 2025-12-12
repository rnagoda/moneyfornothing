/**
 * Formatting utilities for Money For Nothing
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as currency with cents
 */
export function formatCurrencyWithCents(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format current month and year for display
 * e.g., "December 2025"
 */
export function formatCurrentMonthYear(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Format a YYYY-MM string to display format
 * e.g., "2025-12" -> "December 2025"
 */
export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a YYYY-MM string to display format, or current month if not provided
 * e.g., "2025-12" -> "December 2025"
 */
export function formatMonth(yearMonth?: string): string {
  if (!yearMonth) {
    return formatCurrentMonthYear();
  }
  return formatMonthYear(yearMonth);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Sanitize a string for safe display (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Parse a currency string to number
 * e.g., "$1,234.56" -> 1234.56
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
