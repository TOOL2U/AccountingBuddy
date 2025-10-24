import { NextRequest, NextResponse } from 'next/server';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback data structure
const FALLBACK_DATA = {
  date: '',
  vendor: '',
  amount: '',
  category: 'Uncategorized',
};

// Type for extracted data
interface ExtractedData {
  date: string;
  vendor: string;
  amount: string;
  category: string;
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
    const prompt = `Extract structured data from this receipt text: ${text}

Return JSON only with the following keys:
{
  "date": "MM/DD/YYYY",
  "vendor": "<string>",
  "amount": "<number>",
  "category": "<string: e.g., EXP - Construction - Structure or Uncategorized>"
}

Important:
- For date, use MM/DD/YYYY format
- For amount, extract only the numeric value (no currency symbols)
- For category, try to infer from the vendor or items, or use "Uncategorized"
- Return ONLY valid JSON, no additional text`;

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
            content: 'You are a receipt data extraction assistant. Extract structured data from receipt text and return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
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

      // Validate required fields
      if (!extracted.date && !extracted.vendor && !extracted.amount && !extracted.category) {
        console.error('Extracted data is missing all required fields');
        return FALLBACK_DATA;
      }

      // Ensure all fields exist with defaults
      extracted = {
        date: extracted.date || '',
        vendor: extracted.vendor || '',
        amount: extracted.amount || '',
        category: extracted.category || 'Uncategorized',
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

