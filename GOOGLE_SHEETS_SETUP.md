# Google Sheets Setup Guide

This guide will help you set up the Google Sheets webhook integration for Accounting Buddy.

## Features

- **Comment-Guided AI Extraction**: Add optional comments when uploading receipts to help the AI select the correct categories
- **Fuzzy Matching**: AI-selected values are automatically matched to canonical dropdown options using keyword matching and Levenshtein distance
- **Confidence Scoring**: Low-confidence matches (<0.8) are flagged with "⚠️ Needs review" badges in the review UI
- **Dropdown Validation**: All dropdown fields are validated before sending to Google Sheets to ensure data consistency

## Prerequisites

- A Google account
- A Google Sheet where you want to store your receipt data

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet or open an existing one
3. Name it something like "Accounting Buddy P&L 2025"
4. Create a sheet named **"Accounting"** (or use the default sheet and rename it)
5. Add column headers - **IMPORTANT: Use this exact structure**:
   - **Row 1**: Leave empty or add a title (e.g., "Alesia House P&L 2025")
   - **Row 2**: Leave empty
   - **Row 3**: Add these column headers starting from **Column B** (leave Column A empty):
     - Column A: **(Leave empty)** - for row numbers/spacing
     - Column B: **Day** (e.g., "27")
     - Column C: **Month** (e.g., "Feb", "Oct")
     - Column D: **Year** (e.g., "2025")
     - Column E: **Property** (e.g., "Sia Moon", "Alesia House")
     - Column F: **Type of operation** (e.g., "EXP - Construction - Materials")
     - Column G: **Type of payment** (e.g., "Cash", "Bank transfer")
     - Column H: **Detail** (e.g., "Materials", "Labour")
     - Column I: **Ref** (e.g., Invoice number - optional)
     - Column J: **Debit** (Expense amount - format as currency)
     - Column K: **Credit** (Income amount - format as currency)

**Note:** This structure matches the canonical schema in `/docs/Accounting_Buddy_P&L_2025.csv`. The webhook will append data starting from Column B (skipping Column A).

## Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Delete any existing code in the editor

## Step 3: Add the Webhook Code

Copy and paste the following code into the Apps Script editor:

```javascript
function doPost(e) {
  // IMPORTANT: Replace this with your own secret
  // Generate a secure secret with: openssl rand -base64 32
  const secret = "YOUR_SECRET_HERE";

  try {
    // Parse the incoming request
    const params = JSON.parse(e.postData.contents);
    const incomingSecret = e.parameter.secret;

    // Validate the webhook secret
    if (incomingSecret !== secret) {
      return ContentService
        .createTextOutput("Unauthorized")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Get the "Accounting" sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accounting");

    // If sheet doesn't exist, create it
    if (!sheet) {
      return ContentService
        .createTextOutput("Error: 'Accounting' sheet not found")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Append the data as a new row (11 fields: empty first column + 10 data fields)
    // Column A is left empty for row numbers/spacing (matches CSV structure)
    sheet.appendRow([
      "",                      // Column A: Empty (for row numbers/spacing)
      params.day,              // Column B: Day
      params.month,            // Column C: Month
      params.year,             // Column D: Year
      params.property,         // Column E: Property
      params.typeOfOperation,  // Column F: Type of operation
      params.typeOfPayment,    // Column G: Type of payment
      params.detail,           // Column H: Detail
      params.ref,              // Column I: Ref
      params.debit,            // Column J: Debit
      params.credit            // Column K: Credit
    ]);

    // Return success response
    return ContentService
      .createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // Log error and return failure response
    Logger.log("Error: " + error.toString());
    return ContentService
      .createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

### Important: Set Your Secret

1. Generate a secure secret by running this command in your terminal:
   ```bash
   openssl rand -base64 32
   ```
2. Copy the generated secret
3. Replace `YOUR_SECRET_HERE` in the code with your generated secret
4. **Save this secret** - you'll need it for your `.env.local` file

## Step 4: Deploy the Web App

1. Click the **Deploy** button (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Accounting Buddy Webhook" (optional)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. You may need to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
7. Copy the **Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

## Step 5: Configure Your Environment Variables

1. In your Accounting Buddy project, create or edit `.env.local`
2. Add the following variables:

```bash
# Google Sheets Webhook URL (from Step 4)
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Webhook Secret (from Step 3)
SHEETS_WEBHOOK_SECRET=your_generated_secret_here
```

3. Save the file
4. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

## Step 6: Test the Integration

1. Open your Accounting Buddy app at http://localhost:3002
2. Go to the Upload page
3. Upload a receipt image
4. Review the extracted data
5. Click "Send to Google Sheet"
6. Check your Google Sheet - you should see a new row with the receipt data!

## Troubleshooting

### "Webhook authentication failed"
- Make sure the `SHEETS_WEBHOOK_SECRET` in `.env.local` matches the `secret` in your Apps Script code exactly

### "Failed to send data to Google Sheets"
- Check that the `SHEETS_WEBHOOK_URL` is correct
- Make sure you deployed the Apps Script as a web app with "Anyone" access
- Check the Apps Script execution logs: **Executions** tab in the Apps Script editor

### "Unauthorized" response
- The webhook secret doesn't match
- Regenerate the secret and update both the Apps Script and `.env.local`

### Data not appearing in the sheet
- Check that your sheet has the correct column headers (10 columns: Day, Month, Year, Property, Type of Operation, Type of Payment, Detail, Ref, Debit, Credit)
- Check the Apps Script execution logs for errors
- Make sure the sheet is named "Accounting" (case-sensitive)

## Security Notes

- ✅ The webhook secret prevents unauthorized access to your sheet
- ✅ Never commit `.env.local` to version control
- ✅ Use a strong, randomly generated secret (at least 32 characters)
- ✅ The Apps Script runs under your Google account permissions
- ⚠️ Anyone with the webhook URL and secret can add data to your sheet

## Advanced: Using a Different Sheet Name

The default configuration uses a sheet named **"Accounting"**. If you want to use a different sheet name:

1. Rename your sheet in Google Sheets
2. Update the Apps Script code:

```javascript
// Change this line:
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accounting");

// To your sheet name:
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("YourSheetName");
```

3. Save and redeploy the Apps Script

## Need Help?

- Check the [main README](./README.md) for more information
- Review the [SECURITY.md](./SECURITY.md) for security best practices
- Open an issue on GitHub if you encounter problems

