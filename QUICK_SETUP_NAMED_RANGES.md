# Quick Setup: Create Named Ranges for AI Management

## ✅ Apps Script V7.0 is Deployed and Working!

Your test shows the script is correctly routing to the AI endpoints. Now you just need to create the two named ranges.

---

## Step 1: Create `AI_Prompts` Named Range

### Option A: Use Existing Sheet

1. Open your Google Sheet: **"Accounting Buddy P&L 2025"**
2. Go to the **"P&L "** sheet (or any sheet with empty space)
3. Find an empty cell (e.g., `Z1` or `AA1`)
4. Paste this default prompt into the cell:

```
You are an AI assistant that extracts accounting data from Thai receipt text. Extract these fields:

REQUIRED FIELDS:
- date: Transaction date (format: DD/MM/YYYY or Buddhist Era YYYY-MM-DD)
- property: Property name or person name (e.g., "Sia Moon", "John Doe")
- typeOfOperation: Category from this list:
  * EXP - Construction - Materials
  * EXP - Construction - Labour
  * EXP - Construction - Wall
  * EXP - Construction - Floor
  * EXP - Property - Rent
  * EXP - Property - Utilities
  * EXP - Office - Supplies
  * INC - Rental Income
  * INC - Service Income
- typeOfPayment: Payment method (Cash, Bank Transfer, Credit Card, PromptPay)
- detail: Brief description of the transaction
- amount: The total amount (number only, no currency symbols)
- debit: Amount if expense (0 if income)
- credit: Amount if income (0 if expense)

RULES:
1. If date is in Buddhist Era (e.g., 2568), convert to Gregorian (subtract 543)
2. Match keywords to categories (e.g., "wall" → EXP - Construction - Wall)
3. If typeOfOperation is unclear, use "EXP - Office - Supplies" as default
4. Return ONLY valid JSON, no explanations
5. Use best judgment for missing fields

EXAMPLE OUTPUT:
{
  "date": "27/10/2025",
  "property": "Sia Moon",
  "typeOfOperation": "EXP - Construction - Materials",
  "typeOfPayment": "Cash",
  "detail": "Cement and sand for wall construction",
  "amount": 1500,
  "debit": 1500,
  "credit": 0
}
```

5. Select the cell with the prompt
6. Click **Data** → **Named ranges** (in the menu bar)
7. Click **+ Add a range**
8. In the dialog:
   - **Name:** `AI_Prompts` (exact spelling, case-sensitive)
   - **Range:** Should auto-fill with your selected cell (e.g., `P&L !Z1`)
9. Click **Done**

### Option B: Create New "Config" Sheet (Recommended)

1. Create a new sheet called **"Config"**
2. In cell `A1`, paste the prompt above
3. Select cell `A1`
4. Click **Data** → **Named ranges**
5. Click **+ Add a range**
6. Name: `AI_Prompts`
7. Range: `Config!A1`
8. Click **Done**

---

## Step 2: Create `AI_KeywordRules` Named Range

### Using the Same Sheet:

1. In the same sheet (Config or P&L), go to cell `C1`
2. Create this table:

| **C1: keyword** | **D1: category** | **E1: priority** |
|-----------------|------------------|------------------|
| wall | EXP - Construction - Wall | 10 |
| labour | EXP - Construction - Labour | 9 |
| paint | EXP - Construction - Materials | 8 |
| cement | EXP - Construction - Materials | 8 |
| sand | EXP - Construction - Materials | 7 |
| floor | EXP - Construction - Floor | 9 |
| tile | EXP - Construction - Floor | 8 |
| rent | EXP - Property - Rent | 10 |
| electric | EXP - Property - Utilities | 9 |
| water | EXP - Property - Utilities | 9 |

3. Select the range `C1:E11` (header + 10 data rows, but you can extend to C1:E100 for future growth)
4. Click **Data** → **Named ranges**
5. Click **+ Add a range**
6. Name: `AI_KeywordRules` (exact spelling, case-sensitive)
7. Range: `Config!C1:E100` (or whatever range you selected)
8. Click **Done**

---

## Step 3: Verify Setup

### Test in Apps Script:

1. Go back to your Apps Script editor
2. Select `testGetPrompt` from the function dropdown
3. Click **Run** ▶️
4. Check the execution log - should show your prompt!

5. Select `testGetRules` from the function dropdown
6. Click **Run** ▶️
7. Check the execution log - should show your keyword rules!

### Expected Success Output:

**testGetPrompt:**
```json
{
  "ok": true,
  "prompt": "You are an AI assistant that extracts...",
  "lastUpdated": "2025-10-29T..."
}
```

**testGetRules:**
```json
{
  "ok": true,
  "rules": [
    {"id": "rule-1", "keyword": "wall", "category": "EXP - Construction - Wall", "priority": 10},
    {"id": "rule-2", "keyword": "labour", "category": "EXP - Construction - Labour", "priority": 9},
    ...
  ],
  "count": 10
}
```

---

## Step 4: Test in Web App

1. Navigate to `http://localhost:3000/admin`
2. Enter PIN: `1234`
3. Click **AI** or go to `/admin/ai`
4. Check each tab:
   - ✅ **Prompts** - Should load your prompt
   - ✅ **Training Data** - Should load your 10 keyword rules
   - ✅ **Test Console** - Try testing with example text
   - ✅ **Live Logs** - Should show system events

---

## Quick Reference

### Named Range Locations (if using Config sheet):

```
Config Sheet:
  A1: AI_Prompts (single cell with prompt text)
  C1:E100: AI_KeywordRules (table with header + data)
```

### Named Range Names (case-sensitive):
- `AI_Prompts`
- `AI_KeywordRules`

### Table Structure for AI_KeywordRules:

| Column C | Column D | Column E |
|----------|----------|----------|
| keyword | category | priority |
| (text) | (text) | (number) |

---

## Troubleshooting

### "AI_Prompts named range not found"
- Check spelling: Must be exactly `AI_Prompts` (capital A, capital I, capital P)
- Verify it exists: **Data** → **Named ranges** → should see `AI_Prompts` in the list
- Make sure it points to a cell with text in it

### "AI_KeywordRules named range not found"
- Check spelling: Must be exactly `AI_KeywordRules` (capital A, capital I, capital K, capital R)
- Verify it exists: **Data** → **Named ranges** → should see `AI_KeywordRules` in the list
- Make sure the range includes the header row

### Rules not loading
- Check that row 1 has headers: `keyword`, `category`, `priority`
- Make sure there's at least one data row below the header
- Verify the named range includes both header and data rows

---

## You're Almost Done! 🎉

Once you create these two named ranges:
1. Run `testGetPrompt()` in Apps Script ✅
2. Run `testGetRules()` in Apps Script ✅
3. Test the web app at `/admin/ai` ✅

**Total time: ~5 minutes** ⏱️

