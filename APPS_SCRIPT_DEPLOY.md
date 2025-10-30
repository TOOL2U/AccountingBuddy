# Apps Script Deployment Guide

**Current Version:** V8  
**File to Deploy:** `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`

---

## 🚀 Quick Deploy

1. Open Google Sheet → **Extensions** → **Apps Script**
2. **Select all code** (Cmd+A / Ctrl+A) and delete
3. Open `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`
4. **Copy all** (Cmd+A, Cmd+C)
5. **Paste** into Apps Script editor
6. Click **Save** (💾)
7. Click **Deploy** → **Manage deployments** → **Edit** → **New version**
8. Description: `V8 - Fixed balance tracking + P&L sheet name`
9. Click **Deploy**

---

## ✅ What's Fixed in V8

1. **Balance Tracking Bug** - Bank balances now save/load correctly (not appearing in cash)
2. **P&L Sheet Name** - Changed `"P&L "` to `"P&L (DO NOT EDIT)"` in 3 places
3. **Property/Person Endpoint** - Now works correctly
4. **Overhead Expenses Endpoint** - Now works correctly

---

## 🧪 Test After Deploy

1. Go to http://localhost:3001/balance
2. Save bank balance → should appear in bank section (not cash)
3. Save cash balance → should appear in cash section (not bank)
4. Go to http://localhost:3001/admin
5. Test Property/Person → should return data (not error)

---

## 🚨 Important

**Clear old balance data:**
- Go to "Bank & Cash Balance" sheet
- Delete all data rows
- Start fresh (old data is in wrong format)

---

## 📝 One File Only

**Apps Script File:** `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`  
**Deployment Guide:** This file

That's it. Simple.

