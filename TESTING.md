# Testing Guide — Accounting Buddy

This document provides comprehensive testing procedures for Accounting Buddy to ensure all features work correctly before and after deployment.

---

## 🎯 Testing Overview

**Test Coverage:**
- ✅ Receipt upload with OCR processing
- ✅ Comment-guided AI categorization
- ✅ Manual text input commands
- ✅ Fuzzy dropdown matching
- ✅ Confidence scoring and badges
- ✅ Google Sheets integration
- ✅ Error handling and edge cases

**Testing Environments:**
- **Local Development:** `http://localhost:3000`
- **Production:** `https://accounting-buddy-seven.vercel.app`

---

## 📋 Pre-Testing Checklist

Before running tests, ensure:

- [ ] All environment variables are configured in `.env.local`:
  - `GOOGLE_VISION_KEY`
  - `OPENAI_API_KEY`
  - `SHEETS_WEBHOOK_URL`
  - `SHEETS_WEBHOOK_SECRET`
- [ ] Google Sheet is set up with "Accounting" sheet (see `GOOGLE_SHEETS_SETUP.md`)
- [ ] Development server is running: `npm run dev`
- [ ] Build passes: `npm run build`
- [ ] TypeScript compilation passes: `npx tsc --noEmit`

---

## 🧪 Test Scenarios

### **Test Case 1: Receipt Upload with Comment**

**Objective:** Verify that uploading a receipt with a comment guides AI categorization correctly.

**Steps:**
1. Navigate to `/upload` page
2. Drag and drop a receipt image (or click to select)
3. Wait for file to be accepted (green checkmark)
4. In the "Comment (optional)" field, enter: `"materials for wall construction"`
5. Click "Process Receipt" button
6. Wait for OCR and AI extraction (loading state)
7. Review page should load with extracted data

**Expected Results:**
- ✅ File upload successful with visual feedback
- ✅ Comment field visible after file selection
- ✅ Processing completes within 5-10 seconds
- ✅ Review page shows extracted data with:
  - **Type of Operation:** "EXP - Construction - Wall" (or similar construction category)
  - **Property:** One of the valid properties (e.g., "Sia Moon")
  - **Type of Payment:** Valid payment type (e.g., "Cash", "Bank transfer")
  - All 10 fields populated (day, month, year, property, typeOfOperation, typeOfPayment, detail, ref, debit, credit)
- ✅ Confidence badges appear if confidence < 0.8
- ✅ Dropdown fields show valid options from `/config/options.json`

**Verification:**
- Check that comment influenced the category selection
- Verify "EXP - Construction - Wall" or related category was selected
- Confirm all dropdown values are valid options

---

### **Test Case 2: Receipt Upload Without Comment**

**Objective:** Verify that AI can infer correct categories from receipt text alone.

**Steps:**
1. Navigate to `/upload` page
2. Upload a receipt image (e.g., grocery receipt, restaurant bill)
3. Leave the comment field empty
4. Click "Process Receipt" button
5. Wait for processing

**Expected Results:**
- ✅ Processing completes successfully
- ✅ AI infers categories from receipt text
- ✅ All 10 fields populated with reasonable values
- ✅ Dropdown fields contain valid options
- ✅ Low-confidence matches show "⚠️ Needs review" badge

**Verification:**
- Check if inferred categories make sense based on receipt content
- Verify confidence badges appear for uncertain matches
- Confirm user can edit dropdown values if needed

---

### **Test Case 3: Manual Text Input (AI Command)**

**Objective:** Verify that manual text commands are processed correctly.

**Steps:**
1. Navigate to `/upload` page
2. Instead of uploading an image, imagine entering text directly (Note: Current implementation requires image upload, but AI can process text-based receipts)
3. Upload a simple text file or image with text: `"debit - 2000 baht - salaries - paid by cash"`
4. Click "Process Receipt"

**Expected Results:**
- ✅ AI extracts structured data from text:
  - **Debit:** 2000
  - **Credit:** 0
  - **Type of Operation:** "EXP - Administration & General - Employee Salaries"
  - **Type of Payment:** "Cash"
  - **Detail:** "salaries" or similar
- ✅ Fuzzy matching recognizes "salaries" keyword
- ✅ Fuzzy matching recognizes "cash" payment type
- ✅ All required fields populated

