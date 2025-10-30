# P&L Sheet Data Extraction - Handoff Document

## 🎯 Objective
Extract transaction data from the **P&L (DO NOT EDIT)** Google Sheet to display in the application.

---

## 📊 Google Sheets Structure

### Sheet Name
```
P&L (DO NOT EDIT)
```

### Spreadsheet ID
```
1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8
```

### Sheet Structure (From Scan)
- **Total Rows**: 50 (with data)
- **Total Columns**: 18 (A-R)
- **Grid Size**: 51 rows × 18 columns

### Layout
```
Row 1-3: Title/Headers
Row 4: Month Headers (JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEPT, OCT, NOV, DEC, TOTAL)
Row 6: "REVENUES" section header
Row 7-10: Revenue categories
Row 13: "PROPERTY OR PERSON" section header
Row 14-19: Property/Person rows
Row 22: "OVERHEAD EXPENSES" section header
Row 23+: Expense categories
Row 48: "GROSS OPERATING PROFIT (EBITDA)" summary row
```

### Columns
- **Column A**: Category names (Properties, Operations, etc.)
- **Column B**: "This Month" values
- **Column C**: "% On Rev" (percentage)
- **Columns E-P**: Monthly values (JAN through DEC)
- **Column Q**: TOTAL

---

## 🔑 Authentication Files

### 1. Service Account JSON
**File**: `accounting-buddy-476114-82555a53603b.json`
**Location**: `/Users/shaunducker/Desktop/accounting-buddy-app/`

**Contains**:
- Service account email
- Private key
- Project ID

### 2. Environment Variables
**File**: `.env.local`

**Required Variables**:
```bash
GOOGLE_SHEET_ID=1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8
GOOGLE_APPLICATION_CREDENTIALS=/Users/shaunducker/Desktop/accounting-buddy-app/accounting-buddy-476114-82555a53603b.json
```

---

## 📁 Relevant Code Files

### 1. **Existing Scanner Script** (Reference Implementation)
**File**: `scripts/scan-pnl-sheet.js`
- ✅ Already configured to read P&L (DO NOT EDIT) sheet
- ✅ Has helper functions for parsing data
- ✅ Uses correct authentication
- 📊 Outputs results to: `logs/pnl-sheet-scan.json`

**Key Functions**:
```javascript
// Column conversion
columnIndexToLetter(index) // Converts 0 → A, 1 → B, etc.

// Data type detection
isHeader(value)    // Detects section headers
isDate(value)      // Detects dates
isNumeric(value)   // Detects numbers/currency
parseNumeric(value) // Parses numbers from formatted strings

// Structure analysis
analyzeDataStructure(rows) // Analyzes sheet structure
```

### 2. **Validation Script** (For Checking Data Integrity)
**File**: `scripts/validate-all-data.js`
- Compares P&L sheet data with Data sheet
- Validates sync status
- Useful for debugging

### 3. **Data Sheet Sync Scripts** (Reference for API Usage)
**Files**:
- `scripts/sync-sheet-dropdowns.js` - Syncs dropdown data
- `scripts/fetch-validation-ranges.js` - Fetches specific ranges
- `scripts/scan-data-sheet.js` - Scans Data sheet structure

---

## 📋 P&L Sheet Data Categories

### Revenue Categories (Rows 7-10)
```javascript
[
  "Revenue - Commision",
  "Revenue - Sales",
  "Revenue - Services",
  "Revenue - Rental Income"
]
```

### Properties/Persons (Rows 14-19)
```javascript
[
  "Sia Moon - Land - General",
  "Alesia House",
  "Lanna House",
  "Parents House",
  "Shaun Ducker",
  "Maria Ren"
]
```

