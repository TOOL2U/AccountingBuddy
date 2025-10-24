# 🚀 Option 3 Deployment Guide - POST Body Authentication

**Date:** 2025-10-24
**Solution:** Send webhook secret in POST body instead of headers
**Status:** Ready for deployment

---

## 📋 What Changed

### **Problem:**
Google Apps Script was rejecting authentication via Authorization headers and query parameters.

### **Solution:**
Send the secret in the POST request body, which Apps Script handles more reliably.

### **Changes Made:**

1. **Next.js API Route** (`/app/api/sheets/route.ts`)
   - Changed from Authorization header to POST body
   - Secret now sent as part of the JSON payload
   - Apps Script receives it in `e.postData.contents`

2. **Apps Script Code** (`APPS_SCRIPT_CODE_V3.js`)
   - Reads secret from POST body instead of headers
   - Validates secret before processing data
   - Removes secret from payload before appending to sheet
   - Returns JSON responses for better error handling

---

## 🔧 Deployment Steps

### **Step 1: Update Google Apps Script** (5 minutes)

1. **Open Google Apps Script Editor**
   - Go to https://script.google.com
   - Open your existing "Accounting Buddy" project
   - Or create a new project if needed

2. **Replace the Code**
   - Select all existing code (Cmd+A / Ctrl+A)
   - Delete it
   - Copy the entire contents of `APPS_SCRIPT_CODE_V3.js`
   - Paste into the editor

3. **Bind to Your Spreadsheet** (Important!)
   - If not already bound, go to: Resources → Advanced Google Services
   - Or use `SpreadsheetApp.openById('YOUR_SPREADSHEET_ID')` in the code
   - Make sure you have a sheet named "Accounting"

4. **Test the Script** (Optional but recommended)
   - In the Apps Script editor, select the function `testDoPost`
   - Click "Run" (▶️ button)
   - Check the "Execution log" for success message
   - Verify a test row appears in your spreadsheet

5. **Deploy the Web App**
   - Click "Deploy" → "New deployment"
   - Click the gear icon ⚙️ next to "Select type"
   - Choose "Web app"
   - Configure settings:
     - **Description:** "Accounting Buddy v3 - POST body auth"
     - **Execute as:** Me (your Google account)
     - **Who has access:** Anyone
   - Click "Deploy"
   - **IMPORTANT:** Copy the new deployment URL
   - Click "Done"

6. **Save the Deployment URL**
   - The URL will look like:
     ```
     https://script.google.com/macros/s/AKfycby.../exec
     ```
   - Copy this URL - you'll need it for Step 2

---

### **Step 2: Update Vercel Environment Variables** (2 minutes)

1. **Go to Vercel Dashboard**
   - Open https://vercel.com
   - Navigate to your "accounting-buddy" project
   - Go to Settings → Environment Variables

2. **Update SHEETS_WEBHOOK_URL**
   - Find the `SHEETS_WEBHOOK_URL` variable
   - Click "Edit"
   - Paste the NEW deployment URL from Step 1
   - Save

3. **Verify SHEETS_WEBHOOK_SECRET**
   - Make sure it's still set to:
     ```
     VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=
     ```
   - This must match the secret in the Apps Script code

4. **Redeploy the Application**
   - Go to Deployments tab
   - Click "..." on the latest deployment
   - Click "Redeploy"
   - Or just push a new commit to trigger auto-deployment

---

### **Step 3: Test the Integration** (5 minutes)

#### **Test 1: Direct Apps Script Test**

Test the Apps Script directly with cURL:

```bash
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=",
    "day": "27",
    "month": "Feb",
    "year": "2025",
    "property": "Sia Moon",
    "typeOfOperation": "EXP - Construction - Materials",
    "typeOfPayment": "Cash",
    "detail": "Test from cURL",
    "ref": "TEST-001",
    "debit": 1000,
    "credit": 0
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "success": true,
  "message": "Data appended successfully",
  "row": 5,
  "timestamp": "2025-10-24T..."
}
```

**Check:** Verify a new row appears in your Google Sheet

---

#### **Test 2: End-to-End Application Test**

1. **Go to the Upload Page**
   - Visit: https://accounting-buddy-seven.vercel.app/upload

2. **Upload a Receipt**
   - Upload any receipt image (or use manual text input)
   - Add a comment: "Test receipt for Option 3"
   - Click "Upload & Process"

3. **Review the Data**
   - Check the review page
   - Verify all fields are populated correctly
   - Click "Submit to Google Sheets"

4. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions → Logs
   - Look for these messages:
     ```
     [SHEETS] Sending to webhook with secret in POST body...
     [SHEETS] Webhook response: {"ok":true,"success":true,...}
     [✔] Sheets append → status: SUCCESS (JSON format)
     ✅ Accounting Buddy Receipt Upload Complete
     ```

5. **Verify Google Sheets**
   - Open your Google Sheet
   - Check that a new row was added
   - Verify data is in columns B-K (Column A should be empty)
   - Verify date format is correct (DD/MMM/YYYY)

---

## 🔍 Troubleshooting

### **Issue 1: Still Getting "Unauthorized"**

**Possible Causes:**
- Old deployment URL being used
- Secret mismatch between .env.local and Apps Script
- Apps Script not deployed with "Anyone" access

**Solutions:**
1. Verify you copied the NEW deployment URL
2. Double-check the secret matches exactly (including any special characters)
3. Redeploy Apps Script with "Anyone" access
4. Clear Vercel cache and redeploy

---

### **Issue 2: "Sheet 'Accounting' not found"**

**Possible Causes:**
- Sheet name doesn't match
- Script not bound to correct spreadsheet

**Solutions:**
1. Verify your sheet is named exactly "Accounting" (case-sensitive)
2. Or update the script to use your sheet name
3. Or bind the script to the correct spreadsheet

---

### **Issue 3: Apps Script Returns Error**

**Check Apps Script Logs:**
1. Go to Apps Script Editor
2. Click "Executions" (clock icon on left sidebar)
3. Find the failed execution
4. Click to see detailed error logs

**Common Errors:**
- "Cannot read property 'contents' of undefined" → POST data not received
- "Sheet not found" → Wrong sheet name or spreadsheet
- "Unauthorized" → Secret mismatch

---

## 📊 Expected Log Output

### **Successful Request - Vercel Logs:**
```
[SHEETS] Starting Google Sheets append...
[SHEETS] Received payload: {day: "27", month: "Feb", year: "2025", ...}
[SHEETS] Payload validated successfully
[SHEETS] Normalized dropdown values: {property: "Sia Moon", ...}
[SHEETS] Sending to webhook with secret in POST body...
[SHEETS] Webhook response: {"ok":true,"success":true,"message":"Data appended successfully","row":5}
[✔] Sheets append → status: SUCCESS (JSON format)
✅ Accounting Buddy Receipt Upload Complete — Data appended to Google Sheets
POST /api/sheets 200 in 2.3s
```

### **Successful Request - Apps Script Logs:**
```
=== Incoming POST Request ===
Has postData: true
Payload parsed successfully
Payload keys: secret, day, month, year, property, typeOfOperation, typeOfPayment, detail, ref, debit, credit
Has secret in payload: true
Secret matches: true
✓ Authentication successful
✓ All required fields present
✓ Sheet "Accounting" found
Row data prepared: ["","27/Feb/2025","Sia Moon",...]
✓ Data appended successfully to row 5
```

---

## ✅ Success Criteria

After deployment, verify:

- [ ] Apps Script test function runs successfully
- [ ] cURL test returns `{"ok": true, "success": true}`
- [ ] Test row appears in Google Sheet
- [ ] End-to-end upload works from web app
- [ ] Vercel logs show success messages
- [ ] Apps Script logs show authentication success
- [ ] Data appears in correct columns (B-K)
- [ ] No "Unauthorized" errors

---

## 🎉 What's Different in Option 3

| Aspect | Previous (Header Auth) | Option 3 (Body Auth) |
|--------|----------------------|---------------------|
| **Secret Location** | Authorization header | POST body |
| **Apps Script Access** | `e.headers.Authorization` | `payload.secret` |
| **Reliability** | ❌ Inconsistent | ✅ Reliable |
| **Google Support** | Limited | Full support |
| **Error Handling** | Text responses | JSON responses |
| **Debugging** | Difficult | Easy (logs show payload) |

---

## 📞 Next Steps

1. **Deploy Apps Script** with the new code
2. **Update Vercel** environment variables
3. **Test with cURL** to verify Apps Script works
4. **Test end-to-end** with the web app
5. **Monitor logs** for success messages
6. **Verify data** appears in Google Sheets

If all tests pass, the webhook integration is fixed! 🎉

---

**Files Modified:**
- `app/api/sheets/route.ts` - Changed to POST body authentication
- `APPS_SCRIPT_CODE_V3.js` - New Apps Script with body auth

**Status:** ✅ Ready for deployment
**Confidence:** High - POST body is the most reliable method for Apps Script