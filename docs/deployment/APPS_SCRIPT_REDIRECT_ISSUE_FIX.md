# 🚨 Apps Script Redirect Issue - URGENT FIX NEEDED

**Date:** November 1, 2025  
**Issue:** Apps Script returns 302 redirect to broken `user_content_key` URL  
**Status:** ⚠️ **DEPLOYMENT CORRUPTED - NEEDS FRESH DEPLOYMENT**

---

## 🔍 The Problem

When calling the Apps Script webhook, we get:

```
HTTP 302 Moved Temporarily
→ Location: https://script.googleusercontent.com/macros/echo?user_content_key=...&lib=MO6Ijj8BZGUsFaBoVLJuezIFpGDg2vV9V
→ Following redirect → "ไม่พบเพจ" (File not found)
```

**This means:** The deployment is corrupted or has a broken library dependency.

---

## 🎯 Root Cause

The redirect URL contains `lib=MO6Ijj8BZGUsFaBoVLJuezIFpGDg2vV9V` which suggests:

1. ❌ **The deployment has a library dependency** that doesn't exist or is broken
2. ❌ **The deployment is using an old/corrupted version**
3. ❌ **The Apps Script project has library references** that need to be removed

---

## ✅ SOLUTION: Fresh Deployment (No Libraries)

### **Step 1: Check for Library Dependencies**

1. **Open Apps Script:**
   - Go to your Google Sheet
   - Click **Extensions** → **Apps Script**

2. **Check Libraries:**
   - Look at the left sidebar
   - Click the **+** icon next to "Libraries" (if visible)
   - **OR** Look for a "Libraries" section in the left panel

3. **Remove ALL Libraries:**
   - If you see ANY libraries listed, **REMOVE THEM ALL**
   - Your script should have **ZERO** library dependencies
   - The `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` file is standalone and doesn't need any libraries

---

### **Step 2: Delete ALL Deployments**

1. **Go to Deployments:**
   - Click **Deploy** → **Manage deployments**

2. **Delete EVERYTHING:**
   - Click the **trash icon** (🗑️) next to **EVERY** deployment
   - Confirm deletion for each one
   - Make sure the list is **COMPLETELY EMPTY**

3. **Close the dialog**

---

### **Step 3: Verify the Code**

1. **Check line 38:**
   ```javascript
   const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
   ```

2. **If it doesn't match:**
   - **SELECT ALL** code (Cmd+A / Ctrl+A)
   - **DELETE** everything
   - **Open** `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` from your computer
   - **COPY** the entire file
   - **PASTE** into Apps Script editor
   - Click **Save** (💾)

---

### **Step 4: Create FRESH Deployment**

1. **Click Deploy → New deployment**

2. **Click the gear icon** (⚙️) next to "Select type"

3. **Select "Web app"**

4. **Configure:**
   - **Description:** `V8 - Fresh deployment without libraries`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** **"Anyone"** ⚠️ **CRITICAL**

5. **Click Deploy**

6. **Authorize if prompted:**
   - Click **Authorize access**
   - Select your Google account
   - Click **Advanced**
   - Click **Go to [Project Name] (unsafe)**
   - Click **Allow**

7. **Copy the NEW deployment URL**
   - It will be different from the old one
   - Format: `https://script.google.com/macros/s/[NEW_ID]/exec`

---

### **Step 5: Test the NEW Deployment**

Replace `[NEW_DEPLOYMENT_ID]` with your actual new deployment ID:

```bash
curl -X POST "https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

**Expected result:** JSON data (NOT HTML redirect)

**Example:**
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
  "year": { ... }
}
```

---

### **Step 6: Update Environment Variables**

**⚠️ IMPORTANT:** The new deployment will have a **DIFFERENT URL**!

#### **Update Vercel:**

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

2. **Edit these 4 variables** with the **NEW URL**:
   - `SHEETS_WEBHOOK_URL` → New URL
   - `SHEETS_PNL_URL` → New URL
   - `SHEETS_BALANCES_GET_URL` → New URL
   - `SHEETS_BALANCES_APPEND_URL` → New URL

3. Click **Save**

4. **Redeploy Vercel:**
   - Go to **Deployments** tab
   - Click **...** menu on latest deployment
   - Click **Redeploy**

#### **Update .env.local:**

```bash
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_PNL_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
```

---

## 🔍 Diagnostic Checklist

Before creating the new deployment, verify:

- [ ] **NO libraries** in the Apps Script project (left sidebar should show no libraries)
- [ ] **ALL old deployments deleted** (Deploy → Manage deployments should be empty)
- [ ] **Code matches** `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` exactly
- [ ] **Line 38** shows correct secret: `VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=`
- [ ] **Saved** the code (💾 icon)

---

## 🚨 What NOT to Do

### ❌ **Don't use "Test deployment"**
- Always use **"New deployment"** (not test)
- Test deployments have temporary URLs that change

### ❌ **Don't add libraries**
- The script is standalone
- No libraries needed
- Libraries cause the redirect issue

### ❌ **Don't use "Latest" version**
- Always select **"New version"** when deploying
- "Latest" can cause caching issues

### ❌ **Don't forget to authorize**
- If prompted, you MUST authorize the script
- Click "Advanced" → "Go to [Project] (unsafe)" → "Allow"

---

## 🎯 Why This Happens

The `lib=MO6Ijj8BZGUsFaBoVLJuezIFpGDg2vV9V` in the redirect URL indicates:

1. **Library dependency:** The deployment thinks it needs a library
2. **Broken reference:** The library ID doesn't exist or is inaccessible
3. **Corrupted deployment:** The deployment metadata is corrupted

**Solution:** Delete everything and start fresh with NO libraries.

---

## 📊 Expected vs Actual Behavior

### **Expected (Working Deployment):**

```
POST → Apps Script
→ HTTP 200 OK
→ JSON response
```

### **Actual (Broken Deployment):**

```
POST → Apps Script
→ HTTP 302 Redirect
→ https://script.googleusercontent.com/...&lib=MO6Ijj8BZGUsFaBoVLJuezIFpGDg2vV9V
→ HTTP 404 File Not Found
```

---

## 🧪 Testing After Fix

### **Test 1: Health Check (GET)**

```bash
curl "https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec"
```

**Expected:**
```json
{
  "status": "ok",
  "message": "Accounting Buddy webhook + Dynamic P&L + Inbox + Balance + Overhead Expenses",
  "version": "7.1 - With Overhead Expenses Modal Support",
  "timestamp": "2025-11-01T06:30:00.000Z",
  "endpoints": { ... }
}
```

---

### **Test 2: P&L Endpoint (POST)**

```bash
curl -X POST "https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

**Expected:** JSON with P&L data

---

### **Test 3: Named Ranges (POST)**

```bash
curl -X POST "https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_named_ranges","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

**Expected:** JSON with named ranges list

---

## 🎯 Summary

**Problem:** Deployment has broken library dependency causing 302 redirect to non-existent file

**Solution:** 
1. Remove ALL libraries
2. Delete ALL deployments
3. Create fresh deployment
4. Update environment variables

**Critical Steps:**
- ✅ Remove libraries
- ✅ Delete old deployments
- ✅ Set "Who has access" to "Anyone"
- ✅ Copy new deployment URL
- ✅ Update Vercel environment variables

---

**Report Generated:** November 1, 2025  
**Status:** ⚠️ **AWAITING FRESH DEPLOYMENT**  
**Action Required:** Follow steps 1-6 above to create fresh deployment

