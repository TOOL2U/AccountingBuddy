# P&L Named Ranges Setup Guide

This guide explains how to set up named ranges in your Google Sheet to enable the P&L Dashboard feature.

## Overview

The P&L Dashboard displays live KPIs from your Google Sheet's "P&L" tab. It requires specific named ranges to be defined in your spreadsheet.

## Required Named Ranges

You need to create **6 required** and **2 optional** named ranges in your Google Sheet:

### Required Named Ranges

| Named Range | Description | Example Cell |
|------------|-------------|--------------|
| `Month_Total_Revenue` | Current month's total revenue | `'P&L'!B5` |
| `Year_Total_Revenue` | Year-to-date total revenue | `'P&L'!C5` |
| `Month_Total_Overheads` | Current month's overhead expenses | `'P&L'!B10` |
| `Year_Total_Overheads` | Year-to-date overhead expenses | `'P&L'!C10` |
| `Month_GOP` | Current month's Gross Operating Profit | `'P&L'!B15` |
| `Year_GOP` | Year-to-date Gross Operating Profit | `'P&L'!C15` |

### Optional Named Ranges

| Named Range | Description | Example Cell |
|------------|-------------|--------------|
| `Month_EBITDA_Margin` | Current month's EBITDA margin (%) | `'P&L'!B20` |
| `Year_EBITDA_Margin` | Year-to-date EBITDA margin (%) | `'P&L'!C20` |

**Note:** If the optional EBITDA margin ranges are not defined, the system will automatically calculate them as:
```
EBITDA Margin = (GOP / Revenue) × 100
```

## How to Create Named Ranges

### Step-by-Step Instructions

1. **Open your Google Sheet** and navigate to the "P&L" tab

2. **Select the cell** containing the value you want to name (e.g., B5 for Month Revenue)

3. **Open the Named Ranges panel:**
   - Click **Data** in the menu bar
   - Select **Named ranges**
   - The Named ranges panel will open on the right side

4. **Create a new named range:**
   - Click **+ Add a range** button
   - Enter the name exactly as shown in the table above (e.g., `Month_Total_Revenue`)
   - Verify the range shows the correct cell reference (e.g., `'P&L'!B5`)
   - Click **Done**

5. **Repeat for all required ranges** (and optional ranges if desired)

### Example P&L Sheet Structure

Here's a typical P&L sheet structure:

```
     A                    B (Month)    C (Year)
1    P&L Dashboard
2    
3    Revenue
4    Total Revenue        50,000       500,000
5    
6    Expenses
7    Total Overheads      30,000       300,000
8    
9    Profit
10   Gross Operating      20,000       200,000
11   
12   Margins
13   EBITDA Margin %      40.00%       40.00%
```

In this example:
- `Month_Total_Revenue` → B4
- `Year_Total_Revenue` → C4
- `Month_Total_Overheads` → B7
- `Year_Total_Overheads` → C7
- `Month_GOP` → B10
- `Year_GOP` → C10
- `Month_EBITDA_Margin` → B13 (optional)
- `Year_EBITDA_Margin` → C13 (optional)

## Verifying Named Ranges

### In Google Sheets

1. Click **Data** → **Named ranges**
2. You should see all 6-8 named ranges listed
3. Click on each range to verify it highlights the correct cell

### Using Apps Script Test Function

1. Open your Apps Script project
2. Find the `testPnLEndpoint()` function
3. Click **Run** (▶️ button)
4. Check the **Execution log** for results
5. You should see output like:

```json
{
  "ok": true,
  "data": {
    "month": {
      "revenue": 50000,
      "overheads": 30000,
      "gop": 20000,
      "ebitdaMargin": 40
    },
    "year": {
      "revenue": 500000,
      "overheads": 300000,
      "gop": 200000,
      "ebitdaMargin": 40
    },
    "updatedAt": "2025-10-26T03:00:00.000Z"
  }
}
```

## Troubleshooting

### Error: "Named range not found"

**Problem:** One or more required named ranges are missing.

**Solution:**
1. Open **Data** → **Named ranges** in Google Sheets
2. Verify all 6 required ranges exist
3. Check spelling matches exactly (case-sensitive)
4. Ensure ranges point to the correct cells

### Error: "Invalid data structure"

**Problem:** Named ranges exist but point to empty cells or invalid data.

**Solution:**
1. Click on each named range to verify it highlights a cell with a number
2. Ensure cells contain numeric values (not text or formulas that return errors)
3. Empty cells will be treated as 0

### EBITDA Margin shows 0%

**Problem:** Revenue is 0 or named range is missing.

**Solution:**
1. If revenue is actually 0, this is correct (can't divide by zero)
2. If revenue exists, verify `Month_Total_Revenue` and `Year_Total_Revenue` ranges are correct
3. Optionally create `Month_EBITDA_Margin` and `Year_EBITDA_Margin` ranges with pre-calculated values

### Values not updating in dashboard

**Problem:** Dashboard shows old data.

**Solution:**
1. The API has a 60-second cache
2. Click the refresh button (↻) in the P&L Dashboard
3. Wait 60 seconds and refresh again
4. Check Google Sheet values are actually changing

## Data Format Requirements

### Numbers
- All named ranges should point to cells containing **numbers**
- Acceptable formats:
  - Plain numbers: `50000`
  - Formatted numbers: `50,000.00`
  - Currency: `฿50,000.00`
- **Not acceptable:**
  - Text: `"50000"`
  - Formulas with errors: `#DIV/0!`, `#REF!`

### Percentages
- EBITDA margins can be stored as:
  - Decimal: `0.40` (will be displayed as 40%)
  - Percentage: `40` (will be displayed as 40%)
- The system expects percentage values (not decimals)
- If your sheet stores as decimal (0.40), multiply by 100 in the cell or formula

## Security Notes

- The Apps Script endpoint requires authentication via `SHEETS_WEBHOOK_SECRET`
- Only your Next.js app can access the P&L data
- Named ranges are read-only from the API
- No data is written back to the sheet

## Support

If you encounter issues:

1. Run the `testPnLEndpoint()` function in Apps Script
2. Check the Execution log for detailed error messages
3. Verify all named ranges exist and point to valid cells
4. Ensure your Apps Script deployment is up to date
5. Check that `SHEETS_PNL_URL` is set correctly in `.env.local`

## Next Steps

After setting up named ranges:

1. Deploy the updated Apps Script code
2. Add `SHEETS_PNL_URL` to your `.env.local` file
3. Restart your Next.js dev server
4. Navigate to `/pnl` in your app
5. Verify all 8 KPI cards display correct values

---

**Last Updated:** October 26, 2025  
**Version:** 1.0

