# Pre-Test Checklist — Accounting Buddy v1.0.0-final

**Date:** 2025-10-24  
**Status:** Ready for Real-World Testing  
**Tester:** Shaun (CEO)  
**Production URL:** https://accounting-buddy-seven.vercel.app/upload

---

## 🎯 Testing Objectives

Verify that the complete pipeline works seamlessly from receipt upload → OCR → AI extraction → Google Sheets append with real-world receipts in both Thai and English.

---

## ✅ Pre-Test Setup Checklist

### **1. Environment Configuration** ✅

- [x] **Google Cloud Vision API Key** configured in Vercel
  - Variable: `GOOGLE_VISION_KEY`
  - Status: ✅ Configured
  - Test: OCR endpoint should return text

- [x] **OpenAI API Key** configured in Vercel
  - Variable: `OPENAI_API_KEY`
  - Status: ✅ Configured
  - Test: Extract endpoint should return structured data

- [x] **Google Sheets Webhook URL** configured in Vercel
  - Variable: `SHEETS_WEBHOOK_URL`
  - Format: `https://script.google.com/macros/s/{SCRIPT_ID}/exec`
  - Status: ⏳ Needs verification
  - Test: Webhook should return 200 OK

- [x] **Google Sheets Webhook Secret** configured in Vercel
  - Variable: `SHEETS_WEBHOOK_SECRET`
  - Status: ⏳ Needs verification
  - Test: Webhook should authenticate successfully

### **2. Google Sheets Setup** ⏳

- [ ] **Spreadsheet Created**
  - Name: "Accounting Buddy P&L 2025" (or similar)
  - Tab: "Accounting"
  - Status: ⏳ Pending

- [ ] **Column Structure Verified**
  - Column A: Empty (for row numbers)
  - Column B: Day
  - Column C: Month
  - Column D: Year
  - Column E: Property
  - Column F: Type of Operation
  - Column G: Type of Payment
  - Column H: Detail
  - Column I: Ref
  - Column J: Debit
  - Column K: Credit
  - Status: ⏳ Pending

- [ ] **Apps Script Webhook Deployed**
  - Script deployed as web app
  - Access: "Anyone" (for webhook access)
  - Secret configured in script
  - Status: ⏳ Pending

- [ ] **Webhook Test Successful**
  - Test append with sample data
  - Verify data appears in correct columns
  - Status: ⏳ Pending

### **3. Code Quality Verification** ✅

- [x] **TypeScript Compilation**
  - Command: `npx tsc --noEmit`
  - Result: ✅ PASSED (no errors)

- [x] **Production Build**
  - Command: `npm run build`
  - Result: ✅ PASSED (26.1s, 8/8 routes)

- [x] **All Routes Compiled**
  - Static pages: 4 (/, /_not-found, /inbox, /upload)
  - API routes: 3 (/api/extract, /api/ocr, /api/sheets)
  - Dynamic pages: 1 (/review/[id])
  - Result: ✅ PASSED

- [x] **Enhanced Logging Added**
  - OCR route: ✅ Added detailed logging
  - Extract route: ✅ Added detailed logging
  - Sheets route: ✅ Added detailed logging
  - Result: ✅ COMPLETE

### **4. Deployment Verification** ✅

- [x] **Production Deployment Live**
  - URL: https://accounting-buddy-seven.vercel.app
  - Status: ✅ Live and accessible

- [x] **Latest Code Deployed**
  - Latest commit: `96b88b9` (documentation)
  - Feature commit: `dff3f9e` (dropdown enhancements)
  - Status: ✅ Deployed

- [x] **Upload Page Accessible**
  - URL: https://accounting-buddy-seven.vercel.app/upload
  - Status: ✅ Accessible

---

## 🧪 Test Scenarios

### **Test Case 1: Simple Receipt (Thai) - HomePro Materials**

**Input:**
- Receipt: HomePro receipt for construction materials
- Amount: ฿1,245
- Comment: "Materials for wall construction"

**Expected Output:**
- Day: 27
- Month: Feb
- Year: 2025
- Property: Sia Moon (or user-selected)
- Type of Operation: "EXP - Construction - Materials" or "EXP - Construction - Wall"
- Type of Payment: Cash
- Detail: "Materials" or "Materials for wall construction"
- Debit: 1245
- Credit: 0

