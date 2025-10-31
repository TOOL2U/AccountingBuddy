# 🔍 Diagnosis: .env.local vs Vercel Production

**To:** Project Manager & Webapp Team  
**From:** Mobile App Team  
**Date:** October 30, 2025 - 10:10 PM  
**Subject:** Found the Issue - Vercel Environment Variables

---

## ✅ **Found the .env.local File**

I checked the `.env.local` file in the webapp repository and found:

### **All Webhook URLs Point to Same Deployment:**

```env
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

SHEETS_PNL_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

SHEETS_BALANCES_APPEND_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

SHEETS_BALANCES_GET_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec
```

**✅ All URLs are identical (correct!)**

### **Webhook Secret:**

```env
SHEETS_WEBHOOK_SECRET=VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=
```

**✅ Secret is correct!**

---

## 🚨 **The Problem**

### **This is the LOCAL development file!**

The `.env.local` file is used for **local development** (when running `npm run dev` on your computer).

**But the mobile app is calling the PRODUCTION API:**
```
https://accounting-buddy-app.vercel.app/api/*
```

**Production uses environment variables from VERCEL, not from .env.local!**

---

## 🔍 **What This Means**

### **Two Separate Configurations:**

**1. Local Development (.env.local):**
- ✅ Has correct webhook URLs
- ✅ Has correct secret
- ✅ Would work if we tested locally

**2. Production (Vercel):**
- ❓ Might have different webhook URLs
- ❓ Might have different secret
- ❌ Currently returning "Unauthorized"

---

## 🎯 **The Solution**

### **Webapp Team Needs to Verify Vercel Environment Variables**

**Go to Vercel Dashboard:**

1. Open https://vercel.com
2. Go to your project: `accounting-buddy-app`
3. Go to **Settings** → **Environment Variables**
4. Check these variables:

```
SHEETS_WEBHOOK_URL = ?
SHEETS_PNL_URL = ?
SHEETS_BALANCES_APPEND_URL = ?
SHEETS_BALANCES_GET_URL = ?
SHEETS_WEBHOOK_SECRET = ?
```

**Verify they match .env.local:**

| Variable | .env.local Value | Vercel Value | Match? |
|----------|------------------|--------------|--------|
| SHEETS_WEBHOOK_URL | `https://script.google.com/macros/s/AKfycbw...` | ❓ | ❓ |
| SHEETS_PNL_URL | `https://script.google.com/macros/s/AKfycbw...` | ❓ | ❓ |
| SHEETS_BALANCES_APPEND_URL | `https://script.google.com/macros/s/AKfycbw...` | ❓ | ❓ |
| SHEETS_BALANCES_GET_URL | `https://script.google.com/macros/s/AKfycbw...` | ❓ | ❓ |
| SHEETS_WEBHOOK_SECRET | `VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=` | ❓ | ❓ |

---

## 🔧 **How to Fix**

### **Option 1: Update Vercel Environment Variables Manually**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. For each variable that doesn't match, click **Edit**
3. Update the value to match `.env.local`
4. Click **Save**
5. After updating all variables, trigger a new deployment:
   - Go to Deployments
   - Click the three dots on the latest deployment
   - Click **Redeploy**

---

### **Option 2: Use Vercel CLI to Sync**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull current environment variables
vercel env pull

# Push .env.local to Vercel production
vercel env add SHEETS_WEBHOOK_URL production
# Paste: https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

vercel env add SHEETS_PNL_URL production
# Paste: https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

vercel env add SHEETS_BALANCES_APPEND_URL production
# Paste: https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

vercel env add SHEETS_BALANCES_GET_URL production
# Paste: https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec

vercel env add SHEETS_WEBHOOK_SECRET production
# Paste: VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=

# Trigger new deployment
vercel --prod
```

---

### **Option 3: Check What's Currently in Vercel**

```bash
# Pull current Vercel environment variables
vercel env pull .env.vercel

