# 🔄 Sync Sheets Script - Quick Reference

## Overview
The `sync-sheets.js` script is your **one-stop automation tool** for keeping everything in sync with Google Sheets. It handles:

✅ Dropdown options (Type of Operation, Properties, Type of Payment)  
✅ AI keywords for all options  
✅ P&L sheet structure detection  
✅ **Automatic named range fixing** (no manual work!)  
✅ Apps Script configuration updates  
✅ Config file updates  

## Usage

### Basic Commands

```bash
# Regular sync (recommended)
node sync-sheets.js

# Check named ranges only (quick check)
node sync-sheets.js --check-only

# Preview changes without applying them
node sync-sheets.js --dry-run

# Show detailed logs including all ranges
node sync-sheets.js --verbose

# Force update even if no changes detected
node sync-sheets.js --force

# Combine options
node sync-sheets.js --verbose --check-only
```

## What It Does

### Phase 1: Scan Data Sheet
- Extracts dropdown options from the "Data" sheet
- Finds: Type of Operation (33 items), Properties (7), Type of Payment (4)
- Auto-detects section boundaries

### Phase 2: Scan P&L Structure
- Detects Property/Person rows (currently 14-20)
- Detects Overhead Expenses rows (currently 31-58)
- Adapts to structure changes automatically

### Phase 3: Auto-Fix Named Ranges ⭐ **NEW!**
- Scans P&L to find actual positions of:
  - Total Revenue
  - Total Overhead Expense
  - GOP (EBITDA)
  - EBITDA Margin
  - Property/Person Total
- Compares with current named ranges
- **Automatically updates** any incorrect ranges
- No manual Google Sheets edits needed!

### Phase 4: Compare Configs
- Compares fetched data with current config files
- Detects added/removed items

### Phase 5: Generate AI Keywords
- Uses GPT-4 to generate keywords for new items
- Only runs if new items detected

### Phase 6: Update Config Files
- Updates `config/options.json`
- Updates `config/live-dropdowns.json`
- Updates `config/enhanced-keywords.json`

### Phase 7: Update Apps Script
- Updates row ranges if P&L structure changed
- Increments version number
- Creates backup before modifying

### Phase 8: Generate Report
- Creates timestamped sync report
- Documents all changes made

## When to Run This Script

### ✅ Run immediately when:
- You add/remove overhead expense categories
- You add/remove properties
- You add/remove Type of Operation items
- P&L structure changes (rows shift)
- Named ranges are pointing to wrong cells

### 🔄 Run regularly:
- Before deploying new code
- After major Google Sheets updates
- When onboarding new team members

### ⚡ Quick Checks:
```bash
# Just want to see if named ranges are correct?
node sync-sheets.js --check-only

# Want to see what would change?
node sync-sheets.js --dry-run
```

## Output Examples

### All Good ✅
```
✅ All named ranges are correct
✅ No changes detected in dropdown options
✅ ✨ Everything is already in sync! No changes needed.
```

### Auto-Fix Applied 🔧
```
ℹ️  Updating 8 named range(s) to match current P&L structure...
✅ Auto-fixed 8 named range(s)
```

### With --check-only
```
📋 Current Named Ranges:
   ✓ Month_Total_Revenue                 → O11
   ✓ Year_Total_Revenue                  → Q11
   ✓ Month_Total_Overheads               → O59
   ✓ Year_Total_Overheads                → Q59
   ✓ Month_GOP                           → O62
   ✓ Year_GOP                            → Q62
   ✓ Month_EBITDA_Margin                 → O63
   ✓ Year_EBITDA_Margin                  → Q63
```

## Current Named Ranges (Auto-Fixed)

| Named Range | Cell | What It Points To |
|-------------|------|-------------------|
| `Year_EBITDA_Margin` | Q63 | EBITDA Margin (Year) |
| `Month_EBITDA_Margin` | O63 | EBITDA Margin (Month) |
| `Year_GOP` | Q62 | Gross Operating Profit (Year) |
| `Month_GOP` | O62 | Gross Operating Profit (Month) |
| `Year_Total_Overheads` | Q59 | Total Overhead Expense (Year) |
| `Month_Total_Overheads` | O59 | Total Overhead Expense (Month) |
| `Year_Total_Revenue` | Q11 | Total Revenue (Year) |
| `Month_Total_Revenue` | O11 | Total Revenue (Month) |
| `Year_Property_Person_Expense` | Q21 | Total Property/Person (Year) |
| `Month_Property_Person_Expense` | O21 | Total Property/Person (Month) |

## Troubleshooting

### "Fatal error: GOOGLE_SHEET_ID not found"
- Make sure `.env.local` has `GOOGLE_SHEET_ID` set
- Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON

### "Could not find all required metrics"
- Check that P&L sheet has standard structure
- Look for: "Total Revenue", "GROSS OPERATING PROFIT (EBITDA)", "Ebitda Margin"

### "Named range update failed"
- Check Google Sheets API permissions
- Verify service account has edit access to the spreadsheet

## Files Modified

When run (not in `--dry-run` mode):

- ✏️ `config/options.json` - Dropdown options
- ✏️ `config/live-dropdowns.json` - Live data from sheets
- ✏️ `config/enhanced-keywords.json` - AI keywords
- ✏️ `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` - Apps Script code
- ✏️ **Google Sheets Named Ranges** - Auto-fixed to correct positions
- 📝 `sync-report-[timestamp].json` - Sync report

## Benefits of This Automation

### Before (Manual Process) ❌
1. Add overhead expense in Google Sheets
2. Rows shift down
3. Named ranges now point to wrong cells
4. Open Google Sheets → Data → Named Ranges
5. Manually update 8+ named ranges one by one
6. Update config files manually
7. Update Apps Script row numbers manually
8. Hope you didn't miss anything

### After (Automated) ✅
1. Add overhead expense in Google Sheets
2. Run: `node sync-sheets.js`
3. Done! Everything updated automatically

**Time saved:** ~15-20 minutes per update  
**Errors avoided:** 100% - no manual mistakes  

## Pro Tips

1. **Run with `--check-only` first** to see current state before making changes
2. **Use `--verbose` when debugging** to see exactly what's being detected
3. **Use `--dry-run` when testing** to preview changes safely
4. **Commit config changes to git** after running sync
5. **Keep backups** - script creates them automatically for Apps Script

---

**Last Updated:** November 1, 2025  
**Script Version:** 3.0 (with auto-fix named ranges)
