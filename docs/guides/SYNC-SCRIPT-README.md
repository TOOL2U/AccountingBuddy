# 🔄 Unified Google Sheets Sync Script

## Overview

The `sync-sheets.js` script is a comprehensive synchronization tool that keeps your webapp configuration in sync with your Google Sheets data. It replaces all the previous scattered sync scripts with a single, unified solution.

## What It Does

This script automatically:

1. **Scans Google Sheets** for changes in:
   - "Data" sheet dropdown options (Type of Operation, Properties, Type of Payment)
   - "P&L (DO NOT EDIT)" sheet structure (row numbers, expense categories)
   - Named ranges (Total Overhead, GOP, EBITDA, etc.)

2. **Updates Configuration Files**:
   - `config/options.json` - Main dropdown options and keywords
   - `config/live-dropdowns.json` - Real-time dropdown data with metadata
   - `config/enhanced-keywords.json` - Enhanced AI keyword mappings

3. **Generates AI Keywords** for new items using GPT-4

4. **Updates Apps Script** code when P&L structure changes

5. **Generates Detailed Reports** showing exactly what changed

---

## Installation

The script is already set up and ready to use. It requires:

- ✅ Node.js (already installed)
- ✅ `googleapis` package (already in package.json)
- ✅ `node-fetch` package (already in package.json)
- ✅ Environment variables in `.env.local` (already configured)

---

## Usage

### Basic Usage

```bash
# Run the sync (will update all files)
node sync-sheets.js
```

### Dry Run Mode (Recommended First)

```bash
# See what would change without making changes
node sync-sheets.js --dry-run
```

### Verbose Mode

```bash
# Show detailed logs
node sync-sheets.js --verbose
```

### Combined Options

```bash
# Dry run with verbose output
node sync-sheets.js --dry-run --verbose
```

### Force Update

```bash
# Force update even if no changes detected
node sync-sheets.js --force
```

---

## When to Run This Script

Run the sync script whenever you make changes to Google Sheets:

### ✅ Run After These Changes:

1. **Adding a new expense category** to the "P&L (DO NOT EDIT)" sheet
   - Example: Adding "EXP - Personal - Massage" at row 52
   - Script will update Apps Script row numbers automatically

2. **Adding a new dropdown option** in the "Data" sheet
   - Example: Adding a new property "New House"
   - Script will generate AI keywords for the new option

3. **Changing data validation ranges** in the "Data" sheet
   - Example: Extending Type of Operation from A4:A35 to A4:A40
   - Script will update config files with new ranges

4. **Modifying named ranges** in the P&L sheet
   - Example: Total Overhead moving from row 53 to row 54
   - Script will update Apps Script references

### ❌ Don't Need to Run After:

- Adding transaction data to "Accounting Buddy P&L 2025" sheet
- Changing formulas in P&L sheet (unless they affect row structure)
- Updating balance data in "Bank & Cash Balance" sheet

---

## What Gets Updated

### 1. Configuration Files

#### `config/options.json`
- **Properties array** - List of properties/persons
- **Type of Operation array** - Revenue and expense categories
- **Type of Payment array** - Payment methods
- **Keywords object** - AI matching keywords for each option

#### `config/live-dropdowns.json`
- Same dropdown data as options.json
- Metadata (ranges, timestamps, filtered headers)
- Used for real-time dropdown population in the webapp

#### `config/enhanced-keywords.json`
- Enhanced AI keyword mappings
- More comprehensive than options.json keywords
- Used for better AI extraction accuracy

### 2. Apps Script

#### `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`
- **Overhead expenses range** (currently rows 29-52)
- **Property/Person range** (currently rows 14-19)
- **Named range row numbers** (53, 56, 57)
- **Version number** (auto-incremented)

**⚠️ IMPORTANT:** After the script updates the Apps Script file, you must manually deploy it to Google Sheets:

1. Open Google Sheets → Extensions → Apps Script
2. Copy the entire updated `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` file
3. Paste it into Apps Script editor
4. Deploy → Manage deployments → Edit → New version

---

## Output

### Console Output

The script provides color-coded output:

- 🟢 **Green** - Success messages
- 🟡 **Yellow** - Warnings and changes detected
- 🔵 **Blue** - Information messages
- 🔴 **Red** - Errors
- 🟣 **Cyan** - Verbose debug messages

### Example Output

```
======================================================================
  🔄 UNIFIED GOOGLE SHEETS SYNC SCRIPT
======================================================================

📊 Phase 1: Scanning "Data" sheet for dropdown options...
ℹ️  Found 32 Type of Operation items
ℹ️  Found 6 Properties
ℹ️  Found 4 Type of Payment items

📈 Phase 2: Scanning "P&L (DO NOT EDIT)" sheet structure...
ℹ️  Overhead expenses: rows 29 to 52 (24 categories)

🏷️  Phase 3: Scanning named ranges...
ℹ️  Found 10 P&L-related named ranges

🔍 Phase 4: Comparing with current configuration...
⚠️  Detected 1 changes in dropdown options
ℹ️  Type of Operation - Added: EXP - Personal - Massage

🤖 Phase 5: Generating AI keywords for new items...
ℹ️  Generating keywords for 1 new items using GPT-4...
✅ Generated keywords for 1 items

💾 Phase 6: Updating configuration files...
✅ Updated config/options.json
✅ Updated config/live-dropdowns.json
✅ Updated config/enhanced-keywords.json

📝 Phase 7: Updating Apps Script configuration...
ℹ️  Updating overhead expenses end row: 51 → 52
ℹ️  Updated Apps Script version: 8.0 → 8.1
ℹ️  Created backup: COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.backup.1730280000000.js
✅ Updated COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js
⚠️  IMPORTANT: You need to deploy the updated Apps Script to Google Sheets!
   1. Open Google Sheets → Extensions → Apps Script
   2. Copy the entire updated file
   3. Paste it into Apps Script editor
   4. Deploy → Manage deployments → Edit → New version

📋 Phase 8: Generating sync report...
✅ Sync report saved: sync-report-1730280000000.json

======================================================================
  ✅ SYNC COMPLETE
======================================================================
✅ Updated 1 dropdown options
✅ Generated keywords for 1 new items
⚠️  Apps Script was modified - remember to deploy to Google Sheets!
```

