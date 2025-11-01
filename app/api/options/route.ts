import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/options
 * 
 * Returns all dropdown options for the mobile app.
 * Data is read from config/live-dropdowns.json which is synced from Google Sheets.
 * 
 * Response format:
 * {
 *   "ok": true,
 *   "data": {
 *     "properties": [...],
 *     "typeOfOperations": [...],
 *     "typeOfPayments": [...]
 *   },
 *   "updatedAt": "2025-10-30T09:38:11.978Z",
 *   "cached": true
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Read the live dropdowns config file
    const configPath = path.join(process.cwd(), 'config', 'live-dropdowns.json');
    
    // Check if file exists
    if (!fs.existsSync(configPath)) {
      console.error('[OPTIONS] Config file not found:', configPath);
      return NextResponse.json(
        {
          ok: false,
          error: 'Dropdown options not available. Please run sync script first.',
          data: null
        },
        { status: 500 }
      );
    }

    // Read and parse the config file
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileContent);

    // Extract dropdown options
    const properties = config.property || [];
    const typeOfOperations = config.typeOfOperation || [];
    const typeOfPayments = config.typeOfPayment || [];

    // Get the last updated timestamp
    const updatedAt = config.fetchedAt || config.extractedAt || new Date().toISOString();

    // Build response
    const response = {
      ok: true,
      data: {
        properties,
        typeOfOperations,
        typeOfPayments
      },
      updatedAt,
      cached: true,
      source: config.source || 'config_file',
      metadata: {
        totalProperties: properties.length,
        totalOperations: typeOfOperations.length,
        totalPayments: typeOfPayments.length
      }
    };

    console.log('[OPTIONS] Successfully returned dropdown options');
    console.log(`[OPTIONS] Properties: ${properties.length}, Operations: ${typeOfOperations.length}, Payments: ${typeOfPayments.length}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[OPTIONS] Error reading dropdown options:', error);
    
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load dropdown options',
        data: null
      },
      { status: 500 }
    );
  }
}

