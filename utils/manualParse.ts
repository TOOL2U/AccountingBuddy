import { matchProperty, matchTypeOfOperation, matchTypeOfPayment } from './matchOption';
import options from '@/config/options.json';

/**
 * Parse result with confidence score and extracted data
 */
export interface ParseResult {
  ok: boolean;
  data?: Partial<{
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
  }>;
  confidence: number;
  reasons?: string[];
}

/**
 * Detect debit/credit/expense/income keywords
 * Returns: 'debit' | 'credit' | null
 */
function detectTransactionType(input: string): 'debit' | 'credit' | null {
  const lower = input.toLowerCase();
  
  // Credit/Income keywords
  if (/(credit|income|in|revenue|sales|rental|deposit)\b/.test(lower)) {
    return 'credit';
  }
  
  // Debit/Expense keywords
  if (/(debit|expense|exp|out|payment|paid|cost)\b/.test(lower)) {
    return 'debit';
  }
  
  return null;
}

/**
 * Extract amount from input
 * Supports: 2000, 2,000, ฿2,000, 2000 thb, 2000 baht
 */
function extractAmount(input: string): number | null {
  // Remove currency symbols and normalize
  const normalized = input
    .replace(/[฿$€£¥]/g, '')
    .replace(/\s+(thb|baht|bath|dollar|usd)\b/gi, '')
    .trim();
  
  // Find numeric patterns (with optional commas)
  const matches = normalized.match(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\b/g);
  
  if (!matches || matches.length === 0) {
    return null;
  }
  
  // Take the first numeric value found
  const amountStr = matches[0].replace(/,/g, '');
  const amount = parseFloat(amountStr);
  
  return isNaN(amount) ? null : amount;
}

/**
 * Parse date from input
 * Supports: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 * Handles BE (Buddhist Era) years by subtracting 543
 */
function parseDate(input: string): { day: string; month: string; year: string } | null {
  const lower = input.toLowerCase();
  
  // Check for BE year indicator
  const isBE = /\b(be|พ\.ศ\.)\b/.test(lower);
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = input.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (ddmmyyyy) {
    let year = parseInt(ddmmyyyy[3]);
    // If year > 2100, assume it's BE
    if (year > 2100 || isBE) {
      year -= 543;
    }
    
    // Convert numeric month to abbreviation
    const monthNum = parseInt(ddmmyyyy[2]);
    const monthAbbrev = new Date(year, monthNum - 1, 1).toLocaleString('en', { month: 'short' });
    
    return {
      day: ddmmyyyy[1].padStart(2, '0'),
      month: monthAbbrev,
      year: year.toString(),
    };
  }
  
  // Try YYYY-MM-DD
  const yyyymmdd = input.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if (yyyymmdd) {
    let year = parseInt(yyyymmdd[1]);
    if (year > 2100 || isBE) {
      year -= 543;
    }
    
    // Convert numeric month to abbreviation
    const monthNum = parseInt(yyyymmdd[2]);
    const monthAbbrev = new Date(year, monthNum - 1, 1).toLocaleString('en', { month: 'short' });
    
    return {
      day: yyyymmdd[3].padStart(2, '0'),
      month: monthAbbrev,
      year: year.toString(),
    };
  }
  
  return null;
}

/**
 * Extract property from input using keyword matching
 */
function extractProperty(input: string): string | null {
  const result = matchProperty(input);
  
  // Lower threshold for property matching - accept any match with confidence > 0.5
  let finalResult = result.confidence > 0.5 ? result.value : null;
  
  // Emergency fallback - direct keyword search for critical properties
  if (!finalResult) {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('alesia')) finalResult = 'Alesia House';
    else if (lowerInput.includes('lanna')) finalResult = 'Lanna House';
    else if (lowerInput.includes('parents') || lowerInput.includes('parent')) finalResult = 'Parents House';
    else if (lowerInput.includes('sia') || lowerInput.includes('moon')) finalResult = 'Sia Moon - Land - General';
  }
  
  return finalResult;
}

/**
 * Extract payment type from input using keyword matching
 */
function extractPayment(input: string): string | null {
  const result = matchTypeOfPayment(input);
  return result.matched ? result.value : null;
}

/**
 * Extract operation type from input using keyword matching
 */
function extractOperation(input: string): string | null {
  const result = matchTypeOfOperation(input);
  return result.matched ? result.value : null;
}

