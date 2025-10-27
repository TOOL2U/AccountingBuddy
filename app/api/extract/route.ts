import { NextRequest, NextResponse } from 'next/server';
import { normalizeDropdownFields, getOptions } from '@/utils/matchOption';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback data structure - expanded schema
const FALLBACK_DATA = {
  day: '',
  month: '',
  year: '',
  property: 'Sia Moon - Land - General',
  typeOfOperation: 'EXP - Construction - Overheads/General/Unclassified',
  typeOfPayment: '',
  detail: '',
  ref: '',
  debit: 0,
  credit: 0,
};

// Type for extracted data - expanded schema
interface ExtractedData {
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
  confidence?: {
    property: number;
    typeOfOperation: number;
    typeOfPayment: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          data: FALLBACK_DATA 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text, comment } = body;

    console.log('[EXTRACT] Starting AI extraction...');
    console.log(`[EXTRACT] Input text length: ${text?.length || 0} characters`);
    if (comment) {
      console.log(`[EXTRACT] User comment provided: "${comment}"`);
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('[✖] EXTRACT failed: No text provided');
      return NextResponse.json(
        {
          error: 'Invalid input: text is required and must be non-empty',
          data: FALLBACK_DATA
        },
        { status: 400 }
      );
    }

    // Call OpenAI API with optional comment
    const extractedData = await callOpenAI(text, comment);

    console.log('[✔] AI extraction success → fields mapped:', Object.keys(extractedData).filter(k => k !== 'confidence').join(', '));
    console.log(`[EXTRACT] Extracted: ${extractedData.typeOfOperation} | ${extractedData.detail} | ${extractedData.debit > 0 ? 'Debit: ' + extractedData.debit : 'Credit: ' + extractedData.credit}`);
    if (extractedData.confidence) {
      console.log(`[EXTRACT] Confidence scores: Property=${extractedData.confidence.property.toFixed(2)}, Operation=${extractedData.confidence.typeOfOperation.toFixed(2)}, Payment=${extractedData.confidence.typeOfPayment.toFixed(2)}`);
    }

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract data from receipt',
        data: FALLBACK_DATA 
      },
      { status: 500 }
    );
  }
}