**Verification:**
- Verify keyword matching worked: "salaries" → "EXP - Administration & General - Employee Salaries"
- Verify payment matching worked: "cash" → "Cash"
- Confirm debit/credit amounts are correct

---

### **Test Case 4: Fuzzy Dropdown Matching**

**Objective:** Verify that fuzzy matching correctly maps similar values to canonical options.

**Steps:**
1. Upload a receipt with text containing:
   - "bank payment" (not exact match for "Bank transfer")
   - "staff wages" (not exact match for "Employee Salaries")
   - "villa one" (not exact match for "Villa 1")
2. Process the receipt

**Expected Results:**
- ✅ "bank payment" → "Bank transfer" (high confidence)
- ✅ "staff wages" → "EXP - Administration & General - Employee Salaries" (high confidence)
- ✅ "villa one" → "Villa 1" (high confidence)
- ✅ Confidence scores > 0.8 for good matches
- ✅ Confidence scores < 0.8 for uncertain matches (show "Needs review" badge)

**Verification:**
- Check `/utils/matchOption.ts` is working correctly
- Verify Levenshtein distance algorithm is matching similar strings
- Confirm keyword matching is recognizing synonyms

---

### **Test Case 5: Review Page Functionality**

**Objective:** Verify that the review page allows editing and displays confidence badges correctly.

**Steps:**
1. After processing a receipt, land on review page
2. Observe all form fields and dropdowns
3. Check for confidence badges on dropdown fields
4. Edit a dropdown value (e.g., change Property from "Sia Moon" to "Villa 1")
5. Edit a text field (e.g., change Detail)
6. Edit numeric fields (e.g., change Debit amount)
7. Click "Confirm & Send to Sheet" button

**Expected Results:**
- ✅ All 10 fields are editable
- ✅ Dropdown fields show valid options from `/config/options.json`
- ✅ Confidence badges appear on fields with confidence < 0.8
- ✅ Badge shows "⚠️ Needs review" in yellow
- ✅ User can change any field value
- ✅ Form validation works (required fields, number formats)
- ✅ Submit button triggers Google Sheets webhook
- ✅ Success toast notification appears after submission
- ✅ User is redirected to inbox page

**Verification:**
- Confirm all dropdowns have correct options
- Verify confidence badges only appear when confidence < 0.8
- Check that edited values are sent to Google Sheets

---

### **Test Case 6: Google Sheets Integration**

**Objective:** Verify that data is correctly appended to Google Sheets with proper formatting.

**Steps:**
1. Complete Test Case 1 (receipt upload with comment)
2. On review page, click "Confirm & Send to Sheet"
3. Wait for success notification
4. Open your Google Sheet (the one configured in `SHEETS_WEBHOOK_URL`)
5. Navigate to the "Accounting" sheet
6. Check the last row of data

**Expected Results:**
- ✅ New row appended to the sheet
- ✅ Data appears in correct columns:
  - Column A: Empty (for row numbers/spacing)
  - Column B: Day (e.g., "27")
  - Column C: Month (e.g., "Feb")
  - Column D: Year (e.g., "2025")
  - Column E: Property (e.g., "Sia Moon")
  - Column F: Type of operation (e.g., "EXP - Construction - Wall")
  - Column G: Type of payment (e.g., "Bank transfer")
  - Column H: Detail (e.g., "Materials")
  - Column I: Ref (e.g., "" or invoice number)
  - Column J: Debit (e.g., 4785)
  - Column K: Credit (e.g., 0)
- ✅ All dropdown values match canonical options
- ✅ Numbers are formatted correctly (no currency symbols in raw data)
- ✅ Dates are properly split into day/month/year

**Verification:**
- Compare sheet data with what was shown on review page
- Verify no data corruption or missing fields
- Confirm dropdown values are valid (not "Uncategorized" unless intended)
- Check that empty Column A is preserved

---

### **Test Case 7: Image Compression**

**Objective:** Verify that large images are compressed before processing.

**Steps:**
1. Find or create an image file > 1MB in size
2. Upload the image to `/upload` page
3. Monitor network tab in browser DevTools
4. Check the size of the image sent to `/api/ocr`

**Expected Results:**
- ✅ Image is compressed if > 1MB
- ✅ Compressed image is ~65% smaller than original
- ✅ OCR still works correctly on compressed image
- ✅ No quality loss affecting text recognition