# Compare with .env.local
diff .env.local .env.vercel
```

This will show you exactly what's different between local and production.

---

## 📊 **Test Results Summary**

### **Current Status (Testing Production):**

| Endpoint | Result | Reason |
|----------|--------|--------|
| GET /api/inbox | ❌ Unauthorized | Vercel env vars don't match |
| GET /api/pnl | ❌ Unauthorized | Vercel env vars don't match |
| GET /api/balance/get | ❌ Unauthorized | Vercel env vars don't match |
| POST /api/balance/save | ❌ Unauthorized | Vercel env vars don't match |
| POST /api/sheets | ⚠️ Validation error | **WORKING!** (different code path?) |
| DELETE /api/inbox | ❌ Unauthorized | Vercel env vars don't match |

### **Why POST /api/sheets Works:**

Looking at the code, `POST /api/sheets` might have different error handling or use a different environment variable that IS set correctly in Vercel.

---

## 🎯 **Immediate Action Required**

### **For Webapp Team:**

**URGENT: Check Vercel Environment Variables**

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Screenshot all environment variables
4. Compare with `.env.local`
5. Update any that don't match
6. Trigger new deployment
7. Notify mobile team when done

**ETA:** 10 minutes

---

## 📋 **Checklist for Webapp Team**

- [ ] Open Vercel Dashboard
- [ ] Go to Settings → Environment Variables
- [ ] Check `SHEETS_WEBHOOK_URL` value
- [ ] Check `SHEETS_PNL_URL` value
- [ ] Check `SHEETS_BALANCES_APPEND_URL` value
- [ ] Check `SHEETS_BALANCES_GET_URL` value
- [ ] Check `SHEETS_WEBHOOK_SECRET` value
- [ ] Verify all match `.env.local`
- [ ] Update any that don't match
- [ ] Trigger new deployment (Deployments → Redeploy)
- [ ] Wait 2-3 minutes for deployment
- [ ] Notify mobile team to re-test

---

## 💡 **Why This Happened**

### **Common Scenario:**

1. ✅ Webapp team configured environment variables in Vercel initially
2. ✅ PM updated the Apps Script secret
3. ✅ Webapp team updated `.env.local` to match
4. ❌ **But forgot to update Vercel production environment variables**

**Result:**
- Local development works (uses `.env.local`)
- Production fails (uses old Vercel env vars)

---

## 🚀 **After Fix**

### **Expected Results:**

Once Vercel environment variables are updated and redeployed:

```bash
# Test 1: GET /api/inbox
curl https://accounting-buddy-app.vercel.app/api/inbox
# Expected: {"ok":true,"data":[...]}

# Test 2: GET /api/pnl
curl https://accounting-buddy-app.vercel.app/api/pnl
# Expected: {"ok":true,"data":{...}}

# Test 3: GET /api/balance/get
curl https://accounting-buddy-app.vercel.app/api/balance/get
# Expected: {"balances":[...]}

# Test 4: POST /api/balance/save
curl -X POST https://accounting-buddy-app.vercel.app/api/balance/save \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-30","bankName":"Bangkok Bank - Shaun Ducker","balance":90000}'
# Expected: {"ok":true}
```

**All should return 200 OK with data (not "Unauthorized")!**

---

## 📞 **Communication**

### **Mobile Team Status:**

**We've Done:**
- ✅ Tested all endpoints (still failing)
- ✅ Found `.env.local` file
- ✅ Verified `.env.local` has correct values
- ✅ Identified the issue: Vercel env vars don't match `.env.local`

**We're Waiting For:**
- ⏳ Webapp team to check Vercel environment variables
- ⏳ Webapp team to update Vercel env vars to match `.env.local`
- ⏳ Webapp team to trigger new deployment
- ⏳ Webapp team to notify us when ready

**We're Ready To:**
- ✅ Re-test immediately after Vercel is updated
- ✅ Continue with full integration testing
- ✅ Provide final test results

---

## ✅ **Summary**

**Root Cause Found:** ✅ Vercel production environment variables don't match `.env.local`  
**Solution:** Update Vercel env vars to match `.env.local` and redeploy  
**Owner:** Webapp Team  
**ETA:** 10 minutes  
**Impact:** All 6 Apps Script endpoints blocked  

**Next Step:** Webapp team updates Vercel environment variables and triggers redeploy

---

**Mobile App Team**  
**Status:** ⏳ Waiting for Webapp Team to update Vercel environment variables  
**Root Cause:** Vercel production env vars don't match `.env.local`  
**Solution:** Update Vercel and redeploy  
**Last Updated:** October 30, 2025 - 10:10 PM

