# 📱 MOBILE API INTEGRATION GUIDE
## Accounting Buddy iPhone App - Backend Integration

**Last Updated:** October 30, 2025  
**API Version:** 2.0  
**Base URL:** `https://accounting-buddy-app.vercel.app` (or your custom domain)

---

## 1️⃣ OVERVIEW

The **Accounting Buddy iPhone App** will communicate directly with the existing **Next.js API routes** hosted on Vercel. All data syncs through our **Google Sheets + Apps Script backend** — there is no separate database.

### Architecture Flow
```
iPhone App → Next.js API (Vercel) → Apps Script Webhook → Google Sheets
```

### Key Points
- ✅ **No Direct Google Sheets Access** - Mobile app only calls Next.js API endpoints
- ✅ **Shared Backend** - Same infrastructure as the webapp
- ✅ **Real-Time Sync** - All changes immediately reflected in Google Sheets
- ✅ **Stateless API** - No session management required
- ✅ **JSON-Based** - All requests and responses use JSON format

---

## 2️⃣ AUTHENTICATION

### Current Authentication Mechanism
The API uses a **shared secret** authentication model via the `SHEETS_WEBHOOK_SECRET` environment variable.

### Authentication Methods

**Option 1: No Authentication (Current - Public Endpoints)**
Most endpoints are currently **public** and do not require authentication headers. This is suitable for single-user applications.

**Option 2: Future Authentication (Recommended for Mobile)**
If you need to secure the mobile API, implement a custom authentication header:

```http
Authorization: Bearer <API_KEY>
```

### Endpoints Requiring Authentication
Currently, authentication is handled **internally** between the Next.js API and Apps Script webhook. The mobile app does **not** need to send authentication headers for most endpoints.

**Internal Authentication Flow:**
```
Mobile App → Next.js API (no auth) → Apps Script (secret in POST body)
```

### Security Recommendations
- ✅ Use HTTPS only (enforced by Vercel)
- ✅ Implement rate limiting on mobile app
- ✅ Validate all user inputs before sending to API
- ✅ Handle API errors gracefully

---

## 3️⃣ API ENDPOINTS & EXAMPLES

### Base URL
```
Production: https://accounting-buddy-app.vercel.app
Development: http://localhost:3000
```

### Core Endpoints Summary

| Endpoint | Method | Description | Auth Required | Cache |
|----------|--------|-------------|---------------|-------|
| `/api/ocr` | POST | Extract text from receipt image | No | None |
| `/api/extract` | POST | AI extraction from OCR text | No | None |
| `/api/sheets` | POST | Submit transaction to Google Sheets | No | None |
| `/api/inbox` | GET | Fetch all processed receipts | No | 5 sec |
| `/api/inbox` | DELETE | Delete a receipt by row number | No | None |
| `/api/pnl` | GET | Fetch P&L KPI data | No | 60 sec |
| `/api/pnl/property-person` | GET | Property expense breakdown | No | None |
| `/api/pnl/overhead-expenses` | GET | Overhead expense breakdown | No | None |
| `/api/balance/get` | GET/POST | Get all balances | No | 30 sec |
| `/api/balance/save` | POST | Save balance entry | No | None |
| `/api/balance/ocr` | POST | OCR for balance slips | No | None |

---

### 📸 **1. OCR - Extract Text from Receipt Image**

**Endpoint:** `POST /api/ocr`

**Description:** Extracts text from receipt image using Google Cloud Vision API.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "fileType": "image/jpeg"
}
```

**Request Fields:**
- `image` (string, required): Base64-encoded image with data URI prefix
- `fileType` (string, required): MIME type (`image/jpeg`, `image/png`, or `application/pdf`)

**Response (Success):**
```json
{
  "success": true,
  "text": "HomePro Samui\nDate: 15/10/2025\nTotal: 1,245 THB\nConstruction materials",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid file type. Only JPG, PNG, and PDF are supported."
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing image, invalid file type)
- `500` - OCR processing error

**Notes:**
- Supports JPG, PNG, PDF (max 10MB recommended)
- Processing time: 2-3 seconds
- Retry logic: 3 attempts with exponential backoff

