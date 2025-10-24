import { NextRequest, NextResponse } from 'next/server';

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
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid input: text is required and must be non-empty',
          data: FALLBACK_DATA 
        },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const extractedData = await callOpenAI(text);

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

async function callOpenAI(text: string): Promise<ExtractedData> {
  try {
    const currentDate = new Date();
    const prompt = `Extract structured accounting data in JSON for this text:
"${text}"

Output fields:
{
  "day": "<string: day number, e.g., '27'>",
  "month": "<string: 3-letter month, e.g., 'Feb', 'Oct'>",
  "year": "<string: 4-digit year, e.g., '2025'>",
  "property": "<string: property name, e.g., 'Sia Moon', 'Villa 1'>",
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
   - If no date found, use today: day="${currentDate.getDate()}", month="${currentDate.toLocaleString('en', { month: 'short' })}", year="${currentDate.getFullYear()}"

2. Property:
   - Look for property names like "Sia Moon", "Villa 1", "Villa 2", etc.
   - Default to "Sia Moon" if not specified

3. Type of Operation (typeOfOperation):
   - For expenses: "EXP - <category> - <subcategory>"
   - Examples: "EXP - Construction - Materials", "EXP - Construction - Wall", "EXP - Salaries - Staff", "EXP - Utilities - Electric"
   - For income: "INC - <category> - <subcategory>"
   - Examples: "INC - Rental - Monthly", "INC - Sales - Products"
   - Use "Uncategorized" if unclear

4. Type of Payment (typeOfPayment):
   - Options: "Cash", "Bank transfer", "Card", "Check", "Mobile payment"
   - Infer from keywords like "paid cash", "bank transfer", "card payment"

5. Detail:
   - Brief description of the transaction
   - Examples: "Materials purchase", "Staff salary payment", "Electric bill"

6. Ref (optional):
   - Invoice number, receipt number, or reference
   - Leave empty string "" if not found

7. Debit vs Credit:
   - If text mentions "paid", "expense", "cost", "purchase", "spent" → fill debit, set credit to 0
   - If text mentions "received", "income", "deposit", "earned" → fill credit, set debit to 0
   - Extract only numeric value (no currency symbols)
   - Use 0 for empty debit/credit

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

