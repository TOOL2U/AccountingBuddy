import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_VISION_KEY = process.env.GOOGLE_VISION_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Accepted file types
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

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
 * POST /api/ocr
 * Accepts multipart form data with a file, extracts text using Google Vision API
 */
export async function POST(request: NextRequest) {
  try {
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
        { error: 'Invalid file type. Only JPG, PNG, and PDF are supported.' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Call Google Vision API with retry logic
    let text = '';
    try {
      console.log('[OCR] Starting Vision API call...');
      text = await callVisionAPI(base64Content);
      console.log(`[✔] OCR complete → text length: ${text.length} characters`);

      // Validate extracted text quality
      if (!text || text.trim().length < 10) {
        console.warn('[⚠] OCR returned insufficient text (< 10 chars). Text:', text);
        return NextResponse.json(
          {
            id: uuidv4(),
            text: text || '',
            error: 'Could not extract readable text from image. Please ensure the receipt is clear and well-lit.'
          },
          { status: 200 } // Return 200 with error message for graceful handling
        );
      }

      // Log detected language if available (for debugging)
      console.log('[OCR] Text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    } catch (error) {
      console.error('[✖] OCR failed after retries:', error);
      return NextResponse.json(
        {
          id: uuidv4(),
          text: '',
          error: 'OCR processing failed. Please try again with a clearer image.'
        },
        { status: 200 } // Return 200 with error message for graceful handling
      );
    }

    // Generate unique ID for this receipt
    const id = uuidv4();
    console.log(`[✔] OCR successful → Receipt ID: ${id}`);

    return NextResponse.json({
      id,
      text,
    });
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

