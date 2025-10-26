/**
 * Currency Formatting Utilities
 * 
 * Provides consistent THB (Thai Baht) formatting across the application.
 */

/**
 * Format a number as Thai Baht currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted THB string (e.g., "฿1,234.56" or "1,234.56 THB")
 */
export function formatTHB(
  amount: number,
  options: {
    showSymbol?: boolean;
    symbolPosition?: 'prefix' | 'suffix';
    decimals?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    symbolPosition = 'prefix',
    decimals = 2,
  } = options;

  // Handle invalid numbers
  if (isNaN(amount) || !isFinite(amount)) {
    return showSymbol ? '฿0.00' : '0.00';
  }

  // Format number with commas and decimals
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Add currency symbol if requested
  if (!showSymbol) {
    return formatted;
  }

  return symbolPosition === 'prefix' 
    ? `฿${formatted}` 
    : `${formatted} THB`;
}

/**
 * Format a number as compact THB (e.g., "฿1.2K", "฿3.4M")
 * Useful for displaying large amounts in limited space
 */
export function formatTHBCompact(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '฿0';
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000) {
    return `${sign}฿${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    return `${sign}฿${(absAmount / 1_000).toFixed(1)}K`;
  } else {
    return `${sign}฿${absAmount.toFixed(0)}`;
  }
}

/**
 * Parse a THB string back to a number
 * Handles various formats: "฿1,234.56", "1234.56 THB", "1,234.56", etc.
 */
export function parseTHB(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbols, commas, and "THB" text
  const cleaned = value
    .replace(/[฿,THBthb\s]/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

