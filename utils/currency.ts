/**
 * Currency formatting utilities for THB (Thai Baht)
 */

/**
 * Format a number as Thai Baht currency
 * @param value - The numeric value to format
 * @param options - Optional formatting options
 * @returns Formatted THB string (e.g., "฿1,234.56" or "1,234.56 THB")
 */
export function formatTHB(
  value: number,
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

  // Handle invalid values
  if (typeof value !== 'number' || isNaN(value)) {
    return showSymbol ? '฿0.00' : '0.00';
  }

  // Format number with commas and decimals
  const formatted = value.toLocaleString('en-US', {
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
 * Parse a string to extract a numeric THB value
 * Handles various formats: "1,234.56", "฿1234.56", "1234.56 THB", etc.
 * @param input - The string to parse
 * @returns Parsed number or null if invalid
 */
export function parseTHB(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove currency symbols and text
  let cleaned = input
    .replace(/฿|THB|บาท/gi, '')
    .trim();

  // Remove commas (thousand separators)
  cleaned = cleaned.replace(/,/g, '');

  // Parse as float
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}

/**
 * Format a variance value with color coding
 * @param variance - The variance amount
 * @returns Object with formatted value and color class
 */
export function formatVariance(variance: number): {
  formatted: string;
  color: 'success' | 'warning' | 'danger';
  className: string;
} {
  const absVariance = Math.abs(variance);
  const formatted = formatTHB(variance, { showSymbol: true });

  let color: 'success' | 'warning' | 'danger';
  let className: string;

  if (absVariance <= 100) {
    color = 'success';
    className = 'text-status-success';
  } else if (absVariance <= 1000) {
    color = 'warning';
    className = 'text-status-warning';
  } else {
    color = 'danger';
    className = 'text-status-danger';
  }

  return {
    formatted: variance >= 0 ? `+${formatted}` : formatted,
    color,
    className,
  };
}