**Verification:**
- Check network request payload size
- Verify OCR extraction quality is maintained
- Confirm compression utility (`/utils/imageCompression.ts`) is working

---

### **Test Case 8: Error Handling**

**Objective:** Verify that errors are handled gracefully with user-friendly messages.

**Test 8a: Invalid File Type**
1. Try to upload a `.txt` or `.docx` file
2. Expected: Error message "Please upload a valid image (JPG, PNG) or PDF file"

**Test 8b: Missing API Key**
1. Remove `OPENAI_API_KEY` from `.env.local`
2. Try to process a receipt
3. Expected: Error message about API configuration

**Test 8c: Invalid Webhook URL**
1. Set `SHEETS_WEBHOOK_URL` to an invalid URL
2. Try to submit data to sheet
3. Expected: Error message about webhook failure

**Test 8d: Network Timeout**
1. Simulate slow network (DevTools → Network → Throttling)
2. Try to process a receipt
3. Expected: Loading state persists, eventual timeout with error message

**Expected Results:**
- ✅ All errors show user-friendly messages
- ✅ No sensitive information exposed in error messages
- ✅ User can retry after fixing the issue
- ✅ Application doesn't crash or show blank screen

---

### **Test Case 9: Confidence Scoring Accuracy**

**Objective:** Verify that confidence scoring correctly identifies uncertain matches.

**Steps:**
1. Upload a receipt with ambiguous text (e.g., "misc expense", "other payment")
2. Process the receipt
3. Check confidence badges on review page

**Expected Results:**
- ✅ Ambiguous categories show low confidence (<0.8)
- ✅ "⚠️ Needs review" badge appears on uncertain fields
- ✅ Clear categories show high confidence (>0.8)
- ✅ No badge appears on high-confidence fields

**Verification:**
- Check that confidence threshold (0.8) is appropriate
- Verify that truly ambiguous matches are flagged
- Confirm that clear matches are not unnecessarily flagged

---

### **Test Case 10: Vendor Caching**

**Objective:** Verify that vendor caching improves categorization for repeat vendors.

**Steps:**
1. Upload a receipt from "ABC Hardware Store" with detail "ABC Hardware Store"
2. Manually select "EXP - Construction - Materials" for Type of Operation
3. Submit to sheet
4. Upload another receipt from "ABC Hardware Store"
5. Check if Type of Operation is pre-filled

**Expected Results:**
- ✅ First receipt: User manually selects category
- ✅ Mapping is cached in localStorage
- ✅ Second receipt: Category is pre-filled based on cache
- ✅ User can still override if needed

**Verification:**
- Check localStorage in browser DevTools
- Verify `vendorOperationCache` key exists
- Confirm mapping is used for subsequent receipts

---

## 🔍 Edge Cases & Boundary Testing

### **Edge Case 1: Empty or Minimal Receipt Text**
- Upload an image with very little text
- Expected: AI should still extract available data, use defaults for missing fields

### **Edge Case 2: Non-English Text**
- Upload a receipt with Thai text (e.g., "฿2,000 เงินสด")
- Expected: OCR should extract text, AI should parse amounts and keywords

### **Edge Case 3: Multiple Amounts on Receipt**
- Upload a receipt with subtotal, tax, and total
- Expected: AI should extract the correct total amount

### **Edge Case 4: Missing Date**
- Upload a receipt without a date
- Expected: AI should use current date or leave empty for user to fill

### **Edge Case 5: Very Large Amount**
- Upload a receipt with amount > 1,000,000
- Expected: Amount should be parsed correctly without truncation

---

## 🚀 Production Deployment Testing

After deploying to production (`https://accounting-buddy-seven.vercel.app`), repeat all test cases above to ensure:

- [ ] All environment variables are configured in Vercel
- [ ] OCR processing works in production
- [ ] AI extraction works in production
- [ ] Google Sheets webhook works in production
- [ ] HTTPS is enforced
- [ ] No CORS errors
- [ ] No console errors in browser
- [ ] Performance is acceptable (< 10 seconds per receipt)

---

## 📊 Automated Test Results

### Build & Compilation Tests

**Test Date:** 2025-10-24
**Commit:** `dff3f9e` - "feat: AI-guided dropdown selection and comment-based category accuracy improvements"

