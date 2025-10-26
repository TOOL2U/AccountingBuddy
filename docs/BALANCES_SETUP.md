# Balance Management Setup Guide

This guide walks you through setting up the Balance Management feature for Accounting Buddy, which allows you to track bank and cash balances, reconcile them against P&L data, and extract balances from bank app screenshots using OCR.

## Overview

The Balance feature provides:
- **Bank Balance Tracking**: Upload bank app screenshots → OCR extraction → save to Google Sheets
- **Cash Balance Tracking**: Manual input for cash in hand
- **Reconciliation**: Compare actual balances vs P&L net cash movement
- **History**: View last 5 balance entries
- **PIN Protection**: Simple 4-digit PIN gate (client-side, convenience only)

## Prerequisites

- Existing Accounting Buddy setup with Apps Script webhook deployed
- Google Vision API key configured (`GOOGLE_VISION_KEY` in `.env.local`)
- Access to your Google Sheets spreadsheet

## Step 1: Create Balances Sheet

1. Open your Accounting Buddy Google Sheets spreadsheet
2. Create a new sheet named **"Balances"** (exact name, case-sensitive)
3. Add the following column headers in row 1:
   - **A1**: `timestamp`
   - **B1**: `bankBalance`
   - **C1**: `cashBalance`
   - **D1**: `note`

