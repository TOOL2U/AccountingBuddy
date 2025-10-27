import options from '@/config/options.json';

/**
 * Match result with confidence score
 */
export interface MatchResult {
  value: string;
  confidence: number;
  matched: boolean;
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance normalized by string length
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1.0;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Levenshtein distance
  const matrix: number[][] = [];
  const len1 = s1.length;
  const len2 = s2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  return 1 - distance / maxLength;
}

/**
 * Match input against keywords for a specific option
 */
function matchKeywords(input: string, keywords: string[]): number {
  const inputLower = input.toLowerCase().trim();
  let maxScore = 0;

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase().trim();
    
    // Exact match gets highest score
    if (inputLower === keywordLower) {
      return 1.0;
    }

    // For single-word keywords, check word boundaries to prevent "sia" matching "alesia"
    if (!keywordLower.includes(' ') && !inputLower.includes(' ')) {
      // Only match if input starts with keyword or keyword starts with input
      if (inputLower.startsWith(keywordLower) && inputLower.length > keywordLower.length) {
        // "alesia" should NOT match "sia" - skip short keywords that are substrings
        if (keywordLower.length >= 4 || inputLower === keywordLower) {
          maxScore = Math.max(maxScore, 0.85);
        }
      } else if (keywordLower.startsWith(inputLower) && keywordLower.length > inputLower.length) {
        // "sia" can match "sia moon" but not "alesia"
        maxScore = Math.max(maxScore, 0.9);
      }
    } else {
      // Multi-word keywords: check if input contains keyword or vice versa
      if (inputLower.includes(keywordLower)) {
        maxScore = Math.max(maxScore, 0.95);
      } else if (keywordLower.includes(inputLower)) {
        maxScore = Math.max(maxScore, 0.85);
      }
    }

    // Word boundary match (e.g., "salaries" matches "salary")
    const inputWords = inputLower.split(/\s+/);
    const keywordWords = keywordLower.split(/\s+/);
    
    for (const inputWord of inputWords) {
      for (const keywordWord of keywordWords) {
        // Prevent partial matches like "sia" in "alesia"
        if (inputWord === keywordWord) {
          maxScore = Math.max(maxScore, 0.95);
        } else if (inputWord.length >= 4 && keywordWord.length >= 4) {
          const similarity = calculateSimilarity(inputWord, keywordWord);
          if (similarity > 0.8) {
            maxScore = Math.max(maxScore, similarity * 0.9);
          }
        }
      }
    }
  }

  return maxScore;
}

/**
 * Match property name
 */
export function matchProperty(input: string, comment?: string): MatchResult {
  if (!input && !comment) {
    return { value: 'Sia Moon - Land - General', confidence: 0.5, matched: false };
  }

  const searchText = `${input} ${comment || ''}`.toLowerCase().trim();
  let bestMatch = { value: 'Sia Moon - Land - General', confidence: 0.0, matched: false };

  // Priority shortcuts - exact matches for common property names
  const shortcuts: Record<string, string> = {
    'alesia': 'Alesia House',
    'lanna': 'Lanna House', 
    'parents': 'Parents House',
    'sia': 'Sia Moon - Land - General',
    'sia moon': 'Sia Moon - Land - General'
  };

  // Check for exact shortcut matches first
  const inputWords = searchText.split(/\s+/);
  for (const word of inputWords) {
    if (shortcuts[word]) {
      return { value: shortcuts[word], confidence: 1.0, matched: true };
    }
  }

  // Try exact match against full property names
  for (const property of options.properties) {
    if (searchText.toLowerCase() === property.toLowerCase()) {
      return { value: property, confidence: 1.0, matched: true };
    }
  }

  // Try keyword matching with improved scoring
  const keywords = options.keywords.properties as Record<string, string[]>;
  for (const [property, propertyKeywords] of Object.entries(keywords)) {
    const score = matchKeywords(searchText, propertyKeywords);
    if (score > bestMatch.confidence) {
      bestMatch = { value: property, confidence: score, matched: score >= 0.8 };
    }
  }

  // Try direct similarity matching as fallback
  for (const property of options.properties) {
    const score = calculateSimilarity(searchText, property);
    if (score > bestMatch.confidence && score >= 0.7) {
      bestMatch = { value: property, confidence: score, matched: score >= 0.8 };
    }
  }

  // Default to Sia Moon if no good match
  if (!bestMatch.matched) {
    return { value: 'Sia Moon - Land - General', confidence: 0.5, matched: false };
  }

  return bestMatch;
}