### Expense Categories (Rows 23+)
```javascript
[
  "EXP - Utilities - Gas",
  "EXP - Utilities - Water",
  "EXP - Utilities  - Electricity",
  "EXP - HR - Employees Salaries",
  "EXP - Administration & General - License & Certificates",
  "EXP - Construction - Structure",
  "EXP - Construction - Overheads/General/Unclassified",
  "EXP - Construction - Electric Supplies",
  "EXP - Construction - Wall",
  "EXP - Appliances & Electronics",
  "EXP - Windows, Doors, Locks & Hardware",
  "EXP - Repairs & Maintenance  - Furniture & Decorative Items",
  "EXP - Repairs & Maintenance  - Waste removal",
  "EXP - Repairs & Maintenance - Tools & Equipment",
  "EXP - Repairs & Maintenance - Painting & Decoration",
  "EXP - Repairs & Maintenance - Electrical & Mechanical",
  "EXP - Repairs & Maintenance - Landscaping",
  "EXP - Sales & Marketing -  Professional Marketing Services",
  "EXP - Administration & General - Legal",
  "EXP - Administration & General - Professional fees",
  "EXP - Administration & General - Office supplies",
  "EXP - Administration & General  - Subscription, Software & Membership",
  "EXP - Other Expenses"
]
```

---

## 🔧 Implementation Guide

### Step 1: Authentication Setup

```javascript
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Load service account credentials
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Create auth client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Create sheets client
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
```

### Step 2: Fetch P&L Data

```javascript
// Get all data from P&L sheet
const response = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'P&L (DO NOT EDIT)!A1:R100', // Adjust range as needed
  valueRenderOption: 'UNFORMATTED_VALUE', // Get raw values
});

const rows = response.data.values || [];
```

### Step 3: Parse Specific Sections

#### Get Revenue Data (Example)
```javascript
// Revenue section: Rows 7-10, Columns E-Q (months + total)
const revenueRange = 'P&L (DO NOT EDIT)!A7:Q10';
const revenueResponse = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: revenueRange,
});

const revenueData = revenueResponse.data.values.map(row => ({
  category: row[0],          // Column A: Category name
  thisMonth: row[1] || 0,    // Column B: This month
  percentOnRev: row[2] || 0, // Column C: % on revenue
  jan: row[4] || 0,          // Column E
  feb: row[5] || 0,          // Column F
  mar: row[6] || 0,          // Column G
  apr: row[7] || 0,          // Column H
  may: row[8] || 0,          // Column I
  jun: row[9] || 0,          // Column J
  jul: row[10] || 0,         // Column K
  aug: row[11] || 0,         // Column L
  sept: row[12] || 0,        // Column M
  oct: row[13] || 0,         // Column N
  nov: row[14] || 0,         // Column O
  dec: row[15] || 0,         // Column P
  total: row[16] || 0,       // Column Q
}));
```

#### Get Property Data
```javascript
// Properties section: Rows 14-19
const propertyRange = 'P&L (DO NOT EDIT)!A14:Q19';
// Same structure as above
```

#### Get Expense Data
```javascript
// Expenses section: Rows 23-47 (approximate)
const expenseRange = 'P&L (DO NOT EDIT)!A23:Q47';
// Same structure as above
```

### Step 4: Handle Edge Cases

```javascript
// Filter out empty rows
const cleanData = rows.filter(row => 
  row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
);

// Parse numeric values (handle formulas, errors, etc.)
function safeParseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.startsWith('#')) return 0; // Excel errors
  const parsed = parseFloat(String(value).replace(/[,฿$]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}
```

---

## 📄 Documentation Files to Review

### Project Overview
1. **`PROJECT_FAMILIARIZATION_SUMMARY.md`**
   - Complete project structure
   - Data flow diagrams
   - Section: "Google Sheets Integration"

### Google Sheets Integration
2. **`GOOGLE_SHEETS_SETUP.md`**
   - Setup guide for Google Sheets webhook
   - Authentication setup

3. **`GOOGLE_SHEETS_SYNC_COMPLETE.md`**
   - How sync was implemented
   - Service account configuration

### Data Validation
4. **`DATA_VALIDATION_REPORT.md`** (NEW - Just Created)
   - Current state of all data sources
   - Validation results
   - Dropdown options list

5. **`DROPDOWN_SYNC_UPDATE.md`** (NEW - Just Created)
   - Recent sync changes
   - Validation ranges
   - Filter configuration

