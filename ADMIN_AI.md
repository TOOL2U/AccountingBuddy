# Admin → AI Section Documentation

## Overview

The **Admin → AI** section provides a comprehensive interface for managing AI extraction, training data, testing, and monitoring. This feature allows administrators to fine-tune the AI's behavior and monitor its performance in real-time.

---

## Access

**URL:** `/admin/ai`

**Authentication:** Protected by the same 4-digit PIN as the main admin page (default: `1234`)

---

## Features

### 1. **Prompts Tab** 📝

Edit the AI extraction prompt used by the system.

**How to use:**
1. Navigate to the **Prompts** tab
2. Edit the system prompt in the textarea
3. Click **Save Changes** to update the prompt in Google Sheets
4. Click **Revert** to discard unsaved changes

**Storage:** The prompt is stored in the Google Sheets `AI_Prompts` named range.

**Tips:**
- The prompt guides how the AI extracts accounting data from receipts
- Include clear instructions about date formats, categories, and amounts
- Test changes using the **Test Console** tab before saving

---

### 2. **Training Data Tab** 🗂️

Manage keyword → category mappings to improve AI accuracy.

**How to use:**
1. Navigate to the **Training Data** tab
2. Click **Add Rule** to create a new keyword mapping
3. Fill in:
   - **Keyword:** The word to match (e.g., "wall", "labour")
   - **Category:** The accounting category (e.g., "EXP - Construction - Wall")
   - **Priority:** Higher numbers = higher priority (1-100)
4. Click **Save Changes** to update rules in Google Sheets
5. Click the trash icon to delete a rule

**Storage:** Rules are stored in the Google Sheets `AI_KeywordRules` named range.

**Tips:**
- Use specific keywords that appear frequently in your receipts
- Higher priority rules are matched first
- Test rules using the **Test Console** tab

---

### 3. **Test Console Tab** 🧪

Test AI extraction with custom input without affecting production data.

**How to use:**
1. Navigate to the **Test Console** tab
2. Click a **Quick Example** or type your own text
3. Click **Run Test** to see how the AI extracts data
4. Review the extracted fields and response time
5. Check the **Raw JSON Output** for detailed results

**Features:**
- Uses the current AI prompt from Google Sheets
- Shows response time and token usage
- Displays all extracted fields in a grid
- No data is saved to Google Sheets

**Tips:**
- Test with real receipt text from your business
- Try edge cases (missing dates, unusual amounts, etc.)
- Use this to validate prompt and rule changes

---

### 4. **Live Logs Tab** 📊

View real-time AI system events and monitor performance.

**How to use:**
1. Navigate to the **Live Logs** tab
2. Use filter tabs to view specific event types:
   - **ALL:** All events
   - **OCR:** Image text extraction events
   - **AI:** AI extraction events
   - **WEBHOOK:** Google Sheets sync events
   - **SYSTEM:** General system events
   - **ERROR:** Error events
3. Enable **Auto-refresh (10s)** to automatically update logs
4. Click **Refresh** to manually update
5. Click **Clear** to delete all logs

**Features:**
- In-memory storage (max 200 events)
- Auto-clears on app restart
- Color-coded by event type
- Expandable metadata for detailed context
- Timestamps in local time

**Tips:**
- Monitor logs while testing to see what's happening
- Filter by ERROR to troubleshoot issues
- Use metadata to see detailed extraction results

---

## Google Sheets Setup

### Required Named Ranges

Create these named ranges in your Google Sheet:

1. **`AI_Prompts`**
   - Single cell containing the AI extraction prompt
   - Example: Cell `Z1` on a "Config" sheet

2. **`AI_KeywordRules`**
   - Range with 3 columns: `keyword`, `category`, `priority`
   - Example: `AA1:AC100` on a "Config" sheet
   - Header row: `keyword | category | priority`

### Apps Script Functions

Add these functions to your Apps Script (see `COMPLETE_APPS_SCRIPT_V6_FINAL.js`):

```javascript
function handleGetPrompt() {
  // Read from AI_Prompts named range
  // Return { ok: true, prompt: "...", lastUpdated: "..." }
}

function handleUpdatePrompt(prompt) {
  // Write to AI_Prompts named range
  // Return { ok: true }
}

function handleGetRules() {
  // Read from AI_KeywordRules named range
  // Return { ok: true, rules: [...] }
}

function handleUpdateRules(rules) {
  // Write to AI_KeywordRules named range
  // Return { ok: true }
}
```

---

## Troubleshooting

### Prompts not loading
- Check that `AI_Prompts` named range exists in Google Sheets
- Verify Apps Script has `handleGetPrompt()` function
- Check browser console for errors

### Rules not saving
- Check that `AI_KeywordRules` named range exists
- Verify Apps Script has `handleUpdateRules()` function
- Ensure rules have valid keyword, category, and priority

### Test console errors
- Verify `OPENAI_API_KEY` is set in environment variables
- Check that the prompt is valid (not empty)
- Review error logs in the **Live Logs** tab

### Logs not appearing
- Logs are in-memory only and clear on restart
- Check that auto-refresh is enabled
- Verify filter is set to correct event type

---

## Best Practices

1. **Test before deploying:** Always test prompt and rule changes in the Test Console before saving
2. **Monitor logs:** Keep the Live Logs tab open while testing to catch issues early
3. **Backup prompts:** Copy your prompt to a text file before making major changes
4. **Use priorities:** Set higher priorities for more specific keywords
5. **Regular review:** Check logs weekly to identify patterns and improve accuracy

---

## Security Notes

- The AI section is protected by the same PIN as the main admin page
- Prompts and rules are stored in Google Sheets (not in the database)
- Logs are in-memory only and never stored permanently
- Test console does not save data to Google Sheets
- All API calls are logged for monitoring

---

## Support

For issues or questions:
1. Check the **Live Logs** tab for error messages
2. Review this documentation
3. Contact the development team

---

**Last Updated:** 2025-10-29