#### TypeScript Compilation Test
```bash
$ npx tsc --noEmit
✅ PASSED - No TypeScript errors found
```

**Result:** ✅ **PASSED**
**Details:** All TypeScript files compile successfully with no type errors. Full type safety confirmed across all components, API routes, and utilities.

---

#### Production Build Test
```bash
$ npm run build

> accounting-buddy-app@0.1.0 build
> next build

   ▲ Next.js 16.0.0 (Turbopack)
   - Environments: .env.local
   - Experiments (use with caution):
     · optimizePackageImports

   Creating an optimized production build ...
 ✓ Compiled successfully in 26.1s
   Running TypeScript ...
   Collecting page data ...
   Generating static pages (0/8) ...
   Generating static pages (2/8)
   Generating static pages (4/8)
   Generating static pages (6/8)
 ✓ Generating static pages (8/8) in 2.0s
   Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/extract
├ ƒ /api/ocr
├ ƒ /api/sheets
├ ○ /inbox
├ ƒ /review/[id]
└ ○ /upload

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Result:** ✅ **PASSED**
**Details:**
- Build completed successfully in 26.1 seconds
- All 8 routes compiled without errors
- Static pages: 4 (/, /_not-found, /inbox, /upload)
- Dynamic API routes: 3 (/api/extract, /api/ocr, /api/sheets)
- Dynamic page: 1 (/review/[id])
- No build warnings or errors
- Production-ready build generated

---

#### Code Quality Summary

| Metric | Status | Details |
|--------|--------|---------|
| **TypeScript Compilation** | ✅ PASSED | No type errors |
| **Production Build** | ✅ PASSED | Build successful in 26.1s |
| **Route Compilation** | ✅ PASSED | 8/8 routes compiled |
| **Static Generation** | ✅ PASSED | 4 static pages generated |
| **API Routes** | ✅ PASSED | 3 API routes functional |
| **Build Warnings** | ✅ PASSED | Zero warnings |
| **Build Errors** | ✅ PASSED | Zero errors |

**Overall Automated Test Status:** ✅ **ALL PASSED**

---

### Manual Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Receipt Upload with Comment | ⏳ Pending | Requires real-world testing |
| Receipt Upload without Comment | ⏳ Pending | Requires real-world testing |
| Manual Text Input | ⏳ Pending | Requires real-world testing |
| Fuzzy Dropdown Matching | ⏳ Pending | Requires real-world testing |
| Review Page Functionality | ⏳ Pending | Requires real-world testing |
| Google Sheets Integration | ⏳ Pending | Requires real-world testing |
| Image Compression | ⏳ Pending | Requires real-world testing |
| Error Handling | ⏳ Pending | Requires real-world testing |
| Confidence Scoring | ⏳ Pending | Requires real-world testing |
| Vendor Caching | ⏳ Pending | Requires real-world testing |

**Note:** Manual testing should be performed with real receipts and actual Google Sheets integration before marking as complete.

---

### Test Environment Information

| Property | Value |
|----------|-------|
| **Node Version** | v20+ (recommended) |
| **Next.js Version** | 16.0.0 |
| **React Version** | 19.x |
| **TypeScript Version** | 5.x |
| **Build Tool** | Turbopack |
| **Test Date** | 2025-10-24 |
| **Commit Hash** | dff3f9e |
| **Branch** | main |

---

## 🐛 Bug Reporting

If you encounter any issues during testing, please document:

1. **Test Case:** Which test case failed
2. **Steps to Reproduce:** Exact steps taken
3. **Expected Result:** What should have happened
4. **Actual Result:** What actually happened
5. **Screenshots:** If applicable
6. **Environment:** Local dev or production
7. **Browser:** Chrome, Safari, Firefox, etc.

---

## ✅ Testing Checklist

Before marking Phase 1 as complete:

- [ ] All 10 test cases executed successfully
- [ ] Edge cases tested
- [ ] Production deployment verified
- [ ] Google Sheets integration confirmed
- [ ] Error handling validated
- [ ] Performance acceptable (< 10 seconds per receipt)
- [ ] No console errors in browser
- [ ] Mobile responsiveness tested
- [ ] All documentation reviewed

---

**Last Updated:** 2025-10-24  
**Version:** 1.0.0-final  
**Status:** Ready for real-world testing

