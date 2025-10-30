# 🚀 Sync Script - Quick Reference

## Common Commands

```bash
# Preview changes (recommended first)
node sync-sheets.js --dry-run

# Run the sync
node sync-sheets.js

# Verbose output
node sync-sheets.js --verbose

# Force update
node sync-sheets.js --force
```

---

## When to Run

| Change Made | Run Sync? | Why |
|-------------|-----------|-----|
| Added new expense category to P&L | ✅ YES | Updates Apps Script row numbers |
| Added new property in Data sheet | ✅ YES | Updates dropdowns + generates keywords |
| Added new Type of Operation | ✅ YES | Updates dropdowns + generates keywords |
| Added new Type of Payment | ✅ YES | Updates dropdowns + generates keywords |
| Added transaction to main sheet | ❌ NO | Transaction data doesn't affect config |
| Changed P&L formula | ❌ NO | Unless it changes row structure |
| Updated balance data | ❌ NO | Balance data doesn't affect config |

---

## What Gets Updated

### Config Files (3 files)
- `config/options.json` - Dropdown options + keywords
- `config/live-dropdowns.json` - Real-time dropdown data
- `config/enhanced-keywords.json` - Enhanced AI keywords

### Apps Script (1 file)
- `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` - Row numbers + version

---

## After Running Sync

### If Apps Script Was Modified:

1. Open Google Sheets → Extensions → Apps Script
2. Copy entire `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` file
3. Paste into Apps Script editor
4. Deploy → Manage deployments → Edit → New version

### Test Your Webapp:

1. Check dropdowns show new options
2. Test P&L page displays correctly
3. Test overhead expenses modal
4. Test property/person details modal

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Credentials file not found" | Check `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` |
| "GOOGLE_SHEET_ID not found" | Check `GOOGLE_SHEET_ID` in `.env.local` |
| "No changes detected" | Run with `--force` or `--verbose` to debug |
| "OPENAI_API_KEY not found" | Add API key to `.env.local` (optional) |

---

## Example Workflow

### Scenario: Adding a New Expense Category

1. **Edit Google Sheets:**
   - Open "P&L (DO NOT EDIT)" sheet
   - Insert new row at row 52
   - Add "EXP - Marketing - Social Media"

2. **Run Sync (Dry Run First):**
   ```bash
   node sync-sheets.js --dry-run
   ```

3. **Review Output:**
   - Check what will be updated
   - Verify new expense is detected

4. **Run Actual Sync:**
   ```bash
   node sync-sheets.js
   ```

5. **Deploy Apps Script:**
   - Copy updated file to Google Apps Script
   - Deploy new version

6. **Test Webapp:**
   - Check P&L page
   - Check overhead expenses modal
   - Verify new category appears

---

## Files Created by Sync Script

| File | Purpose | Keep or Delete? |
|------|---------|-----------------|
| `sync-report-{timestamp}.json` | Detailed sync report | Review then delete |
| `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.backup.{timestamp}.js` | Apps Script backup | Delete after confirming new version works |

---

## Quick Checks

### Before Running Sync:
- [ ] Made changes to Google Sheets
- [ ] Changes are in "Data" or "P&L (DO NOT EDIT)" sheets
- [ ] `.env.local` has correct credentials

### After Running Sync:
- [ ] Reviewed sync report
- [ ] Deployed Apps Script (if modified)
- [ ] Tested webapp dropdowns
- [ ] Tested P&L page
- [ ] Deleted old backup files

---

## Need Help?

See full documentation: `SYNC-SCRIPT-README.md`

