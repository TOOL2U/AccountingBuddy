/**
 * Validates and sanitizes receipt data payload for Google Sheets
 * Trims whitespace and converts amount to number
 */

export interface ReceiptPayload {
  date: string;
  vendor: string;
  amount: string | number;
  category: string;
}

export interface ValidatedPayload {
  date: string;
  vendor: string;
  amount: number;
  category: string;
}

export interface ValidationResult {
  isValid: boolean;
  data?: ValidatedPayload;
  error?: string;
}

/**
 * Validates and sanitizes receipt payload
 * @param payload - Raw receipt data from form
 * @returns Validation result with sanitized data or error message
 */
export function validatePayload(payload: ReceiptPayload): ValidationResult {
  // Check for required fields
  if (!payload.date || !payload.vendor || !payload.amount || !payload.category) {
    return {
      isValid: false,
      error: 'Missing required fields: date, vendor, amount, and category are all required',
    };
  }

  // Trim whitespace from string fields
  const date = String(payload.date).trim();
  const vendor = String(payload.vendor).trim();
  const category = String(payload.category).trim();

  // Validate date is not empty after trimming
  if (!date) {
    return {
      isValid: false,
      error: 'Date cannot be empty',
    };
  }

  // Validate vendor is not empty after trimming
  if (!vendor) {
    return {
      isValid: false,
      error: 'Vendor cannot be empty',
    };
  }

  // Convert amount to number and validate
  const amount = Number(payload.amount);
  if (isNaN(amount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    };
  }

  if (amount < 0) {
    return {
      isValid: false,
      error: 'Amount cannot be negative',
    };
  }

  // Validate category is not empty after trimming
  if (!category) {
    return {
      isValid: false,
      error: 'Category cannot be empty',
    };
  }

  // Return validated and sanitized data
  return {
    isValid: true,
    data: {
      date,
      vendor,
      amount,
      category,
    },
  };
}

