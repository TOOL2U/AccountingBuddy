# 🔌 Mobile App ↔ Webapp Backend Connectivity Checklist

**From:** Mobile App Team  
**To:** Webapp Team & Project Manager  
**Date:** October 30, 2025  
**Subject:** Complete Requirements for Mobile-Webapp Connection

---

## 📋 Executive Summary

This document outlines **EXACTLY** what the mobile app needs from the webapp backend to establish full connectivity. Once these requirements are met, we will run comprehensive tests to verify the connection.

---

## 🎯 What Mobile App Needs from Webapp Team

### 1. ✅ **Base URL** (CONFIRMED)

**Status:** ✅ **CONFIGURED**

```
Base URL: https://accounting-buddy-app.vercel.app/api
```

**Mobile App Configuration:**
- File: `.env`
- Variable: `API_BASE_URL=https://accounting-buddy-app.vercel.app/api`
- Status: ✅ Set correctly

---

### 2. ⚠️ **Authentication Secret** (MISSING)

**Status:** ⚠️ **NEEDS WEBAPP TEAM INPUT**

**What we need:**
- The `SHEETS_WEBHOOK_SECRET` value that the webapp uses to authenticate with Google Sheets

**Why we need it:**
- Some endpoints may require authentication headers
- We need to match the webapp's authentication mechanism

**Where it goes:**
- File: `.env`
- Variable: `AUTH_SECRET=<value_from_webapp_team>`

**Current Status:**
```env
AUTH_SECRET=
```
☝️ **This is empty - we need the webapp team to provide this value**

**Question for Webapp Team:**
- Do we need to send this secret in request headers?
- If yes, what header name? (e.g., `X-Auth-Secret`, `Authorization`, etc.)
- Or is this only used server-side by the webapp?

---

### 3. ✅ **API Endpoints** (CONFIRMED)

**Status:** ✅ **ALL ENDPOINTS IDENTIFIED**

The mobile app calls these 8 endpoints:

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 1 | `/api/ocr` | POST | Extract text from receipt image | ✅ Configured |
| 2 | `/api/extract` | POST | AI field extraction from text | ✅ Configured |
| 3 | `/api/sheets` | POST | Submit transaction to Google Sheets | ✅ Configured |
| 4 | `/api/inbox` | GET | Fetch all transactions | ✅ Configured |
| 5 | `/api/inbox` | DELETE | Delete transaction by row number | ✅ Configured |
| 6 | `/api/pnl` | GET | Get P&L KPI data | ⚠️ Needs env vars |
| 7 | `/api/balance/get` | GET | Get all balances | ⚠️ Needs env vars |
| 8 | `/api/balance/save` | POST | Save balance entry | ⚠️ Needs env vars |

**Webapp Team Action Required:**
- Confirm endpoints 6, 7, 8 are configured with environment variables on Vercel
- Confirm all endpoints are accessible from mobile app

---

### 4. ⚠️ **Environment Variables on Vercel** (WEBAPP TEAM ACTION)

**Status:** ⚠️ **WAITING FOR WEBAPP TEAM**

According to the webapp team's response, these environment variables need to be configured on Vercel:

```bash
SHEETS_WEBHOOK_URL=<google_apps_script_webhook_url>
SHEETS_WEBHOOK_SECRET=<authentication_secret>
SHEETS_PNL_URL=<same_webhook_url_with_action_param>
SHEETS_BALANCES_GET_URL=<same_webhook_url_with_action_param>
SHEETS_BALANCES_APPEND_URL=<same_webhook_url_with_action_param>
```

**Webapp Team: Please confirm:**
- ✅ Are these variables configured on Vercel?
- ✅ Has Vercel been redeployed after configuration?
- ✅ Are all 8 endpoints now working?

---

### 5. ✅ **Request/Response Formats** (CONFIRMED)

**Status:** ✅ **MOBILE APP MATCHES WEBAPP EXPECTATIONS**

#### Example 1: Submit Transaction (`POST /api/sheets`)

**Mobile App Sends:**
```json
{
  "day": "30",
  "month": "10",
  "year": "2025",
  "property": "Alesia House",
  "typeOfOperation": "EXP - Utilities - Water",
  "typeOfPayment": "Cash",
  "detail": "Water bill October",
  "ref": "WB-2025-10",
  "debit": "500",
  "credit": ""
}
```

**Webapp Should Return:**
```json
{
  "ok": true,
  "message": "Transaction submitted successfully"
}
```

#### Example 2: Get P&L Data (`GET /api/pnl`)

**Mobile App Expects:**
```json
{
  "totalRevenue": 150000,
  "totalExpenses": 75000,
  "netIncome": 75000,
  "revenueByCategory": [
    { "category": "Revenue - Rental Income", "amount": 100000 },
    { "category": "Revenue - Services", "amount": 50000 }
  ],
  "expensesByCategory": [
    { "category": "EXP - Utilities - Water", "amount": 5000 },
    { "category": "EXP - Utilities - Electricity", "amount": 10000 }
  ]
}
```