/**
 * Match type of operation
 */
export function matchTypeOfOperation(input: string, comment?: string): MatchResult {
  if (!input && !comment) {
    return { value: '', confidence: 0.0, matched: false };
  }

  const searchText = `${input} ${comment || ''}`.toLowerCase().trim();
  let bestMatch = { value: '', confidence: 0.0, matched: false };

  // Try exact match first
  for (const operation of options.typeOfOperation) {
    if (searchText.toLowerCase() === operation.toLowerCase()) {
      return { value: operation, confidence: 1.0, matched: true };
    }
  }

  // Try keyword matching
  const keywords = options.keywords.typeOfOperation as Record<string, string[]>;
  for (const [operation, operationKeywords] of Object.entries(keywords)) {
    const score = matchKeywords(searchText, operationKeywords);
    if (score > bestMatch.confidence) {
      bestMatch = { value: operation, confidence: score, matched: score >= 0.8 };
    }
  }

  // Try direct similarity matching
  for (const operation of options.typeOfOperation) {
    const score = calculateSimilarity(searchText, operation);
    if (score > bestMatch.confidence) {
      bestMatch = { value: operation, confidence: score, matched: score >= 0.8 };
    }
  }

  return bestMatch;
}

/**
 * Match type of payment
 */
export function matchTypeOfPayment(input: string, comment?: string): MatchResult {
  if (!input && !comment) {
    return { value: 'Cash', confidence: 0.5, matched: false };
  }

  const searchText = `${input} ${comment || ''}`.toLowerCase().trim();
  let bestMatch = { value: 'Cash', confidence: 0.0, matched: false };

  // Try exact match first
  for (const payment of options.typeOfPayment) {
    if (searchText.toLowerCase() === payment.toLowerCase()) {
      return { value: payment, confidence: 1.0, matched: true };
    }
  }

  // Try keyword matching
  const keywords = options.keywords.typeOfPayment as Record<string, string[]>;
  for (const [payment, paymentKeywords] of Object.entries(keywords)) {
    const score = matchKeywords(searchText, paymentKeywords);
    if (score > bestMatch.confidence) {
      bestMatch = { value: payment, confidence: score, matched: score >= 0.8 };
    }
  }

  // Try direct similarity matching
  for (const payment of options.typeOfPayment) {
    const score = calculateSimilarity(searchText, payment);
    if (score > bestMatch.confidence) {
      bestMatch = { value: payment, confidence: score, matched: score >= 0.8 };
    }
  }

  // Default to Cash if no good match
  if (!bestMatch.matched) {
    return { value: 'Cash', confidence: 0.5, matched: false };
  }

  return bestMatch;
}

/**
 * Validate and normalize all dropdown fields
 */
export interface NormalizedData {
  property: MatchResult;
  typeOfOperation: MatchResult;
  typeOfPayment: MatchResult;
}

export function normalizeDropdownFields(
  data: {
    property?: string;
    typeOfOperation?: string;
    typeOfPayment?: string;
  },
  comment?: string
): NormalizedData {
  return {
    property: matchProperty(data.property || '', comment),
    typeOfOperation: matchTypeOfOperation(data.typeOfOperation || '', comment),
    typeOfPayment: matchTypeOfPayment(data.typeOfPayment || '', comment),
  };
}

/**
 * Get all available options for dropdowns
 */
export function getOptions() {
  return {
    properties: options.properties,
    typeOfOperation: options.typeOfOperation,
    typeOfPayment: options.typeOfPayment,
  };
}