---

### 🤖 **2. AI Extract - Extract Fields from Text**

**Endpoint:** `POST /api/extract`

**Description:** Uses OpenAI GPT-4o to extract structured data from OCR text or manual input.

**Request:**
```json
{
  "text": "HomePro Samui - 1,245 baht - construction materials for Alesia House",
  "comment": "construction materials"
}
```

**Request Fields:**
- `text` (string, required): OCR text or manual text input
- `comment` (string, optional): Additional context to guide AI extraction

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "day": "15",
    "month": "10",
    "year": "2025",
    "property": "Alesia House",
    "typeOfOperation": "EXP - Construction - Structure",
    "typeOfPayment": "Cash",
    "detail": "HomePro Samui - construction materials",
    "ref": "",
    "debit": 1245,
    "credit": 0,
    "confidence": {
      "property": 0.92,
      "typeOfOperation": 0.88,
      "typeOfPayment": 0.75
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "OpenAI API key not configured",
  "data": {
    "day": "",
    "month": "",
    "year": "",
    "property": "Sia Moon - Land - General",
    "typeOfOperation": "",
    "typeOfPayment": "",
    "detail": "",
    "ref": "",
    "debit": 0,
    "credit": 0
  }
}
```

**Status Codes:**
- `200` - Success (even with fallback data)
- `500` - API configuration error

**Notes:**
- Processing time: 2-5 seconds
- Confidence scores: <0.7 = low confidence (show warning)
- Fallback data returned if AI extraction fails

---

### 📤 **3. Submit Transaction - Save to Google Sheets**

**Endpoint:** `POST /api/sheets`

**Description:** Validates and submits transaction data to Google Sheets.

**Request:**
```json
{
  "day": "15",
  "month": "10",
  "year": "2025",
  "property": "Alesia House",
  "typeOfOperation": "EXP - Construction - Structure",
  "typeOfPayment": "Cash",
  "detail": "HomePro Samui - construction materials",
  "ref": "INV-12345",
  "debit": 1245,
  "credit": 0
}
```

**Request Fields (All Required):**
- `day` (string): Day (1-31)
- `month` (string): Month (1-12)
- `year` (string): Year (e.g., "2025")
- `property` (string): Property name (must match dropdown options)
- `typeOfOperation` (string): Category (must match dropdown options)
- `typeOfPayment` (string): Payment type (must match dropdown options)
- `detail` (string): Transaction description
- `ref` (string): Reference number (can be empty)
- `debit` (number): Debit amount (0 if credit transaction)
- `credit` (number): Credit amount (0 if debit transaction)

**Response (Success):**
```json
{
  "success": true,
  "message": "Receipt added to Google Sheet successfully"
}
```

**Response (Error - Validation):**
```json
{
  "success": false,
  "error": "Invalid category: \"\". Please select a valid category."
}
```

**Response (Error - Authentication):**
```json
{
  "success": false,
  "error": "Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET."
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error (invalid payload)
- `401` - Authentication error (wrong secret)
- `500` - Server error (webhook failure)

**Notes:**
- Server-side validation ensures data integrity
- Dropdown values are normalized to match canonical options
- Empty `typeOfOperation` is rejected

---

### 📥 **4. Inbox - Fetch All Receipts**

**Endpoint:** `GET /api/inbox`

**Description:** Fetches all processed receipts from Google Sheets.

**Request:** No body required

**Response (Success):**
```json
{
  "ok": true,
  "data": [
    {
      "rowNumber": 7,
      "day": "15",
      "month": "10",
      "year": "2025",
      "property": "Alesia House",
      "typeOfOperation": "EXP - Construction - Structure",
      "typeOfPayment": "Cash",
      "detail": "HomePro Samui - construction materials",
      "ref": "INV-12345",
      "debit": 1245,
      "credit": 0
    }
  ],
  "count": 1,
  "cached": false
}
```

**Response (Cached):**
```json
{
  "ok": true,
  "data": [...],
  "cached": true,
  "cacheAge": 3
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Notes:**
- Cache duration: 5 seconds
- Returns all transactions from Google Sheets
- `rowNumber` is used for deletion

---

### 🗑️ **5. Delete Receipt**

**Endpoint:** `DELETE /api/inbox`

**Description:** Deletes a specific receipt by row number.

**Request:**
```json
{
  "rowNumber": 7
}
```

**Response (Success):**
```json
{
  "ok": true,
  "success": true,
  "message": "Entry deleted successfully",
  "deletedRow": 7
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Row number is required"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing row number
- `500` - Server error

**Notes:**
- Invalidates inbox cache after deletion
- Row numbers are 1-based (matching Google Sheets)

---

### 📊 **6. P&L Dashboard - Fetch KPI Data**

**Endpoint:** `GET /api/pnl`

**Description:** Fetches P&L KPI data (revenue, overheads, GOP, EBITDA) for current month and year.

**Request:** No body required

**Response (Success):**
```json
{
  "ok": true,
  "data": {
    "month": {
      "revenue": 125000,
      "overheads": 45000,
      "propertyPersonExpense": 30000,
      "gop": 50000,
      "ebitdaMargin": 40.0
    },
    "year": {
      "revenue": 1250000,
      "overheads": 450000,
      "propertyPersonExpense": 300000,
      "gop": 500000,
      "ebitdaMargin": 40.0
    },
    "updatedAt": "2025-10-30T10:30:00.000Z"
  },
  "cached": false,
  "warnings": [],
  "computedFallbacks": []
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Notes:**
- Cache duration: 60 seconds
- All amounts in Thai Baht (THB)
- EBITDA margin as percentage (0-100)

---

### 💰 **7. Balance - Get All Balances**

**Endpoint:** `GET /api/balance/get` or `POST /api/balance/get`

**Description:** Fetches latest balances for all banks and cash.

**Request:** No body required

**Response (Success):**
```json
{
  "ok": true,
  "balances": [
    {
      "bankName": "Cash",
      "balance": 15000,
      "lastUpdated": "2025-10-30T10:00:00.000Z"
    },
    {
      "bankName": "Bank Transfer - Bangkok Bank - Shaun Ducker",
      "balance": 250000,
      "lastUpdated": "2025-10-30T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Notes:**
- Cache duration: 30 seconds
- Supports both GET and POST methods

---

### 💾 **8. Balance - Save Balance Entry**

**Endpoint:** `POST /api/balance/save`

**Description:** Saves a new balance entry for a specific bank or cash.

**Request:**
```json
{
  "bankName": "Cash",
  "balance": 15000,
  "note": "End of day count"
}
```

**Request Fields:**
- `bankName` (string, required): Bank name or "Cash"
- `balance` (number, required): Balance amount (must be >= 0)
- `note` (string, optional): Optional note

**Response (Success):**
```json
{
  "ok": true,
  "message": "Balance saved successfully",
  "savedData": {
    "bankName": "Cash",
    "balance": 15000
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid balance value"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `500` - Server error

**Notes:**
- Balance must be a positive number
- Invalidates balance cache after save

---

## 4️⃣ DATA MODEL

### Transaction Schema (10 Fields)

All transactions use this standardized 10-field schema:

```typescript
interface Transaction {
  day: string;           // "1" to "31"
  month: string;         // "1" to "12"
  year: string;          // "2025"
  property: string;      // Must match dropdown options
  typeOfOperation: string; // Must match dropdown options
  typeOfPayment: string; // Must match dropdown options
  detail: string;        // Free text description
  ref: string;           // Reference number (optional)
  debit: number;         // Debit amount (0 if credit)
  credit: number;        // Credit amount (0 if debit)
}
```

### Dropdown Options

**⚠️ CRITICAL: These are the EXACT dropdown values as of October 30, 2025.**
**All values are case-sensitive and must match exactly (including spaces and special characters).**

**Properties (7 options):**
```
1. Sia Moon - Land - General
2. Alesia House
3. Lanna House
4. Parents House
5. Shaun Ducker - Personal
6. Maria Ren - Personal
7. Family
```

**Type of Operation (33 options):**
```
REVENUES (4 options):
1. Revenue - Commision  ⚠️ Note: "Commision" is misspelled in Google Sheets - use this exact spelling
2. Revenue - Sales
3. Revenue - Services
4. Revenue - Rental Income

UTILITIES (3 options):
5. EXP - Utilities - Gas
6. EXP - Utilities - Water
7. EXP - Utilities  - Electricity  ⚠️ Note: TWO spaces before "Electricity" - use exact spacing

OVERHEAD EXPENSES (1 option):
8. OVERHEAD EXPENSES

ADMINISTRATION & GENERAL (4 options):
9. EXP - Administration & General - License & Certificates
10. EXP - Administration & General - Legal
11. EXP - Administration & General - Professional fees
12. EXP - Administration & General - Office supplies
13. EXP - Administration & General  - Subscription, Software & Membership

CONSTRUCTION (3 options):
14. EXP - Construction - Structure
15. EXP - Construction - Overheads/General/Unclassified
16. EXP - Construction - Electric Supplies
17. EXP - Construction - Wall

HR (1 option):
18. EXP - HR - Employees Salaries

APPLIANCES & HARDWARE (2 options):
19. EXP - Appliances & Electronics
20. EXP - Windows, Doors, Locks & Hardware

REPAIRS & MAINTENANCE (5 options):
21. EXP - Repairs & Maintenance  - Furniture & Decorative Items
22. EXP - Repairs & Maintenance  - Waste removal
23. EXP - Repairs & Maintenance - Tools & Equipment
24. EXP - Repairs & Maintenance - Painting & Decoration
25. EXP - Repairs & Maintenance - Electrical & Mechanical
26. EXP - Repairs & Maintenance - Landscaping

SALES & MARKETING (1 option):
27. EXP - Sales & Marketing -  Professional Marketing Services

OTHER EXPENSES (1 option):
28. EXP - Other Expenses

PERSONAL EXPENSES (1 option):
29. EXP - Personal - Massage

HOUSEHOLD EXPENSES (4 options):
30. EXP - Household - Alcohol
31. EXP - Household - Groceries
32. EXP - Household - Nappies
33. EXP - Household - Toiletries
```

**Type of Payment (4 options):**
```
1. Bank Transfer - Bangkok Bank - Shaun Ducker
2. Bank Transfer - Bangkok Bank - Maria Ren
3. Bank transfer - Krung Thai Bank - Family Account
4. Cash
```

### Sample Payloads

**Debit Transaction (Expense):**
```json
{
  "day": "15",
  "month": "10",
  "year": "2025",
  "property": "Alesia House",
  "typeOfOperation": "EXP - Construction - Structure",
  "typeOfPayment": "Cash",
  "detail": "HomePro Samui - construction materials",
  "ref": "INV-12345",
  "debit": 1245,
  "credit": 0
}
```

**Credit Transaction (Revenue):**
```json
{
  "day": "1",
  "month": "10",
  "year": "2025",
  "property": "Lanna House",
  "typeOfOperation": "Revenue - Rental Income",
  "typeOfPayment": "Bank Transfer - Bangkok Bank - Shaun Ducker",
  "detail": "October rent - Lanna House",
  "ref": "RENT-OCT-2025",
  "debit": 0,
  "credit": 25000
}
```

---

### Important Notes for Mobile Developers

**1. Dropdown Values are Case-Sensitive**
- All dropdown values must match EXACTLY (including spaces, capitalization, special characters)
- Example: `"Bank Transfer - Bangkok Bank - Shaun Ducker"` ≠ `"bank transfer - bangkok bank - shaun ducker"`
- Example: `"EXP - Utilities  - Electricity"` has TWO spaces before "Electricity" (this is correct)

**2. Misspellings in Source Data**
- `"Revenue - Commision"` is misspelled in Google Sheets (should be "Commission")
- Use the exact spelling from the dropdown list above
- Do NOT auto-correct these values

**3. Fetching Live Dropdown Options**
Currently, there is no dedicated API endpoint to fetch dropdown options. Mobile app should:
- **Option A:** Hardcode the dropdown options from this document (recommended for v1)
- **Option B:** Fetch from config files via GitHub API (advanced)
- **Option C:** Request a new `/api/config` endpoint from backend team (future enhancement)

**4. Validation Strategy**
Before submitting a transaction:
- Validate that `property` matches one of the 7 property options
- Validate that `typeOfOperation` matches one of the 33 operation options
- Validate that `typeOfPayment` matches one of the 4 payment options
- Show error to user if validation fails (don't submit invalid data)

**5. Handling Dropdown Updates**
If dropdown options change in Google Sheets:
- Backend team will run `npm run sync` to update config files
- Mobile app will need to update hardcoded values in next release
- Consider implementing a version check mechanism

---

## 5️⃣ SYNC & CACHING

### Sync System Overview

The webapp uses a sync script (`sync-sheets.js`) to keep dropdown options, keywords, and named ranges synchronized with Google Sheets.

**Sync Process (8 Phases):**
1. Scan "Data" sheet for dropdown options
2. Scan "P&L (DO NOT EDIT)" sheet structure
3. Scan named ranges
4. Compare with current configuration
5. Generate AI keywords for new items
6. Update config files (3 files)
7. Update Apps Script configuration
8. Generate sync report

### Mobile App Sync Strategy

**Important:** The mobile app **does NOT sync directly** with Google Sheets.

**Mobile App Flow:**
```
Mobile App → Next.js API → Apps Script → Google Sheets
```

**Dropdown Options:**
- Mobile app should fetch dropdown options from `/api/sheets` health check endpoint (future enhancement)
- Or hardcode current options and update with app releases
- Or implement a `/api/config` endpoint to fetch live dropdown options

### Caching Strategy

| Endpoint | Cache Duration | Cache Location |
|----------|----------------|----------------|
| `/api/inbox` | 5 seconds | Server (in-memory) |
| `/api/pnl` | 60 seconds | Server (in-memory) |
| `/api/balance/get` | 30 seconds | Server (in-memory) |
| `/api/ocr` | None | N/A |
| `/api/extract` | None | N/A |
| `/api/sheets` | None | N/A |

**Mobile App Caching Recommendations:**
- Cache dropdown options locally (update weekly)
- Cache P&L data for 60 seconds (match server cache)
- Cache balance data for 30 seconds (match server cache)
- Do NOT cache transaction submissions

---

## 6️⃣ ERROR HANDLING

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

Or:

```json
{
  "ok": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Process response data |
| `400` | Bad Request | Show validation error to user |
| `401` | Unauthorized | Check authentication (rare) |
| `429` | Rate Limited | Retry with exponential backoff |
| `500` | Server Error | Show generic error, retry |

### Common Error Messages

**Validation Errors (400):**
```json
{ "error": "Invalid category: \"\". Please select a valid category." }
{ "error": "Row number is required" }
{ "error": "Invalid balance value" }
```

**Configuration Errors (500):**
```json
{ "error": "OpenAI API key not configured" }
{ "error": "Webhook endpoint not configured" }
{ "error": "Balance service not configured" }
```

**Authentication Errors (401):**
```json
{ "error": "Webhook authentication failed" }
```

### Retry Logic

**OCR Endpoint (`/api/ocr`):**
- Automatic retry: 3 attempts
- Delays: 1s, 2s, 4s (exponential backoff)
- Triggers: 429 (rate limit), 500 (server error)

**Mobile App Recommendations:**
- Implement retry for 500 errors (max 3 attempts)
- Implement exponential backoff for 429 errors
- Show user-friendly error messages
- Log errors for debugging

### Error Handling Example (Swift)

```swift
func handleAPIError(statusCode: Int, errorMessage: String) {
    switch statusCode {
    case 400:
        // Validation error - show to user
        showAlert(title: "Invalid Data", message: errorMessage)
    case 401:
        // Authentication error - rare, log and retry
        print("Auth error: \\(errorMessage)")
    case 429:
        // Rate limited - retry with backoff
        retryWithBackoff()
    case 500:
        // Server error - retry or show generic error
        showAlert(title: "Server Error", message: "Please try again later")
    default:
        showAlert(title: "Error", message: errorMessage)
    }
}
```

---

## 7️⃣ TESTING & VERIFICATION

### Testing with cURL

**1. Test OCR Endpoint:**
```bash
curl -X POST https://accounting-buddy-app.vercel.app/api/ocr \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "fileType": "image/jpeg"
  }'
```

**2. Test AI Extract Endpoint:**
```bash
curl -X POST https://accounting-buddy-app.vercel.app/api/extract \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "HomePro Samui - 1,245 baht - construction materials",
    "comment": "construction"
  }'
```

**3. Test Submit Transaction:**
```bash
curl -X POST https://accounting-buddy-app.vercel.app/api/sheets \\
  -H "Content-Type: application/json" \\
  -d '{
    "day": "15",
    "month": "10",
    "year": "2025",
    "property": "Alesia House",
    "typeOfOperation": "EXP - Construction - Structure",
    "typeOfPayment": "Cash",
    "detail": "Test transaction",
    "ref": "",
    "debit": 100,
    "credit": 0
  }'
```

**4. Test Fetch Inbox:**
```bash
curl -X GET https://accounting-buddy-app.vercel.app/api/inbox
```

**5. Test Fetch P&L:**
```bash
curl -X GET https://accounting-buddy-app.vercel.app/api/pnl
```

**6. Test Fetch Balances:**
```bash
curl -X GET https://accounting-buddy-app.vercel.app/api/balance/get
```

### Postman Collection

Import this JSON to test all endpoints:

```json
{
  "info": {
    "name": "Accounting Buddy Mobile API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "OCR - Extract Text",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/ocr",
        "body": {
          "mode": "raw",
          "raw": "{\"image\":\"data:image/jpeg;base64,...\",\"fileType\":\"image/jpeg\"}"
        }
      }
    },
    {
      "name": "AI Extract",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/extract",
        "body": {
          "mode": "raw",
          "raw": "{\"text\":\"HomePro - 1245 baht\",\"comment\":\"construction\"}"
        }
      }
    },
    {
      "name": "Submit Transaction",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/sheets",
        "body": {
          "mode": "raw",
          "raw": "{\"day\":\"15\",\"month\":\"10\",\"year\":\"2025\",\"property\":\"Alesia House\",\"typeOfOperation\":\"EXP - Construction - Structure\",\"typeOfPayment\":\"Cash\",\"detail\":\"Test\",\"ref\":\"\",\"debit\":100,\"credit\":0}"
        }
      }
    },
    {
      "name": "Fetch Inbox",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/inbox"
      }
    },
    {
      "name": "Fetch P&L",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/pnl"
      }
    },
    {
      "name": "Fetch Balances",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/balance/get"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://accounting-buddy-app.vercel.app"
    }
  ]
}
```

### Rate Limits & Quotas

**Vercel Limits (Free Tier):**
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- No request rate limit

**Google Cloud Vision API:**
- 1,000 requests/month free
- Then $1.50 per 1,000 requests

**OpenAI API:**
- Pay-as-you-go pricing
- ~$0.01 per receipt extraction

**Recommendations:**
- Implement client-side rate limiting (max 10 requests/minute)
- Cache dropdown options locally
- Batch requests when possible

---

## 8️⃣ ENVIRONMENT VARIABLES (REFERENCE)

### Required Environment Variables

These variables are configured on the **Vercel backend** and are **NOT** needed by the mobile app:

```bash
# Google Cloud Vision API (for OCR)
GOOGLE_VISION_KEY=AIza...

# OpenAI API (for AI extraction)
OPENAI_API_KEY=sk-proj-...

# Google Sheets Webhook (Apps Script)
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3...

# Google Sheet ID (for sync script)
GOOGLE_SHEET_ID=1UnCopz...

# P&L Endpoint (same as webhook)
SHEETS_PNL_URL=https://script.google.com/macros/s/.../exec

# Balance Endpoints (same as webhook)
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/.../exec
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/.../exec
```

### Environment Variables Used by Each Endpoint

| Endpoint | Variables Used |
|----------|----------------|
| `/api/ocr` | `GOOGLE_VISION_KEY` |
| `/api/extract` | `OPENAI_API_KEY` |
| `/api/sheets` | `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET` |
| `/api/inbox` | `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET` |
| `/api/pnl` | `SHEETS_PNL_URL`, `SHEETS_WEBHOOK_SECRET` |
| `/api/balance/get` | `SHEETS_BALANCES_GET_URL`, `SHEETS_WEBHOOK_SECRET` |
| `/api/balance/save` | `SHEETS_BALANCES_APPEND_URL`, `SHEETS_WEBHOOK_SECRET` |

---

## 9️⃣ MOBILE APP DEVELOPMENT CHECKLIST

### Phase 1: Core Receipt Processing
- [ ] Implement camera capture
- [ ] Implement image picker
- [ ] Call `/api/ocr` with base64 image
- [ ] Call `/api/extract` with OCR text
- [ ] Display extracted data in review form
- [ ] Implement 10-field edit form
- [ ] Call `/api/sheets` to submit transaction
- [ ] Handle success/error states

### Phase 2: Inbox & History
- [ ] Call `/api/inbox` to fetch receipts
- [ ] Display receipts in list view
- [ ] Implement pull-to-refresh
- [ ] Implement delete functionality (`DELETE /api/inbox`)
- [ ] Handle cache states

### Phase 3: P&L Dashboard
- [ ] Call `/api/pnl` to fetch KPIs
- [ ] Display 8 KPI cards (month/year)
- [ ] Implement property breakdown view
- [ ] Implement overhead breakdown view
- [ ] Handle cache and refresh

### Phase 4: Balance Tracking
- [ ] Call `/api/balance/get` to fetch balances
- [ ] Display balances by bank/cash
- [ ] Implement balance entry form
- [ ] Call `/api/balance/save` to save balance
- [ ] Implement OCR for balance slips

### Phase 5: Polish & UX
- [ ] Implement error handling
- [ ] Implement retry logic
- [ ] Add loading states
- [ ] Add offline detection
- [ ] Implement local caching
- [ ] Add haptic feedback
- [ ] Implement dark mode

---

## 🔟 SUPPORT & RESOURCES

### Documentation
- [PROJECT_MANAGER_REPORT.md](./PROJECT_MANAGER_REPORT.md) - Complete project overview
- [FILE_INVENTORY.md](./FILE_INVENTORY.md) - Detailed file inventory
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Test suite documentation
- [README.md](./README.md) - Project README

### API Source Code
All API routes are located in:
```
app/api/
├── ocr/route.ts
├── extract/route.ts
├── sheets/route.ts
├── inbox/route.ts
├── pnl/route.ts
├── balance/get/route.ts
└── balance/save/route.ts
```

### Contact & Support
- **Repository:** https://github.com/TOOL2U/AccountingBuddy
- **Issues:** https://github.com/TOOL2U/AccountingBuddy/issues
- **Deployment:** Vercel Dashboard

---

## ✅ QUICK START GUIDE

### 1. Test API Connectivity
```bash
curl https://accounting-buddy-app.vercel.app/api/sheets
```

Expected response:
```json
{
  "status": "ok",
  "service": "Google Sheets Webhook",
  "configured": true,
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

### 2. Test Receipt Upload Flow
1. Capture receipt image
2. Convert to base64 with data URI
3. POST to `/api/ocr`
4. POST OCR text to `/api/extract`
5. Display extracted data in review form
6. POST validated data to `/api/sheets`

### 3. Test Inbox Fetch
```bash
curl https://accounting-buddy-app.vercel.app/api/inbox
```

### 4. Test P&L Fetch
```bash
curl https://accounting-buddy-app.vercel.app/api/pnl
```

---

**Document Version:** 1.0  
**Last Updated:** October 30, 2025  
**Maintained By:** Accounting Buddy Webapp Team

**Ready to build! 🚀**

