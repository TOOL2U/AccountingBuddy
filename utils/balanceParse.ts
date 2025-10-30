/**
 * Balance parsing utilities for OCR text extraction
 * Handles Thai and English bank app screenshots
 */

export interface ParsedBalance {
  value: number;
  sourceLine: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Keywords that indicate a balance line (Thai and English)
 */
const BALANCE_KEYWORDS = [
  // English
  'available',
  'balance',
  'current balance',
  'account balance',
  'total balance',
  
  // Thai
  'ยอดคงเหลือ',
  'ยอดเงินคงเหลือ',
  'ยอดเงิน',
  'คงเหลือ',
  
  // Currency indicators
  'thb',
  '฿',
  'บาท',
  'baht',
];

/**
 * Regex patterns for extracting THB amounts
 */
const AMOUNT_PATTERNS = [
  // Pattern 1: THB prefix (e.g., "THB 1,234.56" or "฿1,234.56")
  /(?:THB|฿)\s*([0-9][0-9,]*\.?[0-9]{0,2})/i,
  
  // Pattern 2: Suffix (e.g., "1,234.56 THB" or "1234.56 บาท")
  /([0-9][0-9,]*\.?[0-9]{0,2})\s*(?:THB|บาท|baht)/i,
  
  // Pattern 3: Standalone number with commas/decimals (e.g., "1,234.56")
  /([0-9][0-9,]+\.[0-9]{2})/,
  
  // Pattern 4: Large number without decimals (e.g., "12345")
  /([0-9]{4,})/,
];

/**
 * Normalize a number string by removing commas and parsing
 */
function normalizeAmount(amountStr: string): number | null {
  if (!amountStr) return null;
  
  // Remove commas and whitespace
  const cleaned = amountStr.replace(/,/g, '').trim();
  
  // Parse as float
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Check if a line contains balance-related keywords
 */
function hasBalanceKeyword(line: string): boolean {
  const lowerLine = line.toLowerCase();
  return BALANCE_KEYWORDS.some(keyword => 
    lowerLine.includes(keyword.toLowerCase())
  );
}

/**
 * Extract all potential amounts from a line
 */
function extractAmounts(line: string): number[] {
  const amounts: number[] = [];
  
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = line.matchAll(new RegExp(pattern, 'g'));
    for (const match of matches) {
      const amountStr = match[1];
      const amount = normalizeAmount(amountStr);
      if (amount !== null && amount > 0) {
        amounts.push(amount);
      }
    }
  }
  
  return amounts;
}

/**
 * Parse OCR text to extract the most likely bank balance
 * @param rawText - Raw OCR text from bank app screenshot
 * @returns Parsed balance with confidence level
 */
export function parseLikelyBalance(rawText: string): ParsedBalance | null {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  // Split into lines and clean
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Strategy 1: Find lines with balance keywords
  const balanceLines: Array<{ line: string; amounts: number[] }> = [];
  
  for (const line of lines) {
    if (hasBalanceKeyword(line)) {
      const amounts = extractAmounts(line);
      if (amounts.length > 0) {
        balanceLines.push({ line, amounts });
      }
    }
  }

  // If we found lines with balance keywords, pick the max amount
  if (balanceLines.length > 0) {
    let maxAmount = 0;
    let sourceLine = '';
    
    for (const { line, amounts } of balanceLines) {
      const lineMax = Math.max(...amounts);
      if (lineMax > maxAmount) {
        maxAmount = lineMax;
        sourceLine = line;
      }
    }
    
    return {
      value: maxAmount,
      sourceLine,
      confidence: 'high',
    };
  }

  // Strategy 2: Extract all amounts from all lines and pick the max
  const allAmounts: Array<{ amount: number; line: string }> = [];
  
  for (const line of lines) {
    const amounts = extractAmounts(line);
    for (const amount of amounts) {
      allAmounts.push({ amount, line });
    }
  }

  if (allAmounts.length === 0) {
    return null;
  }

  // Sort by amount descending
  allAmounts.sort((a, b) => b.amount - a.amount);

  // Pick the largest plausible amount (not too large to be unrealistic)
  // Assume bank balances are typically < 100 million THB
  const MAX_PLAUSIBLE = 100_000_000;
  
  for (const { amount, line } of allAmounts) {
    if (amount <= MAX_PLAUSIBLE) {
      return {
        value: amount,
        sourceLine: line,
        confidence: 'medium',
      };
    }
  }

  // Fallback: return the largest amount even if implausible
  return {
    value: allAmounts[0].amount,
    sourceLine: allAmounts[0].line,
    confidence: 'low',
  };
}

/**
 * Validate a parsed balance value
 * @param value - The balance value to validate
 * @returns True if valid, false otherwise
 */
export function isValidBalance(value: number): boolean {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= 0 &&
    value <= 100_000_000 // Max 100M THB
  );
}

