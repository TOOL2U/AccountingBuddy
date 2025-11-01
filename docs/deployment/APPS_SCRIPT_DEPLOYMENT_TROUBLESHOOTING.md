# 🚨 Apps Script Deployment Troubleshooting

**Date:** November 1, 2025  
**Issue:** Apps Script returns "Moved Temporarily" redirect and then "File not found" error  
**Status:** ⚠️ **DEPLOYMENT ISSUE DETECTED**

---

## 🔍 Problem Detected

When testing the Apps Script webhook URL, we get:

```
HTTP 302 Moved Temporarily
→ Redirects to Google Drive error page
→ "ขออภัย ไม่สามารถเปิดไฟล์ได้ในเวลานี้" (Sorry, cannot open file at this time)
```

**This means:** The deployment is not properly configured or the URL is incorrect.

---

## 🎯 Root Cause

This error typically happens when:

1. ❌ **Deployment is not set to "Anyone"** - The deployment is restricted
2. ❌ **Deployment URL is old/invalid** - The deployment was deleted or changed
3. ❌ **Deployment is not published** - The script is saved but not deployed
4. ❌ **Wrong deployment type** - Using "Test deployment" instead of "New deployment"

---

## ✅ Solution: Redeploy Apps Script Correctly

### **Step 1: Open Apps Script Editor**

1. Open your Google Sheet: **"Accounting Buddy P&L 2025"**
2. Click **Extensions** → **Apps Script**
3. You should see your code with `EXPECTED_SECRET` on line 38

---

### **Step 2: Verify the Code**

Make sure line 38 shows:
```javascript
const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
```

If it doesn't match, copy the entire `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` file and paste it.

---

### **Step 3: Delete Old Deployment (Important!)**

1. Click **Deploy** → **Manage deployments**
2. You'll see your current deployment(s)
3. Click the **trash icon** (🗑️) next to the old deployment
4. Confirm deletion
5. Click **Close**

---

### **Step 4: Create NEW Deployment**

1. Click **Deploy** → **New deployment**
2. Click the **gear icon** (⚙️) next to "Select type"
3. Select **"Web app"**
4. Configure the deployment:
   - **Description:** `V8 - Fixed authentication and named ranges`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** **"Anyone"** ⚠️ **CRITICAL - Must be "Anyone"**
5. Click **Deploy**
6. You may need to authorize the script:
   - Click **Authorize access**
   - Select your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
7. **Copy the new Web app URL** - It should look like:
   ```
   https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   ```

---

### **Step 5: Update Environment Variables**

**⚠️ IMPORTANT:** The new deployment will have a **DIFFERENT URL**!

You need to update these environment variables in Vercel:

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Update these variables with the **NEW URL**:
   - `SHEETS_WEBHOOK_URL`
   - `SHEETS_PNL_URL`
   - `SHEETS_BALANCES_GET_URL`
   - `SHEETS_BALANCES_APPEND_URL`

3. All 4 should point to the **SAME NEW URL**

4. Click **Save**

5. **Redeploy your Vercel app:**
   - Go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Click **Redeploy**

---

### **Step 6: Update .env.local**

Update your local `.env.local` file with the new URL:

```bash
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_PNL_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
```

---

### **Step 7: Test the New Deployment**

Test directly with the **NEW URL**:

```bash
curl -X POST "https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

**Expected result:** JSON data with P&L metrics

**If you still get "Unauthorized":** The code in Apps Script doesn't match the file

**If you get HTML error:** The deployment access is not set to "Anyone"

---

## 🔧 Alternative: Update Existing Deployment

If you don't want to change the URL, you can update the existing deployment:

### **Step 1: Manage Deployments**

1. Click **Deploy** → **Manage deployments**
2. Click the **pencil icon** (✏️ Edit) next to your deployment

### **Step 2: Check Access Settings**

1. Verify **"Who has access"** is set to **"Anyone"**
2. If it's not, change it to **"Anyone"**
3. Under **Version**, select **"New version"**
4. Description: `V8 - Fixed authentication`
5. Click **Deploy**

### **Step 3: Test Again**

```bash
curl -X POST "https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

