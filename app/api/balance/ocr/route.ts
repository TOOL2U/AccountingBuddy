import { NextRequest, NextResponse } from 'next/server';
import { parseLikelyBalance } from '@/utils/balanceParse';

const GOOGLE_VISION_KEY = process.env.GOOGLE_VISION_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Accepted file types
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Google Vision API with retry logic
 */
async function callVisionAPI(base64Content: string, retryCount = 0): Promise<string> {
  try {
    const response = await fetch(`${VISION_API_URL}?key=${GOOGLE_VISION_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Content },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    });

    // Handle rate limits and server errors with retry
    if ((response.status === 429 || response.status === 500) && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount];
      console.log(`[⚠] Vision API error ${response.status}, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return callVisionAPI(base64Content, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[✖] Vision API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors in response
    if (data.responses?.[0]?.error) {
      const error = data.responses[0].error;
      console.error('[✖] Vision API returned error:', error);
      throw new Error(`Vision API error: ${error.message || 'Unknown error'}`);
    }

    // Extract text from response
    const text = data.responses?.[0]?.fullTextAnnotation?.text || '';

    // Log detected languages for debugging
    const detectedLanguages = data.responses?.[0]?.fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages;
    if (detectedLanguages && detectedLanguages.length > 0) {
      console.log('[OCR] Detected languages:', detectedLanguages.map((l: any) => l.languageCode).join(', '));
    }

    return text;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount];
      console.log(`Vision API error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return callVisionAPI(base64Content, retryCount + 1);
    }
    throw error;
  }
}

/**
 * POST /api/balance/ocr
 * Accepts bank screenshot, extracts text via Vision API, parses balance amount
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[BALANCE OCR] Starting bank screenshot OCR...');

    // Check if API key is configured
    if (!GOOGLE_VISION_KEY) {
      return NextResponse.json(
        { error: 'Google Vision API key not configured' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG and PNG are supported.' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Call Google Vision API with retry logic
    let rawText = '';
    try {
      console.log('[BALANCE OCR] Calling Vision API...');
      rawText = await callVisionAPI(base64Content);
      console.log(`[✔] OCR complete → text length: ${rawText.length} characters`);

      // Validate extracted text quality
      if (!rawText || rawText.trim().length < 10) {
        console.warn('[⚠] OCR returned insufficient text (< 10 chars)');
        return NextResponse.json(
          {
            bankBalance: 0,
            rawText: rawText || '',
            confidence: 'low',
            error: 'Could not extract readable text from image. Please ensure the screenshot is clear and well-lit.'
          },
          { status: 200 }
        );
      }

      console.log('[BALANCE OCR] Text preview:', rawText.substring(0, 150) + (rawText.length > 150 ? '...' : ''));

    } catch (error) {
      console.error('[✖] OCR failed after retries:', error);
      return NextResponse.json(
        {
          bankBalance: 0,
          rawText: '',
          confidence: 'low',
          error: 'OCR processing failed. Please try again with a clearer image.'
        },
        { status: 200 }
      );
    }

    // Parse balance from OCR text
    console.log('[BALANCE OCR] Parsing balance from text...');
    const parseResult = parseLikelyBalance(rawText);
    
    console.log('[BALANCE OCR] Parse result:', {
      value: parseResult.value,
      confidence: parseResult.confidence,
      sourceLine: parseResult.sourceLine,
      candidatesCount: parseResult.allCandidates?.length || 0,
    });

    // Return parsed balance
    return NextResponse.json({
      bankBalance: parseResult.value,
      rawText: rawText,
      confidence: parseResult.confidence,
      sourceLine: parseResult.sourceLine,
      allCandidates: parseResult.allCandidates,
    });

  } catch (error) {
    console.error('[✖] Balance OCR API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        bankBalance: 0,
        rawText: '',
        confidence: 'low',
      },
      { status: 500 }
    );
  }
}