#### Example 3: Get Balances (`GET /api/balance/get`)

**Mobile App Expects:**
```json
{
  "balances": [
    {
      "date": "2025-10-30",
      "property": "Alesia House",
      "balance": 50000,
      "notes": "Monthly balance"
    }
  ]
}
```

**Webapp Team: Please confirm these formats are correct.**

---

### 6. ✅ **Dropdown Values** (CONFIRMED)

**Status:** ✅ **MOBILE APP MATCHES GOOGLE SHEETS EXACTLY**

The mobile app uses these exact values (including misspellings and spacing):

**Properties (7 options):**
- Sia Moon - Land - General
- Alesia House
- Lanna House
- Parents House
- Shaun Ducker - Personal
- Maria Ren - Personal
- Family

**Type of Operations (33 options):**
- Revenue - Commision ⚠️ (misspelled - matches sheets)
- Revenue - Sales
- Revenue - Services
- Revenue - Rental Income
- EXP - Utilities - Gas
- EXP - Utilities - Water
- EXP - Utilities  - Electricity ⚠️ (double space - matches sheets)
- ... (all 33 categories)

**Type of Payments (4 options):**
- Bank Transfer - Bangkok Bank - Shaun Ducker
- Bank Transfer - Bangkok Bank - Maria Ren
- Bank transfer - Krung Thai Bank - Family Account ⚠️ (lowercase "transfer" - matches sheets)
- Cash

**Webapp Team: These values are verified and match your Google Sheets exactly.**

---

### 7. ⚠️ **CORS Configuration** (NEEDS VERIFICATION)

**Status:** ⚠️ **NEEDS WEBAPP TEAM CONFIRMATION**

**Question for Webapp Team:**
- Are CORS headers configured on Vercel to allow mobile app requests?
- Do we need to whitelist any origins?
- Are preflight OPTIONS requests handled correctly?

**Expected CORS Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Mobile App Note:** We're using React Native (not web browser), so CORS might not apply. But please confirm.

---

### 8. ⚠️ **Error Response Format** (NEEDS CONFIRMATION)

**Status:** ⚠️ **NEEDS WEBAPP TEAM CONFIRMATION**

**Mobile App Expects Errors in This Format:**
```json
{
  "error": "Error message here",
  "message": "Detailed error description"
}
```

**Current Mobile App Error Handling:**
```typescript
const message = axiosError.response?.data?.error || 
               axiosError.response?.data?.message || 
               axiosError.message || 
               'An unknown error occurred';
```

**Webapp Team: Please confirm your error responses match this format.**

---

## 🧪 Testing Plan - Once Requirements Are Met

### Phase 1: Individual Endpoint Testing (30 minutes)

**Test 1: OCR Endpoint**
```bash
POST /api/ocr
Body: { "image": "<base64_image>", "fileType": "image/jpeg" }
Expected: { "text": "extracted text..." }
```

**Test 2: Extract Endpoint**
```bash
POST /api/extract
Body: { "text": "receipt text...", "comment": "optional" }
Expected: { "day": "30", "month": "10", ... }
```

**Test 3: Sheets Endpoint**
```bash
POST /api/sheets
Body: { "day": "30", "month": "10", "year": "2025", ... }
Expected: { "ok": true, "message": "..." }
```

**Test 4: Inbox GET**
```bash
GET /api/inbox
Expected: { "receipts": [...] }
```

**Test 5: Inbox DELETE**
```bash
DELETE /api/inbox
Body: { "rowNumber": 123 }
Expected: { "ok": true, "message": "..." }
```

**Test 6: P&L Endpoint**
```bash
GET /api/pnl
Expected: { "totalRevenue": 0, "totalExpenses": 0, ... }
```

**Test 7: Balance GET**
```bash
GET /api/balance/get
Expected: { "balances": [...] }
```

**Test 8: Balance SAVE**
```bash
POST /api/balance/save
Body: { "date": "2025-10-30", "property": "Alesia House", ... }
Expected: { "ok": true, "message": "..." }
```

---

### Phase 2: End-to-End Flow Testing (30 minutes)

**Test Flow 1: Upload Receipt → Submit Transaction**
1. Take photo of receipt
2. Call `/api/ocr` to extract text
3. Call `/api/extract` to get fields
4. Review extracted data
5. Call `/api/sheets` to submit
6. Verify transaction appears in Google Sheets
7. Call `/api/inbox` to verify it's in inbox

**Test Flow 2: Manual Entry → Submit Transaction**
1. Fill out manual entry form
2. Select property, category, payment type from dropdowns
3. Call `/api/sheets` to submit
4. Verify transaction appears in Google Sheets

