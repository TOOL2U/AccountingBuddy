# 🚀 DEPLOY APPS SCRIPT V7.0 NOW

## ⚠️ IMPORTANT: You need to redeploy!

The test failed because you're still running V6.1 in Google Apps Script.

---

## 📋 Quick Deploy Steps

### 1. Open Google Apps Script
Go to: https://script.google.com

### 2. Find Your Project
Look for **"Accounting Buddy"** project and click it

### 3. Replace ALL Code
1. **SELECT ALL** (Cmd+A or Ctrl+A)
2. **DELETE** everything
3. Open file: `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` (1,401 lines)
4. **COPY ALL** code from that file
5. **PASTE** into Apps Script editor

### 4. Deploy New Version
1. Click **"Deploy"** → **"Manage deployments"**
2. Click the **"Edit"** icon (pencil) next to your deployment
3. Change **"Version"** dropdown to **"New version"**
4. Add description: `V7.0 - Balance Management`
5. Click **"Deploy"**
6. ✅ Done! URL stays the same

### 5. Test Again
```bash
node scripts/check-balance-sheet.js
```

**Expected output:**
```
✅ balancesGetLatest endpoint is working!
   Bank Balance: ฿0
   Cash Balance: ฿0
```

---

## ✅ What's in V7.0

- ✅ `handleBalancesAppend()` function (line 1021)
- ✅ `handleBalancesGetLatest()` function (line 1080)
- ✅ Updated routing in `doPost()` (lines 439, 442)
- ✅ `BALANCES_SHEET_NAME` constant (line 45)
- ✅ Updated error messages

---

## 🐛 Current Error

```
Unknown request type. Expected: getPnL, getInbox, deleteEntry, list_named_ranges, or webhook data
```

This means V6.1 is still deployed. V7.0 should say:
```
Expected: getPnL, getInbox, deleteEntry, balancesAppend, balancesGetLatest, list_named_ranges, or webhook data
```

---

## 📝 File to Copy

**File:** `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`  
**Lines:** 1,401  
**Version:** 7.0

Just open it, select all, copy, and paste into Apps Script!

