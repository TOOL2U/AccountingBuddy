# 🔐 Webapp Team - Authentication Clarification for Mobile Team

**To:** Mobile App Team & Project Manager  
**From:** Webapp Development Team  
**Date:** October 30, 2025  
**Subject:** IMPORTANT - Mobile App Does NOT Need Authentication

---

## 🎉 **GOOD NEWS: Mobile App Does NOT Need to Authenticate!**

### **TL;DR:**

✅ **Mobile app does NOT need to send any authentication headers**  
✅ **Mobile app does NOT need API keys or secrets**  
✅ **Mobile app can call all endpoints without authentication**  
✅ **All endpoints are PUBLIC for mobile app**  

**The "Unauthorized" error is NOT from our Next.js backend - it's from Google Apps Script!**

---

## 🔍 **Understanding the "Unauthorized" Error**

### **Where the Error is Coming From:**

```
Mobile App → Next.js API (Vercel) → Google Apps Script → Google Sheets
                                          ↑
                                    "Unauthorized" error
                                    comes from HERE
```

**The authentication is between:**
- ✅ Next.js backend ↔ Google Apps Script (we handle this)
- ❌ NOT between Mobile App ↔ Next.js backend

---

## 📋 **How Authentication Works**

### **Step-by-Step Flow:**

**Step 1: Mobile App Calls Next.js API**
```bash
# Mobile app sends simple request (NO authentication needed)
curl https://accounting-buddy-app.vercel.app/api/pnl
```

**Step 2: Next.js API Calls Google Apps Script**
```javascript
// Our Next.js backend adds authentication automatically
const response = await fetch(SHEETS_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'getPnL',
    secret: process.env.SHEETS_WEBHOOK_SECRET  // ← WE add this
  })
});
```

**Step 3: Google Apps Script Validates Secret**
```javascript
// Apps Script checks if secret matches
if (data.secret !== WEBHOOK_SECRET) {
  return { ok: false, error: 'Unauthorized' };  // ← This is the error you're seeing
}
```

**Step 4: Response Flows Back**
```
Google Sheets → Apps Script → Next.js API → Mobile App
```

---

## ✅ **What Mobile App Should Do**

### **Answer to Your Questions:**

**Question 1: What authentication method should we use?**
- **Answer:** NONE! No authentication needed from mobile app.

**Question 2: What is the authentication value?**
- **Answer:** N/A - Mobile app doesn't send authentication.

**Question 3: What header name should we use?**
- **Answer:** N/A - No authentication headers needed.

**Question 4: Example request?**
- **Answer:** Your current requests are CORRECT! No changes needed.

### **Your Current Code is PERFECT:**