### Sync Report File

The script generates a JSON report file with detailed information:

```json
{
  "timestamp": "2025-10-30T08:00:00.000Z",
  "summary": {
    "dropdownChanges": 1,
    "appsScriptModified": true,
    "dryRun": false
  },
  "changes": {
    "typeOfOperation": {
      "added": ["EXP - Personal - Massage"],
      "removed": [],
      "total": 33
    },
    "properties": {
      "added": [],
      "removed": [],
      "total": 6
    },
    "typeOfPayment": {
      "added": [],
      "removed": [],
      "total": 4
    }
  },
  "pnlStructure": {
    "overheadStart": 29,
    "overheadEnd": 52,
    "overheadCount": 24
  },
  "namedRanges": {
    "Month_Total_Overheads": { "row": 53 },
    "Month_GOP": { "row": 56 },
    "Month_EBITDA_Margin": { "row": 57 }
  }
}
```

---

## Troubleshooting

### Error: "Credentials file not found"

**Solution:** Make sure `.env.local` has the correct path:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/shaunducker/Desktop/accounting-buddy-app/accounting-buddy-476114-82555a53603b.json
```

### Error: "GOOGLE_SHEET_ID not found"

**Solution:** Make sure `.env.local` has:
```bash
GOOGLE_SHEET_ID=1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8
```

### Warning: "OPENAI_API_KEY not found - skipping keyword generation"

**Solution:** This is not critical. The script will still update dropdown options, but you'll need to manually add keywords for new items in `config/options.json`.

To fix: Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-...
```

### No Changes Detected

If the script says "Everything is already in sync" but you know you made changes:

1. Check if you're editing the correct Google Sheet (ID: `1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8`)
2. Make sure you're editing the "Data" or "P&L (DO NOT EDIT)" sheets
3. Try running with `--force` flag to force an update
4. Run with `--verbose` to see detailed logs

---

## Architecture

The script is organized into 8 phases:

1. **Phase 1: Scan Data Sheet** - Fetch dropdown options from "Data" sheet
2. **Phase 2: Scan P&L Sheet** - Detect P&L structure and row numbers
3. **Phase 3: Scan Named Ranges** - Get all P&L-related named ranges
4. **Phase 4: Compare** - Compare fetched data with current config files
5. **Phase 5: Generate Keywords** - Use GPT-4 to generate keywords for new items
6. **Phase 6: Update Config Files** - Write updated data to config files
7. **Phase 7: Update Apps Script** - Update row numbers in Apps Script code
8. **Phase 8: Generate Report** - Create detailed sync report

---

## Best Practices

### 1. Always Run Dry Run First

```bash
node sync-sheets.js --dry-run
```

This lets you see what would change before making actual changes.

### 2. Review the Sync Report

After running the script, check the generated `sync-report-*.json` file to verify all changes are correct.

### 3. Test After Syncing

After syncing, test your webapp to make sure:
- Dropdowns show the new options
- P&L page displays correctly
- Overhead expenses modal shows all categories

### 4. Deploy Apps Script Immediately

If the script updates the Apps Script file, deploy it to Google Sheets immediately to avoid inconsistencies.

### 5. Keep Backups

The script automatically creates backups of the Apps Script file before modifying it. These are saved as:
```
COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.backup.{timestamp}.js
```

You can delete old backups after confirming the new version works.

---

## Maintenance

### Adding New Sync Targets

If you need to sync additional data in the future, edit `sync-sheets.js` and add new phases:

1. Add a new scan function (e.g., `scanNewSheet()`)
2. Add update logic in `updateConfigFiles()`
3. Update the report generation in `generateSyncReport()`

### Updating Sheet Ranges

If the data validation ranges change in Google Sheets, update the ranges in Phase 1:

```javascript
const ranges = [
  'Data!A4:A50',   // Type of Operation
  'Data!A38:A50',  // Properties
  'Data!A46:A60'   // Type of Payment
];
```

---

## Summary

This unified sync script replaces all previous sync scripts and provides:

- ✅ **One command** to sync everything
- ✅ **Automatic detection** of all changes
- ✅ **AI keyword generation** for new items
- ✅ **Apps Script updates** when structure changes
- ✅ **Detailed reports** of what changed
- ✅ **Dry run mode** to preview changes
- ✅ **Automatic backups** before modifications

**Remember:** This is your single source of truth for keeping the webapp in sync with Google Sheets!