4. (Optional) Format the sheet:
   - Bold the header row
   - Set header background to dark gray (#4a5568)
   - Set header text color to white
   - Freeze row 1

**Example:**

| timestamp | bankBalance | cashBalance | note |
|-----------|-------------|-------------|------|
| 2025-01-15T10:30:00Z | 50000.00 | 5000.00 | Initial balance |

## Step 2: Update Apps Script

### Option A: Use the Complete V6 Script (Recommended)

1. Open your Apps Script project: https://script.google.com
2. Find your existing Accounting Buddy project
3. **Backup your current code** (copy to a text file)
4. Open the file `APPS_SCRIPT_CODE_V6_WITH_BALANCES.js` from the project root
5. Copy the balance-related functions and add them to your existing script
6. Update the `doPost` function to include the balance routing:

```javascript
// Add these cases to your existing doPost function's action router:

if (payload.action === 'appendBalance') {
  Logger.log('→ Routing to append balance endpoint');
  return handleAppendBalance_(payload);
} else if (payload.action === 'getBalance') {
  Logger.log('→ Routing to get balance endpoint');
  return handleGetBalance_(payload);
}
```

### Option B: Add Balance Functions Manually

1. Open `APPS_SCRIPT_BALANCES.js` from the project root
2. Copy all the balance-related functions
3. Paste them into your existing Apps Script project
4. Update the `doPost` function as shown in Option A

## Step 3: Deploy Apps Script

1. In Apps Script, click **Deploy** → **Manage deployments**
2. Click the **Edit** (pencil) icon on your existing deployment
3. Click **Deploy**
4. The deployment URL remains the same (no need to update environment variables)
5. Click **Done**

**Note**: The balance endpoints use the same deployment URL as your existing webhook and P&L endpoints. The routing is handled by the `action` parameter.

## Step 4: Update Environment Variables

1. Open your `.env.local` file (or create it from `.env.example`)
2. Add the following variables with your Apps Script deployment URL:

```bash
# Balance Management Endpoints
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Important**: Both URLs should be the **same** as your existing `SHEETS_WEBHOOK_URL`. The Apps Script routes requests based on the `action` parameter in the POST body.

3. Ensure you have the Vision API key configured:

```bash
GOOGLE_VISION_KEY=your_vision_api_key_here
```

## Step 5: Create Named Ranges for Reconciliation (Optional)

For accurate reconciliation, create named ranges in your P&L sheet:

### Option A: Create Named Ranges Manually

1. In your P&L sheet, select the cell containing the **current month's net cash movement**
2. Click **Data** → **Named ranges**
3. Create a named range: `Month_Net_Cash`
4. Repeat for **year-to-date net cash**: `Year_Net_Cash`

### Option B: Use Computed Fallback

If you don't create these named ranges, the system will automatically compute:
- **Month Net Cash** = Month Revenue - Month Overheads
- **Year Net Cash** = Year Revenue - Year Overheads

This uses your existing P&L named ranges (`Month_Total_Revenue`, `Month_Total_Overheads`, etc.)

## Step 6: Test the Setup

### Test 1: Manual Balance Entry

1. Start your Next.js dev server: `npm run dev`
2. Navigate to: http://localhost:3000/balance
3. Enter PIN: `1234`
4. Enter a cash balance (e.g., `5000`) and click **Save**
5. Check your Google Sheets "Balances" tab - you should see a new row

### Test 2: Bank Screenshot OCR

1. Take a screenshot of your bank app showing the available balance
2. On the Balance page, click **Upload Bank Screenshot**
3. Select your screenshot
4. Click **Extract Balance**
5. If successful, you'll see the detected amount
6. Click **Use [amount]** to apply it to the bank balance field
7. Click **Save** to store it in Google Sheets

### Test 3: Reconciliation

1. Ensure you have P&L data in your spreadsheet
2. On the Balance page, scroll to the **Reconciliation** section
3. You should see:
   - Total Balance (Bank + Cash)
   - Month Net Cash from P&L
   - Year Net Cash from P&L
   - Variance calculations with color coding

### Test 4: API Endpoints

Test the API endpoints directly:

```bash
# Test balance save
curl -X POST http://localhost:3000/api/balance/save \
  -H "Content-Type: application/json" \
  -d '{"bankBalance": 50000, "cashBalance": 5000}'

# Test balance get
curl http://localhost:3000/api/balance/get
```

## Troubleshooting

### Issue: "Balance webhook not configured"

**Solution**: Ensure `SHEETS_BALANCES_APPEND_URL` and `SHEETS_BALANCES_GET_URL` are set in `.env.local` and restart your dev server.

### Issue: "Unauthorized" error

**Solution**: Verify that `SHEETS_WEBHOOK_SECRET` in `.env.local` matches the `EXPECTED_SECRET` in your Apps Script.

### Issue: OCR returns 0 or no balance detected

**Possible causes**:
- Screenshot is blurry or low quality
- Balance amount is not clearly visible
- Text is too small or obscured

**Solutions**:
- Take a clearer screenshot with good lighting
- Ensure the balance amount is prominently displayed
- Try cropping the image to focus on the balance area
- Use manual entry as a fallback

### Issue: "Sheet 'Balances' not found"

**Solution**: Create the Balances sheet in your Google Sheets spreadsheet with the exact name "Balances" (case-sensitive).

### Issue: Reconciliation shows incorrect values

**Possible causes**:
- Named ranges not created or incorrectly named
- P&L data is missing or incorrect

**Solutions**:
- Verify named ranges exist: `Month_Net_Cash`, `Year_Net_Cash`
- Check that P&L named ranges are correctly set up
- The system will fall back to computing Revenue - Overheads if named ranges are missing

## Security Notes

### PIN Protection

The 4-digit PIN (`1234` by default) is a **convenience lock only** and provides **no real security**:
- PIN is checked client-side only
- PIN is stored in sessionStorage (cleared on browser close)
- Anyone with access to the code can see the PIN

**To change the PIN**: Edit `CORRECT_PIN` in `app/balance/page.tsx`

### Production Recommendations

For production use, consider:
1. Implementing server-side authentication
2. Using environment variables for the PIN
3. Adding rate limiting to prevent brute force
4. Implementing proper user authentication (OAuth, JWT, etc.)
5. Encrypting sensitive data in transit and at rest

## API Reference

### POST /api/balance/ocr

Extract bank balance from screenshot using OCR.

**Request**: Multipart form data with `file` field (PNG/JPG)

**Response**:
```json
{
  "bankBalance": 50000.00,
  "rawText": "Available Balance\n฿50,000.00\nTHB",
  "confidence": "high",
  "sourceLine": "Available Balance ฿50,000.00",
  "allCandidates": [...]
}
```

### POST /api/balance/save

Save bank and/or cash balance to Google Sheets.

**Request**:
```json
{
  "bankBalance": 50000.00,
  "cashBalance": 5000.00,
  "note": "Optional note"
}
```

**Response**:
```json
{
  "ok": true,
  "message": "Balance saved to Google Sheets successfully"
}
```

### GET /api/balance/get

Fetch latest balances and reconciliation data.

**Response**:
```json
{
  "latest": {
    "timestamp": "2025-01-15T10:30:00Z",
    "bankBalance": 50000.00,
    "cashBalance": 5000.00
  },
  "reconcile": {
    "monthNetCash": 48000.00,
    "yearNetCash": 180000.00
  },
  "history": [
    {
      "timestamp": "2025-01-15T10:30:00Z",
      "bankBalance": 50000.00,
      "cashBalance": 5000.00
    }
  ]
}
```

## Next Steps

- Set up automated balance snapshots (e.g., daily cron job)
- Add balance trend charts
- Implement balance alerts (e.g., low balance warnings)
- Add support for multiple bank accounts
- Integrate with bank APIs for automatic balance fetching

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Apps Script logs: https://script.google.com → Executions
3. Check browser console for client-side errors
4. Review Next.js server logs for API errors

