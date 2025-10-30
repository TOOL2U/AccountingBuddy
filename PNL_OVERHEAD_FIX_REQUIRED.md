# P&L Overhead Expenses Fix Required

## Issue Summary
The P&L Dashboard is showing **฿0.00** for "Total Overheads" (Month to Date), but when you click on it to view details, the modal correctly shows **฿5,000.00** in overhead expenses.

## Root Cause
The named range `Month_Total_Overheads` is pointing to cell **N46** in the "P&L (DO NOT EDIT)" sheet, which currently returns **0**.

However, the actual overhead expenses (rows 29-51, column N) add up to **฿5,000.00**:
- EXP - HR - Employees Salaries: ฿5,000.00
- (All other expenses: ฿0.00)

## What's Happening
1. **P&L Dashboard** reads the value from the named range `Month_Total_Overheads` (cell N46) → Shows ฿0.00
2. **Overhead Details Modal** reads directly from rows 29-51 → Correctly calculates ฿5,000.00

This indicates that cell **N46** either:
- Doesn't have a SUM formula
- Has a SUM formula pointing to the wrong range
- Has a formula that's not calculating correctly

## Fix Required in Google Sheets

### Month Total Overheads (Cell N46)
**Current Status:** Returns 0
**Should contain:** `=SUM(N29:N51)`
**Expected Result:** ฿5,000.00

### Year Total Overheads (Cell Q46)
**Current Status:** Returns 0
**Should contain:** `=SUM(Q29:Q51)`
**Expected Result:** ฿5,000.00

## Steps to Fix

1. Open your Google Sheet
2. Go to the "P&L (DO NOT EDIT)" tab
3. Find cell **N46** (this is where the `Month_Total_Overheads` named range points)
4. Verify the formula is: `=SUM(N29:N51)`
5. If the formula is missing or incorrect, update it
6. Do the same for cell **Q46** (Year Total): `=SUM(Q29:Q51)`
7. Save the sheet
8. Clear the P&L cache by refreshing the dashboard (clicking the refresh button)

## Verification

After fixing:
- The P&L Dashboard should show **฿5,000.00** for "Total Overheads (MTD)"
- The modal details should still show the same **฿5,000.00** breakdown
- Both values should match

## Named Range Information

### Current Named Ranges (from API)
```json
{
  "Month_Total_Overheads": {
    "sheet": "P&L (DO NOT EDIT)",
    "cell": "N46",
    "value": 0  ← WRONG!
  },
  "Year_Total_Overheads": {
    "sheet": "P&L (DO NOT EDIT)",
    "cell": "Q46",
    "value": 0  ← WRONG!
  }
}
```

### Overhead Expense Details (from API)
```json
{
  "period": "month",
  "totalExpense": 5000,  ← CORRECT!
  "data": [
    {
      "name": "EXP - HR - Employees Salaries",
      "expense": 5000,
      "percentage": 100
    }
    // ... 22 other expense categories with ฿0
  ]
}
```

## Technical Details

### How the System Works

1. **Named Ranges** (rows 29-51):
   - Individual expense items are read directly from the sheet
   - Used by the "Overhead Details Modal"
   - Currently working correctly

2. **Summary Cell** (cell N46/Q46):
   - Should contain a SUM formula
   - Referenced by the named range `Month_Total_Overheads`
   - Used by the "P&L Dashboard"
   - Currently returning 0 (incorrect)

### Expected Sheet Structure

```
Row | Column A (Description)                          | Column N (Month) | Column Q (Year)
----|------------------------------------------------|------------------|----------------
29  | EXP - HR - Employees Salaries                  | 5000            | 5000
30  | EXP - Utilities - Gas                          | 0               | 0
... | ...                                             | ...             | ...
51  | EXP - Other Expenses                            | 0               | 0
----|------------------------------------------------|------------------|----------------
46  | TOTAL OVERHEADS (or similar label)             | =SUM(N29:N51)   | =SUM(Q29:Q51)
    |                                                 |   ↑ Should be   |   ↑ Should be
    |                                                 |   5000          |   5000
```

## Files Involved

- **Frontend**: `/app/pnl/page.tsx` (displays the dashboard)
- **API Route**: `/app/api/pnl/route.ts` (fetches from Apps Script)
- **Apps Script**: `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` → `getPnLDataFromRanges_()`
- **Google Sheet**: "P&L (DO NOT EDIT)" tab, cells N46 and Q46

## Date Generated
October 30, 2025 5:53 AM