**Test Flow 3: View P&L Dashboard**
1. Call `/api/pnl` to get data
2. Verify KPIs display correctly
3. Verify revenue/expense breakdowns

**Test Flow 4: View & Manage Balances**
1. Call `/api/balance/get` to fetch balances
2. Add new balance entry
3. Call `/api/balance/save` to submit
4. Verify balance appears in Google Sheets

**Test Flow 5: Inbox Management**
1. Call `/api/inbox` to fetch transactions
2. Select transaction to delete
3. Call `DELETE /api/inbox` with row number
4. Verify transaction is removed from Google Sheets

---

### Phase 3: Error Handling Testing (15 minutes)

**Test Error 1: Invalid Data**
- Submit transaction with invalid category
- Expected: Error message explaining invalid category

**Test Error 2: Missing Required Fields**
- Submit transaction without required fields
- Expected: Error message listing missing fields

**Test Error 3: Network Timeout**
- Simulate slow network
- Expected: Retry logic kicks in (3 attempts)

**Test Error 4: Server Error (500)**
- Trigger server error
- Expected: Retry logic kicks in, then show error

---

## ✅ Checklist for Webapp Team

Before we start testing, please confirm:

- [ ] **Environment Variables Configured on Vercel**
  - [ ] `SHEETS_WEBHOOK_URL`
  - [ ] `SHEETS_WEBHOOK_SECRET`
  - [ ] `SHEETS_PNL_URL`
  - [ ] `SHEETS_BALANCES_GET_URL`
  - [ ] `SHEETS_BALANCES_APPEND_URL`

- [ ] **Vercel Redeployed** after environment variable changes

- [ ] **All 8 Endpoints Working**
  - [ ] `/api/ocr` (POST)
  - [ ] `/api/extract` (POST)
  - [ ] `/api/sheets` (POST)
  - [ ] `/api/inbox` (GET)
  - [ ] `/api/inbox` (DELETE)
  - [ ] `/api/pnl` (GET)
  - [ ] `/api/balance/get` (GET)
  - [ ] `/api/balance/save` (POST)

- [ ] **Authentication Secret Provided** (if needed by mobile app)

- [ ] **Error Response Format Confirmed**

- [ ] **CORS Configuration Confirmed** (if applicable)

---

## ✅ Checklist for Mobile Team

Before we start testing, we confirm:

- [x] **Base URL Configured** (`https://accounting-buddy-app.vercel.app/api`)
- [x] **All 8 Endpoints Configured** in `src/config/api.ts`
- [x] **Dropdown Values Match Google Sheets** (all 33 categories, 7 properties, 4 payment types)
- [x] **Request/Response Formats Implemented** correctly
- [x] **Error Handling Implemented** with retry logic
- [x] **Timeout Configured** (30 seconds)
- [x] **Retry Logic Configured** (3 attempts, exponential backoff)
- [ ] **Authentication Secret Configured** (waiting for webapp team)

---

## 📞 Communication Protocol

### For Webapp Team:

**Please reply to this document with:**

1. ✅ Confirmation that all environment variables are configured
2. ✅ Confirmation that Vercel has been redeployed
3. ✅ The `SHEETS_WEBHOOK_SECRET` value (if mobile app needs it)
4. ✅ Confirmation of error response format
5. ✅ Any additional requirements we missed

### For Mobile Team:

**We will:**

1. ✅ Wait for webapp team confirmation
2. ✅ Configure authentication secret (if provided)
3. ✅ Run all tests from Phase 1, 2, and 3
4. ✅ Document test results
5. ✅ Report any issues to webapp team

---

## 🎯 Success Criteria

**We will consider the mobile app "fully connected" when:**

1. ✅ All 8 endpoints return successful responses
2. ✅ Transactions submitted from mobile app appear in Google Sheets
3. ✅ P&L data displays correctly in mobile app
4. ✅ Balance data displays correctly in mobile app
5. ✅ Inbox data displays correctly in mobile app
6. ✅ Delete functionality works correctly
7. ✅ Error handling works correctly
8. ✅ Retry logic works correctly

---

## 📊 Next Steps

### Immediate (Waiting for Webapp Team):
1. Webapp team confirms environment variables are configured
2. Webapp team provides authentication secret (if needed)
3. Webapp team confirms all endpoints are working

### After Webapp Team Confirmation:
1. Mobile team configures authentication secret
2. Mobile team runs Phase 1 tests (individual endpoints)
3. Mobile team runs Phase 2 tests (end-to-end flows)
4. Mobile team runs Phase 3 tests (error handling)
5. Mobile team documents results
6. Both teams review results together

---

**Mobile App Team**  
**Status:** Ready to Test - Waiting for Webapp Team Confirmation  
**Last Updated:** October 30, 2025