**Success Criteria:**
- ✅ OCR extracts text correctly
- ✅ AI categorizes as construction expense
- ✅ Data appears in Google Sheets within 5 seconds
- ✅ Confidence badges show high confidence (>0.8)

---

### **Test Case 2: Service Invoice - Plumber**

**Input:**
- Receipt: Plumber service invoice
- Amount: ฿2,000
- Comment: "Plumbing repair - cash payment"

**Expected Output:**
- Type of Operation: "EXP - Repairs & Maintenance - Plumbing"
- Type of Payment: Cash
- Detail: "Plumbing repair" or "Labour"
- Debit: 2000
- Credit: 0

**Success Criteria:**
- ✅ AI categorizes as repairs & maintenance
- ✅ Payment method correctly identified as Cash
- ✅ Comment influences categorization

---

### **Test Case 3: Grocery Receipt - Office Supplies**

**Input:**
- Receipt: Makro receipt for office supplies
- Amount: ฿850
- Comment: "Office supplies"

**Expected Output:**
- Type of Operation: "EXP - Administration & General - Office Supplies"
- Detail: "Office supplies"
- Debit: 850
- Credit: 0

**Success Criteria:**
- ✅ AI categorizes as admin expense
- ✅ Comment guides categorization correctly

---

### **Test Case 4: Manual Text Input (AI Chat)**

**Input:**
- Text command: "debit - 2000 baht - salaries - paid by cash"
- No image upload

**Expected Output:**
- Type of Operation: "EXP - Administration & General - Employee Salaries"
- Type of Payment: Cash
- Detail: "Salaries"
- Debit: 2000
- Credit: 0

**Success Criteria:**
- ✅ AI understands natural language command
- ✅ Correctly maps to salary expense category
- ✅ Data appends to Google Sheets

---

### **Test Case 5: PDF Receipt**

**Input:**
- PDF receipt (any vendor)
- Test PDF upload functionality

**Expected Output:**
- OCR extracts text from PDF
- AI processes normally
- Data appends to Google Sheets

**Success Criteria:**
- ✅ PDF upload accepted
- ✅ OCR processes PDF correctly
- ✅ No errors in pipeline

---

### **Test Case 6: Low-Quality Image**

**Input:**
- Blurry or low-light receipt photo
- Test error handling

**Expected Output:**
- OCR may return insufficient text
- User-friendly error message displayed
- No crash or generic error

**Success Criteria:**
- ✅ Graceful error handling
- ✅ Clear error message to user
- ✅ Suggestion to retake photo

---

### **Test Case 7: Fuzzy Matching**

**Input:**
- Receipt with typo: "Sia Moom" instead of "Sia Moon"
- Or: "Bank tranfer" instead of "Bank transfer"

**Expected Output:**
- Fuzzy matching corrects to "Sia Moon"
- Fuzzy matching corrects to "Bank transfer"
- Confidence score may be lower (<0.8)

**Success Criteria:**
- ✅ Fuzzy matching works correctly
- ✅ Confidence badge shows "⚠️ Needs review" if <0.8
- ✅ User can verify and correct if needed

---

### **Test Case 8: Confidence Scoring**

**Input:**
- Receipt with ambiguous category
- Example: "General supplies" (could be office, construction, etc.)

**Expected Output:**
- AI makes best guess
- Confidence score <0.8
- "⚠️ Needs review" badge displayed

**Success Criteria:**
- ✅ Confidence scoring works correctly
- ✅ Low-confidence items flagged for review
- ✅ User can correct before submitting

---

## 📊 Expected Pipeline Flow

```
1. Upload Page
   ↓
2. File Upload (JPG/PNG/PDF) + Optional Comment
   ↓
3. Image Compression (if >1MB)
   ↓
4. OCR API (/api/ocr)
   → Google Cloud Vision API
   → Extract text from image
   → Log: "[✔] OCR complete → text length: X characters"
   ↓
5. AI Extraction API (/api/extract)
   → OpenAI GPT-4o API
   → Extract 10-field structured data
   → Apply fuzzy matching and normalization
   → Calculate confidence scores
   → Log: "[✔] AI extraction success → fields mapped: ..."
   ↓
6. Review Page (/review/[id])
   → Display extracted data in dropdowns
   → Show confidence badges for low-confidence fields
   → User can edit before submitting
   ↓
7. Google Sheets API (/api/sheets)
   → Validate payload
   → Normalize dropdown values
   → Send to Google Apps Script webhook
   → Log: "[✔] Sheets append → status: SUCCESS"
   → Log: "✅ Accounting Buddy Receipt Upload Complete"
   ↓
8. Success!
   → Data appears in Google Sheets
   → User redirected to /inbox
   → Success toast displayed
```