/**
 * Extract detail/description from input
 * Removes known keywords and returns remaining text
 */
function extractDetail(input: string, detectedKeywords: string[]): string {
  let detail = input;
  
  // Remove detected keywords
  for (const keyword of detectedKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    detail = detail.replace(regex, '');
  }
  
  // Remove common separators and clean up
  detail = detail
    .replace(/[,\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return detail || 'Manual entry';
}

/**
 * Parse manual command input
 * @param input - User's text command (e.g., "debit 2000 salaries cash")
 * @returns Parse result with confidence score and extracted data
 */
export function parseManualCommand(input: string): ParseResult {
  if (!input || input.trim().length === 0) {
    return {
      ok: false,
      confidence: 0,
      reasons: ['Input is empty'],
    };
  }
  
  const normalized = input.toLowerCase().trim();
  const reasons: string[] = [];
  let confidence = 0;
  
  // Initialize data object
  const data: Partial<ParseResult['data']> = {
    ref: '',
  };
  
  // 1. Detect transaction type (debit/credit)
  const transactionType = detectTransactionType(normalized);
  if (transactionType) {
    if (transactionType === 'debit') {
      data.debit = 0; // Will be set later
      data.credit = 0;
    } else {
      data.debit = 0;
      data.credit = 0; // Will be set later
    }
    confidence += 0.4;
    reasons.push(`Detected ${transactionType} transaction`);
  }
  
  // 2. Extract amount
  const amount = extractAmount(input);
  if (amount !== null) {
    if (transactionType === 'credit') {
      data.credit = amount;
    } else {
      data.debit = amount;
    }
    confidence += 0.4;
    reasons.push(`Extracted amount: ${amount}`);
  }
  
  // 3. Extract date
  const dateResult = parseDate(input);
  if (dateResult) {
    data.day = dateResult.day;
    data.month = dateResult.month;
    data.year = dateResult.year;
    confidence += 0.1;
    reasons.push(`Parsed date: ${dateResult.day}/${dateResult.month}/${dateResult.year}`);
  } else {
    // Default to today's date with proper month abbreviation
    const today = new Date();
    data.day = today.getDate().toString().padStart(2, '0');
    data.month = today.toLocaleString('en', { month: 'short' });
    data.year = today.getFullYear().toString();
  }
  
  // 4. Extract property
  const property = extractProperty(normalized);
  if (property) {
    data.property = property;
    confidence += 0.05;
    reasons.push(`Detected property: ${property}`);
  } else {
    data.property = 'Sia Moon - Land - General'; // Updated default to match live data
  }
  
  // 5. Extract payment type
  const payment = extractPayment(normalized);
  if (payment) {
    data.typeOfPayment = payment;
    confidence += 0.2;
    reasons.push(`Detected payment: ${payment}`);
  } else {
    data.typeOfPayment = 'Cash'; // Default
  }
  
  // 6. Extract operation type
  const operation = extractOperation(normalized);
  if (operation) {
    data.typeOfOperation = operation;
    confidence += 0.3;
    reasons.push(`Detected operation: ${operation}`);
  } else {
    // Use "Uncategorized" to force user selection on review page
    data.typeOfOperation = 'Uncategorized';
  }
  
  // 7. Extract detail/description
  const detectedKeywords = [
    transactionType || '',
    amount?.toString() || '',
    payment || '',
    operation || '',
    property || '',
  ].filter(Boolean);
  
  data.detail = extractDetail(input, detectedKeywords);
  
  // Determine if parsing was successful
  const hasAmount = amount !== null;
  const hasOperation = operation !== null;
  const hasPaymentOrType = payment !== null || transactionType !== null;
  
  const ok = confidence >= 0.75 && hasAmount && (hasOperation || hasPaymentOrType);
  
  return {
    ok,
    data,
    confidence: Math.min(confidence, 1.0),
    reasons,
  };
}

/**
 * Get command history from localStorage
 */
export function getCommandHistory(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('ab_manual_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load command history:', error);
    return [];
  }
}

/**
 * Save command to history (max 5 commands)
 */
export function saveCommandToHistory(command: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getCommandHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(cmd => cmd !== command);
    
    // Add to beginning
    filtered.unshift(command);
    
    // Keep only last 5
    const updated = filtered.slice(0, 5);
    
    localStorage.setItem('ab_manual_history', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save command history:', error);
  }
}

