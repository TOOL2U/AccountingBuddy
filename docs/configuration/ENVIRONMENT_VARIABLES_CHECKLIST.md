# 🔧 Environment Variables Checklist for Vercel

**Date:** October 30, 2025  
**Purpose:** Ensure all environment variables are configured for mobile app integration  
**Priority:** HIGH - Mobile team is waiting

---

## 📋 Required Environment Variables

### ✅ Core Variables (Already Configured)

These should already be set on Vercel:

```bash
# Google Cloud Vision API (for OCR)
GOOGLE_VISION_KEY=AIzaSy...

# OpenAI API (for AI extraction)
OPENAI_API_KEY=sk-proj-...

# Google Sheets Webhook (Apps Script)
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3...

# Google Sheet ID (for sync operations)
GOOGLE_SHEET_ID=1UnCopz...
```

---

### ⚠️ Additional Variables (May Need Configuration)

These variables are referenced in the code but should **point to the SAME webhook URL**:

```bash
# P&L Endpoint (should be same as SHEETS_WEBHOOK_URL)
SHEETS_PNL_URL=https://script.google.com/macros/s/AKfycbxxx.../exec

# Balance Endpoints (should be same as SHEETS_WEBHOOK_URL)
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
```

**Important:** All three variables above should have the **EXACT SAME VALUE** as `SHEETS_WEBHOOK_URL`.

---

## 🔍 Why Multiple Variables for Same URL?

**Historical Reason:**
- Initially planned to have separate Apps Script deployments for each feature
- Later consolidated to ONE webhook with different `action` parameters
- Variable names were kept for backward compatibility

**Current Architecture:**
```
All operations → SHEETS_WEBHOOK_URL with different actions:
- action: "getPnL" → P&L data
- action: "balancesGetLatest" → Balance data
- action: "balancesAppend" → Save balance
- action: "getInbox" → Inbox data
- action: "appendData" → Submit transaction
```

---

## ✅ Action Items

### 1. Check Vercel Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

**Verify these are set:**
- [ ] `GOOGLE_VISION_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `SHEETS_WEBHOOK_URL`
- [ ] `SHEETS_WEBHOOK_SECRET`
- [ ] `GOOGLE_SHEET_ID`

### 2. Add Missing Variables (If Needed)

If `SHEETS_PNL_URL`, `SHEETS_BALANCES_GET_URL`, or `SHEETS_BALANCES_APPEND_URL` are missing:

**Option A: Add them (Quick Fix)**
```bash
SHEETS_PNL_URL=<same value as SHEETS_WEBHOOK_URL>
SHEETS_BALANCES_GET_URL=<same value as SHEETS_WEBHOOK_URL>
SHEETS_BALANCES_APPEND_URL=<same value as SHEETS_WEBHOOK_URL>
```

**Option B: Refactor code (Better Long-term)**
- Update API routes to use `SHEETS_WEBHOOK_URL` everywhere
- Remove references to separate URL variables
- Update `.env.example` to reflect single webhook URL

---

## 🧪 Testing After Configuration

### Test P&L Endpoint
```bash
curl https://accounting-buddy-app.vercel.app/api/pnl
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "monthKPIs": { ... },
    "yearKPIs": { ... }
  }
}
```

**Error Response (if not configured):**
```json
{
  "ok": false,
  "error": "P&L endpoint not configured. Please set SHEETS_PNL_URL in environment variables."
}
```

---

### Test Balance Endpoint
```bash
curl https://accounting-buddy-app.vercel.app/api/balance/get
```

**Expected Response:**
```json
{
  "balances": [
    {
      "bankName": "Bangkok Bank - Shaun Ducker",
      "balance": 50000,
      "date": "2025-10-30"
    }
  ]
}
```

**Error Response (if not configured):**
```json
{
  "error": "Balance service not configured"
}
```

---

### Test Inbox Endpoint
```bash
curl https://accounting-buddy-app.vercel.app/api/inbox
```

**Expected Response:**
```json
{
  "ok": true,
  "data": [ ... ],
  "count": 10
}
```

**Error Response (if not configured):**
```json
{
  "ok": false,
  "error": "Webhook endpoint not configured. Please set SHEETS_WEBHOOK_URL in environment variables."
}
```

---

## 📝 Summary for Mobile Team

**If mobile team is seeing "not configured" errors:**

1. **Check Vercel environment variables** (most likely cause)
2. **Add missing variables** (`SHEETS_PNL_URL`, `SHEETS_BALANCES_GET_URL`, `SHEETS_BALANCES_APPEND_URL`)
3. **Set them to the same value** as `SHEETS_WEBHOOK_URL`
4. **Redeploy** (Vercel should auto-deploy on env var change)
5. **Test endpoints** using cURL commands above

**Timeline:** 15 minutes to configure + 2 minutes for Vercel to redeploy

---

## 🔗 Related Files

- `.env.example` - Example environment variables
- `app/api/pnl/route.ts` - P&L endpoint (uses `SHEETS_PNL_URL`)
- `app/api/balance/get/route.ts` - Balance endpoint (uses `SHEETS_BALANCES_GET_URL`)
- `app/api/balance/save/route.ts` - Balance save endpoint (uses `SHEETS_BALANCES_APPEND_URL`)
- `app/api/inbox/route.ts` - Inbox endpoint (uses `SHEETS_WEBHOOK_URL`)

---

## ✅ Verification Checklist

After configuring environment variables:

- [ ] All variables are set on Vercel
- [ ] Vercel has redeployed (check deployment log)
- [ ] `/api/pnl` returns data (not error)
- [ ] `/api/balance/get` returns data (not error)
- [ ] `/api/inbox` returns data (not error)
- [ ] Mobile team notified that endpoints are working
- [ ] End-to-end test with mobile app successful

---

**Last Updated:** October 30, 2025  
**Status:** Pending Verification