async function callOpenAI(text: string, comment?: string): Promise<ExtractedData> {
  try {
    const currentDate = new Date();
    const options = getOptions();

    // Build context with comment if provided
    const contextText = comment
      ? `Receipt text: "${text}"\n\nUser comment (use this to guide categorization): "${comment}"`
      : `Receipt text: "${text}"`;

    const prompt = `You are an expert accounting data extraction AI trained on real Thai business transaction data. Extract structured accounting data in JSON for this text:

${contextText}

CRITICAL: Use EXACT values from these live dropdown options:

Properties (choose one - these are the ONLY valid options):
${options.properties.map(p => `- "${p}"`).join('\n')}

Type of Operation (choose one - match EXACTLY):
${options.typeOfOperation.map(op => `- "${op}"`).join('\n')}

Type of Payment (choose one):
${options.typeOfPayment.map(tp => `- "${tp}"`).join('\n')}

TRAINING EXAMPLES (learn from real P&L data):

Example 1: "27/Feb/2025 Sia Moon wall materials bank transfer 4785 baht"
→ {
  "day": "27",
  "month": "Feb", 
  "year": "2025",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Bank transfer",
  "detail": "Materials",
  "ref": "",
  "debit": 4785,
  "credit": 0
}

Example 2: "labour payment cash 135200 sia moon"
→ {
  "day": "${currentDate.getDate()}",
  "month": "${currentDate.toLocaleString('en', { month: 'short' })}",
  "year": "${currentDate.getFullYear()}",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Cash",
  "detail": "Labour",
  "ref": "",
  "debit": 135200,
  "credit": 0
}

Example 3: "electric supplies cable wire bank transfer 3200"
→ {
  "day": "${currentDate.getDate()}",
  "month": "${currentDate.toLocaleString('en', { month: 'short' })}",
  "year": "${currentDate.getFullYear()}",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Electric Supplies",
  "typeOfPayment": "Bank transfer",
  "detail": "Electric supplies cable wire",
  "ref": "",
  "debit": 3200,
  "credit": 0
}

SMART CATEGORIZATION RULES:
1. Property Detection:
   - "sia moon" → "Sia Moon - Land - General" (default)
   - "alesia house" → "Alesia House"
   - "lanna house" → "Lanna House"
   - "parents house" → "Parents House"

2. Operation Categories (prioritize more specific matches):
   - "electric supplies", "electrical supplies", "electric materials", "cable", "wire", "electrical materials" → "EXP - Construction - Electric Supplies"
   - "electric bill", "electricity bill", "power bill", "utility electric" → "EXP - Utilities  - Electricity"
   - "electrical repair", "electrician", "electric maintenance" → "EXP - Repairs & Maintenance - Electrical & Mechanical"
   - "wall", "materials", "construction" → "EXP - Construction - Wall"
   - "aircon", "air purifier", "electronics" → "EXP - Appliances & Electronics"
   - "door", "window", "lock", "hardware" → "EXP - Windows, Doors, Locks & Hardware"
   - "furniture", "decorative", "decor", "decoration", "art", "vase", "pillow" → "EXP - Repairs & Maintenance  - Furniture & Decorative Items"
   - "painting", "paint", "painter", "decorative painting" → "EXP - Repairs & Maintenance - Painting & Decoration"
   - "salary", "salaries", "staff" → "EXP - HR - Employees Salaries"

3. Payment Methods:
   - "cash" → "Cash"
   - "transfer", "bank" → "Bank transfer"
   - "card", "credit" → "Credit card"

Output fields:
{
  "day": "<string: day number, e.g., '27'>",
  "month": "<string: 3-letter month, e.g., 'Feb', 'Oct', 'Jun', 'Aug', 'Sep'>",
  "year": "<string: 4-digit year, e.g., '2025'>",
  "property": "<string: exact property name from dropdown>",
  "typeOfOperation": "<string: exact operation category from dropdown>",
  "typeOfPayment": "<string: exact payment method from dropdown>",
  "detail": "<string: transaction description>",
  "ref": "<string: invoice/reference number, optional>",
  "debit": <number: expense amount, 0 if not applicable>,
  "credit": <number: income amount, 0 if not applicable>
}

CRITICAL RULES:
1. Date: Split into day, month (3-letter), year. If no date, use today: day="${currentDate.getDate()}", month="${currentDate.toLocaleString('en', { month: 'short' })}", year="${currentDate.getFullYear()}"
2. Property: Must be exact match from dropdown list. Default to "Sia Moon - Land - General"
3. Operation: Must be exact match from dropdown list. Use smart categorization above. NEVER select headers: "REVENUES", "Fixed Costs", "EXPENSES", "Property"
4. Payment: Must be exact match from dropdown list
5. Amount: Remove ฿, commas, "baht". For expenses → debit field. For income → credit field
6. Detail: Keep concise but descriptive, capitalize first letter

FORBIDDEN CATEGORIES (these are headers, not selectable options):
- "REVENUES" (use specific revenue type like "Revenue - Sales")
- "Fixed Costs" (use specific cost type)
- "EXPENSES" (use specific expense type like "EXP - Construction - Wall")
- "Property" (use actual property name)

Return ONLY valid JSON, no additional text.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an accounting data extraction assistant. Extract structured accounting data from receipt text and return only valid JSON with all required fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 800, // Increased for more complex schema
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return FALLBACK_DATA;
    }

    // Parse JSON from response
    let extracted: ExtractedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;

      extracted = JSON.parse(jsonString.trim());

      // Validate that we have at least some required fields
      if (!extracted.day && !extracted.month && !extracted.year && !extracted.property && !extracted.typeOfOperation) {
        console.error('Extracted data is missing all required fields');
        return FALLBACK_DATA;
      }

      // Ensure all fields exist with defaults
      const currentDate = new Date();
      extracted = {
        day: extracted.day || String(currentDate.getDate()),
        month: extracted.month || currentDate.toLocaleString('en', { month: 'short' }),
        year: extracted.year || String(currentDate.getFullYear()),
        property: extracted.property || 'Sia Moon',
        typeOfOperation: extracted.typeOfOperation || 'Uncategorized',
        typeOfPayment: extracted.typeOfPayment || '',
        detail: extracted.detail || '',
        ref: extracted.ref || '',
        debit: Number(extracted.debit) || 0,
        credit: Number(extracted.credit) || 0,
      };

      // Normalize dropdown fields to match canonical options
      const normalized = normalizeDropdownFields(
        {
          property: extracted.property,
          typeOfOperation: extracted.typeOfOperation,
          typeOfPayment: extracted.typeOfPayment,
        },
        comment
      );

      // Apply normalized values and add confidence scores
      extracted.property = normalized.property.value;
      extracted.typeOfOperation = normalized.typeOfOperation.value;
      extracted.typeOfPayment = normalized.typeOfPayment.value;
      extracted.confidence = {
        property: normalized.property.confidence,
        typeOfOperation: normalized.typeOfOperation.confidence,
        typeOfPayment: normalized.typeOfPayment.confidence,
      };

      return extracted;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Response content:', content);
      return FALLBACK_DATA;
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return FALLBACK_DATA;
  }
}