---

## 🔍 What to Check During Testing

### **Terminal Logs (Vercel Logs)**

Look for these log messages:

```
[OCR] Starting Vision API call...
[✔] OCR complete → text length: 245 characters
[OCR] Text preview: HomePro...
[✔] OCR successful → Receipt ID: abc-123

[EXTRACT] Starting AI extraction...
[EXTRACT] Input text length: 245 characters
[EXTRACT] User comment provided: "Materials for wall construction"
[✔] AI extraction success → fields mapped: day, month, year, property, typeOfOperation, ...
[EXTRACT] Extracted: EXP - Construction - Materials | Materials | Debit: 1245
[EXTRACT] Confidence scores: Property=1.00, Operation=0.95, Payment=1.00

[SHEETS] Starting Google Sheets append...
[SHEETS] Received payload: {...}
[SHEETS] Payload validated successfully
[SHEETS] Normalized dropdown values: {...}
[SHEETS] Sending to webhook...
[SHEETS] Webhook response: Success
[✔] Sheets append → status: SUCCESS
✅ Accounting Buddy Receipt Upload Complete — Data appended to Google Sheets
```

### **Google Sheets**

Check that:
- ✅ New row appears in "Accounting" tab
- ✅ Column A is empty
- ✅ Columns B-K contain correct data
- ✅ Date is split correctly (day, month, year)
- ✅ Debit/Credit values are numeric (no currency symbols)
- ✅ Dropdown values match canonical options

### **User Interface**

Check that:
- ✅ Upload page loads quickly
- ✅ Drag-and-drop works
- ✅ Comment field is visible and functional
- ✅ Loading spinner shows during processing
- ✅ Review page displays dropdowns (not text inputs)
- ✅ Confidence badges show for low-confidence fields
- ✅ Success toast appears after submission
- ✅ Redirect to /inbox works

---

## 🚨 Known Issues to Watch For

1. **OCR Returns Empty Text**
   - Cause: Poor image quality, low lighting, or unsupported language
   - Expected: User-friendly error message
   - Action: Suggest retaking photo with better lighting

2. **AI Extraction Timeout**
   - Cause: OpenAI API slow or rate limited
   - Expected: Fallback data returned
   - Action: Retry or use fallback values

3. **Webhook Authentication Failure**
   - Cause: Wrong SHEETS_WEBHOOK_SECRET
   - Expected: 401 error with clear message
   - Action: Verify secret matches in both Vercel and Apps Script

4. **Fuzzy Matching Too Aggressive**
   - Cause: Confidence threshold too low
   - Expected: Incorrect category selected
   - Action: Adjust threshold in `/utils/matchOption.ts` (currently 0.8)

---

## ✅ Final Pre-Test Checklist

Before starting real-world testing:

- [x] All code changes committed and pushed
- [x] Production build successful
- [x] TypeScript compilation passing
- [x] Enhanced logging added to all API routes
- [x] Test script created (`test-pipeline.sh`)
- [ ] Google Sheets webhook configured and tested
- [ ] Environment variables verified in Vercel
- [ ] Test receipts prepared (Thai and English)
- [ ] Vercel logs accessible for monitoring
- [ ] Ready to test at https://accounting-buddy-seven.vercel.app/upload

---

## 📞 Support During Testing

**If issues occur:**
1. Check Vercel logs for error messages
2. Verify environment variables are set correctly
3. Test webhook URL directly with curl
4. Check Google Sheets Apps Script logs
5. Report issues with screenshots and error messages

**Contact:**
- Developer: Augment Agent
- Repository: https://github.com/TOOL2U/AccountingBuddy
- Documentation: See TESTING.md, SECURITY.md, GOOGLE_SHEETS_SETUP.md

---

**Status:** ✅ Ready for Real-World Testing  
**Next Step:** Configure Google Sheets webhook and begin testing with real receipts

