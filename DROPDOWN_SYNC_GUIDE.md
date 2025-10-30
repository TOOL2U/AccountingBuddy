# Dropdown Sync Guide

## Quick Sync Command

Whenever you update dropdown options in Google Sheets, run:

```bash
node scripts/sync-sheet-dropdowns.js
```

## What This Does

1. ✅ Fetches actual validation ranges from Google Sheets "Data" tab
2. ✅ Filters out headers (REVENUES, Fixed Costs, EXPENSES, Property)
3. ✅ Filters out test values (test, TEST, demo, sample, etc.)
4. ✅ Updates `config/options.json` with clean options
5. ✅ Preserves existing keywords for unchanged options
6. ✅ Adds basic keywords for new options
7. ✅ Updates `config/live-dropdowns.json` for reference

## Validation Ranges

The script reads from these ranges in your Google Sheets "Data" tab:

- **Property**: `Data!A39:A44` (6 values expected)
- **Type of Operation**: `Data!A3:A36` (27-30 values after filtering)
- **Type of Payment**: `Data!A72:A74` (3 values expected)

## Automatic Filtering

### Headers (NOT selectable by users/AI)
- REVENUES
- Fixed Costs
- EXPENSES
- Property

### Test Values (NOT synced to production)
- test, TEST, Test
- demo, DEMO, Demo
- sample, SAMPLE, Sample

## Current Dropdown Options (as of 2025-10-29)

### Properties (6)
- Sia Moon - Land - General
- Alesia House
- Lanna House
- Parents House
- Shaun Ducker
- Maria Ren

### Type of Operation (27)
- Revenue - Commision
- Revenue - Sales
- Revenue - Services
- Revenue - Rental Income
- EXP - Utilities - Gas
- EXP - Utilities - Water
- EXP - Utilities  - Electricity
- EXP - Administration & General - License & Certificates
- EXP - Construction - Structure
- EXP - Construction - Overheads/General/Unclassified
- EXP - HR - Employees Salaries
- EXP - Administration & General - Legal
- EXP - Administration & General - Professional fees
- EXP - Administration & General - Office supplies
- EXP - Administration & General  - Subscription, Software & Membership
- EXP - Construction - Electric Supplies
- EXP - Appliances & Electronics
- EXP - Windows, Doors, Locks & Hardware
- EXP - Repairs & Maintenance  - Furniture & Decorative Items
- EXP - Repairs & Maintenance  - Waste removal
- EXP - Repairs & Maintenance - Tools & Equipment
- EXP - Repairs & Maintenance - Painting & Decoration
- EXP - Repairs & Maintenance - Electrical & Mechanical
- EXP - Repairs & Maintenance - Landscaping
- EXP - Sales & Marketing -  Professional Marketing Services
- EXP - Construction - Wall
- EXP - Other Expenses

### Type of Payment (3)
- Credit card
- Bank transfer
- Cash

## Adding New Options

1. **In Google Sheets**: Add new option to the Data tab validation range
2. **Run Sync**: `node scripts/sync-sheet-dropdowns.js`
3. **Review**: Check `config/options.json` - new options will have basic keywords
4. **Enhance Keywords** (optional): Edit `config/options.json` to add better AI keywords

## Troubleshooting

### "Service account file not found"
- Check `.env.local` has correct `GOOGLE_APPLICATION_CREDENTIALS` path
- Current: `/Users/shaunducker/Desktop/accounting-buddy-app/accounting-buddy-476114-82555a53603b.json`

### "GOOGLE_SHEET_ID not found"
- Check `.env.local` has `GOOGLE_SHEET_ID`
- Current: `1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8`

### "Permission denied" 
- Make sure service account email has viewer access to the Google Sheet
- Email: Check your service account JSON file for `client_email`

## Files Updated by Sync

- `config/options.json` - Main dropdown options + keywords (used by AI)
- `config/live-dropdowns.json` - Reference copy with metadata

## Manual Verification

After syncing, verify the changes:

```bash
node scripts/compare-dropdowns.js
```

This will show any differences between the two config files.
