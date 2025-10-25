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
  property: 'Sia Moon',
  typeOfOperation: 'Uncategorized',
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

    const prompt = `Extract structured accounting data in JSON for this text:
${contextText}

IMPORTANT: You must select values from these EXACT dropdown options:

Properties (choose one):
${options.properties.map(p => `- "${p}"`).join('\n')}

Type of Operation (choose one):
${options.typeOfOperation.slice(0, 15).map(op => `- "${op}"`).join('\n')}
... and more (match exactly or use "Uncategorized")

Type of Payment (choose one):
${options.typeOfPayment.map(tp => `- "${tp}"`).join('\n')}

Output fields:
{
  "day": "<string: day number, e.g., '27'>",
  "month": "<string: 3-letter month, e.g., 'Feb', 'Oct', 'Jun', 'Aug', 'Sep'>",
  "year": "<string: 4-digit year, e.g., '2025'>",
  "property": "<string: property name, e.g., 'Sia Moon', 'Alesia House'>",
  "typeOfOperation": "<string: operation category>",
  "typeOfPayment": "<string: payment method>",
  "detail": "<string: transaction description>",
  "ref": "<string: invoice/reference number, optional>",
  "debit": <number: expense amount, 0 if not applicable>,
  "credit": <number: income amount, 0 if not applicable>
}

Rules:
1. Date Parsing:
   - Split date into day, month (3-letter abbreviation), year
   - Month must be 3 letters: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
   - If no date found, use today: day="${currentDate.getDate()}", month="${currentDate.toLocaleString('en', { month: 'short' })}", year="${currentDate.getFullYear()}"

2. Property:
   - Look for property names like "Sia Moon" or "Alesia House"
   - ONLY valid properties: "Sia Moon", "Alesia House"
   - Default to "Sia Moon" if not specified

3. Type of Operation (typeOfOperation):
   - For expenses: "EXP - <category> - <subcategory>"
   - Common expense categories:
     * "EXP - Construction - Wall"
     * "EXP - Construction - Materials"
     * "EXP - Construction - Electric"
     * "EXP - Construction - Overheads/General/Unclassified"
     * "EXP - Repairs & Maintenance - Electrical & Mechanical"
     * "EXP - Appliances & Electronics"
     * "EXP - Windows, Doors, Locks & Hardware"
     * "EXP - Decor"
     * "EXP - Salaries - Staff"
     * "EXP - Utilities - Electric"
   - For income: "INC - <category> - <subcategory>"
   - Examples: "INC - Rental - Monthly", "INC - Sales - Products"
   - Match the exact format from examples above
   - Use "EXP - Uncategorized" if unclear

4. Type of Payment (typeOfPayment):
   - Options: "Cash", "Bank transfer", "Card", "Check", "Mobile payment"
   - Note: "Bank transfer" has a space (not "Bank_transfer" or "BankTransfer")
   - Infer from keywords: "cash" → "Cash", "bank transfer" or "transfer" → "Bank transfer", "card" → "Card"
   - Default to "Cash" if payment method unclear

5. Detail:
   - Brief description of the transaction
   - Examples from real data:
     * "Materials" (for construction materials)
     * "Labour" (for labor/worker payments)
     * "Labour - painting" (for specific labor type)
     * "Electric cable for gardening 100m" (specific item description)
     * "Air purifier" (appliance purchase)
     * "Termite treatment 2nd half for 2025 year" (service description)
   - Keep it concise but descriptive
   - Capitalize first letter

6. Ref (optional):
   - Invoice number, receipt number, or reference
   - Leave empty string "" if not found
   - Examples: "INV-12345", "Receipt #789"

7. Debit vs Credit:
   - If text mentions "paid", "expense", "cost", "purchase", "spent", "EXP" → fill debit, set credit to 0
   - If text mentions "received", "income", "deposit", "earned", "INC" → fill credit, set debit to 0
   - Extract only numeric value (remove currency symbols like ฿, $, €, commas, spaces)
   - Examples: "฿4,785" → 4785, "135,200 baht" → 135200, "2000 baht" → 2000
   - Use 0 for empty debit/credit

8. Number Extraction:
   - Remove all currency symbols (฿, $, €, £, ¥)
   - Remove all commas and spaces from numbers
   - Convert to plain integer or decimal
   - Examples: "฿15,820" → 15820, "฿3,600" → 3600, "279" → 279

Return a single JSON object only, no additional text.`;

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

