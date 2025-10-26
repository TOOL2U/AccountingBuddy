/**
 * Balance Parsing Utilities
 * 
 * Extracts bank balance amounts from OCR text using heuristics and regex patterns.
 * Optimized for Thai bank app screenshots.
 */

/**
 * Keywords that typically appear near balance amounts in Thai bank apps
 */
const BALANCE_KEYWORDS = [
  // English
  'available',
  'balance',
  'total',
  'amount',
  'current',
  // Thai
  'ยอดคงเหลือ',
  'ยอดเงิน',
  'คงเหลือ',
  'ยอดพร้อมใช้',
  'available balance',
  // Currency indicators
  'thb',
  '฿',
  'บาท',
  'baht',
];

/**
 * Normalize Thai and Arabic numerals to standard digits
 */
function normalizeDigits(text: string): string {
  // Thai numerals to Arabic
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let normalized = text;
  
  thaiDigits.forEach((thaiDigit, index) => {
    normalized = normalized.replace(new RegExp(thaiDigit, 'g'), index.toString());
  });
  
  return normalized;
}

/**
 * Extract all potential amounts from a line of text
 */
function extractAmounts(line: string): Array<{ value: number; raw: string }> {
  const normalized = normalizeDigits(line);
  const amounts: Array<{ value: number; raw: string }> = [];
  
  // Regex patterns for THB amounts
  // Matches: 1,234.56 or 1234.56 or 1,234 or 1234
  // With optional currency symbols: ฿, THB, บาท
  const patterns = [
    // With currency prefix: ฿1,234.56 or THB 1,234.56
    /(?:฿|THB|บาท)\s*([0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{1,2})?)/gi,
    // With currency suffix: 1,234.56 บาท or 1,234.56 THB
    /([0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:บาท|THB|Baht)/gi,
    // Plain numbers with commas: 1,234.56 or 1,234
    /\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b/g,
    // Plain numbers without commas but with decimals: 1234.56
    /\b([0-9]{4,}(?:\.[0-9]{1,2})?)\b/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(normalized)) !== null) {
      const raw = match[1] || match[0];
      // Remove commas and parse
      const cleaned = raw.replace(/,/g, '');
      const value = parseFloat(cleaned);
      
      // Only accept reasonable amounts (> 0 and < 1 billion)
      if (!isNaN(value) && value > 0 && value < 1_000_000_000) {
        amounts.push({ value, raw });
      }
    }
  });
  
  return amounts;
}

/**
 * Calculate relevance score for a line based on keywords
 */
function calculateRelevanceScore(line: string): number {
  const lowerLine = line.toLowerCase();
  let score = 0;
  
  BALANCE_KEYWORDS.forEach(keyword => {
    if (lowerLine.includes(keyword.toLowerCase())) {
      score += 1;
    }
  });
  
  return score;
}

export interface ParsedBalance {
  value: number;
  sourceLine: string;
  confidence: 'high' | 'medium' | 'low';
  allCandidates?: Array<{ value: number; line: string; score: number }>;
}

/**
 * Parse likely balance from OCR text
 * 
 * Strategy:
 * 1. Split text into lines
 * 2. For each line, extract all potential amounts
 * 3. Score lines based on keyword presence
 * 4. Return the highest-scored amount, or the max amount if no keywords found
 * 
 * @param rawText - OCR extracted text from bank screenshot
 * @returns Parsed balance with confidence level
 */
export function parseLikelyBalance(rawText: string): ParsedBalance {
  if (!rawText || typeof rawText !== 'string') {
    return {
      value: 0,
      sourceLine: '',
      confidence: 'low',
      allCandidates: [],
    };
  }
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const candidates: Array<{ value: number; line: string; score: number }> = [];
  
  // Extract amounts from each line and score them
  lines.forEach(line => {
    const amounts = extractAmounts(line);
    const relevanceScore = calculateRelevanceScore(line);
    
    amounts.forEach(amount => {
      candidates.push({
        value: amount.value,
        line: line,
        score: relevanceScore,
      });
    });
  });
  
  // No amounts found
  if (candidates.length === 0) {
    return {
      value: 0,
      sourceLine: '',
      confidence: 'low',
      allCandidates: [],
    };
  }
  
  // Sort by score (descending), then by value (descending)
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.value - a.value;
  });
  
  const best = candidates[0];
  
  // Determine confidence based on score and number of candidates
  let confidence: 'high' | 'medium' | 'low';
  if (best.score >= 2) {
    confidence = 'high';
  } else if (best.score >= 1 || candidates.length === 1) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    value: best.value,
    sourceLine: best.line,
    confidence,
    allCandidates: candidates.slice(0, 5), // Top 5 candidates for debugging
  };
}

/**
 * Format a balance parsing result for display
 */
export function formatParseResult(result: ParsedBalance): string {
  if (result.value === 0) {
    return 'No balance detected';
  }
  
  const confidenceEmoji = {
    high: '✓',
    medium: '~',
    low: '?',
  };
  
  return `${confidenceEmoji[result.confidence]} ฿${result.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