```typescript
// This is CORRECT - no authentication needed!
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**DO NOT add any authentication headers!**

---

## 🚨 **The Real Problem: Google Apps Script Secret Mismatch**

### **Root Cause:**

The `SHEETS_WEBHOOK_SECRET` in Vercel doesn't match the secret in Google Apps Script properties.

**Current Situation:**
- Vercel has: `VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=`
- Apps Script has: `???` (probably different or not set)

### **Who Needs to Fix:**

**PM (Project Manager)** - Only PM has access to Google Apps Script

**What PM Needs to Do:**

1. Open Google Apps Script: https://script.google.com
2. Open "Accounting Buddy Webhook" project
3. Go to **Project Settings** (gear icon)
4. Go to **Script Properties**
5. Find or add property: `WEBHOOK_SECRET`
6. Set value to: `VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=`
7. Save changes

**Timeline:** 5 minutes

---

## 🧪 **Testing After PM Fixes Apps Script**

### **Once PM Updates the Secret:**

**Test 1: P&L Endpoint**
```bash
curl https://accounting-buddy-app.vercel.app/api/pnl
```

**Expected Response (SUCCESS):**
```json
{
  "ok": true,
  "data": {
    "month": {
      "revenue": 125000,
      "overheads": 45000,
      "propertyPersonExpense": 30000,
      "gop": 50000,
      "ebitdaMargin": 40
    },
    "year": {
      "revenue": 1250000,
      "overheads": 450000,
      "propertyPersonExpense": 300000,
      "gop": 500000,
      "ebitdaMargin": 40
    }
  }
}
```

**Test 2: Balance Endpoint**
```bash
curl https://accounting-buddy-app.vercel.app/api/balance/get
```

**Expected Response (SUCCESS):**
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

**Test 3: Inbox Endpoint**
```bash
curl https://accounting-buddy-app.vercel.app/api/inbox
```

**Expected Response (SUCCESS):**
```json
{
  "ok": true,
  "data": [
    {
      "rowNumber": 156,
      "date": "2025-10-30",
      "property": "Shaun Ducker - Personal",
      "typeOfOperation": "EXP - Groceries & Food",
      "detail": "TESCO LOTUS",
      "ref": "",
      "debit": 450,
      "credit": 0,
      "typeOfPayment": "Cash"
    }
  ],
  "count": 1
}
```

---

## 📊 **Summary for Mobile Team**

### **What You Need to Do:**

**NOTHING!** Your code is perfect. No changes needed.

### **What You're Waiting For:**

**PM to fix Google Apps Script secret** (5 minutes)

### **What Happens Next:**

1. ✅ PM updates Apps Script secret (5 min)
2. ✅ Webapp team tests all endpoints (5 min)
3. ✅ Webapp team confirms all working (2 min)
4. ✅ Mobile team runs Phase 1 tests (15 min)
5. ✅ Mobile team runs Phase 2 tests (20 min)
6. ✅ Mobile team runs Phase 3 tests (10 min)

**Total:** 57 minutes from when PM fixes Apps Script

---

## 🎯 **Updated Timeline**

### **Current Status:**

| Task | Status | Owner | Time |
|------|--------|-------|------|
| Configure Vercel env vars | ✅ Done | Webapp Team | - |
| Vercel redeploy | ✅ Done | Webapp Team | - |
| **Fix Apps Script secret** | ⏳ **PENDING** | **PM** | **5 min** |
| Test all endpoints | ⏳ Pending | Webapp Team | 5 min |
| Mobile Phase 1 tests | ⏳ Pending | Mobile Team | 15 min |
| Mobile Phase 2 tests | ⏳ Pending | Mobile Team | 20 min |
| Mobile Phase 3 tests | ⏳ Pending | Mobile Team | 10 min |

**Current Blocker:** PM needs to update Apps Script secret

---

## 📝 **For PM: Step-by-Step Instructions**

### **How to Fix the "Unauthorized" Error:**

**Step 1: Open Google Apps Script**
1. Go to: https://script.google.com
2. Log in with your Google account
3. Find project: "Accounting Buddy Webhook" (or similar name)
4. Click to open it

**Step 2: Open Project Settings**
1. Click the **gear icon** (⚙️) on the left sidebar
2. This opens "Project Settings"

**Step 3: Update Script Properties**
1. Scroll down to **Script Properties** section
2. Look for property named: `WEBHOOK_SECRET`
3. If it exists, click **Edit**
4. If it doesn't exist, click **Add script property**

**Step 4: Set the Secret Value**
1. Property name: `WEBHOOK_SECRET`
2. Property value: `VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=`
3. Click **Save**

**Step 5: Verify Deployment**
1. Click **Deploy** → **Manage deployments**
2. Verify there's an active deployment
3. Verify "Execute as" is set to **Me**
4. Verify "Who has access" is set to **Anyone**

**Step 6: Test**
1. Run this command in terminal:
```bash
curl https://accounting-buddy-app.vercel.app/api/pnl
```
2. You should see JSON data (not "Unauthorized")

**Done!** ✅

---

## 🚀 **What Webapp Team is Doing**

### **We've Already Done:**

✅ Configured all 10 environment variables in Vercel  
✅ Triggered Vercel redeploy  
✅ Tested endpoints (found Apps Script auth issue)  
✅ Diagnosed the problem (secret mismatch)  
✅ Created this clarification document  

### **We're Waiting For:**

⏳ PM to update Apps Script secret

### **We'll Do Next:**

1. ✅ Test all 8 endpoints after PM fixes secret
2. ✅ Confirm all return correct data
3. ✅ Notify mobile team that endpoints are ready
4. ✅ Support mobile team during testing
5. ✅ Debug any issues discovered

---

## 📞 **Communication Protocol**

### **For Mobile Team:**

**DO NOT change your code!** Your implementation is correct.

**Wait for notification from:**
- Webapp team: "All endpoints tested and working"
- Then start your Phase 1 tests

### **For PM:**

**Please update Apps Script secret** using instructions above.

**Then notify:**
- Webapp team: "Apps Script secret updated"
- We'll test and confirm endpoints work
- Then notify mobile team to start testing

### **For Webapp Team (Us):**

**We're standing by** to:
- Test endpoints immediately after PM fixes secret
- Support mobile team during testing
- Debug any issues

---

## ✅ **Final Summary**

### **The Issue:**

❌ "Unauthorized" errors from Google Apps Script  
❌ Secret in Apps Script doesn't match secret in Vercel  

### **The Solution:**

✅ PM updates Apps Script secret (5 minutes)  
✅ Webapp team tests endpoints (5 minutes)  
✅ Mobile team runs tests (45 minutes)  

### **Mobile Team Action:**

✅ **NONE!** Your code is perfect. Just wait for PM to fix Apps Script.

### **PM Action:**

⏳ **Update Apps Script secret** (5 minutes) - Instructions above

### **Webapp Team Action:**

⏳ **Test endpoints after PM fixes** (5 minutes)  
⏳ **Notify mobile team when ready** (1 minute)  

---

**Total Time to Full Connectivity:** 56 minutes from when PM starts

---

**Webapp Development Team**  
**Status:** Ready to test after PM fixes Apps Script  
**Mobile Team:** No code changes needed - your implementation is correct!  
**PM:** Please update Apps Script secret using instructions above  
**Last Updated:** October 30, 2025 - 9:50 PM

