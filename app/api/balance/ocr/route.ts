import { NextRequest, NextResponse } from 'next/server';
import { parseLikelyBalance } from '@/utils/balanceParse';

/**
 * POST /api/balance/ocr
 * Extract bank balance from screenshot using Google Cloud Vision API
 */
export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG or PNG.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call Google Cloud Vision API
    const visionApiKey = process.env.GOOGLE_VISION_KEY;
    if (!visionApiKey) {
      console.error('GOOGLE_VISION_KEY not configured');
      return NextResponse.json(
        { error: 'OCR service not configured' },
        { status: 500 }
      );
    }

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`;
    
    const visionResponse = await fetch(visionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API error:', errorText);
      return NextResponse.json(
        { error: 'OCR extraction failed' },
        { status: 500 }
      );
    }

    const visionData = await visionResponse.json();
    
    // Extract text from response
    const textAnnotations = visionData.responses?.[0]?.textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json(
        { error: 'No text found in image' },
        { status: 400 }
      );
    }

    const rawText = textAnnotations[0].description || '';

    // Parse the balance from OCR text
    const parsed = parseLikelyBalance(rawText);

    if (!parsed) {
      return NextResponse.json({
        bankBalance: null,
        rawText,
        error: 'Could not detect a balance amount in the image',
      });
    }

    return NextResponse.json({
      bankBalance: parsed.value,
      rawText,
      sourceLine: parsed.sourceLine,
      confidence: parsed.confidence,
    });

  } catch (error) {
    console.error('Balance OCR error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'OCR processing failed',
      },
      { status: 500 }
    );
  }
}