### Scripts Reference
6. **Scan Result**: `logs/pnl-sheet-scan.json`
   - Complete P&L sheet structure
   - Sample data
   - Column patterns

---

## 🎯 What Data to Extract

### Option 1: Extract All Monthly Data
- Get all categories with their monthly values
- Useful for charts/graphs showing trends
- Range: `P&L (DO NOT EDIT)!A1:Q50`

### Option 2: Extract Summary Data
- Get only "This Month" and "TOTAL" columns
- Lighter payload
- Range: `P&L (DO NOT EDIT)!A1:B50` + `P&L (DO NOT EDIT)!Q1:Q50`

### Option 3: Extract Specific Categories
- Get only Revenues: Rows 7-10
- Get only Properties: Rows 14-19
- Get only Expenses: Rows 23-47

---

## 🔍 Testing

### Test Script
```bash
# Run the existing scanner to see current data
node scripts/scan-pnl-sheet.js

# Check the output
cat logs/pnl-sheet-scan.json | jq '.'
```

### Verify Authentication
```bash
# Test environment variables
node -e "console.log(process.env.GOOGLE_SHEET_ID)"
node -e "console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)"

# Verify service account file exists
ls -la accounting-buddy-476114-82555a53603b.json
```

---

## ⚠️ Important Notes

### 1. **Sheet Name is Exact**
The sheet name is: `P&L (DO NOT EDIT)` (includes space before parenthesis)

### 2. **Read-Only Access**
Service account has `spreadsheets.readonly` scope - cannot write to sheet

### 3. **Data Sheet vs P&L Sheet**
- **Data Sheet**: Contains validation ranges for dropdowns
- **P&L Sheet**: Contains actual transaction summaries/totals

### 4. **Headers to Exclude**
These are section headers, not data:
- "REVENUES"
- "PROPERTY OR PERSON"
- "OVERHEAD EXPENSES"
- "GROSS OPERATING PROFIT (EBITDA)"

### 5. **Formula Errors**
Some cells may contain `#DIV/0!` or other formula errors - handle gracefully

---

## 📊 Sample Output Structure

```json
{
  "revenues": [
    {
      "category": "Revenue - Commision",
      "thisMonth": 0,
      "jan": 0,
      "feb": 0,
      // ... other months
      "total": 0
    }
  ],
  "properties": [
    {
      "name": "Sia Moon - Land - General",
      "thisMonth": 0,
      "jan": 0,
      // ... other months
      "total": 0
    }
  ],
  "expenses": [
    {
      "category": "EXP - Utilities - Gas",
      "thisMonth": 0,
      "jan": 0,
      // ... other months
      "total": 0
    }
  ],
  "metadata": {
    "extractedAt": "2025-10-29T12:00:00Z",
    "sheetName": "P&L (DO NOT EDIT)",
    "spreadsheetId": "1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8"
  }
}
```

---

## 🚀 Next Steps

1. **Review Existing Scanner**: `scripts/scan-pnl-sheet.js`
2. **Check Scan Results**: `logs/pnl-sheet-scan.json`
3. **Decide on Data Structure**: What format do you need?
4. **Create API Endpoint** (if needed): `app/api/pnl/route.ts`
5. **Create Frontend Component** (if needed): Display the data

---

## 📞 Quick Reference

```javascript
// Sheet Info
const SHEET_NAME = 'P&L (DO NOT EDIT)';
const SPREADSHEET_ID = '1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8';

// Key Ranges
const REVENUE_RANGE = 'P&L (DO NOT EDIT)!A7:Q10';
const PROPERTY_RANGE = 'P&L (DO NOT EDIT)!A14:Q19';
const EXPENSE_RANGE = 'P&L (DO NOT EDIT)!A23:Q47';

// Service Account
const CREDENTIALS_PATH = 'accounting-buddy-476114-82555a53603b.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
```

---

**Created**: October 29, 2025  
**For**: Augment AI - P&L Data Extraction  
**Status**: Ready for Implementation 🚀
