/**
 * Validates and sanitizes receipt data payload for Google Sheets
 * Expanded schema to match Accounting Buddy P&L 2025 spreadsheet
 * Trims whitespace and converts numeric fields to numbers
 */

import { getOptions } from './matchOption';

export interface ReceiptPayload {
  day: string;
  month: string;
  year: string;
  property: string;
  typeOfOperation: string;
  typeOfPayment: string;
  detail: string;
  ref: string;
  debit: string | number;
  credit: string | number;
}

export interface ValidatedPayload {
  day: string;
  month: string;
  year: string;
  property: string;
  typeOfOperation: string;
  typeOfPayment: string;
  detail: string;
  ref: string;
  debit: number;
  credit: number;
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
  // Check for required fields (day, month, year, property, typeOfOperation, typeOfPayment, detail)
  // ref is optional, debit and credit can be 0
  if (!payload.day || !payload.month || !payload.year || !payload.property ||
      !payload.typeOfOperation || !payload.typeOfPayment || !payload.detail) {
    return {
      isValid: false,
      error: 'Missing required fields: day, month, year, property, typeOfOperation, typeOfPayment, and detail are all required',
    };
  }

  // Trim whitespace from string fields
  const day = String(payload.day).trim();
  const month = String(payload.month).trim();
  const year = String(payload.year).trim();
  const property = String(payload.property).trim();
  const typeOfOperation = String(payload.typeOfOperation).trim();
  const typeOfPayment = String(payload.typeOfPayment).trim();
  const detail = String(payload.detail).trim();
  const ref = String(payload.ref || '').trim(); // Optional field

  // Validate required fields are not empty after trimming
  if (!day) {
    return {
      isValid: false,
      error: 'Day cannot be empty',
    };
  }

  if (!month) {
    return {
      isValid: false,
      error: 'Month cannot be empty',
    };
  }

  if (!year) {
    return {
      isValid: false,
      error: 'Year cannot be empty',
    };
  }

  if (!property) {
    return {
      isValid: false,
      error: 'Property cannot be empty',
    };
  }

  if (!typeOfOperation) {
    return {
      isValid: false,
      error: 'Type of Operation cannot be empty',
    };
  }

  // Check for "Uncategorized" and prevent submission
  if (typeOfOperation === 'Uncategorized') {
    return {
      isValid: false,
      error: 'Please select a valid category from the dropdown. "Uncategorized" entries cannot be sent to the sheet.',
    };
  }

  // Validate against live dropdown options
  const options = getOptions();
  
  // Check if property is valid
  if (!options.properties.includes(property)) {
    return {
      isValid: false,
      error: `Invalid property "${property}". Please select from: ${options.properties.join(', ')}`,
    };
  }

  // Check if typeOfOperation is valid
  if (!options.typeOfOperation.includes(typeOfOperation)) {
    return {
      isValid: false,
      error: `Invalid operation type "${typeOfOperation}". Please select a valid category from the dropdown.`,
    };
  }

  // Check if typeOfPayment is valid
  if (!options.typeOfPayment.includes(typeOfPayment)) {
    return {
      isValid: false,
      error: `Invalid payment type "${typeOfPayment}". Please select from: ${options.typeOfPayment.join(', ')}`,
    };
  }

  if (!typeOfPayment) {
    return {
      isValid: false,
      error: 'Type of Payment cannot be empty',
    };
  }

  if (!detail) {
    return {
      isValid: false,
      error: 'Detail cannot be empty',
    };
  }

  // Convert debit and credit to numbers and validate
  const debit = Number(payload.debit || 0);
  const credit = Number(payload.credit || 0);

  if (isNaN(debit)) {
    return {
      isValid: false,
      error: 'Debit must be a valid number',
    };
  }

  if (isNaN(credit)) {
    return {
      isValid: false,
      error: 'Credit must be a valid number',
    };
  }

  if (debit < 0) {
    return {
      isValid: false,
      error: 'Debit cannot be negative',
    };
  }

  if (credit < 0) {
    return {
      isValid: false,
      error: 'Credit cannot be negative',
    };
  }

  // Return validated and sanitized data
  return {
    isValid: true,
    data: {
      day,
      month,
      year,
      property,
      typeOfOperation,
      typeOfPayment,
      detail,
      ref,
      debit,
      credit,
    },
  };
}

