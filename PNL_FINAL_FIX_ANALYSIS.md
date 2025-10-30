# P&L Overhead Fix - Final Analysis

## Date: October 30, 2025 - Complete Investigation

## What We Discovered

### 1. The Data Location
**Sheet**: "P&L (DO NOT EDIT)"  
**Row 32**: EXP - HR - Employees Salaries  
**Value**: ฿5,000 in column N (October) and column Q (Year)

### 2. The Problem with Cell N46
**Current Formula in N46:**
```
=sumifs('Accounting Buddy P&L 2025'!$J:$J,'Accounting Buddy P&L 2025'!$F:$F,A46,'Accounting Buddy P&L 2025'!$C:$C,"Oct")
```

This formula is looking at a DIFFERENT sheet ('Accounting Buddy P&L 2025') instead of the current sheet data!

**Current Formula in Q46:**
```
=sum(E46:P46)
```

This is summing across columns E to P in row 46 (horizontal sum), not down rows 29-51!

### 3. What Cell A46 Contains
```
=Data!A29
```

Cell A46 is pulling its label from the "Data" sheet, which is creating a circular reference issue.

## The Real Issue

The formulas in N46 and Q46 are **completely wrong** for what we need. They should be:

### ✅ CORRECT FORMULAS:

**Cell N46:**
```
=SUM(N29:N51)
```

**Cell Q46:**
```
=SUM(Q29:Q51)
```

## Why the Diagnostic Shows ฿5,000 but Named Range Shows ฿0

1. **Apps Script `getOverheadExpensesDetails`** reads rows 29-51 directly → finds ฿5,000 at row 32
2. **Named range `Month_Total_Overheads`** points to N46 which has a SUMIFS formula looking at wrong sheet → returns ฿0

## Manual Fix Steps (REQUIRED)

### Open Google Sheet
URL: https://docs.google.com/spreadsheets/d/1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8

### Fix Cell N46:
1. Click on cell **N46**
2. **Delete** the current formula:  
   `=sumifs('Accounting Buddy P&L 2025'!$J:$J,'Accounting Buddy P&L 2025'!$F:$F,A46,'Accounting Buddy P&L 2025'!$C:$C,"Oct")`
3. **Enter new formula**:  
   `=SUM(N29:N51)`
4. Press Enter
5. **Verify**: Cell should now show ฿5,000

### Fix Cell Q46:
1. Click on cell **Q46**
2. **Delete** the current formula:  
   `=sum(E46:P46)`
3. **Enter new formula**:  
   `=SUM(Q29:Q51)`
4. Press Enter
5. **Verify**: Cell should now show ฿5,000

### Verify the Fix:
Run in terminal:
```bash
node diagnose-pnl-ranges.js
```

Expected output:
```
Month to Date:
   Overheads: ฿5,000 ← ✓
```

## Why API Automation Failed

1. **Sheet Protection**: The sheet may be protected
2. **Complex Formulas**: Existing formulas reference other sheets
3. **#REF! Errors**: Our attempts to write formulas resulted in reference errors
4. **Format Issues**: Values are stored as currency-formatted strings

## Bottom Line

**The fix is simple but MUST be done manually:**
- Replace the complex formulas in N46 and Q46
- With simple SUM formulas: `=SUM(N29:N51)` and `=SUM(Q29:Q51)`
- This will make the named ranges return the correct ฿5,000

The named ranges (`Month_Total_Overheads` and `Year_Total_Overheads`) are already pointing to the correct cells (N46 and Q46), they just have the wrong formulas inside those cells.
