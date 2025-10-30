# Google Sheets Setup for AI Management

## Overview

To enable the AI management features in the Admin → AI section, you need to create two named ranges in your Google Sheet and deploy the updated Apps Script.

---

## Step 1: Create Named Ranges

### 1.1 Create `AI_Prompts` Named Range

This will store the AI extraction prompt.

**Instructions:**

1. Open your Google Sheet: **"Accounting Buddy P&L 2025"**
2. Navigate to a suitable location (e.g., create a new sheet called "Config" or use an empty area)
3. **Recommended location:** Cell `Z1` on a "Config" sheet
4. In the cell, paste your current AI extraction prompt (or use the default below)
5. Select the cell containing the prompt
6. Click **Data** → **Named ranges**
7. Click **Add a range**
8. Name: `AI_Prompts`
9. Range: The cell you selected (e.g., `Config!Z1`)
10. Click **Done**

**Default AI Prompt (if you don't have one):**

```
You are an AI assistant that extracts accounting data from receipt text. Extract the following fields:
- date: The transaction date (format: DD/MM/YYYY or Buddhist Era)
- property: Property or person name
- typeOfOperation: Category (e.g., "EXP - Construction - Materials")
- typeOfPayment: Payment method (e.g., "Cash", "Bank Transfer")
- detail: Description of the transaction
- amount: The amount (number only)
- debit: Amount if expense (0 if income)
- credit: Amount if income (0 if expense)

Return valid JSON only. If a field is unclear, use your best judgment based on context.
```

---

### 1.2 Create `AI_KeywordRules` Named Range

This will store keyword → category mappings for AI training.

**Instructions:**

1. In the same sheet (e.g., "Config"), create a table starting at cell `AA1`
2. **Header row (AA1:AC1):**
   - `AA1`: `keyword`
   - `AB1`: `category`
   - `AC1`: `priority`
3. **Example data rows:**
   - `AA2`: `wall` | `AB2`: `EXP - Construction - Wall` | `AC2`: `10`
   - `AA3`: `labour` | `AB3`: `EXP - Construction - Labour` | `AC3`: `9`
   - `AA4`: `paint` | `AB4`: `EXP - Construction - Materials` | `AC4`: `8`
   - `AA5`: `cement` | `AB5`: `EXP - Construction - Materials` | `AC5`: `7`
   - `AA6`: `rent` | `AB6`: `EXP - Property - Rent` | `AC6`: `6`
4. Select the entire range including header and data rows (e.g., `AA1:AC100` to allow room for growth)
5. Click **Data** → **Named ranges**
6. Click **Add a range**
7. Name: `AI_KeywordRules`
8. Range: The range you selected (e.g., `Config!AA1:AC100`)
9. Click **Done**

**Table Structure:**

| keyword | category | priority |
|---------|----------|----------|
| wall | EXP - Construction - Wall | 10 |
| labour | EXP - Construction - Labour | 9 |
| paint | EXP - Construction - Materials | 8 |
| cement | EXP - Construction - Materials | 7 |
| rent | EXP - Property - Rent | 6 |

**Notes:**
- Higher priority = matched first
- Keywords are case-insensitive
- You can add as many rules as you need
- The system will skip empty rows

---

## Step 2: Deploy Updated Apps Script

### 2.1 Copy the New Script

1. Open the file: `COMPLETE_APPS_SCRIPT_V6_FINAL.js` in your project
2. **SELECT ALL** the code (Cmd+A / Ctrl+A)
3. **COPY** it (Cmd+C / Ctrl+C)

### 2.2 Update Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Open your existing **"Accounting Buddy"** Apps Script project
3. **SELECT ALL** existing code and **DELETE** it
4. **PASTE** the new code from `COMPLETE_APPS_SCRIPT_V6_FINAL.js`
5. Click **Save** (💾 icon)

### 2.3 Redeploy

1. Click **Deploy** → **Manage deployments**
2. Click the **Edit** icon (✏️ pencil) on your existing deployment
3. Under "Version", select **New version**
4. Add description: `V7.0 - AI Prompt & Rules Management`
5. Click **Deploy**
6. Click **Done**

**Important:** The webhook URL stays the same - no need to update environment variables!

---

## Step 3: Test the Setup

### 3.1 Test in Apps Script

1. In the Apps Script editor, select the function dropdown (top toolbar)
2. Run these test functions one by one:
   - `testGetPrompt` - Should return your AI prompt
   - `testGetRules` - Should return your keyword rules
   - `testUpdatePrompt` - Should update the prompt
   - `testUpdateRules` - Should update the rules
3. Check the **Execution log** for results

### 3.2 Test in the Web App

1. Navigate to `http://localhost:3000/admin`
2. Enter PIN: `1234`
3. Click **AI** in the navigation (or go to `/admin/ai`)
4. Test each tab:
   - **Prompts:** Should load your prompt from Google Sheets
   - **Training Data:** Should load your keyword rules
   - **Test Console:** Should work with the current prompt
   - **Live Logs:** Should show system events

---

## Verification Checklist

- [ ] Created `AI_Prompts` named range in Google Sheets
- [ ] Created `AI_KeywordRules` named range in Google Sheets
- [ ] Added header row to AI_KeywordRules (keyword, category, priority)
- [ ] Added at least 3-5 example keyword rules
- [ ] Copied and pasted new Apps Script code
- [ ] Saved the Apps Script
- [ ] Redeployed with new version
- [ ] Ran `testGetPrompt()` successfully
- [ ] Ran `testGetRules()` successfully
- [ ] Tested Prompts tab in web app
- [ ] Tested Training Data tab in web app
- [ ] Tested Test Console tab in web app
- [ ] Tested Live Logs tab in web app

---

## Troubleshooting

### "AI_Prompts named range not found"
- Make sure you created the named range exactly as `AI_Prompts` (case-sensitive)
- Verify the named range exists: **Data** → **Named ranges**
- Check that the range points to a valid cell

### "AI_KeywordRules named range not found"
- Make sure you created the named range exactly as `AI_KeywordRules` (case-sensitive)
- Verify the named range exists: **Data** → **Named ranges**
- Check that the range includes the header row

### Rules not loading
- Check that the header row is: `keyword`, `category`, `priority`
- Make sure there's at least one data row below the header
- Verify the named range includes both header and data rows

### Prompt not saving
- Check that the `AI_Prompts` named range points to a single cell
- Verify the cell is not protected or locked
- Check Apps Script execution log for errors

---

## Example Sheet Structure

**Sheet: "Config"**

```
         Z                                    AA          AB                              AC
1   [Your AI Prompt Here]                    keyword     category                        priority
2                                             wall        EXP - Construction - Wall       10
3                                             labour      EXP - Construction - Labour     9
4                                             paint       EXP - Construction - Materials  8
5                                             cement      EXP - Construction - Materials  7
6                                             rent        EXP - Property - Rent           6
```

**Named Ranges:**
- `AI_Prompts` → `Config!Z1`
- `AI_KeywordRules` → `Config!AA1:AC100`

---

## Next Steps

Once setup is complete:

1. **Customize your prompt** in the Prompts tab to match your business needs
2. **Add keyword rules** based on common terms in your receipts
3. **Test extraction** using the Test Console with real receipt text
4. **Monitor logs** to see how the AI is performing
5. **Iterate and improve** based on results

---

**Setup complete! 🎉**

Your AI management system is now ready to use at `/admin/ai`

