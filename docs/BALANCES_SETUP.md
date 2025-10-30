# Balance Management Setup Guide

This guide explains how to set up the Balance Management feature for Accounting Buddy, which allows you to track bank and cash balances with OCR extraction and P&L reconciliation.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Google Sheets Setup](#google-sheets-setup)
3. [Google Apps Script Deployment](#google-apps-script-deployment)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Balance Management feature provides:

- **Bank Balance Tracking**: Upload bank app screenshots → OCR extraction → parse THB balance
- **Cash Balance Tracking**: Manual input for cash in hand
- **Google Sheets Persistence**: All balances saved to "Balances" tab
- **P&L Reconciliation**: Compare total balance vs P&L net cash movement
- **PIN Protection**: Simple 4-digit PIN (1234) for client-side access control

---

## 📊 Google Sheets Setup

### Step 1: Create Balances Tab

1. Open your Google Sheet: **"Accounting Buddy P&L 2025"**
2. Create a new tab named: **`Balances`**
3. Set up the following columns in Row 1:

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | timestamp | ISO String | Auto-generated timestamp |
| B | bankBalance | Number | Bank balance in THB |
| C | cashBalance | Number | Cash in hand in THB |
| D | note | Text | Optional note |

**Example:**

```
A1: timestamp
B1: bankBalance
C1: cashBalance
D1: note
```

### Step 2: Create Named Ranges for Reconciliation

The Balance page needs to read P&L net cash movement for reconciliation. Create these named ranges:

#### Option A: If you have dedicated cells for net cash

1. **Month_Net_Cash**
   - Select the cell containing current month's net cash movement
   - Click **Data → Named ranges**
   - Name: `Month_Net_Cash`
   - Click **Done**

2. **Year_Net_Cash**
   - Select the cell containing year-to-date net cash movement
   - Click **Data → Named ranges**
   - Name: `Year_Net_Cash`
   - Click **Done**

#### Option B: Fallback Calculation

If you don't have dedicated net cash cells, the Apps Script will calculate:
- **Month Net Cash** = `Month_Revenue` - `Month_Overheads`
- **Year Net Cash** = `Year_Revenue` - `Year_Overheads`

Make sure you have these named ranges:
- `Month_Revenue`
- `Month_Overheads`
- `Year_Revenue`
- `Year_Overheads`

---

## 🔧 Google Apps Script Deployment

### Step 1: Add Balance Functions to Apps Script

Open your Google Apps Script project and add these two functions:

#### Function 1: handleBalancesAppend()

```javascript
/**
 * Append a new balance entry to the Balances tab
 * POST body: { bankBalance?: number, cashBalance?: number, note?: string }
 */
function handleBalancesAppend(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const balancesSheet = ss.getSheetByName('Balances');
  
  if (!balancesSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'Balances sheet not found. Please create a "Balances" tab.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get the latest balance values (to carry forward if not provided)
  const lastRow = balancesSheet.getLastRow();
  let latestBankBalance = 0;
  let latestCashBalance = 0;
  
  if (lastRow > 1) {
    const lastData = balancesSheet.getRange(lastRow, 1, 1, 4).getValues()[0];
    latestBankBalance = lastData[1] || 0;
    latestCashBalance = lastData[2] || 0;
  }
  
  // Use provided values or carry forward latest
  const bankBalance = payload.bankBalance !== undefined ? payload.bankBalance : latestBankBalance;
  const cashBalance = payload.cashBalance !== undefined ? payload.cashBalance : latestCashBalance;
  const note = payload.note || '';
  
  // Append new row
  const timestamp = new Date().toISOString();
  balancesSheet.appendRow([timestamp, bankBalance, cashBalance, note]);
  
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    message: 'Balance saved successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

#### Function 2: handleBalancesGetLatest()

```javascript
/**
 * Get the latest balance entry and reconciliation data
 * Returns: { latest: {...}, reconcile: {...} }
 */
function handleBalancesGetLatest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const balancesSheet = ss.getSheetByName('Balances');
  
  if (!balancesSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'Balances sheet not found. Please create a "Balances" tab.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get latest balance entry
  const lastRow = balancesSheet.getLastRow();
  let latest = {
    timestamp: new Date().toISOString(),
    bankBalance: 0,
    cashBalance: 0
  };
  
  if (lastRow > 1) {
    const lastData = balancesSheet.getRange(lastRow, 1, 1, 4).getValues()[0];
    latest = {
      timestamp: lastData[0] || new Date().toISOString(),
      bankBalance: lastData[1] || 0,
      cashBalance: lastData[2] || 0
    };
  }
  
  // Get reconciliation data from named ranges
  let monthNetCash = 0;
  let yearNetCash = 0;
  
  try {
    // Try to get Month_Net_Cash named range
    const monthRange = ss.getRangeByName('Month_Net_Cash');
    if (monthRange) {
      monthNetCash = monthRange.getValue() || 0;
    } else {
      // Fallback: calculate from revenue - overheads
      const monthRevenue = ss.getRangeByName('Month_Revenue')?.getValue() || 0;
      const monthOverheads = ss.getRangeByName('Month_Overheads')?.getValue() || 0;
      monthNetCash = monthRevenue - monthOverheads;
    }
  } catch (e) {
    Logger.log('Error getting Month_Net_Cash: ' + e.message);
  }
  
  try {
    // Try to get Year_Net_Cash named range
    const yearRange = ss.getRangeByName('Year_Net_Cash');
    if (yearRange) {
      yearNetCash = yearRange.getValue() || 0;
    } else {
      // Fallback: calculate from revenue - overheads
      const yearRevenue = ss.getRangeByName('Year_Revenue')?.getValue() || 0;
      const yearOverheads = ss.getRangeByName('Year_Overheads')?.getValue() || 0;
      yearNetCash = yearRevenue - yearOverheads;
    }
  } catch (e) {
    Logger.log('Error getting Year_Net_Cash: ' + e.message);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    latest: latest,
    reconcile: {
      monthNetCash: monthNetCash,
      yearNetCash: yearNetCash
    }
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Step 2: Update doPost() Routing

Add routing for the new balance endpoints in your existing `doPost()` function:

```javascript
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Validate secret
    if (payload.secret !== EXPECTED_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Route to appropriate handler
    if (payload.action === 'getInbox') {
      return handleGetInbox();
    } else if (payload.action === 'deleteEntry') {
      return handleDeleteEntry(payload.rowNumber);
    } else if (payload.action === 'getPnL') {
      return handleGetPnL(payload);
    } else if (payload.action === 'list_named_ranges') {
      return handleListNamedRanges();
    } else if (payload.action === 'getPrompt') {
      return handleGetPrompt();
    } else if (payload.action === 'updatePrompt') {
      return handleUpdatePrompt(payload.prompt);
    } else if (payload.action === 'getRules') {
      return handleGetRules();
    } else if (payload.action === 'updateRules') {
      return handleUpdateRules(payload.rules);
    } else if (payload.action === 'balancesAppend') {
      return handleBalancesAppend(payload);
    } else if (payload.action === 'balancesGetLatest') {
      return handleBalancesGetLatest();
    } else {
      // Default: append accounting entry
      return handleAppendEntry(payload);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Description: "Balance Management v1.0"
4. Execute as: **Me**
5. Who has access: **Anyone** (or **Anyone with Google account**)
6. Click **Deploy**
7. Copy the **Web app URL** (it should be the same as your existing webhook URL)

---

## 🔐 Environment Variables

Update your `.env.local` file with the balance endpoints:

```bash
# Balance Management Endpoints (Google Apps Script)
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Note:** Both URLs will be the same as your existing `SHEETS_WEBHOOK_URL` since routing is handled by the `action` parameter in the payload.

---

## 🧪 Testing

### Test 1: Manual Cash Balance

1. Navigate to `/balance` in your app
2. Enter PIN: `1234`
3. In the "Cash in Hand" section, enter a value (e.g., `5000`)
4. Click "Save Cash Balance"
5. Check your Google Sheet's "Balances" tab → should see a new row with the cash balance

### Test 2: Bank Screenshot OCR

1. Take a screenshot of your bank app showing the balance
2. In the "Bank Balance" section, click "Upload bank app screenshot"
3. Select your screenshot
4. Click "Extract Balance"
5. Verify the detected amount is correct
6. Click "Use ฿X,XXX.XX" to populate the input
7. Click "Save Bank Balance"
8. Check your Google Sheet's "Balances" tab → should see updated bank balance

### Test 3: Reconciliation

1. Verify the "Reconciliation" section shows:
   - Total Balance (bank + cash)
   - Month Net Cash from P&L
   - Year Net Cash from P&L
   - Variance calculations with color coding

---

## 🐛 Troubleshooting

### Issue: "Balance service not configured"

**Solution:** Check that `SHEETS_BALANCES_APPEND_URL` and `SHEETS_BALANCES_GET_URL` are set in `.env.local`

### Issue: "Balances sheet not found"

**Solution:** Create a tab named exactly `Balances` (case-sensitive) in your Google Sheet

### Issue: OCR not detecting balance

**Possible causes:**
- Screenshot quality is too low
- Text is not clear or too small
- Balance amount is not visible in the screenshot

**Solutions:**
- Take a clearer screenshot with good lighting
- Ensure the balance amount is prominently displayed
- Try manual input as a fallback

### Issue: Reconciliation shows ฿0.00

**Solution:** Create the named ranges `Month_Net_Cash` and `Year_Net_Cash` in your P&L tab, or ensure fallback ranges exist (`Month_Revenue`, `Month_Overheads`, etc.)

### Issue: PIN not working

**Solution:** The default PIN is `1234`. Clear your browser's session storage and try again.

---

## 📝 Notes

- **PIN Security**: The 4-digit PIN (1234) is for convenience only and provides no real security. It's stored in session storage and can be easily bypassed. Do not use this for sensitive data protection.
- **OCR Accuracy**: The OCR parsing uses heuristics to detect Thai Baht amounts. Accuracy depends on screenshot quality and bank app layout.
- **Caching**: Balance data is cached for 30 seconds to reduce Google Sheets API calls.
- **Variance Thresholds**: 
  - Green: ±฿100 or less
  - Amber: ±฿1,000 or less
  - Red: Greater than ±฿1,000

---

## 🎉 Success!

You should now have a fully functional Balance Management page that:
- ✅ Extracts bank balances from screenshots
- ✅ Tracks cash in hand manually
- ✅ Saves all data to Google Sheets
- ✅ Reconciles against P&L net cash movement
- ✅ Provides visual variance indicators

For questions or issues, refer to the main [README.md](../README.md) or open an issue on GitHub.