---

## 🎯 Checklist

Before testing, verify:

- [ ] Apps Script code has correct secret on line 38
- [ ] Deployment is set to **"Execute as: Me"**
- [ ] Deployment is set to **"Who has access: Anyone"** ⚠️ **CRITICAL**
- [ ] Deployment is a **NEW VERSION** (not "Latest")
- [ ] You authorized the script (if prompted)
- [ ] You copied the correct deployment URL
- [ ] Environment variables in Vercel are updated (if URL changed)
- [ ] Vercel app is redeployed (if URL changed)
- [ ] `.env.local` is updated (if URL changed)

---

## 🚨 Common Mistakes

### **Mistake 1: "Who has access" is NOT set to "Anyone"**

**Symptom:** Redirect to Google Drive error page

**Fix:** 
1. Deploy → Manage deployments → Edit
2. Change "Who has access" to **"Anyone"**
3. Deploy with new version

---

### **Mistake 2: Using "Test deployment" instead of "New deployment"**

**Symptom:** URL changes every time, or deployment doesn't work

**Fix:**
1. Delete test deployment
2. Create **New deployment** (not test)
3. Select "Web app" type

---

### **Mistake 3: Not authorizing the script**

**Symptom:** Deployment fails or shows authorization error

**Fix:**
1. When prompted, click **Authorize access**
2. Select your account
3. Click **Advanced** → **Go to [Project] (unsafe)**
4. Click **Allow**

---

### **Mistake 4: Old deployment URL in environment variables**

**Symptom:** Vercel app still gets errors even after redeploying Apps Script

**Fix:**
1. Update all 4 environment variables in Vercel
2. Redeploy Vercel app
3. Update `.env.local`

---

## 📊 Deployment Settings Summary

| Setting | Value | Critical? |
|---------|-------|-----------|
| **Type** | Web app | ✅ Yes |
| **Description** | V8 - Fixed authentication | ℹ️ No |
| **Execute as** | Me (your-email@gmail.com) | ✅ Yes |
| **Who has access** | **Anyone** | ⚠️ **CRITICAL** |
| **Version** | New version (not "Latest") | ✅ Yes |

---

## 🎯 Expected Behavior After Fix

### **Test 1: Direct Apps Script Test**

```bash
curl -X POST "[YOUR_DEPLOYMENT_URL]" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

**Expected:**
```json
{
  "ok": true,
  "month": {
    "revenue": 125450.00,
    "overheads": 45000.00,
    "propertyPersonExpense": 15000.00,
    "gop": 65450.00,
    "ebitdaMargin": 52.15
  },
  "year": {
    "revenue": 1500000.00,
    "overheads": 550000.00,
    "propertyPersonExpense": 180000.00,
    "gop": 770000.00,
    "ebitdaMargin": 51.33
  }
}
```

---

### **Test 2: Vercel API Test**

```bash
curl -s "https://accounting-buddy-app.vercel.app/api/pnl" | jq '.'
```

**Expected:**
```json
{
  "ok": true,
  "month": { ... },
  "year": { ... }
}
```

---

## 🚀 Next Steps

1. **Redeploy Apps Script** with correct settings (see Step 3-4 above)
2. **Copy the new deployment URL**
3. **Update environment variables** in Vercel (if URL changed)
4. **Test the deployment** with cURL
5. **Test all 8 endpoints** once working
6. **Notify mobile team** that all endpoints are ready

---

## 📝 Summary

**Current Issue:** Deployment access is restricted or URL is invalid

**Root Cause:** Deployment not set to "Anyone" or old/invalid deployment

**Solution:** Redeploy with "Who has access: Anyone"

**Critical Setting:** ⚠️ **"Who has access" MUST be "Anyone"**

---

**Report Generated:** November 1, 2025  
**Status:** ⚠️ **AWAITING REDEPLOYMENT**  
**Action Required:** Redeploy Apps Script with "Anyone" access

